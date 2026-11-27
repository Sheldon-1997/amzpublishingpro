// Client reviews shown in the homepage "review deck".
//
// Rules for adding an entry:
//   1. The review was written by a real client of this business and is posted
//      on a public review profile that belongs to this business.
//   2. `text` and `title` are copied exactly as posted. Do not edit wording,
//      swap in a different company name, or merge reviews.
//   3. `sourceUrl` links to that public profile so readers can check it.
//
// While this list is empty the section is not rendered at all.
export type ClientReview = {
  name: string;
  location?: string;
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  text: string;
  sourceName: string;
  sourceUrl: string;
};

export const clientReviews: readonly ClientReview[] = [];
