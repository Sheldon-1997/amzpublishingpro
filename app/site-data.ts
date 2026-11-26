import {
  catalogCovers,
  catalogGenres,
  type CoverRecord,
} from "./cover-catalog";
import { businessFacts } from "./business-data";

export type BookItem = CoverRecord;
export const books = catalogCovers;
export const genres = [...catalogGenres, "All"] as const;

export const services = [
  {
    title: "Book Publishing",
    href: "/book-publishing",
    summary: "Platform setup, metadata, quality checks, and release support for print and digital editions.",
  },
  {
    title: "Ghostwriting & Content",
    href: "/ghostwriting",
    summary: "Outlines, manuscript writing, and rewriting based on the author's subject, source material, and intended reader.",
  },
  {
    title: "Developmental & Structural Editing",
    href: "/editing",
    summary: "Editorial work on structure, argument, plot, pacing, clarity, and the reader's experience.",
  },
  {
    title: "Copyediting & Proofreading",
    href: "/editing",
    summary: "Detailed review of grammar, spelling, punctuation, consistency, and final proofs.",
  },
  {
    title: "Book Formatting",
    href: "/book-formatting",
    summary: "Interiors prepared for eBooks, paperbacks, and hardcovers.",
  },
  {
    title: "Cover Design",
    href: "/cover-design",
    summary: "Front covers, full wraps, 3D concepts, and 3D presentation views shaped for the book's genre.",
  },
  {
    title: "Author Brand Content",
    href: "/author-brand-content",
    summary: "Author profiles, retail platform brand content, and visual materials for books and series.",
  },
  {
    title: "Book Marketing",
    href: "/book-marketing",
    summary: "Planning for discoverability, campaigns, and launch based on the book's audience.",
  },
];

export type ContentSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type ContentPageRecord = {
  slug: string;
  canonical: string;
  eyebrow: string;
  title: string;
  description: string;
  sections: ContentSection[];
  kind?: "contact" | "portfolio" | "genres" | "resources";
};

const corePages: ContentPageRecord[] = [
  {
    slug: "services",
    canonical: "/services",
    eyebrow: "Publishing services",
    title: "Choose the right help for your manuscript.",
    description: "Select one service or combine the work needed for the current stage of the book.",
    sections: [
      { title: "Editorial", bullets: ["Ghostwriting and rewriting", "Developmental and structural editing", "Copyediting and proofreading"] },
      { title: "Design and production", bullets: ["Cover concepts and full wrap design", "eBook, paperback, and hardcover formatting", "Illustration and retail platform visual content"] },
      { title: "Publishing and launch", bullets: ["Platform setup and quality checks", "Metadata, categories, and keywords", "Author profiles and launch support"] },
    ],
  },
  {
    slug: "book-publishing",
    canonical: "/book-publishing",
    eyebrow: "Book publishing",
    title: "From finished files to a clean platform release.",
    description: "Publishing support for authors who want clear ownership, accurate setup, and properly prepared files for global book platforms.",
    sections: [
      { title: "Platform preparation", paragraphs: ["We prepare the publishing checklist around your chosen formats and platforms, then confirm the files, metadata, categories, pricing inputs, and account responsibilities before release."], bullets: ["eBook file and publishing preparation", "Paperback and hardcover setup", "Metadata and category review", "Quality check before publication"] },
      { title: "Your account, your rights", paragraphs: ["The author should understand who owns the manuscript, design files, ISBN, publishing account, and royalty access. Those responsibilities are documented before submission."] },
      { title: "No sales guarantees", paragraphs: ["Platform eligibility, royalties, ranking, retailer availability, and sales depend on platform rules and reader demand. Publishing support is not a guarantee of placement or commercial results."] },
    ],
  },
  {
    slug: "ghostwriting",
    canonical: "/ghostwriting",
    eyebrow: "Ghostwriting and content development",
    title: "A complete manuscript process built around your voice.",
    description: "Structured writing support for authors who have an idea, source material, interviews, notes, or an early draft but need a full manuscript.",
    sections: [
      { title: "Scope and outline", paragraphs: ["We begin with the intended reader, subject, tone, length, source material, and deliverables. The outline becomes the working map for drafting and review."] },
      { title: "Writing and revision", bullets: ["Drafting one chapter at a time", "Voice and tone alignment", "Source and citation planning where required", "Scheduled revision rounds"] },
      { title: "Confidentiality and authorship", paragraphs: ["Confidentiality, credit, source ownership, and final manuscript rights should be stated in the project agreement before writing begins."] },
    ],
  },
  {
    slug: "editing",
    canonical: "/editing",
    eyebrow: "Editing",
    title: "The right edit for the actual stage of the book.",
    description: "Structural work fixes the book's foundation. Line and copyediting refine the language. Proofreading checks the final formatted pages.",
    sections: [
      { title: "Developmental and structural editing", bullets: ["Plot, argument, pacing, and organization", "Chapter structure and information gaps", "Character, narrative, and reader journey", "Editorial letter and notes within the manuscript"] },
      { title: "Line and copyediting", bullets: ["Clarity, flow, tone, and repetition", "Grammar, spelling, punctuation, and usage", "Editorial style sheet and consistency review"] },
      { title: "Proofreading", paragraphs: ["The final proof is checked after formatting for remaining typos, spacing, headings, page references, and layout inconsistencies."] },
    ],
  },
  {
    slug: "book-formatting",
    canonical: "/book-formatting",
    eyebrow: "Book formatting",
    title: "Readable interiors prepared for every chosen format.",
    description: "Print and eBook editions need different production decisions. Each file is prepared against its format and platform specification.",
    sections: [
      { title: "Print interiors", bullets: ["Trim size, margins, bleed, and gutters", "Typography and chapter openings", "Headers, footers, page numbers, and contents", "Print PDF quality checks"] },
      { title: "eBook interiors", bullets: ["Reflowable eBook formatting", "Clickable contents and navigation", "Image and caption handling", "Checks across common devices"] },
      { title: "Source files", paragraphs: ["The agreed deliverables and editable source file terms are listed in the project scope before production starts."] },
    ],
  },
  {
    slug: "cover-design",
    canonical: "/cover-design",
    eyebrow: "Cover design",
    title: "A cover system that fits the genre and the format.",
    description: "Cover concepts are developed around the reader, market category, title hierarchy, and production requirements instead of visual trends alone.",
    sections: [
      { title: "Concept development", bullets: ["Genre and audience research", "Multiple visual directions", "Title, subtitle, and author hierarchy", "Revision against a clear brief"] },
      { title: "Production files", bullets: ["eBook front cover", "Paperback and hardcover full wraps", "Spine and back cover layout", "2D artwork and optional 3D presentation views"] },
      { title: "Complete artwork", paragraphs: ["Covers are displayed at their full aspect ratio and are never cropped or stretched. The sample concepts on this website are original designs with illustrative titles. Client covers are shown only with the author's permission."] },
    ],
  },
  {
    slug: "author-brand-content",
    canonical: "/author-brand-content",
    eyebrow: "Author brand content",
    title: "A consistent author presence beyond the cover.",
    description: "Author profiles, visual systems, and retail platform brand content can connect the book, the author, and the reader without making unsupported performance claims.",
    sections: [
      { title: "Author presence", bullets: ["Author biography and positioning", "Profile setup guidance", "Series and title organization", "Consistent author visuals"] },
      { title: "Retail Platform Brand Content", bullets: ["Visual storytelling modules", "Book and series comparisons", "Author story and topic sections", "Image specifications for platform upload"] },
      { title: "Accurate representation", paragraphs: ["All author, award, review, bestseller, and sales claims should be supported by current records and permission."] },
    ],
  },
  {
    slug: "book-marketing",
    canonical: "/book-marketing",
    eyebrow: "Book marketing",
    title: "Practical launch support grounded in the book's audience.",
    description: "Marketing work begins with the title, reader, genre, metadata, and available budget. It does not begin with guaranteed rankings or sales promises.",
    sections: [
      { title: "Discoverability", bullets: ["Metadata and description review", "Category and keyword research", "Audience and comparable title analysis", "Author platform planning"] },
      { title: "Campaign support", bullets: ["Launch calendar", "Retail ad campaign setup guidance", "Creative and landing page review", "Reporting and budget checkpoints"] },
      { title: "What marketing cannot promise", paragraphs: ["Advertising and launch support can improve preparation and reach, but no responsible service can guarantee sales, reviews, bestseller status, or return on ad spend."] },
    ],
  },
  {
    slug: "about",
    canonical: "/about",
    eyebrow: "About the publishing service",
    title: "Independent publishing support for authors who want clarity.",
    description: `${businessFacts.name} provides paid editorial, design, formatting, publishing setup, and author brand services for independent authors.`,
    sections: [
      { title: "What we do", paragraphs: ["We organize specialist work around the stage of the manuscript. The scope can cover one production task or a coordinated path from early draft to files ready for platform upload."] },
      { title: "How projects are managed", bullets: ["Written scope and deliverables", "Named review stages", "Clear ownership responsibilities", "No hidden checkout or automatic purchase"] },
      { title: "What authors should keep", paragraphs: ["Authors should retain copies of their manuscript, final files, agreements, platform credentials, ISBN records, and royalty access information."] },
    ],
  },
  {
    slug: "portfolio",
    canonical: "/portfolio",
    eyebrow: "Cover samples",
    title: "Sample cover concepts for every genre we support.",
    description: "These are original sample concepts created for this website to show how genre shapes a cover. The titles are illustrative and these are not client projects. Client work is displayed only with the author's permission.",
    sections: [],
    kind: "portfolio",
  },
  {
    slug: "genres",
    canonical: "/genres",
    eyebrow: "Genres",
    title: "Editorial and design decisions change with the reader.",
    description: "The genre filter shows sample cover concepts for each book category we support.",
    sections: [],
    kind: "genres",
  },
  {
    slug: "how-it-works",
    canonical: "/how-it-works",
    eyebrow: "Project process",
    title: "Four practical production checkpoints.",
    description: "The process is written around deliverables and approvals rather than vague creative stages.",
    sections: [
      { title: "Manuscript and scope review", paragraphs: ["We confirm the manuscript stage, audience, formats, services, responsibilities, timeline, and expected deliverables."] },
      { title: "Editorial and design production", paragraphs: ["Approved editorial and design work moves through scheduled drafts and review rounds."] },
      { title: "Formatting and quality assurance", paragraphs: ["Files are prepared for each format and checked for content, navigation, dimensions, and production issues."] },
      { title: "Platform setup and handoff", paragraphs: ["The author receives the agreed files, setup support, ownership records, and a clear handoff after launch."] },
    ],
  },
  {
    slug: "resources",
    canonical: "/resources",
    eyebrow: "Author resources",
    title: "Straight answers before production begins.",
    description: "A concise guide to the decisions that most often affect cost, schedule, ownership, and file quality.",
    sections: [
      { title: "Prepare your manuscript", bullets: ["Use consistent chapter and heading styles", "Resolve permissions for quotes and images", "Separate editorial changes from final proofreading"] },
      { title: "Know your ownership", bullets: ["Manuscript and source files", "Cover licensing and artwork rights", "ISBN registration", "Publishing account and royalty access"] },
      { title: "Choose the right formats", bullets: ["Reflowable eBook", "Paperback", "Hardcover", "Audiobook planning where applicable"] },
    ],
    kind: "resources",
  },
  {
    slug: "contact",
    canonical: "/contact",
    eyebrow: "Contact",
    title: "Tell us where the manuscript stands.",
    description: "Share the genre, word count, current stage, services needed, and target formats. No checkout is required.",
    sections: [],
    kind: "contact",
  },
  {
    slug: "terms",
    canonical: "/terms",
    eyebrow: "Website terms",
    title: "Website terms of use.",
    description: "These terms cover use of this informational website. Services for individual projects require a separate written agreement.",
    sections: [
      { title: "Informational website", paragraphs: ["Website content describes general publishing services and does not itself create a client relationship, quotation, guarantee, or publishing agreement."] },
      { title: "Project agreements", paragraphs: ["Scope, fees, timeline, revisions, refunds, deliverables, rights, confidentiality, and platform responsibilities must be stated in the signed project agreement."] },
      { title: "Brand Independence", paragraphs: [`${businessFacts.name} provides editing, cover design, formatting, and publishing setup directly to authors. ${businessFacts.independenceStatement} Authors retain control of their accounts, credentials, publishing records, and royalty access.`] },
      { title: "External platforms", paragraphs: [`Retailer and publishing platform names and trademarks belong to their respective owners and are used only to identify those platforms. Platform rules, eligibility, pricing, royalties, and availability may change independently of ${businessFacts.name}.`] },
      { title: "Sample cover concepts", paragraphs: ["Cover samples displayed on this website are original concepts with illustrative titles. They do not represent client projects, published books, or real authors."] },
      { title: "No guaranteed results", paragraphs: ["Publishing, marketing, and platform support services do not guarantee approval, ranking, reviews, retailer placement, sales, royalties, or financial performance."] },
      { title: "Contact", paragraphs: [`Questions about these terms can be sent to ${businessFacts.email} or discussed by phone at ${businessFacts.phone.display}. Our business address is ${businessFacts.address.formatted}.`] },
    ],
  },
  {
    slug: "privacy",
    canonical: "/privacy",
    eyebrow: "Privacy",
    title: "Privacy notice.",
    description: `Effective November 27, 2026. This notice explains how information is handled when you visit this website or contact ${businessFacts.name}.`,
    sections: [
      { title: "Who we are", paragraphs: [`${businessFacts.name} provides publishing services for independent authors. Our business address is ${businessFacts.address.formatted}. Privacy questions can be sent to ${businessFacts.email}.`] },
      { title: "Information you choose to provide", paragraphs: ["When you contact us, you may provide your name, email, phone number, manuscript stage, genre, service interests, and project message. Do not send full manuscripts or sensitive personal information through the website form."] },
      { title: "How information is used", paragraphs: ["Contact information is used to respond to your inquiry, understand the requested work, prepare a scope, communicate about the project, protect the website, and maintain necessary business records."] },
      { title: "Email form", paragraphs: ["The current website form opens the visitor's email application. The website does not store form submissions in a public database."] },
      { title: "Website technology and cookies", paragraphs: ["This website does not currently use the Meta Pixel, Conversions API, analytics cookies, or advertising cookies. Our hosting provider processes limited technical request information, such as an IP address, browser details, requested page, referring page, timestamp, and security events, to deliver and protect the website. Any cookie set for that purpose is strictly necessary and is not used by us for advertising or to follow visitors across websites."] },
      { title: "Advertising", paragraphs: [`We may advertise ${businessFacts.name} through Facebook and Instagram and through search advertising. Meta and other advertising platforms handle information about activity within their own services under their policies. If you follow an advertisement to this website, we do not receive your advertising platform account information unless you choose to contact us. Before activating website based advertising measurement or remarketing, we will update this notice and add any choices required by applicable law.`] },
      { title: "How information is shared", paragraphs: ["We do not sell or rent inquiry information. Information may be shared with service providers that help operate communications or website infrastructure, when required by law, to protect legal rights or safety, or as part of a business transfer. Service providers are permitted to use information only for the work they perform for us."] },
      { title: "Retention", paragraphs: ["Inquiry information is kept only as long as reasonably needed to respond, maintain business records, resolve disputes, and meet legal obligations. Technical logs are retained according to the hosting provider's operational and security practices."] },
      { title: "Your choices", paragraphs: [`Depending on where you live, you may have rights to request access, correction, or deletion of personal information. You may also withdraw from future marketing messages. Requests can be sent to ${businessFacts.email}.`] },
      { title: "Children", paragraphs: ["This website and its services are intended for adults and are not directed to children under 13. We do not knowingly request personal information from children through the inquiry form."] },
      { title: "Changes and contact", paragraphs: [`We may update this notice when website practices change. The effective date above identifies the current version. Questions can be sent to ${businessFacts.email} or mailed to ${businessFacts.address.formatted}.`] },
    ],
  },
  {
    slug: "ecommerce-store-setup",
    canonical: "/ecommerce-store-setup",
    eyebrow: "Store setup",
    title: "Online storefront setup and catalog support.",
    description: "Online store setup support, scoped in writing without checkout or performance guarantees.",
    sections: [
      { title: "Store structure", bullets: ["Catalog and category planning", "Listing content preparation", "Store navigation and visual hierarchy", "Basic account handoff documentation"] },
      { title: "Important limitation", paragraphs: ["Store approval, rankings, sales, and marketplace performance depend on platform rules, product eligibility, competition, and customer demand."] },
    ],
  },
  {
    slug: "ecommerce-marketing",
    canonical: "/ecommerce-marketing",
    eyebrow: "Store marketing",
    title: "Online store marketing planning.",
    description: "Campaign, listing, search, and conversion review support, described without performance promises.",
    sections: [
      { title: "Support areas", bullets: ["Listing and content review", "Search and keyword planning", "Campaign structure", "Conversion path review", "Reporting checkpoints"] },
    ],
  },
  {
    slug: "book-ad-campaigns",
    canonical: "/book-ad-campaigns",
    eyebrow: "Book Ad Campaigns",
    title: "Campaign setup with clear budget checkpoints.",
    description: "Keyword, targeting, creative, bid, and reporting support without promised rankings or returns.",
    sections: [
      { title: "Campaign scope", bullets: ["Keyword and product targeting", "Sponsored ad structure", "Budget and bid checkpoints", "Reporting and iteration"] },
      { title: "Platform disclosure", paragraphs: ["Retail advertising platforms are external services. Approval, delivery, and performance are governed by each platform's current rules and the advertiser's account."] },
    ],
  },
  {
    slug: "keyword-research",
    canonical: "/keyword-research",
    eyebrow: "Keyword research",
    title: "Search terms organized around reader intent.",
    description: "Research supports metadata, descriptions, category choices, and campaigns. It does not guarantee ranking on the first page.",
    sections: [
      { title: "Research inputs", bullets: ["Book topic and genre", "Reader language and intent", "Comparable title patterns", "Long tail search terms", "Campaign relevance"] },
    ],
  },
];

const bySlug = new Map(corePages.map((page) => [page.slug, page]));

export const pageRecords = corePages;

export function getPageRecord(slug: string): ContentPageRecord | undefined {
  return bySlug.get(slug);
}
