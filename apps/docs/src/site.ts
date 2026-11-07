import pkg from "nano-skeleton/package.json" with { type: "json" };

const VERSION = pkg.version;
const REPO_URL = "https://github.com/smashercosmo/nano-skeleton";
const NPM_URL = "https://www.npmjs.com/package/nano-skeleton";

/**
 * Prefixes a path with the site's base, e.g. "changelog" →
 * "/nano-skeleton/changelog"
 */
function withBase(path = "") {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path}`;
}

export { VERSION, REPO_URL, NPM_URL, withBase };
