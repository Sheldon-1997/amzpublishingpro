export const permanentRedirects: Readonly<Record<string, string>> = {
  "/author-brand-a-plus": "/author-brand-content",
  "/amazon-ad-campaign": "/book-ad-campaigns",
  "/amazon-ad-campaign.php": "/book-ad-campaigns",
  "/amazon-author.php": "/author-brand-content",
  "/brand-content.php": "/author-brand-content",
  "/about-us.php": "/about",
  "/ecommerce-store-setup.php": "/ecommerce-store-setup",
  "/ecommerce-marketing.php": "/ecommerce-marketing",
  "/amazon-plus-marketing.php": "/book-marketing",
  "/amazon-book-publishing.php": "/book-publishing",
  "/deep-keyword.php": "/keyword-research",
  "/contact-us.php": "/contact",
  "/terms.php": "/terms",
  "/privacy.php": "/privacy",
  "/index.php": "/book-publishing",
};

export function canonicalRedirectPath(pathname: string): string | undefined {
  return permanentRedirects[pathname];
}
