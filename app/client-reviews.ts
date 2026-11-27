// Client reviews shown in the homepage review deck and on /reviews.
//
// These were sent to the business by email and supplied by the owner on
// 27 November 2026. Rules for this file:
//   1. A review is written by a real client of this business.
//   2. `title` and `text` are the client's own words. Do not rewrite them.
//   3. `source` says how the review reached the business. A review that is
//      posted publicly also carries `sourceUrl`.
//   4. No star rating is shown unless the client gave one.
export type ClientReview = {
  name: string;
  location?: string;
  date: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  title?: string;
  text: string;
  source: "email" | "public";
  sourceName?: string;
  sourceUrl?: string;
};

export const clientReviews: readonly ClientReview[] = [
  {
    name: "Liana Adkins",
    location: "United States",
    date: "October 16, 2026",
    title: "Very professional at what they do!!",
    text: "Very professional at what they do. They understand the requirements easily and make the miracle happen. If you are looking for a beautiful novel then this is the right place to be",
    source: "email",
  },
  {
    name: "M Darryl",
    location: "United States",
    date: "September 18, 2026",
    title: "Happy and satisfied with their efficiency and professionalism.",
    text: "Good professionals who know what they are doing. Never had an issue with them. They have worked exceptionally well on Book named Dead Man's Bay.\nHappy and satisfied with their efficiency and professionalism.",
    source: "email",
  },
  {
    name: "Kathleen Noris",
    location: "United States",
    date: "September 8, 2026",
    title: "Thank you team. You have been wonderful.",
    text: "My experience with this company has been great. They have professional marketeers. I wanted my book to marketed globally and this team made it happen. I can never be more satisfied with them. Thank you team. You have been wonderful.",
    source: "email",
  },
  {
    name: "Bill Chadley",
    location: "United States",
    date: "September 6, 2026",
    title: "Highly recommended to everyone!",
    text: "I have been working with this company for the past few weeks now. Everything is going great and I’m very happy with the progress of the project.\nAMZ Publishing Pro has been very helpful and professional in this area of publishing and the team is working to make sure that you get the best possible results.\nTheir Editing and Publishing team is blessed with great expertise.\nHighly recommended to everyone!",
    source: "email",
  },
];
