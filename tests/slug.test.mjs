// Unit tests for the pure helpers. Run: npm test (Node 22+, no dependencies).
import {test} from "node:test";
import assert from "node:assert/strict";
import {slugify, slugOf} from "../util/slug.ts";
import {clip} from "../util/site.ts";

test("slugify folds diacritics and punctuation to lowercase ASCII", () => {
  assert.equal(slugify("Aleksi Seppänen"), "aleksi-seppanen");
  assert.equal(slugify("Huudot: Online Vehicle Auction Platform"), "huudot-online-vehicle-auction-platform");
  assert.equal(slugify("Tiedot website design, and testing/quality assurance"), "tiedot-website-design-and-testing-quality-assurance");
  assert.equal(slugify("DeFi Protocol Engineering & Operations"), "defi-protocol-engineering-operations");
  assert.equal(slugify("  --Ödön Åström--  "), "odon-astrom");
});

test("slugOf prefers an explicit slug from the API", () => {
  assert.equal(slugOf({title: "Aleksi Seppänen"}), "aleksi-seppanen");
  assert.equal(slugOf({title: "Aleksi Seppänen", slug: "aleksi"}), "aleksi");
});

test("clip keeps short text and cuts long text on a word, under the limit", () => {
  assert.equal(clip("  short   text "), "short text");
  const long = "word ".repeat(60)
  const out = clip(long)
  assert.ok(out.length <= 155, `${out.length}`)
  assert.ok(out.endsWith("word…"))
  assert.equal(clip("Ends with punctuation, then more words that run past the limit", 30), "Ends with punctuation, then…")
});
