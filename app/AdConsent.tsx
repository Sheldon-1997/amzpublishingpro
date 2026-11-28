"use client";

import { useEffect, useState } from "react";
import { metaPixelId } from "./business-data";

// Advertising measurement (Meta Pixel) with consent.
//
// Nothing here runs while `metaPixelId` is empty. When an ID is set, the
// pixel loads only after the visitor chooses Accept, and never when the
// browser sends a Global Privacy Control signal. The choice is kept in the
// browser and can be changed from the "Advertising choices" link in the footer.

const storageKey = "ad-consent";
export const adChoicesEvent = "ad-choices:open";
export const leadSentEvent = "inquiry:sent";

type Choice = "granted" | "denied" | "";
type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown; callMethod?: (...args: unknown[]) => void };

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

function readChoice(): Choice {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value === "granted" || value === "denied" ? value : "";
  } catch {
    return "";
  }
}

function saveChoice(choice: Choice) {
  try {
    window.localStorage.setItem(storageKey, choice);
  } catch {
    // Private browsing: the choice lasts for this page only.
  }
}

function loadPixel() {
  if (!metaPixelId || window.fbq) return;
  const fbq: Fbq = (...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue?.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  fbq("init", metaPixelId);
  fbq("track", "PageView");
}

export function AdConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!metaPixelId) return;
    const privacySignal = navigator.globalPrivacyControl === true;
    const choice = readChoice();
    let timer = 0;
    if (choice === "granted" && !privacySignal) loadPixel();
    // Ask once the page has settled, not in the visitor's first second.
    else if (choice === "" && !privacySignal) timer = window.setTimeout(() => setOpen(true), 1500);

    const reopen = () => setOpen(true);
    const onLead = () => window.fbq?.("track", "Lead");
    window.addEventListener(adChoicesEvent, reopen);
    window.addEventListener(leadSentEvent, onLead);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(adChoicesEvent, reopen);
      window.removeEventListener(leadSentEvent, onLead);
    };
  }, []);

  if (!metaPixelId || !open) return null;

  const choose = (choice: "granted" | "denied") => {
    saveChoice(choice);
    setOpen(false);
    if (choice === "granted") loadPixel();
    // Turning measurement off takes full effect on the next page load.
    else if (window.fbq) window.fbq("consent", "revoke");
  };

  return (
    <aside className="ad-consent" role="dialog" aria-label="Advertising choices" aria-live="polite">
      <p>
        <strong>Advertising choices.</strong> With your permission we use the Meta Pixel to measure our adverts and show
        them to people who visited this site. See our{" "}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/privacy">privacy policy</a>.
      </p>
      <div className="ad-consent-actions">
        <button className="button button-secondary" type="button" onClick={() => choose("denied")}>Decline</button>
        <button className="button button-primary" type="button" onClick={() => choose("granted")}>Accept</button>
      </div>
    </aside>
  );
}

export function AdChoicesLink() {
  if (!metaPixelId) return null;
  return (
    <button className="footer-ad-choices" type="button" onClick={() => window.dispatchEvent(new Event(adChoicesEvent))}>
      Advertising choices
    </button>
  );
}
