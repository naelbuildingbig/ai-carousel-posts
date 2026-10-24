export function validatePost(post) {
  if (!post || typeof post !== "object")
    throw Error("Post must be an object");

  if (
    typeof post.caption !== "string" ||
    !post.caption.trim() ||
    post.caption.length > 2200
  ) throw Error("Caption must contain 1–2200 characters");

  if (
    !Array.isArray(post.slides) ||
    post.slides.length < 2 ||
    post.slides.length > 10
  ) throw Error("Use 2–10 slides");

  return {
    caption: post.caption.trim(),
    slides: post.slides.map((slide, index) => {
      if (
        typeof slide.title !== "string" ||
        !slide.title.trim() ||
        typeof slide.body !== "string" ||
        !slide.body.trim()
      ) throw Error(`Slide ${index + 1} needs title and body`);

      if (slide.title.length > 150 || slide.body.length > 700)
        throw Error(`Slide ${index + 1} exceeds text limits`);

      return {
        number: index + 1,
        title: slide.title.trim(),
        body: slide.body.trim()
      };
    })
  };
}

export function validateId(id) {
  if (!/^\d{4}-\d{2}-\d{2}(?:-\d{6}-\d{3})?$/.test(id))
    throw Error("Invalid post ID");

  return id;
}
