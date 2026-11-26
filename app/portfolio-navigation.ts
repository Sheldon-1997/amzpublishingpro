export function portfolioHrefForGenre(genre: string) {
  return `/?genre=${encodeURIComponent(genre)}#portfolio`;
}

export function genreFromUrl(
  url: string,
  supportedGenres: readonly string[],
  fallback: string,
) {
  try {
    const requestedGenre = new URL(url, "https://amzpublishingpro.com").searchParams.get("genre");
    return requestedGenre && supportedGenres.includes(requestedGenre)
      ? requestedGenre
      : fallback;
  } catch {
    return fallback;
  }
}
