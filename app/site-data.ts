import {
  catalogCovers,
  catalogGenres,
  type CoverRecord,
} from "./cover-catalog";
import { businessFacts, metaPixelId } from "./business-data";

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
  kind?: "contact" | "portfolio" | "genres" | "resources" | "reviews";
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
    slug: "reviews",
    canonical: "/reviews",
    eyebrow: "Author reviews",
    title: "What our authors say.",
    description: `Notes that authors sent to ${businessFacts.name} after working with us, published as they wrote them.`,
    kind: "reviews",
    sections: [],
  },
  {
    slug: "refund-and-cancellation",
    canonical: "/refund-and-cancellation",
    eyebrow: "Refund and cancellation",
    title: "Refund and cancellation policy.",
    description: "Last updated November 28, 2026. A clear starting point if your plans change before or during a publishing project.",
    sections: [
      { title: "Before you commission work", paragraphs: ["A consultation or an inquiry is not a purchase, and this website does not take payment through its inquiry form. There is no charge to cancel an inquiry or to ask us to stop following up.", "For paid work, review the written proposal or project agreement before you accept it. It should explain any deposit, the payment milestones, the cancellation conditions, the revision allowance, and the refund terms for the specific services you choose."] },
      { title: "Requesting a cancellation or refund", paragraphs: [`Contact us through the contact page, by email at ${businessFacts.email}, by phone at ${businessFacts.phone.display}, or through the business contact named in your project agreement. Give your name, the email address used for the project, the project or invoice reference if you have one, and the reason for your request. Please do not send card details.`, "Our team reviews each request against the agreed scope, the stage of the project, the work completed, the amounts paid, and any third party commitments that you authorized. Ask us to confirm any remaining work, the handover of files, and any financial adjustment in writing."] },
      { title: "Work in progress and outside costs", paragraphs: ["How completed work, deposits, services not yet started, and approved outside costs are treated depends on the project agreement and applicable law. A request does not automatically cancel third party printing, distribution, or advertising commitments that have already been placed.", "If you believe a deliverable does not match the agreed scope, tell us what the concern is and point to the relevant approval or specification. We will review it with you and discuss the appropriate next step under the agreement."] },
      { title: "Refund arrangements", paragraphs: ["This website does not advertise a universal refund deadline, an unconditional money back guarantee, or a guaranteed publishing outcome. Any refund that is agreed is confirmed in writing with its amount and how it will be paid. Nothing in this policy limits a right you have under applicable law."] },
      { title: "Your files", paragraphs: ["Your manuscript and the materials you supplied remain yours whether a project is completed or cancelled. The handover of work produced for the project follows the project agreement."] },
      { title: "Questions", paragraphs: [`For a question about this policy, email ${businessFacts.email}, call ${businessFacts.phone.display}, or write to ${businessFacts.address.formatted}.`] },
    ],
  },
  {
    slug: "terms",
    canonical: "/terms",
    eyebrow: "Website terms",
    title: "Website terms of use.",
    description: "These terms cover use of this informational website. Services for individual projects require a separate written agreement.",
    sections: [
      { title: "Informational website", paragraphs: ["Website content describes general publishing services and does not itself create a client relationship, quotation, guarantee, or publishing agreement."] },
      { title: "Project agreements", paragraphs: ["Scope, fees, timeline, revisions, refunds, deliverables, rights, confidentiality, and platform responsibilities must be stated in the signed project agreement. Our refund and cancellation policy explains how to make a request."] },
      { title: "Brand Independence", paragraphs: [`${businessFacts.name} provides editing, cover design, formatting, and publishing setup directly to authors. ${businessFacts.independenceStatement} Authors retain control of their accounts, credentials, publishing records, and royalty access.`] },
      { title: "External platforms", paragraphs: [`Retailer and publishing platform names and trademarks belong to their respective owners and are used only to identify those platforms. Platform rules, eligibility, pricing, royalties, and availability may change independently of ${businessFacts.name}.`] },
      { title: "Sample cover concepts", paragraphs: ["Cover samples displayed on this website are original concepts with illustrative titles. They do not represent client projects, published books, or real authors."] },
      { title: "Client covers", paragraphs: ["Covers shown under client projects were designed for our clients and are displayed as examples of our work. Each book, its title, and its content belong to its author. An author may ask us to remove a cover at any time."] },
      { title: "Privacy", paragraphs: ["Our privacy policy explains what information we collect, how it is used, and how to ask for it to be deleted. It forms part of these terms."] },
      { title: "No guaranteed results", paragraphs: ["Publishing, marketing, and platform support services do not guarantee approval, ranking, reviews, retailer placement, sales, royalties, or financial performance."] },
      { title: "Contact", paragraphs: [`Questions about these terms can be sent to ${businessFacts.email} or discussed by phone at ${businessFacts.phone.display}. Our business address is ${businessFacts.address.formatted}.`] },
    ],
  },
  {
    slug: "privacy",
    canonical: "/privacy",
    eyebrow: "Privacy",
    title: "Privacy policy.",
    description: `Effective November 28, 2026. This policy explains what information ${businessFacts.name} collects, how it is used, and the choices you have when you visit this website, contact us, or respond to one of our advertisements.`,
    sections: [
      { title: "Who we are", paragraphs: [`${businessFacts.name} provides publishing services for independent authors and is responsible for the information described in this policy. Our business address is ${businessFacts.address.formatted}. Privacy questions can be sent to ${businessFacts.email} or raised by phone at ${businessFacts.phone.display}.`] },
      { title: "What this policy covers", paragraphs: [`This policy applies to ${businessFacts.domain}, to inquiries sent to us by email, phone, or message, and to information you send us through an advertisement or lead form on Facebook, Instagram, or a search platform. Work on a client project is also covered by the signed project agreement.`] },
      {
        title: "Information you choose to provide",
        paragraphs: ["When you contact us, you may provide your name, email, phone number, manuscript stage, genre, service interests, and project message. Do not send full manuscripts or sensitive personal information through the website form."],
        bullets: [
          "Inquiry details: name, email address, phone number, and what you tell us about your book.",
          "Lead form details: if you fill in a lead form or send us a message from one of our advertisements, the advertising platform passes us the details you entered, such as your name, email address, and phone number.",
          "Client project materials: manuscripts, cover briefs, images, and publishing details that a client sends us for an agreed project.",
          "Billing details: the name, contact details, and invoice records needed to bill a project. We do not collect card numbers through this website.",
        ],
      },
      { title: "Information we do not ask for", paragraphs: ["We never ask for publishing platform passwords, login credentials, or one time codes. We do not ask for government identification numbers or health information, and this website has no account sign up and no online checkout."] },
      {
        title: "How information is used",
        paragraphs: ["Contact information is used to respond to your inquiry, understand the requested work, prepare a scope, communicate about the project, protect the website, and maintain necessary business records."],
        bullets: [
          "To reply to you and prepare a quotation or project scope.",
          "To deliver editing, design, formatting, and publishing setup that a client has agreed to.",
          "To send service messages about a project, and marketing messages only where you have asked for them or the law allows them.",
          "To keep business, tax, and legal records, and to prevent misuse of the website.",
        ],
      },
      { title: "Legal bases", paragraphs: ["Where the law requires a legal basis, we rely on your request or our agreement with you to answer inquiries and deliver services, on our legitimate interest in running and protecting the business, on legal obligations for record keeping, and on your consent where consent is required. You can withdraw consent at any time."] },
      { title: "Inquiry form", paragraphs: [`When you send the inquiry form, the details you entered are passed to FormSubmit, a form delivery service, which emails them to our inbox at ${businessFacts.email}. FormSubmit handles those details only to deliver the message. If that delivery is not available, the form opens your own email application with the same details so that you can send them yourself. This website does not store form submissions in a public database.`] },
      {
        title: "Website technology and cookies",
        paragraphs: [
          metaPixelId
            ? "This website uses the Meta Pixel, an advertising measurement tool from Meta, only after you choose Accept in the advertising choices notice. While it is on, the Meta Pixel sets cookies and sends Meta information such as the pages you view, the time of your visit, your browser and device details, your IP address, and whether you sent the inquiry form. We use it to measure our advertisements and to show our advertisements to people who have visited this website. If you choose Decline, or your browser sends a Global Privacy Control signal, the Meta Pixel is not loaded. You can change your choice at any time with the Advertising choices link at the foot of every page. Our hosting provider also processes limited technical request information, such as an IP address, browser details, requested page, referring page, timestamp, and security events, to deliver and protect the website."
            : "This website does not currently use the Meta Pixel, Conversions API, analytics cookies, or advertising cookies. Our hosting provider processes limited technical request information, such as an IP address, browser details, requested page, referring page, timestamp, and security events, to deliver and protect the website. Any cookie set for that purpose is strictly necessary and is not used by us for advertising or to follow visitors across websites.",
          "The website loads its own scripts, styles, and images from its own domain. It does not load third party fonts, trackers, chat widgets, or social media plugins. The only request to another company is the one that delivers the inquiry form when you send it. If you close a seasonal greeting, your browser remembers that choice until you close the tab. That note stays in your browser and is not sent to us.",
        ],
      },
      { title: "Advertising", paragraphs: [`We may advertise ${businessFacts.name} through Facebook and Instagram and through search advertising. Meta and other advertising platforms handle information about activity within their own services under their policies. If you follow an advertisement to this website, we do not receive your advertising platform account information unless you choose to contact us. ${metaPixelId ? "With your consent we use the Meta Pixel on this website for advertising measurement and remarketing, as described under Website technology and cookies." : "Before activating website based advertising measurement or remarketing, we will update this policy and add any choices required by applicable law."}`, "If you submit a lead form on Facebook or Instagram, Meta collects the details in the form and shares them with us so that we can reply. We use those details only to respond to your request and to follow up about the services you asked about. You can manage the advertisements you see in your Facebook, Instagram, and Google advertising settings."] },
      { title: "How information is shared", paragraphs: ["We do not sell or rent inquiry information. Information may be shared with service providers that help operate communications or website infrastructure, when required by law, to protect legal rights or safety, or as part of a business transfer. Service providers are permitted to use information only for the work they perform for us.", "The website is currently hosted on GitHub Pages, inquiry forms are delivered by FormSubmit, and our email is provided by GoDaddy. Editors, designers, and formatters who work on a client project see only the materials needed for their part of that project."] },
      { title: "Manuscripts and project files", paragraphs: ["Manuscripts, artwork, and other project files remain the property of the author. We use them only to deliver the agreed services, keep them confidential, and do not publish, sell, or share them outside the project team. A cover is shown on this website only with the author's agreement, and an author can ask us to remove it at any time."] },
      { title: "Retention", paragraphs: ["Inquiry information is kept only as long as reasonably needed to respond, maintain business records, resolve disputes, and meet legal obligations. Technical logs are retained according to the hosting provider's operational and security practices. Project files are kept for the period stated in the project agreement and are deleted or returned when a client asks, unless the law requires us to keep a record."] },
      { title: "Security", paragraphs: ["We limit access to inquiry and project information to the people who need it, and this website is served over an encrypted connection. No method of storage or transmission is completely secure, so please do not email passwords or payment card numbers."] },
      {
        title: "Your choices",
        paragraphs: [`Depending on where you live, you may have rights to request access, correction, or deletion of personal information. You may also withdraw from future marketing messages. Requests can be sent to ${businessFacts.email}.`],
        bullets: [
          "Ask what personal information we hold about you and receive a copy.",
          "Ask us to correct information that is wrong or out of date.",
          "Ask us to delete your information, or to stop using it for marketing.",
          "Residents of some United States states, the European Economic Area, and the United Kingdom have further rights, including the right to object and the right to complain to a regulator.",
        ],
      },
      { title: "How to request deletion of your data", paragraphs: [`Email ${businessFacts.email} with the subject line "Delete my data" from the address you used to contact us, or tell us the name, email address, and phone number you gave. We will confirm the request, delete the inquiry or lead information we hold, and reply when it is done within the time the law requires. We may keep records that the law requires us to keep, such as invoices. We do not charge for a request and we do not treat you differently for making one.`] },
      {
        title: "Sale and sharing of personal information",
        paragraphs: [
          metaPixelId
            ? "We do not sell personal information for money. When you accept the advertising choices notice, information collected by the Meta Pixel is shared with Meta for cross context behavioral advertising. You can opt out at any time by choosing Decline in Advertising choices at the foot of every page, and a Global Privacy Control signal from your browser is treated as an opt out. We do not knowingly sell or share the personal information of anyone under 16."
            : "We do not sell personal information and we do not share it for cross context behavioral advertising. We do not knowingly sell or share the personal information of anyone under 16.",
        ],
      },
      { title: "International visitors", paragraphs: [`${businessFacts.name} operates from the United States. If you contact us from another country, your information will be processed in the United States, where privacy laws may differ from those in your country.`] },
      { title: "Children", paragraphs: ["This website and its services are intended for adults and are not directed to children under 13. We do not knowingly request personal information from children through the inquiry form. If you believe a child has sent us personal information, contact us and we will delete it."] },
      { title: "Changes and contact", paragraphs: [`We may update this policy when website practices change. The effective date above identifies the current version. Questions can be sent to ${businessFacts.email}, raised by phone at ${businessFacts.phone.display}, or mailed to ${businessFacts.address.formatted}.`] },
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
