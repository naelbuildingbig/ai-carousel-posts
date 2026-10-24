export function validateId(id) {
  if (!/^\d{4}-\d{2}-\d{2}(?:-\d{6}-\d{3})?$/.test(id))
    throw Error('Invalid post ID');
  return id;
}
