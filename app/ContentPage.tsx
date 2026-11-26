/* eslint-disable @next/next/no-html-link-for-pages -- Native links avoid a Vinext production navigation crash. */
import { ContactPanel, PortfolioGallery, SiteFooter, SiteHeader } from "./PublishingSite";
import { portfolioHrefForGenre } from "./portfolio-navigation";
import { genres, services, type ContentPageRecord } from "./site-data";

export function ContentPage({ page }: { page: ContentPageRecord }) {
  const supportedGenres = genres.filter((genre) => genre !== "All");

  return (
    <main className="content-site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader solid />

      <section className="page-hero" id="main-content">
        <div className="page-hero-inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a><span aria-hidden="true">/</span><span>{page.eyebrow}</span>
          </nav>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="page-description">{page.description}</p>
          {page.kind !== "contact" ? (
            <div className="page-actions">
              <a className="button button-primary" href="/#start-project">Start Your Project</a>
              <a className="button button-secondary" href="/contact">Discuss the manuscript</a>
            </div>
          ) : null}
        </div>
      </section>

      {page.sections.length ? (
        <section className="section page-sections" aria-label={`${page.eyebrow} details`}>
          {page.sections.map((section) => (
            <article className="content-card" key={section.title}>
              <span className="content-card-accent" aria-hidden="true" />
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets?.length ? (
                <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {page.kind === "portfolio" ? (
        <section className="section inner-module-section">
          <div className="section-heading compact-heading">
            <div><p className="section-kicker">Browse the samples</p><h2>Choose a genre or explore every concept.</h2></div>
            <p>Every sample is shown at its full proportions and is never cropped into a fixed template.</p>
          </div>
          <PortfolioGallery />
        </section>
      ) : null}

      {page.kind === "genres" ? (
        <section className="section inner-module-section">
          <div className="standalone-genre-grid">
            {supportedGenres.map((genre) => (
              <a href={portfolioHrefForGenre(genre)} key={genre}>
                <span>{genre}</span>
              </a>
            ))}
          </div>
          <div className="genre-service-note">
            <h2>Genre is part of the production brief.</h2>
            <p>Reader expectations influence structure, cover signals, interior typography, metadata, description, and launch language. A project starts with its intended reader instead of a generic publishing template.</p>
          </div>
        </section>
      ) : null}

      {page.kind === "contact" ? (
        <section className="contact-section page-contact-section">
          <div className="section"><ContactPanel /></div>
        </section>
      ) : null}

      {page.slug === "services" ? (
        <section className="section inner-module-section">
          <div className="services-grid">
            {services.map((service) => (
              <a className="service-card" href={service.href} key={service.title}>
                <span className="service-mark" aria-hidden="true" />
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
                <span className="text-link">Read service details →</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {page.kind !== "contact" ? (
        <section className="page-cta">
          <div>
            <p className="section-kicker">Have a manuscript in progress?</p>
            <h2>Start with the stage it is in today.</h2>
          </div>
          <a className="button button-primary" href="/#start-project">Prepare an inquiry</a>
        </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}
