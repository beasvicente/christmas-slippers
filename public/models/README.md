# Sailor Slippers GLB contract

Place the final asset at `public/models/sailor-slippers.glb`.

The GLB should contain the complete left-and-right pair:

- use metres or a consistent Blender unit scale;
- centre the pair on X and Z, with soles resting at Y=0;
- point toes toward +Z and heels toward -Z;
- apply transforms before export;
- keep the full pair close to 3 units wide and 3 units long so the existing camera framing works.

Every rendered slipper primitive must identify one of the four configurable
zones through either its mesh name or material-slot name:

| Configurator zone | Required token |
| --- | --- |
| Stripe 1 | `CS_STRIPE1` |
| Stripe 2 | `CS_STRIPE2` |
| Ankle/collar | `CS_ANKLE` |
| Sole | `CS_SOLE` |

Tokens may appear inside longer names, such as `LEFT_CS_STRIPE1_FOREFOOT`.
Material-slot names take precedence over mesh names, allowing one mesh to use
multiple configurable materials. Do not share one material slot across two
different zones.

Use white or neutral base colours when combining colour zones with texture
maps. The viewer preserves GLB textures and PBR properties while replacing the
base colour from the configurator. Meshes without one of the four tokens keep
their authored material, but the asset is rejected if any required zone is
missing entirely.
