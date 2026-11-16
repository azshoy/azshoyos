// Facts about the company, in one place. Everything machine-readable (meta
// tags, JSON-LD, llms.txt, the Markdown routes, the hidden summary on `/`)
// reads from here, so a fact is changed once.
//
// Sources: the Finnish trade register (PRH/YTJ, business ID 3474773-5), the
// desktop's own Readme.md and Contact files (components/azshoyos/Program/
// DocumentReader/ReadableFiles.tsx) and the portfolio API. Do not add a
// claim here that none of those back up.

// The one public address. az.sh is the brand, but the az.sh domain does not
// serve this site, so every canonical, sitemap entry and structured-data id
// points here.
export const siteUrl = "https://azsh.fi"

export const absoluteUrl = (path: string) => `${siteUrl}${path === "/" ? "" : path}`

export const org = {
  name: "az.sh",
  legalName: "az.sh Oy",
  businessId: "3474773-5",
  foundingDate: "2024-09-17",
  // The one public email and phone (owner decision, Nov 2026); the desktop Contact file uses the same pair.
  email: "contact@azsh.fi",
  telephone: "+358 44 055 4838",
  address: {streetAddress: "Asemakatu 18 as. 2", postalCode: "90100", addressLocality: "Oulu", addressCountry: "FI"},
  // Where the people in the portfolio API are based.
  locations: ["Oulu", "Helsinki"],
  github: "https://github.com/azshoy",
  // This site's own public repository: the working example of an agent-ready codebase.
  repository: "https://github.com/azshoy/azshoyos",
  logo: "/logo-512.png",
  ogImage: "/og.png",
  tagline: "Software engineering and design from Finland",
  summary: "az.sh (az.sh Oy) is a software engineering and design consultancy from Oulu and Helsinki, Finland. "
    + "We take ownership of whole products and platforms, end to end: architecture, implementation, infrastructure, testing and design, "
    + "for SaaS and Web3 clients.",
  howWeWork: "We work with AI coding agents every day, under human review and automated quality gates, "
    + "and we build software that agents can use: this site publishes llms.txt, a Markdown version of every page and JSON-LD, "
    + "and its public repository carries an AGENTS.md and a CI smoke test.",
}

// A service and the page that proves it. `project` is a portfolio API id, so a
// service links to its case study even when the case study's title changes.
export type Service = {
  name: string
  detail: string
  evidence: {project: string} | {people: true} | {url: string}
}

// Ordered by how much published evidence stands behind each line. Kept in line
// with the service lines in the azsh-leads repo (config.toml, `proof`).
export const services: Service[] = [
  {
    name: "Web3 and DeFi protocol engineering",
    detail: "smart contracts, ERC-4626 and cross-chain vaults, audit remediation, non-custodial automation and live protocol operations",
    evidence: {project: "DeFiProtocolEngineeringOperations"},
  },
  {
    name: "Fullstack product development",
    detail: "real-time SaaS products in Go, TypeScript, Next.js and React, from first commit to production",
    evidence: {project: "HuudotOnlineVehicleAuctionPlatform"},
  },
  {
    name: "Cloud platforms and DevOps",
    detail: "Kubernetes, infrastructure as code with Pulumi, preview environments per branch, observability",
    evidence: {project: "HuudotOnlineVehicleAuctionPlatform"},
  },
  {
    name: "Test automation and quality assurance",
    detail: "Playwright end-to-end suites and CI quality gates on every pull request",
    evidence: {project: "Tiedotwebsitedesignandtestingqualityassurance"},
  },
  {
    name: "Brand, UI and UX design",
    detail: "visual identity, websites and product interfaces",
    evidence: {project: "Tiedotwebsitedesignandtestingqualityassurance"},
  },
  {
    name: "AI-assisted delivery and agent-ready software",
    detail: "delivery with AI coding agents under human review and CI quality gates, plus codebases, docs and websites that agents can read and work in (llms.txt, Markdown twins, JSON-LD, AGENTS.md)",
    evidence: {url: "https://github.com/azshoy/azshoyos"},
  },
  {
    name: "Embedded systems",
    detail: "C/C++, VHDL and Yocto on Xilinx/AMD hardware",
    evidence: {people: true},
  },
]

// Search results cut descriptions at about 155 characters; cut on a word.
export const clip = (text: string, max = 155) => {
  const flat = text.replace(/\s+/g, " ").trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.·—-]+$/, "")}…`
}
