// The hero animation turns each sample manuscript into the matching original
// sample cover from app/cover-catalog.ts. `spine` is the colour of the 3D
// book's spine and back, taken from the cover artwork. Every cover file is 640x960 (2:3).
export type HeroPublishingCover = {
  genre: string;
  manuscriptTitle: string;
  chapter: string;
  excerpt: string;
  src: string;
  spine: string;
  title: string;
  width: number;
  height: number;
};

export const heroPublishingCovers = [
  {
    genre: "Memoir & Biography",
    manuscriptTitle: "THE LONG ROAD BACK",
    chapter: "A Life Remembered",
    excerpt: "The first memory returns in fragments, then settles into a story worth keeping.",
    src: "/sample-covers/memoir-01.webp",
    spine: "#3a2b3a",
    title: "The Long Road Back",
    width: 640,
    height: 960,
  },
  {
    genre: "Fiction",
    manuscriptTitle: "A QUIET STREET",
    chapter: "Chapter One",
    excerpt: "By morning the town had changed, though nobody could agree on what happened first.",
    src: "/sample-covers/fiction-01.webp",
    spine: "#1c2542",
    title: "A Quiet Street",
    width: 640,
    height: 960,
  },
  {
    genre: "Nonfiction",
    manuscriptTitle: "COMMON GROUND",
    chapter: "An Introduction",
    excerpt: "Good questions reveal the patterns that facts alone can leave hidden.",
    src: "/sample-covers/nonfiction-01.webp",
    spine: "#c9452f",
    title: "Common Ground",
    width: 640,
    height: 960,
  },
  {
    genre: "Romance",
    manuscriptTitle: "LETTERS IN JUNE",
    chapter: "The First Meeting",
    excerpt: "She recognized his handwriting before she remembered where they had met.",
    src: "/sample-covers/romance-01.webp",
    spine: "#8f2f3a",
    title: "Letters in June",
    width: 640,
    height: 960,
  },
  {
    genre: "Mystery & Thriller",
    manuscriptTitle: "THE LAST WITNESS",
    chapter: "Evidence",
    excerpt: "The key was still warm when Mara found it beneath the floorboard.",
    src: "/sample-covers/mystery-01.webp",
    spine: "#0e1114",
    title: "The Last Witness",
    width: 640,
    height: 960,
  },
  {
    genre: "Fantasy & Science Fiction",
    manuscriptTitle: "THE DRAGON ROAD",
    chapter: "Beyond the Gate",
    excerpt: "At dusk the old map began to glow, and the mountain answered with thunder.",
    src: "/sample-covers/fantasy-01.webp",
    spine: "#2a1440",
    title: "The Dragon Road",
    width: 640,
    height: 960,
  },
  {
    genre: "Children's",
    manuscriptTitle: "THE DREAM TRAIL",
    chapter: "A New Adventure",
    excerpt: "Nora packed one red scarf, two biscuits, and her bravest idea.",
    src: "/sample-covers/children-01.webp",
    spine: "#2f8f4e",
    title: "The Dream Trail",
    width: 640,
    height: 960,
  },
  {
    genre: "Self Help & Wellness",
    manuscriptTitle: "SMALL BEGINNINGS",
    chapter: "A Practical Start",
    excerpt: "Lasting change begins with one clear choice that can be repeated tomorrow.",
    src: "/sample-covers/wellness-01.webp",
    spine: "#3f7d4f",
    title: "Small Beginnings",
    width: 640,
    height: 960,
  },
  {
    genre: "Food & Lifestyle",
    manuscriptTitle: "AT THE TABLE",
    chapter: "Recipes and Stories",
    excerpt: "Every recipe carries a place, a season, and the people who first shared it.",
    src: "/sample-covers/food-01.webp",
    spine: "#3b3027",
    title: "At the Table",
    width: 640,
    height: 960,
  },
  {
    genre: "Sports & Business",
    manuscriptTitle: "THE WINNING SHAPE",
    chapter: "How Teams Think",
    excerpt: "The strongest systems make space for judgment when the plan meets reality.",
    src: "/sample-covers/business-01.webp",
    spine: "#0c3f27",
    title: "The Winning Shape",
    width: 640,
    height: 960,
  },
] as const satisfies readonly HeroPublishingCover[];
