// Covers designed for clients of this business, supplied by the owner as the
// final print-wrap files. Only the front panel is shown (800x1200, 2:3).
// Add a cover here only when its author has agreed to it being displayed.
// `spine` is the cloth colour of the 3D hero book, taken from the artwork.
export type ClientCover = { slug: string; title: string; author: string; spine: string; src: string; width: number; height: number };

const cover = (slug: string, title: string, author: string, spine: string): ClientCover => ({
  slug,
  title,
  author,
  spine,
  src: `/client-covers/${slug}.webp`,
  width: 800,
  height: 1200,
});

export const clientCovers: readonly ClientCover[] = [
  cover("gliding-down-the-dark-cold-hallways", "Gliding Down the Dark Cold Hallways", "Sara Sponda", "#0c1b2c"),
  cover("universal-mind-and-the-truth", "Universal Mind and the Truth of \"The Declaration of Independence\"", "James Yi-Sian Shieh", "#6a2a1c"),
  cover("success-by-the-book", "Success By The Book", "Jerry McKenzie", "#11224d"),
  cover("the-tide-of-injustice", "The Tide of Injustice", "Jamie Desper", "#14181c"),
];
