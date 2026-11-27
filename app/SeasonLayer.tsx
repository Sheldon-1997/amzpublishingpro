"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Native links avoid a Vinext production navigation crash. */
import { useEffect, useRef } from "react";
import { seasonById, seasons } from "./seasons";

// One line per season is rendered; CSS shows the line that matches the
// data-season attribute set in <head>, so there is no flash or layout jump.
export function SeasonRibbon() {
  return (
    <aside className="season-ribbon" aria-label="Seasonal greeting">
      <div className="season-ribbon-inner">
        {seasons.map((season) => (
          <p className="season-message" data-season-for={season.id} data-tone={season.tone} key={season.id}>
            <span className="season-message-text">{season.offer || season.message}</span>
            {season.tone === "festive" ? <a href="/contact">Start a conversation</a> : null}
          </p>
        ))}
        <button
          className="season-dismiss"
          type="button"
          aria-label="Hide the seasonal greeting and effects"
          onClick={() => {
            const root = document.documentElement;
            const id = root.getAttribute("data-season");
            root.setAttribute("data-season-dismissed", "");
            try {
              if (id) window.sessionStorage.setItem("season-dismissed", id);
            } catch {
              // Storage can be unavailable; the greeting is still hidden for this page.
            }
            window.dispatchEvent(new Event("season:dismissed"));
          }}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </aside>
  );
}

type Particle = { x: number; y: number; r: number; vx: number; vy: number; spin: number; angle: number; color: string; phase: number };

// A light, decorative canvas effect for festive seasons. It never runs for
// visitors who prefer reduced motion, pauses when the tab is hidden, and stops
// when the greeting is dismissed.
export function SeasonEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = document.documentElement;
    const season = seasonById(root.getAttribute("data-season"));
    if (!canvas || !season || season.effect === "none") return;
    if (root.hasAttribute("data-season-dismissed")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const effect = season.effect;
    const colors = season.effectColors;
    const rising = effect === "hearts" || effect === "sparks";
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;
    let last = performance.now();
    // One canvas pixel per CSS pixel is plenty for soft particles.
    const ratio = 1;
    const particles: Particle[] = [];

    const spawn = (anywhere: boolean): Particle => {
      const size = effect === "snow" ? 1.6 + Math.random() * 3.2
        : effect === "sparks" ? 1.4 + Math.random() * 2.6
          : effect === "hearts" ? 6 + Math.random() * 7
            : 5 + Math.random() * 6;
      const speed = effect === "snow" ? 18 + Math.random() * 30
        : effect === "sparks" ? 10 + Math.random() * 22
          : effect === "hearts" ? 16 + Math.random() * 22
            : 34 + Math.random() * 46;
      return {
        x: Math.random() * width,
        y: anywhere ? Math.random() * height : rising ? height + 20 : -20,
        r: size,
        vx: (Math.random() - 0.5) * (effect === "confetti" ? 40 : 16),
        vy: rising ? -speed : speed,
        spin: (Math.random() - 0.5) * 3,
        angle: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)] ?? "#ffffff",
        phase: Math.random() * Math.PI * 2,
      };
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const target = Math.min(34, Math.max(12, Math.round(width / (effect === "snow" ? 40 : 56))));
      while (particles.length < target) particles.push(spawn(true));
      particles.length = target;
    };

    const drawHeart = (size: number) => {
      context.beginPath();
      context.moveTo(0, size * 0.35);
      context.bezierCurveTo(-size, -size * 0.35, -size * 0.55, -size, 0, -size * 0.45);
      context.bezierCurveTo(size * 0.55, -size, size, -size * 0.35, 0, size * 0.35);
      context.fill();
    };

    const draw = (now: number) => {
      if (!running) return;
      frame = window.requestAnimationFrame(draw);
      // About 30 frames a second is enough for drifting particles.
      if (now - last < 30) return;
      const delta = Math.min(0.08, (now - last) / 1000);
      last = now;
      context.clearRect(0, 0, width, height);

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        particle.phase += delta;
        particle.angle += particle.spin * delta;
        particle.x += (particle.vx + Math.sin(particle.phase) * 14) * delta;
        particle.y += particle.vy * delta;
        if (particle.y > height + 24 || particle.y < -24 || particle.x < -30 || particle.x > width + 30) {
          particles[index] = spawn(false);
          continue;
        }

        context.save();
        context.translate(particle.x, particle.y);
        context.fillStyle = particle.color;
        if (effect === "snow") {
          context.globalAlpha = 0.92;
          context.beginPath();
          context.arc(0, 0, particle.r, 0, Math.PI * 2);
          context.fill();
        } else if (effect === "sparks") {
          context.globalAlpha = 0.35 + 0.55 * Math.abs(Math.sin(particle.phase * 2.2));
          context.rotate(Math.PI / 4);
          context.fillRect(-particle.r, -particle.r, particle.r * 2, particle.r * 2);
        } else if (effect === "hearts") {
          context.globalAlpha = 0.6;
          context.rotate(Math.sin(particle.phase) * 0.25);
          drawHeart(particle.r);
        } else if (effect === "leaves") {
          context.globalAlpha = 0.82;
          context.rotate(particle.angle);
          context.beginPath();
          context.ellipse(0, 0, particle.r, particle.r * 0.48, 0, 0, Math.PI * 2);
          context.fill();
        } else {
          context.globalAlpha = 0.85;
          context.rotate(particle.angle);
          context.scale(1, Math.cos(particle.phase * 3));
          context.fillRect(-particle.r * 0.7, -particle.r * 0.4, particle.r * 1.4, particle.r * 0.8);
        }
        context.restore();
      }
    };

    const start = () => {
      if (!running) return;
      window.cancelAnimationFrame(frame);
      last = performance.now();
      frame = window.requestAnimationFrame(draw);
    };
    // Particles only run over the top of the page, so reading and scrolling
    // further down costs nothing.
    let nearTop = true;
    const onVisibility = () => {
      window.cancelAnimationFrame(frame);
      if (!document.hidden && nearTop) start();
    };
    const onScroll = () => {
      const next = window.scrollY < window.innerHeight * 0.9;
      if (next === nearTop) return;
      nearTop = next;
      window.cancelAnimationFrame(frame);
      if (nearTop) start();
      else context.clearRect(0, 0, width, height);
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
      context.clearRect(0, 0, width, height);
    };

    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("season:dismissed", stop);
    onScroll();
    return () => {
      stop();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("season:dismissed", stop);
    };
  }, []);

  return <canvas className="season-effects" ref={canvasRef} aria-hidden="true" />;
}
