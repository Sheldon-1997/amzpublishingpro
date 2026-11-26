/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { businessFacts } from "../app/business-data";
import { canonicalRedirectPath } from "../app/site-redirects";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const canonicalPath = canonicalRedirectPath(url.pathname);
    const needsCanonicalHost =
      url.hostname.toLowerCase() === `www.${businessFacts.domain}`;

    if (canonicalPath || needsCanonicalHost) {
      url.protocol = "https:";
      url.hostname = businessFacts.domain;
      url.port = "";
      if (canonicalPath) url.pathname = canonicalPath;
      return Response.redirect(url.toString(), canonicalPath ? 301 : 308);
    }

    let response: Response;
    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      response = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    } else {
      response = await handler.fetch(request, env, ctx);
    }

    if (!response.ok || !["GET", "HEAD"].includes(request.method)) return response;

    const requestHasPrivateContext = request.headers.has("authorization") || request.headers.has("cookie");
    const responseVary = response.headers.get("vary") ?? "";
    const responseHasPrivateContext = response.headers.has("set-cookie")
      || /^\s*\*\s*$/.test(responseVary)
      || /(?:^|,)\s*(?:authorization|cookie)\s*(?:,|$)/i.test(responseVary);
    if (requestHasPrivateContext || responseHasPrivateContext) return response;

    const existingCachePolicy = response.headers.get("cache-control")?.toLowerCase() ?? "";
    if (existingCachePolicy.includes("private") || existingCachePolicy.includes("no-store")) return response;
    if (url.pathname.startsWith("/_next/static/")) return response;

    const headers = new Headers();
    response.headers.forEach((value, name) => {
      if (name.toLowerCase() !== "cache-control") headers.append(name, value);
    });
    const contentType = headers.get("content-type")?.toLowerCase() ?? "";
    const isPublicAsset = contentType.startsWith("image/")
      || /\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?)$/i.test(url.pathname);

    if (isPublicAsset) {
      const edgePolicy = "public, max-age=604800, stale-while-revalidate=2592000";
      headers.set("Cloudflare-CDN-Cache-Control", edgePolicy);
      headers.set("CDN-Cache-Control", edgePolicy);
    } else if (contentType.includes("text/html")) {
      headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=86400");
    } else {
      return response;
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

export default worker;
