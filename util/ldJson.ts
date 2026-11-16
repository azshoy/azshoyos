// For <script type="application/ld+json">: "<" is escaped so text from the API
// cannot close the script tag. Its own module so the browser bundle of
// SeoHead does not pull in the graph builders.
export const ldJson = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c")
