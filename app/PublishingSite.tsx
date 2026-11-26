"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Native links avoid a Vinext production navigation crash. */
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildOrganizationStructuredData, businessFacts } from "./business-data";
import { heroPublishingCovers } from "./hero-publishing-covers";
import { genreFromUrl, portfolioHrefForGenre } from "./portfolio-navigation";
import { books, genres, services, type BookItem } from "./site-data";

const { display: phoneDisplay, href: phoneHref } = businessFacts.phone;
const { email } = businessFacts;
const businessAddress = businessFacts.address.formatted;
const inquiryOpenEvent = "site:open-project-inquiry";

function requestProjectInquiry() {
  window.dispatchEvent(new Event(inquiryOpenEvent));
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    const frame = window.requestAnimationFrame(updatePreference);
    media.addEventListener("change", updatePreference);

    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inquiryTriggerRef = useRef<HTMLElement | null>(null);

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => menuToggleRef.current?.focus());
    }
  }, []);

  const closeInquiry = useCallback(() => {
    setInquiryOpen(false);
    window.requestAnimationFrame(() => inquiryTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    const openInquiry = () => {
      inquiryTriggerRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      setInquiryOpen(true);
    };
    window.addEventListener(inquiryOpenEvent, openInquiry);
    return () => window.removeEventListener(inquiryOpenEvent, openInquiry);
  }, []);

  useEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) return;

    const previousOverflow = document.body.style.overflow;
    const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const focusableItems = () => Array.from(menu.querySelectorAll<HTMLElement>(focusableSelector))
      .filter((item) => !item.hasAttribute("hidden"));
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusableItems();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => focusableItems()[0]?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, open]);

  return (
    <header className={`site-header${solid ? " site-header--solid" : ""}`}>
      <a className="wordmark" href="/" aria-label={`${businessFacts.name} home`}>
        <span>AMZ Publishing</span> <strong>Pro</strong>
      </a>

      <nav className="primary-nav" aria-label="Primary navigation">
        <details className="nav-dropdown">
          <summary>Services</summary>
          <div className="nav-dropdown-panel">
            {services.map((service) => (
              <a href={service.href} key={service.title}>
                {service.title}
              </a>
            ))}
          </div>
        </details>
        <a href="/#portfolio">Cover Samples</a>
        <a href="/#genres">Genres</a>
        <a href="/how-it-works">How It Works</a>
        <a href="/resources">Resources</a>
        <a href="/about">About</a>
      </nav>

      <button className="header-cta" type="button" onClick={requestProjectInquiry}>
        Start Your Project
      </button>

      <button
        className="menu-toggle"
        ref={menuToggleRef}
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => {
          if (open) closeMenu(true);
          else setOpen(true);
        }}
      >
        <span />
        <span />
        <span />
      </button>

      {open ? (
        <button
          className="mobile-menu-backdrop"
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => closeMenu(true)}
        />
      ) : null}

      <div
        className={`mobile-menu${open ? " is-open" : ""}`}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
        aria-hidden={!open}
        inert={open ? undefined : true}
        ref={menuRef}
      >
        <div className="mobile-menu-top">
          <span id="mobile-navigation-title">Menu</span>
          <button type="button" onClick={() => closeMenu(true)} aria-label="Close navigation menu">
            ×
          </button>
        </div>
        <a href="/services" onClick={() => closeMenu()}>Services</a>
        <a href="/#portfolio" onClick={() => closeMenu()}>Cover Samples</a>
        <a href="/#genres" onClick={() => closeMenu()}>Genres</a>
        <a href="/how-it-works" onClick={() => closeMenu()}>How It Works</a>
        <a href="/resources" onClick={() => closeMenu()}>Resources</a>
        <a href="/about" onClick={() => closeMenu()}>About</a>
        <a href="/contact" onClick={() => closeMenu()}>Contact</a>
        <button
          className="mobile-project"
          type="button"
          onClick={() => {
            closeMenu();
            requestProjectInquiry();
          }}
        >
          Start Your Project
        </button>
        <a className="mobile-call" href={phoneHref} onClick={() => closeMenu()}>Call {phoneDisplay}</a>
      </div>

      {inquiryOpen ? <ProjectInquiryDialog open onClose={closeInquiry} /> : null}
    </header>
  );
}

export function PortfolioGallery({ compact = false }: { compact?: boolean }) {
  const [genre, setGenre] = useState("Fiction");
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const coverDialogRef = useRef<HTMLDialogElement>(null);
  const lastCoverTriggerRef = useRef<HTMLButtonElement | null>(null);
  const filteredBooks = useMemo(() => {
    if (genre !== "All") return books.filter((book) => book.genre === genre);
    return [...books];
  }, [genre]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setGenre(genreFromUrl(window.location.href, genres, "Fiction"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (sliderRef.current) sliderRef.current.scrollLeft = 0;
  }, [genre]);

  useEffect(() => {
    const dialog = coverDialogRef.current;
    if (selectedBook && dialog && !dialog.open) dialog.showModal();
  }, [selectedBook]);

  const handleCoverDialogClosed = () => {
    setSelectedBook(null);
    window.requestAnimationFrame(() => lastCoverTriggerRef.current?.focus());
  };

  useEffect(() => {
    let disposed = false;
    let teardown = () => {};
    let inViewport = false;
    let initialized = false;
    let restartAuto = () => {};
    const sliderElement = sliderRef.current;

    if (!sliderElement) return;

    const initializeSlider = () => {
      if (initialized || disposed) return;
      initialized = true;

      void import("jquery").then(({ default: $ }) => {
        if (disposed) return;

        const $slider = $(sliderElement);
        const $module = $slider.closest(".portfolio-module");
        const namespace = ".sitePortfolio";
        let timer = 0;

        const move = (direction: number) => {
          const cardWidth = $slider.find(".book-card").first().outerWidth(true) ?? 250;
          const maximum = Math.max(0, sliderElement.scrollWidth - sliderElement.clientWidth);
          const current = $slider.scrollLeft() ?? 0;
          const requested = current + direction * cardWidth * 2;
          const next = direction > 0 && requested >= maximum - 4
            ? 0
            : Math.max(0, Math.min(maximum, requested));
          $slider.stop(true).animate({ scrollLeft: next }, 420);
        };

        const pause = () => window.clearInterval(timer);
        restartAuto = () => {
          pause();
          if (!autoScrollPaused && !reducedMotion && inViewport && !document.hidden && sliderElement.scrollWidth > sliderElement.clientWidth) {
            timer = window.setInterval(() => move(1), 5600);
          }
        };

        $module.find(".portfolio-prev").off(namespace).on(`click${namespace}`, () => move(-1));
        $module.find(".portfolio-next").off(namespace).on(`click${namespace}`, () => move(1));
        $slider.on(`mouseenter${namespace} focusin${namespace} pointerdown${namespace}`, pause);
        $slider.on(`mouseleave${namespace} focusout${namespace} pointerup${namespace} pointercancel${namespace}`, restartAuto);
        restartAuto();

        teardown = () => {
          pause();
          $slider.stop(true);
          $module.find(".portfolio-prev, .portfolio-next").off(namespace);
          $slider.off(namespace);
        };
      });
    };

    const visibilityObserver = "IntersectionObserver" in window
      ? new IntersectionObserver(
        ([entry]) => {
          inViewport = entry.isIntersecting;
          if (inViewport) initializeSlider();
          restartAuto();
        },
        { rootMargin: "280px 0px" },
      )
      : null;
    const handleVisibilityChange = () => restartAuto();

    if (visibilityObserver) {
      visibilityObserver.observe(sliderElement);
    } else {
      inViewport = true;
      initializeSlider();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      visibilityObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      teardown();
    };
  }, [autoScrollPaused, genre, reducedMotion]);

  return (
    <div className={compact ? "portfolio-module is-compact" : "portfolio-module"}>
      <div className="portfolio-toolbar">
        <div className="genre-filters" aria-label="Filter cover samples by genre">
          {genres.map((item) => (
            <button
              key={item}
              type="button"
              className={genre === item ? "is-active" : ""}
              aria-pressed={genre === item}
              onClick={() => setGenre(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          className="portfolio-motion-toggle"
          type="button"
          aria-label={reducedMotion
            ? "Cover gallery motion disabled by device preference"
            : autoScrollPaused ? "Resume cover gallery" : "Pause cover gallery"}
          aria-pressed={autoScrollPaused || reducedMotion}
          disabled={reducedMotion}
          onClick={() => setAutoScrollPaused((current) => !current)}
        >
          {reducedMotion ? "Motion off" : autoScrollPaused ? "Resume" : "Pause"}
        </button>
      </div>

      <div className="slider-shell">
        <button className="portfolio-control portfolio-prev" type="button" aria-label="Show previous covers">
          ←
        </button>
        <div ref={sliderRef} className="portfolio-slider" role="region" aria-label={`${genre} cover gallery`}>
          {filteredBooks.map((book) => (
            <article className="book-card" key={book.id}>
              <button
                className="book-cover-frame book-cover-button"
                type="button"
                aria-label={`Open ${book.title} sample cover`}
                onClick={(event) => {
                  lastCoverTriggerRef.current = event.currentTarget;
                  setSelectedBook(book);
                }}
              >
                {/* Native images serve the committed cover files without an optimization rewrite. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.image}
                  alt={`${book.title} sample cover`}
                  width={book.width}
                  height={book.height}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <p className="book-genre">{book.genre}</p>
              <h3>{book.title}</h3>
              <p className="book-creator">Sample concept</p>
            </article>
          ))}
        </div>
        <button className="portfolio-control portfolio-next" type="button" aria-label="Show more covers">
          →
        </button>
      </div>

      <p className="portfolio-disclosure">
        These are original sample cover concepts created for this website. Titles and author lines are illustrative, and the samples are not client projects or published books. Client covers are displayed only with the author&apos;s permission.
      </p>

      <dialog
        className="cover-dialog"
        ref={coverDialogRef}
        aria-labelledby="cover-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          coverDialogRef.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            coverDialogRef.current?.close();
          }
        }}
        onClose={handleCoverDialogClosed}
      >
        {selectedBook ? (
          <div className="cover-dialog-panel">
            <div className="cover-dialog-heading">
              <div>
                <p className="section-kicker">Sample cover preview</p>
                <h2 id="cover-dialog-title">{selectedBook.title}</h2>
                <p>{selectedBook.genre} · Sample concept</p>
              </div>
              <button
                className="dialog-close"
                type="button"
                aria-label="Close cover preview"
                onClick={() => coverDialogRef.current?.close()}
              >
                ×
              </button>
            </div>
            <div className="cover-preview-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedBook.image}
                alt={`${selectedBook.title} sample cover`}
                width={selectedBook.width}
                height={selectedBook.height}
                decoding="async"
              />
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}

function ProjectInquiryForm({ modal = false }: { modal?: boolean }) {
  const [status, setStatus] = useState("");

  const submitInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = `Publishing inquiry: ${String(form.get("projectType") || "Book project")}`;
    const body = [
      `Name: ${String(form.get("name") || "")}`,
      `Email: ${String(form.get("email") || "")}`,
      `Phone: ${String(form.get("phone") || "")}`,
      `Genre: ${String(form.get("genre") || "")}`,
      `Manuscript stage: ${String(form.get("stage") || "")}`,
      `Services: ${String(form.get("services") || "")}`,
      "",
      String(form.get("message") || ""),
    ].join("\n");

    setStatus("Your email application is opening with the inquiry details. Review the message before sending.");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className={`project-form${modal ? " is-modal" : ""}`} onSubmit={submitInquiry}>
      <div className="form-row">
          <label>
            Full name
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
      </div>
      <div className="form-row">
          <label>
            Phone
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label>
            Project type
            <select name="projectType" defaultValue="Book publishing">
              <option>Book publishing</option>
              <option>Editing</option>
              <option>Ghostwriting</option>
              <option>Cover design</option>
              <option>Book formatting</option>
              <option>Author Brand Content</option>
              <option>Book marketing</option>
            </select>
          </label>
      </div>
      <div className="form-row">
          <label>
            Genre
            <input name="genre" type="text" placeholder="e.g. memoir, romance, business" />
          </label>
          <label>
            Manuscript stage
            <select name="stage" defaultValue="Complete draft">
              <option>Idea or notes</option>
              <option>Outline</option>
              <option>Partial draft</option>
              <option>Complete draft</option>
              <option>Edited manuscript</option>
              <option>Formatted files</option>
            </select>
          </label>
      </div>
      <label>
          Services needed
          <input name="services" type="text" placeholder="List the services you are considering" />
      </label>
      <label>
          Project details
          <textarea name="message" rows={5} required placeholder="Word count, formats, schedule, and the main result you need" />
      </label>
      <label className="consent-field">
          <input type="checkbox" required />
          <span>I agree to be contacted about this inquiry and have reviewed the <a href="/privacy">privacy notice</a>.</span>
      </label>
      <button className="button button-primary form-submit" type="submit">Prepare My Inquiry</button>
      <p className="form-note">This form prepares an email with your project details. Review the message before sending.</p>
      <p className="form-note form-safety-note">{businessFacts.credentialWarning}</p>
      {status ? <p className="form-status" role="status">{status}</p> : null}
    </form>
  );
}

function ProjectInquiryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      window.requestAnimationFrame(() => dialog.querySelector<HTMLInputElement>('input[name="name"]')?.focus());
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      className="inquiry-dialog"
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="inquiry-dialog-title"
    >
      <div className="inquiry-dialog-panel">
        <div className="inquiry-dialog-heading">
          <div>
            <p className="section-kicker">Project inquiry</p>
            <h2 id="inquiry-dialog-title">Tell us about your book.</h2>
            <p>Share the essential details and we will review the project before discussing scope.</p>
          </div>
          <button className="dialog-close" type="button" onClick={onClose} aria-label="Close project inquiry form">×</button>
        </div>
        <ProjectInquiryForm modal />
      </div>
    </dialog>
  );
}

export function ContactPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`contact-layout${compact ? " is-compact" : ""}`}>
      <div className="contact-copy">
        <p className="section-kicker">Start with the manuscript</p>
        <h2>Tell us where your book stands today.</h2>
        <p>
          Share the book&apos;s genre, approximate word count, current draft stage, and publishing plans. We will review it before discussing scope.
        </p>
        <div className="contact-methods">
          <a href={phoneHref}>
            <small>Call</small>
            <strong>{phoneDisplay}</strong>
          </a>
          <a href={`mailto:${email}`}>
            <small>Email</small>
            <strong>{email}</strong>
          </a>
          <div className="contact-address">
            <small>Office</small>
            <address>{businessAddress}</address>
          </div>
        </div>
      </div>

      <ProjectInquiryForm />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a className="wordmark" href="/">
            <span>AMZ Publishing</span> <strong>Pro</strong>
          </a>
          <p>Publishing services for independent authors, from manuscript review through final files.</p>
          <p className="footer-trust">{businessFacts.trustStatement}</p>
          <p className="footer-domain">{businessFacts.domain}</p>
        </div>
        <div>
          <h3>Services</h3>
          <a href="/book-publishing">Book publishing</a>
          <a href="/ghostwriting">Ghostwriting</a>
          <a href="/editing">Editing</a>
          <a href="/book-formatting">Formatting</a>
          <a href="/cover-design">Cover design</a>
          <a href="/author-brand-content">Author Brand Content</a>
        </div>
        <div>
          <h3>Explore</h3>
          <a href="/portfolio">Cover samples</a>
          <a href="/genres">Genres</a>
          <a href="/how-it-works">How it works</a>
          <a href="/resources">Resources</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
        <div>
          <h3>Contact</h3>
          <a href={phoneHref}>{phoneDisplay}</a>
          <a href={`mailto:${email}`}>{email}</a>
          <address className="footer-address">{businessAddress}</address>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 {businessFacts.name}. All rights reserved.</p>
        <p className="footer-independence">{businessFacts.independenceStatement}</p>
      </div>
    </footer>
  );
}

function HeroBookRotator() {
  const [heroCoverIndex, setHeroCoverIndex] = useState(1);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const warmedCoversRef = useRef(new Set<string>());

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSceneVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateDocumentVisibility = () => setDocumentVisible(!document.hidden);
    updateDocumentVisibility();
    document.addEventListener("visibilitychange", updateDocumentVisibility);
    return () => document.removeEventListener("visibilitychange", updateDocumentVisibility);
  }, []);

  useEffect(() => {
    if (reducedMotion || !sceneVisible || !documentVisible) return;

    let delayTimer = 0;
    let idleCallback = 0;
    const warmNextCovers = () => {
      [1, 2].forEach((offset) => {
        const cover = heroPublishingCovers[(heroCoverIndex + offset) % heroPublishingCovers.length];
        if (warmedCoversRef.current.has(cover.src)) return;
        warmedCoversRef.current.add(cover.src);
        const image = new Image();
        image.src = cover.src;
        void image.decode?.().catch(() => undefined);
      });
    };
    const scheduleIdleWarmup = () => {
      delayTimer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) {
          idleCallback = window.requestIdleCallback(warmNextCovers, { timeout: 1800 });
        } else {
          delayTimer = window.setTimeout(warmNextCovers, 500);
        }
      }, 1200);
    };

    if (document.readyState === "complete") scheduleIdleWarmup();
    else window.addEventListener("load", scheduleIdleWarmup, { once: true });

    return () => {
      window.removeEventListener("load", scheduleIdleWarmup);
      window.clearTimeout(delayTimer);
      if (idleCallback && "cancelIdleCallback" in window) window.cancelIdleCallback(idleCallback);
    };
  }, [documentVisible, heroCoverIndex, reducedMotion, sceneVisible]);

  const activeCover = heroPublishingCovers[heroCoverIndex];
  const motionStopped = reducedMotion || rotationPaused || !sceneVisible || !documentVisible;

  return (
    <div
      id="hero-publishing-portal"
      role="region"
      data-cover-count={heroPublishingCovers.length}
      data-active-genre={activeCover.genre}
      data-visual="publishing-cabinet"
      aria-label="Manuscript to published book illustration"
      aria-describedby="hero-publishing-description"
      className={`hero-books${motionStopped ? " is-paused" : ""}${reducedMotion ? " is-reduced-motion" : ""}`}
      ref={sceneRef}
    >
      <p className="visually-hidden" id="hero-publishing-description">
        A manuscript enters the cabinet, the processing light turns yellow, and the published book exits as the light turns green. The sequence repeats across ten sample covers.
      </p>
      <div className="hero-art-backdrop" aria-hidden="true" />
      <div className="hero-scene-floor" aria-hidden="true" />
      <div id="hero-publishing-motion" className="hero-motion-cycle">
        <span
          className="hero-cycle-clock"
          aria-hidden="true"
          onAnimationIteration={() => {
            if (!motionStopped) {
              setHeroCoverIndex((current) => (current + 1) % heroPublishingCovers.length);
            }
          }}
        />
        <div className="publishing-cabinet-scene">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="publishing-cabinet-shell"
            src="/hero-publishing/cabinet-shell.webp"
            alt=""
            width="1024"
            height="683"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            aria-hidden="true"
          />

          <div
            className="cabinet-manuscript-region cabinet-manuscript-slot"
            data-hero-mask="input-aperture"
            data-input-region="inside-slot"
            aria-hidden="true"
          >
            <div className="cabinet-manuscript-track">
              <div className="cabinet-manuscript">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-publishing/manuscript-stack.webp"
                  alt=""
                  width="640"
                  height="427"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          <div
            className="cabinet-manuscript-region cabinet-manuscript-exterior"
            data-input-region="exterior"
            aria-hidden="true"
          >
            <div className="cabinet-manuscript-track">
              <div className="cabinet-manuscript">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-publishing/manuscript-stack.webp"
                  alt=""
                  width="640"
                  height="427"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          <div className="cabinet-lamp" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="cabinet-lamp-state cabinet-lamp-processing"
              src="/hero-publishing/lamp-processing.webp"
              alt=""
              width="42"
              height="42"
              loading="eager"
              decoding="async"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="cabinet-lamp-state cabinet-lamp-published"
              src="/hero-publishing/lamp-published.webp"
              alt=""
              width="42"
              height="42"
              loading="eager"
              decoding="async"
            />
          </div>

          <span className="cabinet-status cabinet-status-processing" aria-hidden="true">In Process</span>
          <span className="cabinet-status cabinet-status-published" aria-hidden="true">Published</span>

          <div
            className="published-output-region published-output-slot"
            data-output-region="inside-slot"
            aria-hidden="true"
          >
            <div className="published-output-track">
              <div className="published-output">
                <span className="visually-hidden">Finished Book</span>
                <figure className="published-book">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="published-book-body"
                    src="/hero-publishing/finished-book-body.webp"
                    alt=""
                    width="720"
                    height="720"
                    loading="eager"
                    decoding="async"
                    aria-hidden="true"
                  />
                  {/* Native images keep every sample cover at its original proportions. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="published-book-cover"
                    src={activeCover.src}
                    alt=""
                    width={activeCover.width}
                    height={activeCover.height}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </figure>
              </div>
            </div>
          </div>

          <div
            className="published-output-region published-output-exterior"
            data-output-region="exterior"
            aria-hidden="true"
          >
            <div className="published-output-track">
              <div className="published-output">
                <figure className="published-book">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="published-book-body"
                    src="/hero-publishing/finished-book-body.webp"
                    alt=""
                    width="720"
                    height="720"
                    loading="eager"
                    decoding="async"
                    aria-hidden="true"
                  />
                  {/* Native images keep every sample cover at its original proportions. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="published-book-cover"
                    src={activeCover.src}
                    alt=""
                    width={activeCover.width}
                    height={activeCover.height}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        className="hero-rotation-toggle"
        type="button"
        aria-controls="hero-publishing-motion"
        aria-label={reducedMotion
          ? "Manuscript to book animation disabled by device preference"
          : rotationPaused ? "Resume manuscript to book animation" : "Pause manuscript to book animation"}
        aria-pressed={rotationPaused || reducedMotion}
        disabled={reducedMotion}
        onClick={() => setRotationPaused((current) => !current)}
      >
        {reducedMotion ? "Motion off" : rotationPaused ? "Resume" : "Pause"}
      </button>
    </div>
  );
}

export function PublishingSite() {
  const supportedGenres = useMemo(() => genres.filter((genre) => genre !== "All"), []);

  useEffect(() => {
    const prefetchedRoutes = new Set<string>();
    const prefetchEligibleSelector = [
      ".primary-nav a",
      ".mobile-menu > a",
      ".service-card",
      ".process-intro > a",
      ".genre-grid a",
      ".standalone-genre-grid a",
      ".page-actions a",
      ".page-cta a",
    ].join(", ");
    const prefetchRoute = (event: Event) => {
      const eventTarget = event.target;
      if (!(eventTarget instanceof Element)) return;
      const anchor = eventTarget.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      if (!anchor.matches(prefetchEligibleSelector)) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      const route = `${destination.pathname}${destination.search}`;
      if (prefetchedRoutes.has(route)) return;
      prefetchedRoutes.add(route);

      const prefetch = document.createElement("link");
      prefetch.rel = "prefetch";
      prefetch.href = route;
      prefetch.dataset.siteRoutePrefetch = "true";
      document.head.appendChild(prefetch);
    };

    document.addEventListener("pointerover", prefetchRoute, { passive: true });
    document.addEventListener("focusin", prefetchRoute);
    return () => {
      document.removeEventListener("pointerover", prefetchRoute);
      document.removeEventListener("focusin", prefetchRoute);
    };
  }, []);

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />

      <section className="hero" id="top">
        <div className="hero-inner" id="main-content">
          <div className="hero-copy">
            <p className="eyebrow">Independent publishing services</p>
            <h1>From Manuscript to Published Book</h1>
            <p className="hero-lede">
              {businessFacts.description}
            </p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={requestProjectInquiry}>Get a Publishing Consultation</button>
              <a className="button button-secondary" href={phoneHref}>Call {phoneDisplay}</a>
              <a className="button button-secondary" href={`mailto:${email}`}>Email Us</a>
            </div>
            <div className="hero-proof" aria-label="Publishing service highlights">
              <span>Complete manuscript support</span>
              <span>Print + eBook preparation</span>
              <span>No online checkout</span>
            </div>
          </div>

          <HeroBookRotator />
        </div>
      </section>

      <section className="service-ribbon" aria-label="Core services">
        <span>Book publishing</span>
        <span>Cover design</span>
        <span>Structural editing</span>
        <span>Book formatting</span>
        <span>Ghostwriting</span>
        <span>Author brand content</span>
      </section>

      <section className="section services-section" id="services">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Publishing services</p>
            <h2>The right specialist for each stage of the book.</h2>
          </div>
          <p>Choose the work your manuscript needs. Every service has a clear scope and deliverables.</p>
        </div>
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

      <section className="process-section" id="process">
        <div className="section process-inner">
          <div className="process-intro">
            <p className="section-kicker">A practical production path</p>
            <h2>A clear process from first review to final files.</h2>
            <p>You can see what is being worked on, what needs your approval, and what files you will receive.</p>
            <a className="text-link light-link" href="/how-it-works">See the full project process →</a>
          </div>
          <div className="process-list">
            <article><span>Manuscript review</span><p>Stage, genre, audience, word count, services, formats, timeline, and responsibilities.</p></article>
            <article><span>Editorial and design</span><p>Scheduled drafts, concepts, revisions, and approvals against the agreed scope.</p></article>
            <article><span>Formatting and QA</span><p>Files for each format are checked for dimensions, navigation, readability, and production issues.</p></article>
            <article><span>Platform setup and handoff</span><p>We prepare metadata and uploads, then deliver the final files and ownership records.</p></article>
          </div>
        </div>
      </section>

      <section className="section portfolio-section" id="portfolio">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Sample cover concepts</p>
            <h2>Cover artwork shown in full.</h2>
          </div>
          <p>Every cover keeps its original proportions so titles, artwork, and details remain clear.</p>
        </div>
        <PortfolioGallery />
      </section>

      <section className="genre-section" id="genres">
        <div className="section genre-inner">
          <div className="genre-intro">
            <p className="section-kicker">Genres we support</p>
            <h2>Every genre speaks to a different reader.</h2>
            <p>Genre shapes the way a book reads, looks, and reaches its audience. We use those expectations to guide each production decision.</p>
          </div>
          <div className="genre-grid">
            {supportedGenres.map((genre) => (
              <a
                href={portfolioHrefForGenre(genre)}
                key={genre}
              >
                <span>{genre}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section capability-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Production capability</p>
            <h2>Different stages call for different specialists.</h2>
          </div>
          <p>A clear scope shows what is being done, who is doing it, and what you will receive.</p>
        </div>
        <div className="capability-grid">
          <article>
            <p className="capability-label">Editorial</p>
            <h3>Strengthen the writing and structure.</h3>
            <ul><li>Ghostwriting and rewriting</li><li>Developmental and structural editing</li><li>Line editing, copyediting, proofreading</li></ul>
          </article>
          <article>
            <p className="capability-label">Retail Platform Brand Content</p>
            <h3>Create the cover and interior.</h3>
            <ul><li>3D cover concepts and full wraps</li><li>eBook, paperback, hardcover interiors</li><li>Illustration and retail platform visual content</li></ul>
          </article>
          <article>
            <p className="capability-label">Publishing</p>
            <h3>Prepare the book for release.</h3>
            <ul><li>Platform and format setup support</li><li>Metadata, categories, and keywords</li><li>Author profile and launch handoff</li></ul>
          </article>
        </div>
      </section>

      <section className="platform-section">
        <div className="section platform-inner">
          <div>
            <p className="section-kicker">Platform preparation</p>
            <h2>Files prepared for the formats you plan to publish.</h2>
          </div>
          <div className="platform-list">
            <span>eBook</span><span>Paperback</span><span>Hardcover</span><span>Author profile</span><span>Retail brand content</span><span>Metadata handoff</span>
          </div>
          <p className="platform-note">Platform approval, royalties, ranking, availability, and sales remain subject to each platform&apos;s current rules and reader demand.</p>
        </div>
      </section>

      <section className="section resources-section" id="resources">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Author resources</p>
            <h2>Useful decisions before production begins.</h2>
          </div>
          <a className="text-link" href="/resources">Open the resource guide →</a>
        </div>
        <div className="resource-grid">
          <article><span>Manuscript</span><h3>Get the manuscript ready for editing.</h3><p>Organize chapters, permissions, references, artwork, and style decisions before the edit.</p></article>
          <article><span>Ownership</span><h3>Keep control of your book and files.</h3><p>Document manuscript, ISBN, cover licensing, source files, platform account, and royalty access.</p></article>
          <article><span>Formats</span><h3>Choose the right print and digital formats.</h3><p>Reflowable eBooks, paperback interiors, and hardcover wraps each need different production checks.</p></article>
        </div>
      </section>

      <section className="faq-section">
        <div className="section faq-inner">
          <div>
            <p className="section-kicker">Common questions</p>
            <h2>Before you request a quote.</h2>
          </div>
          <div className="faq-list">
            <details><summary>Do you publish directly as the book&apos;s publisher?</summary><p>{businessFacts.name} provides paid publishing services. The publishing account, ISBN, imprint, files, and rights arrangement should be confirmed in the project scope.</p></details>
            <details><summary>Do you guarantee 70% royalties or sales?</summary><p>No. Royalty eligibility, pricing, sales, reviews, rankings, and retailer availability depend on platform rules and market demand.</p></details>
            <details><summary>Can I hire only editing or cover design?</summary><p>Yes. Each service can be scoped independently, or combined into a coordinated production plan.</p></details>
            <details><summary>Do you need my full manuscript through the website?</summary><p>No. Start with a project summary. Full manuscripts should be transferred only through an agreed, secure project workflow.</p></details>
            <details><summary>Is there an online checkout?</summary><p>No. The website collects a project inquiry. Pricing and deliverables are confirmed in a written quotation and agreement.</p></details>
          </div>
        </div>
      </section>

      <section className="contact-section" id="start-project">
        <div className="section"><ContactPanel /></div>
      </section>

      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildOrganizationStructuredData()),
        }}
      />
    </main>
  );
}
