"""Create the approved Sailor Slipper pair and export the website GLB.

Run from the repository root with:

    /Applications/Blender.app/Contents/MacOS/Blender \
      --background assets/blender/sailor-slippers.blend \
      --python assets/blender/scripts/export_slippers_glb.py

The source is authored Z-up with toes toward -Y. Blender's glTF exporter maps
that to the website contract: Y-up with toes toward +Z. Only the six duplicated
pair meshes are selected for export; preview cameras, lights, ground and the
single-slipper source are intentionally excluded.
"""

from __future__ import annotations

import math
from pathlib import Path

import bmesh
import bpy
from mathutils import Matrix, Vector


REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
MODEL_PATH = REPOSITORY_ROOT / "public" / "models" / "sailor-slippers.glb"
PREVIEW_DIR = REPOSITORY_ROOT / "assets" / "blender" / "previews"

SOURCE_OBJECT_NAMES = (
    "SLIPPER_UPPER_CS_STRIPE1_CS_STRIPE2",
    "COLLAR_CS_ANKLE",
    "SOLE_CS_SOLE",
)
REQUIRED_MATERIALS = {"CS_STRIPE1", "CS_STRIPE2", "CS_ANKLE", "CS_SOLE"}

PAIR_LAYOUT = {
    "LEFT": {
        "x": -0.75,
        "y": 0.035,
        "rotation_degrees": 2.0,
    },
    "RIGHT": {
        "x": 0.75,
        "y": -0.035,
        "rotation_degrees": -2.0,
    },
}


def get_source_objects() -> list[bpy.types.Object]:
    objects: list[bpy.types.Object] = []
    for name in SOURCE_OBJECT_NAMES:
        obj = bpy.data.objects.get(name)
        if obj is None or obj.type != "MESH":
            raise RuntimeError(f"Missing approved source mesh: {name}")
        objects.append(obj)
    return objects


def create_export_collection() -> bpy.types.Collection:
    existing = bpy.data.collections.get("SAILOR_SLIPPERS_GLB_EXPORT")
    if existing is not None:
        for obj in list(existing.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(existing)

    collection = bpy.data.collections.new("SAILOR_SLIPPERS_GLB_EXPORT")
    bpy.context.scene.collection.children.link(collection)
    return collection


def duplicate_pair(
    source_objects: list[bpy.types.Object],
    collection: bpy.types.Collection,
) -> list[bpy.types.Object]:
    pair: list[bpy.types.Object] = []
    for side, layout in PAIR_LAYOUT.items():
        transform = (
            Matrix.Translation((layout["x"], layout["y"], 0.0))
            @ Matrix.Rotation(
                math.radians(layout["rotation_degrees"]), 4, "Z"
            )
        )
        for source in source_objects:
            mesh = source.data.copy()
            mesh.transform(transform @ source.matrix_world)
            duplicate = bpy.data.objects.new(
                f"{side}_{source.name}",
                mesh,
            )
            collection.objects.link(duplicate)
            duplicate["configurator_side"] = side.lower()
            duplicate["configurator_material_contract"] = (
                "CS_STRIPE1 CS_STRIPE2 CS_ANKLE CS_SOLE"
            )
            pair.append(duplicate)
    return pair


def mesh_bounds(
    objects: list[bpy.types.Object],
) -> tuple[Vector, Vector]:
    points = [
        obj.matrix_world @ vertex.co
        for obj in objects
        for vertex in obj.data.vertices
    ]
    minimum = Vector(min(point[index] for point in points) for index in range(3))
    maximum = Vector(max(point[index] for point in points) for index in range(3))
    return minimum, maximum


def centre_pair_and_ground(objects: list[bpy.types.Object]) -> None:
    minimum, maximum = mesh_bounds(objects)
    # Blender X/Y becomes glTF X/Z. Centre both horizontal axes and move the
    # lowest bevelled sole vertex to Blender Z=0 (glTF Y=0).
    translation = Matrix.Translation(
        (
            -(minimum.x + maximum.x) * 0.5,
            -(minimum.y + maximum.y) * 0.5,
            -minimum.z,
        )
    )
    for obj in objects:
        obj.data.transform(translation)
        obj.data.update()


def validate_pair(objects: list[bpy.types.Object]) -> None:
    material_names = {
        material.name
        for obj in objects
        for material in obj.data.materials
        if material is not None
    }
    missing_materials = REQUIRED_MATERIALS - material_names
    if missing_materials:
        raise RuntimeError(
            "Pair is missing configurable materials: "
            + ", ".join(sorted(missing_materials))
        )

    for obj in objects:
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        non_manifold = [edge for edge in bm.edges if not edge.is_manifold]
        if non_manifold:
            count = len(non_manifold)
            bm.free()
            raise RuntimeError(f"{obj.name} has {count} non-manifold edges")
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(obj.data)
        bm.free()
        obj.data.update()

    minimum, maximum = mesh_bounds(objects)
    if abs(minimum.z) > 0.0001:
        raise RuntimeError(f"Soles do not rest at Blender Z=0: {minimum.z}")
    if abs(minimum.x + maximum.x) > 0.0001:
        raise RuntimeError("Pair is not centred on Blender X")
    if abs(minimum.y + maximum.y) > 0.0001:
        raise RuntimeError("Pair is not centred on Blender Y")

    dimensions = maximum - minimum
    print(
        "PAIR_BOUNDS_BLENDER",
        tuple(round(value, 4) for value in minimum),
        tuple(round(value, 4) for value in maximum),
    )
    print(
        "PAIR_DIMENSIONS_GLTF_XYZ",
        (
            round(dimensions.x, 4),
            round(dimensions.z, 4),
            round(dimensions.y, 4),
        ),
    )
    print("PAIR_MATERIALS", sorted(material_names))


def export_glb(objects: list[bpy.types.Object]) -> None:
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]

    bpy.ops.export_scene.gltf(
        filepath=str(MODEL_PATH),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_extras=False,
    )
    print("EXPORTED_GLB", MODEL_PATH)
    print("EXPORTED_BYTES", MODEL_PATH.stat().st_size)


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_pair_previews(
    source_objects: list[bpy.types.Object],
    pair: list[bpy.types.Object],
) -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    for source in source_objects:
        source.hide_render = True
    for obj in pair:
        obj.hide_render = False

    camera = bpy.data.objects.get("PREVIEW_CAMERA")
    if camera is None or camera.type != "CAMERA":
        raise RuntimeError("The approved Blender source has no preview camera")

    scene = bpy.context.scene
    scene.camera = camera
    scene.render.resolution_x = 1000
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    target = (0.0, 0.0, 0.35)
    views = {
        # Inverse of the glTF axis conversion for the viewer's default camera.
        "pair-three-quarter": ((4.4, -5.7, 4.2), 4.15, target),
        "pair-top": ((0.0, 0.0, 6.0), 3.55, (0.0, 0.0, 0.2)),
        "pair-side": ((5.2, 0.0, 1.35), 3.55, target),
    }
    for name, (location, ortho_scale, view_target) in views.items():
        camera.location = location
        camera.data.type = "ORTHO"
        camera.data.ortho_scale = ortho_scale
        look_at(camera, view_target)
        scene.render.filepath = str(PREVIEW_DIR / f"{name}.png")
        bpy.ops.render.render(write_still=True)
        print("RENDERED_PREVIEW", scene.render.filepath)


def main() -> None:
    source_objects = get_source_objects()
    export_collection = create_export_collection()
    pair = duplicate_pair(source_objects, export_collection)
    centre_pair_and_ground(pair)
    validate_pair(pair)
    export_glb(pair)
    render_pair_previews(source_objects, pair)


if __name__ == "__main__":
    main()
