"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Native links avoid a Vinext production navigation crash. */
import { type CSSProperties, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { buildOrganizationStructuredData, businessFacts, ownerClientStatement, ownerFigures } from "./business-data";
import { clientCovers } from "./client-covers";
import { clientReviews } from "./client-reviews";
import { heroPublishingCovers } from "./hero-publishing-covers";
import { SeasonRibbon } from "./SeasonLayer";
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
    <>
    <header className={`site-header${solid ? " site-header--solid" : ""}`}>
      <a className="wordmark" href="/" aria-label={`${businessFacts.name} home`}>
        <BrandLogo className="brand-logo brand-logo--wide" variant="wide" />
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
    <SeasonRibbon />
    </>
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
          <span>I agree to be contacted about this inquiry and have reviewed the <a href="/privacy">privacy policy</a>.</span>
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
          <a className="wordmark" href="/" aria-label={`${businessFacts.name} home`}>
            <BrandLogo className="brand-logo" />
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
          <a href="/privacy">Privacy Policy</a>
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

type HeroCover = { src: string; spine: string; width: number; height: number; aspect: number; label: string; kind: "client" | "sample" };

// The hero shows real client covers. The sample covers are only a fallback for
// a site with no client covers on file.
const heroCovers: readonly HeroCover[] = clientCovers.length > 0
  ? clientCovers.map((cover) => ({ src: cover.src, spine: cover.spine, width: cover.width, height: cover.height, aspect: cover.width / cover.height, label: cover.title, kind: "client" }))
  : heroPublishingCovers.map((cover) => ({ src: cover.src, spine: cover.spine, width: cover.width, height: cover.height, aspect: cover.width / cover.height, label: cover.genre, kind: "sample" }));
const heroCoverWord = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"][heroCovers.length] ?? String(heroCovers.length);
type HeroSceneHandle = import("./hero-scene").HeroSceneHandle;

// A book built from CSS faces. The KDP section uses it for its sample books and
// the hero uses it as the still picture shown before (or instead of) WebGL.
function HeroBook3D({ cover }: { cover: HeroCover }) {
  return (
    <figure className="published-book">
      <span className="book3d" style={{ "--book-spine": cover.spine } as CSSProperties}>
        <span className="book3d-back" />
        <span className="book3d-spine" />
        <span className="book3d-pages" />
        <span className="book3d-top" />
        <span className="book3d-bottom" />
        {/* Native images keep every sample cover at its original proportions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="published-book-cover"
          src={cover.src}
          alt=""
          width={cover.width}
          height={cover.height}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <span className="book3d-sheen" />
      </span>
    </figure>
  );
}

// The hero visual. The server renders a still book; in the browser a WebGL
// scene (app/hero-scene.ts) takes over when motion is allowed and WebGL works.
function HeroBookStage() {
  const [coverIndex, setCoverIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [live, setLive] = useState(false);
  const [stageVisible, setStageVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroSceneHandle | null>(null);
  const startIndexRef = useRef(coverIndex);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setStageVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  // Load three.js only after the page is interactive, and never for visitors
  // who asked for reduced motion.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    let cancelled = false;
    let timer = 0;
    const boot = async () => {
      try {
        const { createHeroScene } = await import("./hero-scene");
        if (cancelled) return;
        sceneRef.current = createHeroScene({
          canvas,
          covers: heroCovers,
          startIndex: startIndexRef.current,
          onCoverChange: (index) => {
            startIndexRef.current = index;
            setCoverIndex(index);
          },
          onReady: () => setLive(true),
          onLost: () => setLive(false),
        });
      } catch {
        // The still book stays in place.
      }
    };
    const schedule = () => { timer = window.setTimeout(() => void boot(), 250); };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("load", schedule);
      sceneRef.current?.dispose();
      sceneRef.current = null;
      setLive(false);
    };
  }, [reducedMotion]);

  const running = live && !paused && stageVisible && documentVisible;
  useEffect(() => {
    sceneRef.current?.setRunning(running);
  }, [running]);

  // The camera and the book lean toward the pointer anywhere over the hero.
  useEffect(() => {
    if (!live) return;
    const hero = stageRef.current?.closest<HTMLElement>(".hero");
    if (!hero || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (event: PointerEvent) => {
      const box = hero.getBoundingClientRect();
      sceneRef.current?.setPointer(
        ((event.clientX - box.left) / box.width - 0.5) * 2,
        ((event.clientY - box.top) / box.height - 0.5) * 2,
      );
    };
    const onLeave = () => sceneRef.current?.setPointer(0, 0);
    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, [live]);

  const activeCover = heroCovers[coverIndex];

  return (
    <div
      id="hero-publishing-portal"
      role="region"
      data-cover-count={heroCovers.length}
      data-cover-kind={activeCover.kind}
      data-active-genre={activeCover.label}
      data-visual="book-studio"
      aria-label="Book cover showcase"
      aria-describedby="hero-publishing-description"
      className={`hero-books${live ? " is-live" : ""}${paused ? " is-paused" : ""}${reducedMotion ? " is-reduced-motion" : ""}`}
      ref={stageRef}
    >
      <p className="visually-hidden" id="hero-publishing-description">
        A hardcover book turns slowly in the light. It then lies back and opens, its pages lift into the air and settle again, and it closes as the next book. The sequence repeats across {heroCoverWord} {activeCover.kind === "client" ? "covers designed for our authors" : "sample covers"}.
      </p>
      <div className="hero-art-backdrop" aria-hidden="true" />
      <div id="hero-publishing-motion" className="hero-stage">
        <div className="hero-poster" aria-hidden="true">
          <HeroBook3D cover={activeCover} />
        </div>
        <canvas className="hero-stage-canvas" ref={canvasRef} aria-hidden="true" />
      </div>
      <p className="hero-stage-caption" aria-hidden="true">
        <span>{activeCover.kind === "client" ? "Client project" : "Sample cover"}</span> {activeCover.label}
      </p>
      {!reducedMotion && (
        <button
          className="hero-rotation-toggle"
          type="button"
          aria-controls="hero-publishing-motion"
          aria-label={paused ? "Resume book animation" : "Pause book animation"}
          aria-pressed={paused}
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      )}
    </div>
  );
}

const kdpSteps = [
  { title: "Ghostwriting", text: "Turn your idea, notes, or recordings into a complete manuscript in your voice." },
  { title: "Developmental editing", text: "Fix structure, pacing, and clarity before the line-level work begins." },
  { title: "Copyediting and proofreading", text: "Correct grammar, consistency, and typos so the final text reads cleanly." },
  { title: "Cover design", text: "A front cover for the eBook and a full wrap sized for your print trim and page count." },
  { title: "Formatting", text: "Interior files for eBook, paperback, and hardcover that pass KDP's file checks." },
  { title: "KDP setup and publishing", text: "Title details, description, categories, keywords, pricing, and upload in your own KDP account." },
] as const;

// Three client covers float beside the KDP copy (all 2:3 so they sit evenly).
const kdpShowcase = ["every-choice-has-consequences", "twisted-play-better-golf", "success-by-the-book"]
  .map((slug) => clientCovers.find((cover) => cover.slug === slug))
  .filter((cover): cover is (typeof clientCovers)[number] => Boolean(cover));

// Pointer effects shared by the whole page: cards marked data-tilt lean toward
// the cursor, and sections marked data-spotlight get a soft light under it.
function usePointerDepth() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let lastTilt: HTMLElement | null = null;
    const reset = (element: HTMLElement | null) => {
      if (!element) return;
      element.style.setProperty("--tilt-rx", "0");
      element.style.setProperty("--tilt-ry", "0");
    };
    const onMove = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const tilt = target.closest<HTMLElement>("[data-tilt]");
        if (tilt !== lastTilt) reset(lastTilt);
        lastTilt = tilt;
        if (tilt) {
          const box = tilt.getBoundingClientRect();
          const x = (event.clientX - box.left) / box.width;
          const y = (event.clientY - box.top) / box.height;
          tilt.style.setProperty("--tilt-rx", ((x - 0.5) * 2).toFixed(3));
          tilt.style.setProperty("--tilt-ry", ((y - 0.5) * 2).toFixed(3));
          tilt.style.setProperty("--glare-x", `${(x * 100).toFixed(1)}%`);
          tilt.style.setProperty("--glare-y", `${(y * 100).toFixed(1)}%`);
        }
        const spotlight = target.closest<HTMLElement>("[data-spotlight]");
        if (spotlight) {
          const box = spotlight.getBoundingClientRect();
          spotlight.style.setProperty("--spot-x", `${(event.clientX - box.left).toFixed(0)}px`);
          spotlight.style.setProperty("--spot-y", `${(event.clientY - box.top).toFixed(0)}px`);
        }
      });
    };
    const onLeave = () => {
      window.cancelAnimationFrame(frame);
      reset(lastTilt);
      lastTilt = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);
}

function KdpSection() {
  return (
    <section className="kdp-section" id="amazon-kdp" data-spotlight="">
      <div className="section kdp-inner">
        <div className="kdp-copy">
          <p className="section-kicker">Amazon KDP publishing support</p>
          <h2>We help authors publish on <span className="gradient-text">Amazon KDP</span>, from first draft to live listing.</h2>
          <p>
            Kindle Direct Publishing (KDP) is Amazon&apos;s self-publishing platform. We prepare everything your book
            needs to go live there: the writing and editing, the cover, the formatted files, and the listing itself.
            The work is done in your own KDP account, so the book, the files, and the royalties stay with you.
          </p>
          <div className="kdp-actions">
            <button className="button button-primary" type="button" onClick={requestProjectInquiry}>Plan my KDP release</button>
            <a className="button button-ghost" href="/book-publishing">How publishing setup works</a>
          </div>
          <p className="kdp-note">
            {businessFacts.name} is an independent company and is not affiliated with Amazon. Listing approval, royalties,
            rankings, and sales are decided by KDP&apos;s rules and by readers.
          </p>
        </div>

        <div className="kdp-stage" aria-hidden="true">
          <div className="kdp-orbit" />
          {kdpShowcase.map((book, index) => (
            <span className={`kdp-book kdp-book-${index + 1}`} key={book.slug}>
              <span className="book3d" style={{ "--book-spine": book.spine } as CSSProperties}>
                <span className="book3d-back" />
                <span className="book3d-spine" />
                <span className="book3d-pages" />
                <span className="book3d-top" />
                <span className="book3d-bottom" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="kdp-book-cover" src={book.src} alt="" width={book.width} height={book.height} loading="lazy" decoding="async" />
                <span className="book3d-sheen" />
              </span>
            </span>
          ))}
          <span className="kdp-stage-caption">Client covers</span>
        </div>
      </div>

      <div className="section kdp-path">
        <ul className="kdp-steps">
          {kdpSteps.map((step) => (
            <li className="kdp-step" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ul>
        <p className="kdp-path-note">Hire one stage or the whole path. Each stage has a written scope before work starts.</p>
      </div>
    </section>
  );
}

// One figure in the bar. The server renders the final number; in the browser it
// counts up once when the bar scrolls into view.
function FigureCount({ value, suffix }: { value: number; suffix: string }) {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion || !("IntersectionObserver" in window)) return;

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const started = performance.now();
      const duration = 1600;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / duration);
        setShown(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      setShown(0);
      frame = window.requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion, value]);

  return (
    <span className="figure-number" ref={ref}>
      <span aria-hidden="true">{shown.toLocaleString("en-US")}<i>{suffix}</i></span>
      <span className="visually-hidden">{value.toLocaleString("en-US")}{suffix}</span>
    </span>
  );
}

function FigureBar() {
  return (
    <section className="figure-bar" aria-label="AMZ Publishing Pro in numbers" data-spotlight="">
      <div className="figure-bar-inner">
        <p className="figure-bar-lead">{ownerClientStatement}</p>
        <dl className="figure-list">
          {ownerFigures.map((figure) => (
            <div className="figure-item" key={figure.label}>
              <dt>{figure.label}</dt>
              <dd><FigureCount value={figure.value} suffix={figure.suffix} /></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// Covers made for clients, standing on a shelf. Each one leans toward the pointer.
function ClientCovers() {
  if (clientCovers.length === 0) return null;

  return (
    <section className="section client-covers-section" id="client-covers">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Client projects</p>
          <h2>Covers we designed for our authors.</h2>
        </div>
        <p>Front covers from finished projects. Every title belongs to its author.</p>
      </div>
      <ul className="client-shelf">
        {clientCovers.map((cover) => (
          <li key={cover.slug}>
            <div className="client-cover-slot">
              <figure
                className="client-cover"
                data-tilt=""
                style={{
                  aspectRatio: `${cover.width} / ${cover.height}`,
                  // Slots are 2:3. A taller cover is narrowed so it still fits the slot's height.
                  width: `${Math.min(100, (cover.width / cover.height / (2 / 3)) * 100).toFixed(2)}%`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover.src}
                  alt={`${cover.title}${cover.author ? ` by ${cover.author}` : ""}, front cover`}
                  width={cover.width}
                  height={cover.height}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            </div>
            <span className="client-shelf-edge" aria-hidden="true" />
            <p className="client-cover-title">{cover.title}</p>
            {cover.author && <p className="client-cover-author">{cover.author}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

// Two rows of client covers drifting in opposite directions. Decorative: the
// same covers are listed with their titles on the shelf above.
function CoverRiver() {
  if (clientCovers.length < 6) return null;
  const half = Math.ceil(clientCovers.length / 2);
  const rows = [clientCovers.slice(0, half), clientCovers.slice(half)];

  return (
    <section className="cover-river" aria-label="Client covers in motion">
      <div className="cover-river-copy">
        <p className="section-kicker">From manuscript to shelf</p>
        <h2>Your book could be the next one here.</h2>
        <button className="button button-primary" type="button" onClick={requestProjectInquiry}>Start my book</button>
      </div>
      <div className="cover-river-rows" aria-hidden="true">
        {rows.map((row, rowIndex) => (
          <div className={`cover-river-row cover-river-row-${rowIndex + 1}`} key={rowIndex}>
            {[0, 1].map((copy) => (
              <div className="cover-river-group" key={copy}>
                {row.map((cover) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={cover.slug} src={cover.src} alt="" width={cover.width} height={cover.height} loading="lazy" decoding="async" />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// Client reviews as a deck of paper cards: the top card is read, then flicked
// to the back. Renders nothing until app/client-reviews.ts has sourced entries.
function ReviewDeck() {
  const [top, setTop] = useState(0);
  const total = clientReviews.length;
  if (total === 0) return null;

  const step = (direction: 1 | -1) => setTop((current) => (current + direction + total) % total);

  return (
    <section className="reviews-section" id="reviews">
      <div className="section reviews-inner">
        <div className="reviews-intro">
          <p className="section-kicker">Author reviews</p>
          <h2>In their own <span className="reviews-script">words.</span></h2>
          <p>Each review is shown exactly as the author posted it, with a link to the original.</p>
          {total > 1 && (
            <div className="reviews-controls">
              <button type="button" aria-label="Previous review" onClick={() => step(-1)}>←</button>
              <button type="button" aria-label="Next review" onClick={() => step(1)}>→</button>
              <span className="reviews-pips" aria-hidden="true">
                {clientReviews.map((review, index) => (
                  <i className={index === top ? "is-current" : undefined} key={review.sourceUrl + review.name} />
                ))}
              </span>
            </div>
          )}
        </div>

        <ol className="review-deck" aria-live="polite">
          {clientReviews.map((review, index) => {
            const depth = (index - top + total) % total;
            const leaving = total > 2 && depth === total - 1;
            return (
              <li
                className={`review-card${leaving ? " is-behind" : ""}`}
                data-depth={Math.min(depth, 3)}
                aria-hidden={depth !== 0}
                key={review.sourceUrl + review.name}
              >
                <span className="review-quote-mark" aria-hidden="true">“</span>
                <span className="review-stars" role="img" aria-label={`${review.rating} out of 5 stars`}>
                  {"★".repeat(review.rating)}
                </span>
                {review.title && <h3>{review.title}</h3>}
                <blockquote>{review.text}</blockquote>
                <footer>
                  <strong>{review.name}</strong>
                  <span>{[review.location, review.date].filter(Boolean).join(" · ")}</span>
                  <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" tabIndex={depth === 0 ? 0 : -1}>
                    Read on {review.sourceName} →
                  </a>
                </footer>
                {depth === 0 && total > 1 && (
                  <button className="review-card-next" type="button" onClick={() => step(1)}>
                    <span className="visually-hidden">Next review</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function PublishingSite() {
  const supportedGenres = useMemo(() => genres.filter((genre) => genre !== "All"), []);
  usePointerDepth();

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
            <h1>From Manuscript to <span className="gradient-text">Published Book</span></h1>
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

          <HeroBookStage />
        </div>
      </section>

      <section className="service-ribbon" aria-label="Core services">
        <div className="service-ribbon-track">
          {[0, 1].map((copy) => (
            <div className="service-ribbon-group" aria-hidden={copy === 1} key={copy}>
              <span>Book publishing</span>
              <span>Cover design</span>
              <span>Structural editing</span>
              <span>Book formatting</span>
              <span>Ghostwriting</span>
              <span>Author brand content</span>
              <span>Copyediting</span>
              <span>KDP setup</span>
            </div>
          ))}
        </div>
      </section>

      <KdpSection />

      <FigureBar />

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
            <a className="service-card" data-tilt="" href={service.href} key={service.title}>
              <span className="service-mark" aria-hidden="true" />
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              <span className="text-link">Read service details →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="process-section" id="process" data-spotlight="">
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

      <ClientCovers />

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

      <ReviewDeck />

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

      <CoverRiver />

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
