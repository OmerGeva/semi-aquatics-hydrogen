export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with a hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from the start and end
};