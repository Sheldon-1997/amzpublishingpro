// Covers designed for clients of this business, supplied by the owner as the
// final print-wrap files. Only the front panel is shown (800x1200, 2:3).
// Add a cover here only when its author has agreed to it being displayed.
export type ClientCover = { slug: string; title: string; author: string; src: string; width: number; height: number };

const cover = (slug: string, title: string, author: string): ClientCover => ({
  slug,
  title,
  author,
  src: `/client-covers/${slug}.webp`,
  width: 800,
  height: 1200,
});

export const clientCovers: readonly ClientCover[] = [
  cover("gliding-down-the-dark-cold-hallways", "Gliding Down the Dark Cold Hallways", "Sara Sponda"),
  cover("universal-mind-and-the-truth", "Universal Mind and the Truth of \"The Declaration of Independence\"", "James Yi-Sian Shieh"),
  cover("success-by-the-book", "Success By The Book", "Jerry McKenzie"),
  cover("the-tide-of-injustice", "The Tide of Injustice", "Jamie Desper"),
];
