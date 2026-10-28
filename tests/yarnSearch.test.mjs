import assert from "node:assert/strict";
import test from "node:test";

import { filterYarnColors } from "../src/components/configurator/yarnSearch.ts";
import { DROPS_SNOW_YARN_COLORS } from "../src/domain/slipper/index.ts";

test("returns the complete catalogue for an empty yarn search", () => {
  assert.equal(filterYarnColors(DROPS_SNOW_YARN_COLORS, "").length, 87);
  assert.equal(filterYarnColors(DROPS_SNOW_YARN_COLORS, "   ").length, 87);
});

test("finds yarns by exact manufacturer colour number", () => {
  const result = filterYarnColors(DROPS_SNOW_YARN_COLORS, "56");

  assert.deepEqual(result.map(({ id }) => id), ["56"]);
});

test("finds yarns by case-insensitive colour name", () => {
  const result = filterYarnColors(DROPS_SNOW_YARN_COLORS, "CHRISTMAS RED");

  assert.equal(result.length, 1);
  assert.equal(result[0]?.name, "christmas red");
});

test("matches every term across the colour number and name", () => {
  const christmasRed = DROPS_SNOW_YARN_COLORS.find(
    ({ name }) => name === "christmas red",
  );

  assert.ok(christmasRed);
  assert.deepEqual(
    filterYarnColors(DROPS_SNOW_YARN_COLORS, `${christmasRed.id} red`).map(
      ({ id }) => id,
    ),
    [christmasRed.id],
  );
});

test("returns an empty result for an unknown yarn", () => {
  assert.deepEqual(filterYarnColors(DROPS_SNOW_YARN_COLORS, "midnight tinsel"), []);
});
