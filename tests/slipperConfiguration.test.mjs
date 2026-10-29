import assert from "node:assert/strict";
import test from "node:test";

import {
  DROPS_SNOW_YARN_COLORS,
  INITIAL_SLIPPER_CONFIGURATION,
  RETAILER_UNLISTED_DROPS_SNOW_COLORS,
  SUPPORTED_EU_SIZES,
  slipperConfigurationSchema,
} from "../src/domain/slipper/index.ts";

const validConfiguration = {
  recipientName: "Bea",
  euSize: 39,
  colors: {
    stripe1: "56",
    stripe2: "01",
    ankle: "97",
    sole: "02",
  },
};

test("defines an empty initial draft", () => {
  assert.deepEqual(INITIAL_SLIPPER_CONFIGURATION, {
    recipientName: "",
    euSize: null,
    colors: {
      stripe1: null,
      stripe2: null,
      ankle: null,
      sole: null,
    },
  });
});

test("accepts and normalises a complete configuration", () => {
  const result = slipperConfigurationSchema.parse({
    ...validConfiguration,
    recipientName: "  Bea  ",
  });

  assert.equal(result.recipientName, "Bea");
  assert.equal(result.euSize, 39);
});

test("allows one yarn colour to be reused across slipper sections", () => {
  const result = slipperConfigurationSchema.safeParse({
    ...validConfiguration,
    colors: {
      stripe1: "56",
      stripe2: "56",
      ankle: "56",
      sole: "56",
    },
  });

  assert.equal(result.success, true);
});

test("accepts retailer-listed colours that are temporarily out of stock", () => {
  const outOfStockColors = DROPS_SNOW_YARN_COLORS.filter(
    ({ availability }) => availability.stockStatus === "out-of-stock",
  );

  for (const color of outOfStockColors) {
    const result = slipperConfigurationSchema.safeParse({
      ...validConfiguration,
      colors: {
        stripe1: color.id,
        stripe2: color.id,
        ankle: color.id,
        sole: color.id,
      },
    });

    assert.equal(color.selectable, true);
    assert.equal(result.success, true);
  }
});

test("rejects an empty recipient name after trimming", () => {
  const result = slipperConfigurationSchema.safeParse({
    ...validConfiguration,
    recipientName: "   ",
  });

  assert.equal(result.success, false);
});

test("rejects null and unsupported shoe sizes", () => {
  for (const euSize of [null, 34, 44, 39.5]) {
    const result = slipperConfigurationSchema.safeParse({
      ...validConfiguration,
      euSize,
    });

    assert.equal(result.success, false);
  }
});

test("rejects incomplete and unknown yarn colour selections", () => {
  for (const stripe1 of [null, "144", "not-a-colour"]) {
    const result = slipperConfigurationSchema.safeParse({
      ...validConfiguration,
      colors: { ...validConfiguration.colors, stripe1 },
    });

    assert.equal(result.success, false);
  }
});

test("keeps the supported EU size range explicit", () => {
  assert.deepEqual(SUPPORTED_EU_SIZES, [35, 36, 37, 38, 39, 40, 41, 42, 43]);
});

test("captures the verified Laral Crafts catalogue snapshot", () => {
  assert.equal(DROPS_SNOW_YARN_COLORS.length, 87);
  assert.equal(
    new Set(DROPS_SNOW_YARN_COLORS.map(({ id }) => id)).size,
    DROPS_SNOW_YARN_COLORS.length,
  );
  assert.equal(
    DROPS_SNOW_YARN_COLORS.every(({ selectable }) => selectable),
    true,
  );

  const outOfStockIds = DROPS_SNOW_YARN_COLORS.filter(
    ({ availability }) => availability.stockStatus === "out-of-stock",
  ).map(({ id }) => id);

  assert.deepEqual(outOfStockIds, ["01", "141", "46", "56", "113"]);
  assert.deepEqual(
    RETAILER_UNLISTED_DROPS_SNOW_COLORS.map(({ id }) => id),
    ["144", "145"],
  );
});

test("uses valid approximate HEX preview values", () => {
  for (const color of DROPS_SNOW_YARN_COLORS) {
    assert.match(color.approximateHex, /^#[0-9A-F]{6}$/);

    for (const representativeHex of color.representativeHexes ?? []) {
      assert.match(representativeHex, /^#[0-9A-F]{6}$/);
    }
  }
});
