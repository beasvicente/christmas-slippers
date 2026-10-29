import assert from "node:assert/strict";
import test from "node:test";

import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
} from "three";

import {
  SLIPPER_MODEL_ASSET,
  SLIPPER_MODEL_ZONES,
} from "../src/components/three/SlipperModelAsset.ts";
import {
  applySlipperMaterialColors,
  getMissingSlipperZones,
  resolveSlipperZone,
} from "../src/components/three/SlipperModelMapping.ts";

const TEST_COLORS = {
  stripe1: "#AA0000",
  stripe2: "#007700",
  ankle: "#F4EAD0",
  sole: "#222222",
};

test("documents the stable GLB path and four required zones", () => {
  assert.equal(SLIPPER_MODEL_ASSET.url, "/models/sailor-slippers.glb");
  assert.deepEqual(SLIPPER_MODEL_ZONES, [
    "stripe1",
    "stripe2",
    "ankle",
    "sole",
  ]);
});

test("resolves colour zones from Blender-safe mesh and material names", () => {
  assert.equal(resolveSlipperZone("LEFT_CS_STRIPE1_FOREFOOT"), "stripe1");
  assert.equal(resolveSlipperZone("cs-stripe2.001"), "stripe2");
  assert.equal(resolveSlipperZone("Right CS Ankle Collar"), "ankle");
  assert.equal(resolveSlipperZone("CS_SOLE"), "sole");
  assert.equal(resolveSlipperZone("DecorativeStitch"), undefined);
});

test("clones material slots and applies all four configurator colours", () => {
  const root = new Group();
  const sourceMaterials = SLIPPER_MODEL_ZONES.map(
    (zone) => new MeshStandardMaterial({ name: `CS_${zone.toUpperCase()}` }),
  );
  const mesh = new Mesh(new BoxGeometry(), sourceMaterials);
  root.add(mesh);

  const counts = applySlipperMaterialColors(root, TEST_COLORS);
  const mappedMaterials = mesh.material;

  assert.ok(Array.isArray(mappedMaterials));
  assert.deepEqual(getMissingSlipperZones(counts), []);

  for (const [index, zone] of SLIPPER_MODEL_ZONES.entries()) {
    assert.notEqual(mappedMaterials[index], sourceMaterials[index]);
    assert.equal(
      `#${mappedMaterials[index].color.getHexString().toUpperCase()}`,
      TEST_COLORS[zone],
    );
  }
});

test("uses a named mesh when its material slot has no zone token", () => {
  const root = new Group();
  const sourceMaterial = new MeshStandardMaterial({ color: "#FFFFFF" });
  const mesh = new Mesh(new BoxGeometry(), sourceMaterial);
  mesh.name = "RIGHT_CS_ANKLE";
  root.add(mesh);

  const counts = applySlipperMaterialColors(root, TEST_COLORS);

  assert.equal(counts.ankle, 1);
  assert.equal(
    `#${mesh.material.color.getHexString().toUpperCase()}`,
    TEST_COLORS.ankle,
  );
  assert.deepEqual(getMissingSlipperZones(counts), [
    "stripe1",
    "stripe2",
    "sole",
  ]);
});
