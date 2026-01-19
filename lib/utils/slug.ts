export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function generateMovieSlug(title: string, releaseDate: string | null | undefined): string {
  const baseSlug = slugify(title);
  
  if (releaseDate) {
    try {
      const year = new Date(releaseDate).getFullYear();
      if (!isNaN(year)) {
        return `${baseSlug}-${year}`;
      }
    } catch (error) {
      // If date parsing fails, just return the title slug
    }
  }
  
  return baseSlug;
}
