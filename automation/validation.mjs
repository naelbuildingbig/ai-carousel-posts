export function validatePost(post) {
  if (!post || typeof post !== 'object') throw Error('Post must be an object');
  if (typeof post.caption !== 'string' || !post.caption.trim() || post.caption.length > 2200) throw Error('Caption must contain 1–2200 characters');
  if (!Array.isArray(post.slides) || post.slides.length < 2 || post.slides.length > 10) throw Error('Use 2–10 slides');
  return {caption:post.caption.trim(),slides:post.slides.map((s,i)=>{
    if(typeof s.title!=='string'||!s.title.trim()||typeof s.body!=='string'||!s.body.trim())throw Error(`Slide ${i+1} needs title and body`);
    if(s.title.length>150||s.body.length>700)throw Error(`Slide ${i+1} exceeds text limits`);
    return {number:i+1,title:s.title.trim(),body:s.body.trim()};
  })};
}
export function validateId(id){if(!/^\d{4}-\d{2}-\d{2}$/.test(id))throw Error('post_id must be YYYY-MM-DD');return id;}
