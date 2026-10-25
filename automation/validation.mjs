export function validatePost(post) {
  if (!post || typeof post !== "object")
    throw Error("Post must be an object");

  if (
    typeof post.caption !== "string" ||
    !post.caption.trim() ||
    post.caption.length > 2200
  ) throw Error("Caption must contain 1–2200 characters");

  if (!Array.isArray(post.slides))
    throw Error("Slides must be an array");

  const slides = [];

  for (const slide of post.slides) {
    if (!slide || typeof slide !== "object")
      throw Error("Invalid slide");

    const body = slide.body ?? "";
    const title = slide.title ?? "";

    if (typeof body !== "string" || typeof title !== "string")
      throw Error("Slide text must be plain text");

    // Skip unanswered form fields.
    if (!body.trim()) continue;

    if (title.length > 150 || body.length > 700)
      throw Error(
        `Slide ${slides.length + 1} is too long. Shorten the original paragraph.`
      );

    slides.push({
      number: slides.length + 1,
      title,
      body
    });
  }

  if (slides.length < 2 || slides.length > 10)
    throw Error("Provide 2–10 filled paragraphs");

  return {
    caption: post.caption,
    slides
  };
}

export function validateId(id) {
  if (!/^\d{4}-\d{2}-\d{2}(?:-\d{6}-\d{3})?$/.test(id))
    throw Error("Invalid post ID");

  return id;
}
