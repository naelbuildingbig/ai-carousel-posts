import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {validatePost,validateId} from './validation.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const event=JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH,'utf8'));
const input=event.client_payload||event.inputs||{};
const id=validateId(input.post_id);
const dir=path.join(root,'posts',id);
try {await fs.access(path.join(dir,'delivery.json'));throw Error('Delivery already attempted for this post. Inspect its record; automatic replay is blocked.');} catch(e){if(e.code!=='ENOENT')throw e;}
const post=validatePost(typeof input.post_json==='string'?JSON.parse(input.post_json):input.post);
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage();
 await page.goto(pathToFileURL(path.join(root,'automation/template.html')).href);
 await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Ready:'));
 await page.locator('#input').fill(JSON.stringify(post));
 await page.locator('#generate').click();
 const status=await page.locator('#status').innerText();
 if(!status.startsWith('Ready:'))throw Error(status);
 const images=await page.locator('a.download').evaluateAll(links=>links.map(a=>a.href));
 if(images.length!==post.slides.length)throw Error('Image count mismatch');
 for(let i=0;i<images.length;i++){
  if(!images[i].startsWith('data:image/jpeg;base64,'))throw Error('Expected JPEG');
  await fs.writeFile(path.join(dir,`slide-${String(i+1).padStart(2,'0')}.jpg`),Buffer.from(images[i].split(',')[1],'base64'));
 }
 await fs.writeFile(path.join(dir,'post.json'),JSON.stringify(post,null,2));
 await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify({post_id:id,caption:post.caption,slide_count:post.slides.length,status:'rendered'},null,2));
 console.log(`Rendered ${images.length} slides for ${id}.`);
} finally {await browser.close();}
