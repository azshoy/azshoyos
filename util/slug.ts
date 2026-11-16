// URL slugs. No imports, so tests/slug.test.mjs can load it with plain Node.

// Readable ASCII URL segment from a title: "Aleksi Seppänen" -> "aleksi-seppanen".
export const slugify = (text: string) => text
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")

// The API may one day carry its own slug; until then it comes from the title.
export const slugOf = (item: {title: string, slug?: string}) => item.slug ?? slugify(item.title)
