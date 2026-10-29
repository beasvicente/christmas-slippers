import assert from "node:assert/strict";
import test from "node:test";

import {
  NEUTRAL_SLIPPER_MATERIALS,
  resolveSlipperMaterialColors,
} from "../src/components/three/SlipperMaterials.ts";

test("uses neutral viewer materials without changing null configuration values", () => {
  const colors = {
    stripe1: null,
    stripe2: null,
    ankle: null,
    sole: null,
  };

  assert.deepEqual(resolveSlipperMaterialColors(colors), NEUTRAL_SLIPPER_MATERIALS);
  assert.deepEqual(colors, {
    stripe1: null,
    stripe2: null,
    ankle: null,
    sole: null,
  });
});

test("maps each selected yarn ID to its catalogue preview colour", () => {
  assert.deepEqual(
    resolveSlipperMaterialColors({
      stripe1: "56",
      stripe2: "97",
      ankle: "01",
      sole: "02",
    }),
    {
      stripe1: "#B51F2E",
      stripe2: "#234A36",
      ankle: "#F3EFE1",
      sole: "#1D1D1F",
    },
  );
});

test("allows one catalogue colour to be reused across every material zone", () => {
  assert.deepEqual(
    new Set(
      Object.values(
        resolveSlipperMaterialColors({
          stripe1: "56",
          stripe2: "56",
          ankle: "56",
          sole: "56",
        }),
      ),
    ),
    new Set(["#B51F2E"]),
  );
});
