import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The old big-tab portfolio at /people and /projects is hidden, not deleted:
  // the desktop app still renders those components, and dropping the redirects
  // brings the routes straight back.
  async redirects() {
    return [
      {source: "/people", destination: "/portfolio/people", permanent: false},
      {source: "/people/:path*", destination: "/portfolio/people", permanent: false},
      {source: "/projects", destination: "/portfolio/projects", permanent: false},
      {source: "/projects/:path*", destination: "/portfolio/projects", permanent: false},
    ]
  },
};

export default nextConfig;
