// Covers designed for clients of this business, supplied by the owner.
// Only the front panel is published, at the artwork's own proportions
// (800 pixels wide). `spine` is the cloth colour of the 3D hero book.
// Add a cover here only when its author has agreed to it being displayed.
export type ClientCover = {
  slug: string;
  title: string;
  author: string;
  spine: string;
  src: string;
  width: number;
  height: number;
};

const cover = (slug: string, title: string, author: string, spine: string, height = 1200): ClientCover => ({
  slug,
  title,
  author,
  spine,
  src: `/client-covers/${slug}.webp`,
  width: 800,
  height,
});

export const clientCovers: readonly ClientCover[] = [
  cover("76-before-50", "76 Before 50: A Measured Life", "Darrell White", "#10283f"),
  cover("every-choice-has-consequences", "Every Choice Has Consequences", "Keishawn Charles", "#1b1b1b"),
  cover("toulouses-trek", "Toulouse's Trek: The Journey of a Tiny Grape", "", "#6d3fa0", 1000),
  cover("gliding-down-the-dark-cold-hallways", "Gliding Down the Dark Cold Hallways", "Sara Sponda", "#0c1b2c"),
  cover("success-by-the-book", "Success By The Book", "Jerry McKenzie", "#11224d"),
  cover("twisted-play-better-golf", "Twisted: Play Better Golf", "Robert Rozzi", "#1c2a4a"),
  cover("the-season-of-divine-acceleration", "The Season of Divine Acceleration", "O.J. Swanigan", "#0f2f7a"),
  cover("pheenys-big-new-home", "Pheeny's Big New Home", "Madison Sturm", "#4f9a9c", 1208),
  cover("universal-mind-and-the-truth", "Universal Mind and the Truth of \"The Declaration of Independence\"", "James Yi-Sian Shieh", "#6a2a1c"),
  cover("sacred-touch-for-couples", "Sacred Touch for Couples", "Ilona Malygin", "#2a0f24", 990),
  cover("the-tide-of-injustice", "The Tide of Injustice", "Jamie Desper", "#14181c"),
  cover("the-beginning-to-the-book-of-spells", "The Beginning to the Book of Spells", "Darktamein Knight", "#15171c", 1400),
];
