import type { NextConfig } from "next";

const apiHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_PORTFOLIO_API_URL ?? "http://127.0.0.1:4000") }
  catch { return new URL("http://127.0.0.1:4000") }
})()

const nextConfig: NextConfig = {
  // Only the portfolio API is allowed through the image optimizer, and only the
  // portfolio components use next/image, so nothing else is affected. Resized
  // variants are cached on the CDN instead of being pulled from the API again.
  images: {
    remotePatterns: [{
      protocol: apiHost.protocol.replace(":", "") as 'http' | 'https',
      hostname: apiHost.hostname,
      port: apiHost.port,
      pathname: "/static/**",
    }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Permanent so search engines move any old /people and /projects links over.
  // The old big-tab portfolio at /people and /projects is hidden, not deleted:
  // the desktop app still renders those components, and dropping the redirects
  // brings the routes straight back.
  async redirects() {
    return [
      {source: "/people", destination: "/portfolio/people", permanent: true},
      {source: "/people/:path*", destination: "/portfolio/people", permanent: true},
      {source: "/projects", destination: "/portfolio/projects", permanent: true},
      {source: "/projects/:path*", destination: "/portfolio/projects", permanent: true},
      // Leftover stub of the old people portal; nothing links to it.
      {source: "/something", destination: "/portfolio/people", permanent: true},
    ]
  },
};

export default nextConfig;
