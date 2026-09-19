export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

/** Slug do link único: legível o bastante e com sufixo aleatório. */
export function householdSlug(familyName: string): string {
  const suffix = Math.random().toString(36).slice(2, 7);
  const base = slugify(familyName) || "familia";
  return `${base}-${suffix}`;
}
