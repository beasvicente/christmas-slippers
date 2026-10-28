import type { YarnColor } from "@/domain/slipper";

export function filterYarnColors<T extends YarnColor>(
  colors: readonly T[],
  rawQuery: string,
): T[] {
  const searchTerms = rawQuery.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);

  if (searchTerms.length === 0) {
    return [...colors];
  }

  return colors.filter(({ id, name }) => {
    const searchableText = `${id} ${name}`.toLocaleLowerCase();
    return searchTerms.every((term) => searchableText.includes(term));
  });
}
