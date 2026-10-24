import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {validateId} from './validation.mjs';
const event=JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH,'utf8'));
const input=event.client_payload||event.inputs||{};
const id=validateId(input.post_id);
const dir=`posts/${id}`;
const commit=()=>{execFileSync('git',['add',dir]);execFileSync('git',['commit','-m',`Record carousel delivery ${id}`]);execFileSync('git',['push','origin','HEAD:main']);};
const post=JSON.parse(await fs.readFile(`${dir}/post.json`,'utf8'));
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const files=post.slides.map((_,i)=>({media_type:'IMAGE',image_url:`https://raw.githubusercontent.com/${process.env.GITHUB_REPOSITORY}/${sha}/${dir}/slide-${String(i+1).padStart(2,'0')}.jpg`}));
const hook=process.env.MAKE_PUBLISH_WEBHOOK;
if(!hook||!/^https:\/\/hook\.[a-z0-9.]*make\.com\//.test(hook))throw Error('Configure MAKE_PUBLISH_WEBHOOK as a GitHub Actions secret.');
// Check all media before any publishing attempt. URLs are immutable commit URLs.
for(const file of files){const r=await fetch(file.image_url,{method:'HEAD',signal:AbortSignal.timeout(30000)});if(!r.ok||!r.headers.get('content-type')?.includes('image/jpeg'))throw Error('A rendered image is not publicly accessible yet.');}
try{await fs.access(`${dir}/delivery.json`);throw Error('Delivery already attempted; inspect before retrying.');}catch(e){if(e.code!=='ENOENT')throw e;}
const record={post_id:id,status:'delivery_started',started_at:new Date().toISOString(),source_commit:sha};
await fs.writeFile(`${dir}/delivery.json`,JSON.stringify(record,null,2));commit();
try{
 const response=await fetch(hook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({post_id:id,caption:post.caption,files}),signal:AbortSignal.timeout(180000)});
 const text=await response.text();let result;try{result=JSON.parse(text);}catch{}
 if(!response.ok||result?.status!=='published'||!result?.post_id)throw Error('Publishing result unconfirmed. Inspect Make and Instagram before any retry.');
 record.status='published';record.instagram_post_id=String(result.post_id);record.finished_at=new Date().toISOString();
}catch(e){record.status='needs_review';record.message='Publishing result unconfirmed. Check Make history and Instagram before retrying.';await fs.writeFile(`${dir}/delivery.json`,JSON.stringify(record,null,2));commit();throw Error(record.message);}
await fs.writeFile(`${dir}/delivery.json`,JSON.stringify(record,null,2));commit();
