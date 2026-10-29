"""Build the first editable Sailor Slipper geometry study.

Run from the repository root with:

    /Applications/Blender.app/Contents/MacOS/Blender \
      --background --factory-startup \
      --python assets/blender/scripts/build_slippers.py

Blender is Z-up, so this authoring file points the toe toward -Y. Blender's
glTF exporter converts that orientation to the app contract (Y-up, toe +Z).
All dimensions below are visual estimates from the supplied photographs, not
measurements from the knitting pattern.
"""

from __future__ import annotations

import math
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector


REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
BLENDER_DIR = REPOSITORY_ROOT / "assets" / "blender"
PREVIEW_DIR = BLENDER_DIR / "previews"
BLEND_PATH = BLENDER_DIR / "sailor-slippers.blend"


# Estimated authoring dimensions in metres. The intentionally simple scale
# makes later proportion changes predictable before a production GLB export.
PARAMETERS: dict[str, float] = {
    "overall_length": 0.275,
    "overall_width": 0.122,
    "upper_height": 0.064,
    "toe_roundness": 0.86,
    "opening_center_from_heel": 0.0675,
    "opening_length": 0.104,
    "opening_width": 0.076,
    "heel_wall_thickness": 0.0155,
    "heel_height": 0.047,
    "collar_thickness": 0.0144,
    "sole_thickness": 0.012,
    "interior_depth": 0.046,
}

# Work at 10 Blender units per metre for comfortable viewport navigation. The
# root Empty records the unit conversion and all estimated real-world values.
MODEL_SCALE = 10.0


def scaled(name: str) -> float:
    return PARAMETERS[name] * MODEL_SCALE


def footprint_exponent() -> float:
    """Map the user-facing 0..1 toe-roundness estimate to a superellipse."""
    return 2.0 + PARAMETERS["toe_roundness"] * 0.52325581395


def resolved_opening_center_y(half_length: float) -> float:
    """Respect both the requested opening position and minimum rear wall."""
    requested = half_length - scaled("opening_center_from_heel")
    wall_limited = (
        half_length
        - scaled("heel_wall_thickness")
        - scaled("opening_length") * 0.50
    )
    return min(requested, wall_limited)


def smoothstep(edge0: float, edge1: float, value: float) -> float:
    if edge0 == edge1:
        return float(value >= edge1)
    amount = max(0.0, min(1.0, (value - edge0) / (edge1 - edge0)))
    return amount * amount * (3.0 - 2.0 * amount)


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def create_collection(name: str) -> bpy.types.Collection:
    collection = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(collection)
    return collection


def move_to_collection(
    obj: bpy.types.Object, collection: bpy.types.Collection
) -> None:
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    collection.objects.link(obj)


def create_material(
    name: str,
    color: tuple[float, float, float, float],
    roughness: float = 0.82,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name=name)
    material.diffuse_color = color
    material.use_nodes = True
    principled = material.node_tree.nodes.get("Principled BSDF")
    if principled is not None:
        principled.inputs["Base Color"].default_value = color
        principled.inputs["Roughness"].default_value = roughness
        principled.inputs["Specular IOR Level"].default_value = 0.25
    return material


def apply_modifier(obj: bpy.types.Object, modifier_name: str) -> None:
    with bpy.context.temp_override(
        object=obj,
        active_object=obj,
        selected_objects=[obj],
        selected_editable_objects=[obj],
    ):
        bpy.ops.object.modifier_apply(modifier=modifier_name)


def shade_smooth(obj: bpy.types.Object) -> None:
    if obj.type != "MESH":
        return
    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def recalculate_normals(obj: bpy.types.Object) -> None:
    mesh = obj.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()


def superellipse_point(
    angle: float,
    half_width: float,
    half_length: float,
    exponent: float,
) -> tuple[float, float]:
    cosine = math.cos(angle)
    sine = math.sin(angle)
    x = half_width * math.copysign(abs(cosine) ** (2.0 / exponent), cosine)
    y = half_length * math.copysign(abs(sine) ** (2.0 / exponent), sine)
    # A Sailor Slipper is subtly narrower at the heel than through the ball.
    heel_taper = 1.0 - 0.075 * smoothstep(0.05, half_length, y)
    return x * heel_taper, y


def create_parameter_root(
    model_collection: bpy.types.Collection,
) -> bpy.types.Object:
    root = bpy.data.objects.new("SailorSlipper_PARAMETERS", None)
    model_collection.objects.link(root)
    root.empty_display_type = "PLAIN_AXES"
    root.empty_display_size = 0.25
    root["units"] = "metres (values); Blender geometry shown at 10 units/metre"
    root["authoring_axis"] = "Z up, toe -Y, heel +Y"
    root["export_axis"] = "glTF conversion: Y up, toe +Z"
    root["reference_status"] = "Visual estimates from supplied photographs"
    for name, value in PARAMETERS.items():
        root[name] = value
    return root


def create_upper(
    model_collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
) -> bpy.types.Object:
    half_width = scaled("overall_width") / 2.0
    half_length = scaled("overall_length") / 2.0
    upper_height = scaled("upper_height")
    sole_top = scaled("sole_thickness") * 0.72
    sidewall_top = sole_top + upper_height * 0.24
    crown_top = sole_top + upper_height
    body_center_z = sidewall_top + (crown_top - sidewall_top) * 0.50

    # Build a coherent domed upper with a real sidewall rather than scaling a
    # sphere. The superellipse outline gives the reference's broad round toe;
    # a vertical lower ring keeps the shell connected to the sole all around.
    segments = 96
    dome_rings = 30
    footprint_exponent_value = footprint_exponent()
    heel_drop = max(0.0, upper_height - scaled("heel_height")) * 0.3764705882
    vertices: list[tuple[float, float, float]] = [(0.0, -0.03, crown_top)]
    faces: list[tuple[int, ...]] = []

    for ring in range(1, dome_rings + 1):
        fraction = ring / dome_rings
        latitude = math.pi * 0.5 * fraction
        radial = math.sin(latitude)
        crown_factor = math.cos(latitude) ** 0.72
        for segment in range(segments):
            angle = 2.0 * math.pi * segment / segments
            boundary_x, boundary_y = superellipse_point(
                angle, half_width, half_length, footprint_exponent_value
            )
            y = -0.03 + boundary_y * radial
            heel_lowering = heel_drop * smoothstep(0.20, half_length, boundary_y)
            z = sidewall_top + (crown_top - sidewall_top) * crown_factor
            z -= heel_lowering * radial
            vertices.append((boundary_x * radial, y, z))

    first_ring = 1
    for segment in range(segments):
        next_segment = (segment + 1) % segments
        faces.append((0, first_ring + segment, first_ring + next_segment))

    for ring in range(dome_rings - 1):
        current = 1 + ring * segments
        following = current + segments
        for segment in range(segments):
            next_segment = (segment + 1) % segments
            faces.append(
                (
                    current + segment,
                    following + segment,
                    following + next_segment,
                    current + next_segment,
                )
            )

    outer_ring = 1 + (dome_rings - 1) * segments
    lower_ring = len(vertices)
    for segment in range(segments):
        angle = 2.0 * math.pi * segment / segments
        x, y = superellipse_point(
            angle,
            half_width * 0.992,
            half_length * 0.992,
            footprint_exponent_value,
        )
        vertices.append((x, -0.03 + y, sole_top - 0.012))
    for segment in range(segments):
        next_segment = (segment + 1) % segments
        faces.append(
            (
                outer_ring + segment,
                lower_ring + segment,
                lower_ring + next_segment,
                outer_ring + next_segment,
            )
        )

    bottom_center = len(vertices)
    vertices.append((0.0, -0.03, sole_top - 0.012))
    for segment in range(segments):
        next_segment = (segment + 1) % segments
        faces.append((bottom_center, lower_ring + next_segment, lower_ring + segment))

    mesh = bpy.data.meshes.new("Sailor slipper coherent upper mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    upper = bpy.data.objects.new(
        "SLIPPER_UPPER_CS_STRIPE1_CS_STRIPE2", mesh
    )
    model_collection.objects.link(upper)
    recalculate_normals(upper)

    # A closed ellipsoidal cutter produces a genuinely empty entry cavity with
    # a continuous interior floor. Its rear edge sits only one heel-wall width
    # from the slipper boundary.
    opening_center_y = resolved_opening_center_y(half_length)
    cavity_floor = sole_top + 0.07
    cavity_radius_z = scaled("interior_depth") * 0.95 + 0.08
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=80,
        ring_count=48,
        location=(
            0.0,
            opening_center_y,
            cavity_floor + cavity_radius_z,
        ),
        scale=(
            scaled("opening_width") * 0.50,
            scaled("opening_length") * 0.50,
            cavity_radius_z,
        ),
    )
    cutter = bpy.context.object
    cutter.name = "OPENING_BOOLEAN_GUIDE"
    move_to_collection(cutter, model_collection)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)

    boolean = upper.modifiers.new(name="True hollow foot opening", type="BOOLEAN")
    boolean.operation = "DIFFERENCE"
    boolean.solver = "EXACT"
    boolean.object = cutter
    apply_modifier(upper, boolean.name)
    bpy.data.objects.remove(cutter, do_unlink=True)

    bevel = upper.modifiers.new(name="Soft felted shell edges", type="BEVEL")
    bevel.width = 0.018
    bevel.segments = 2
    bevel.limit_method = "ANGLE"
    bevel.angle_limit = math.radians(28.0)
    apply_modifier(upper, bevel.name)

    # Boolean evaluation can introduce an empty slot from the cutter. Reset the
    # slots so the stable 0/1/2 material indices below always match the GLB
    # contract tokens.
    upper.data.materials.clear()
    upper.data.materials.append(materials["stripe1"])
    upper.data.materials.append(materials["stripe2"])
    upper.data.materials.append(materials["ankle"])

    # Alternating forefoot bands continue into the sidewalls. At the narrow
    # rear wall, vertical material assignment reserves the eventual requested
    # ankle -> stripe1 -> stripe2 -> stripe1 -> sole ordering without adding
    # overlapping colour geometry.
    upper.data.update()
    front_edge = -half_length
    band_width = 0.225
    rear_band_start = half_length - 0.31
    for polygon in upper.data.polygons:
        center = polygon.center
        opening_x = center.x / (scaled("opening_width") * 0.56)
        opening_y = (center.y - opening_center_y) / (
            scaled("opening_length") * 0.56
        )
        in_cavity = opening_x * opening_x + opening_y * opening_y < 1.0

        if in_cavity and center.z < body_center_z + 0.08:
            polygon.material_index = 2
        elif center.y > rear_band_start:
            rear_ratio = max(
                0.0,
                min(1.0, (center.z - sole_top) / max(upper_height, 0.001)),
            )
            if rear_ratio > 0.76:
                polygon.material_index = 2
            elif rear_ratio > 0.52:
                polygon.material_index = 0
            elif rear_ratio > 0.30:
                polygon.material_index = 1
            else:
                polygon.material_index = 0
        else:
            band = int((center.y - front_edge) / band_width)
            polygon.material_index = 0 if band % 2 == 0 else 1

    shade_smooth(upper)
    upper["zone_note"] = (
        "One coherent shell; material indices define stripes and rear bands"
    )
    upper["opening_is_boolean_cavity"] = True
    return upper


def approximate_upper_height(
    x: float,
    y: float,
    half_width: float,
    half_length: float,
    sole_top: float,
    upper_height: float,
) -> float:
    exponent = footprint_exponent()
    radial = (
        abs(x / half_width) ** exponent
        + abs((y + 0.03) / half_length) ** exponent
    ) ** (1.0 / exponent)
    radial = max(0.0, min(1.0, radial))
    cosine = math.sqrt(max(0.0, 1.0 - radial * radial))
    sidewall_top = sole_top + upper_height * 0.24
    crown_top = sole_top + upper_height
    heel_drop = max(0.0, upper_height - scaled("heel_height")) * 0.3764705882
    heel_lowering = heel_drop * smoothstep(0.20, half_length, y + 0.03)
    return (
        sidewall_top
        + (crown_top - sidewall_top) * cosine**0.72
        - heel_lowering * radial
    )


def create_collar(
    model_collection: bpy.types.Collection,
    material: bpy.types.Material,
) -> bpy.types.Object:
    half_width = scaled("overall_width") / 2.0
    half_length = scaled("overall_length") / 2.0
    sole_top = scaled("sole_thickness") * 0.72
    upper_height = scaled("upper_height")
    opening_center_y = resolved_opening_center_y(half_length)
    radius_x = scaled("opening_width") * 0.515
    radius_y = scaled("opening_length") * 0.515

    curve_data = bpy.data.curves.new("Integrated oval collar path", type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = 2
    curve_data.bevel_depth = scaled("collar_thickness") * 0.50
    curve_data.bevel_resolution = 5
    curve_data.resolution_u = 2
    spline = curve_data.splines.new(type="NURBS")
    point_count = 96
    spline.points.add(point_count - 1)
    for index in range(point_count):
        angle = 2.0 * math.pi * index / point_count
        x = radius_x * math.cos(angle)
        y = opening_center_y + radius_y * math.sin(angle)
        surface_z = approximate_upper_height(
            x,
            y,
            half_width,
            half_length,
            sole_top,
            upper_height,
        )
        # Embed more than half the tube into the upper so the collar reads as a
        # rolled felted edge instead of a ring hovering above the shell.
        z = surface_z - scaled("collar_thickness") * 0.14
        spline.points[index].co = (x, y, z, 1.0)
    spline.use_cyclic_u = True
    spline.order_u = 3
    spline.use_endpoint_u = False

    collar = bpy.data.objects.new("COLLAR_CS_ANKLE", curve_data)
    model_collection.objects.link(collar)
    curve_data.materials.append(material)

    with bpy.context.temp_override(
        object=collar,
        active_object=collar,
        selected_objects=[collar],
        selected_editable_objects=[collar],
    ):
        bpy.ops.object.convert(target="MESH")
    collar.name = "COLLAR_CS_ANKLE"
    shade_smooth(collar)
    collar["construction"] = "Surface-following NURBS path converted to mesh"
    return collar


def create_sole(
    model_collection: bpy.types.Collection,
    material: bpy.types.Material,
) -> bpy.types.Object:
    half_width = scaled("overall_width") * 0.505
    half_length = scaled("overall_length") * 0.502
    thickness = scaled("sole_thickness")
    segments = 96
    vertices: list[tuple[float, float, float]] = []
    for z in (0.018, thickness - 0.018):
        for segment in range(segments):
            angle = 2.0 * math.pi * segment / segments
            x, y = superellipse_point(
                angle, half_width, half_length, footprint_exponent()
            )
            vertices.append((x, -0.03 + y, z))
    bottom_center = len(vertices)
    vertices.append((0.0, -0.03, 0.018))
    top_center = len(vertices)
    vertices.append((0.0, -0.03, thickness - 0.018))

    faces: list[tuple[int, ...]] = []
    for segment in range(segments):
        next_segment = (segment + 1) % segments
        faces.append(
            (segment, segments + segment, segments + next_segment, next_segment)
        )
        faces.append((bottom_center, next_segment, segment))
        faces.append(
            (top_center, segments + segment, segments + next_segment)
        )

    mesh = bpy.data.meshes.new("Thin rounded Sailor slipper sole")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    sole = bpy.data.objects.new("SOLE_CS_SOLE", mesh)
    model_collection.objects.link(sole)
    recalculate_normals(sole)

    bevel = sole.modifiers.new(name="Rounded sole edge", type="BEVEL")
    bevel.width = 0.035
    bevel.segments = 3
    bevel.limit_method = "ANGLE"
    apply_modifier(sole, bevel.name)
    sole.data.materials.append(material)
    shade_smooth(sole)
    sole["construction"] = "Continuous rounded footprint; no platform extension"
    return sole


def add_notes() -> None:
    notes = bpy.data.texts.new("SAILOR_SLIPPER_MODEL_NOTES")
    notes.write(
        "Sailor Slipper geometry study\n"
        "================================\n"
        "One slipper only. Dimensions are visual estimates from supplied photos.\n"
        "Edit PARAMETERS in assets/blender/scripts/build_slippers.py and rerun.\n"
        "Blender coordinates: Z up, toe -Y, heel +Y.\n"
        "Expected glTF coordinates after export: Y up, toe +Z, heel -Z.\n"
        "The upper uses one closed Boolean cavity, not a surface covering the entry.\n"
        "The collar follows the local upper height and overlaps it intentionally.\n"
        "Simple materials only; wool shading and final colour segmentation are later tasks.\n"
    )


def validate_mesh(obj: bpy.types.Object) -> dict[str, int]:
    if obj.type != "MESH":
        return {"vertices": 0, "faces": 0, "non_manifold_edges": 0}
    mesh = obj.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    non_manifold = sum(1 for edge in bm.edges if not edge.is_manifold)
    result = {
        "vertices": len(bm.verts),
        "faces": len(bm.faces),
        "non_manifold_edges": non_manifold,
    }
    bm.free()
    return result


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def create_studio(studio_collection: bpy.types.Collection) -> bpy.types.Object:
    world = bpy.context.scene.world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (
        0.955,
        0.925,
        0.84,
        1.0,
    )
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.45

    ground_material = create_material(
        "PREVIEW_WARM_IVORY", (0.93, 0.88, 0.76, 1.0), roughness=0.95
    )
    bpy.ops.mesh.primitive_plane_add(size=12.0, location=(0.0, 0.0, -0.015))
    ground = bpy.context.object
    ground.name = "PREVIEW_GROUND"
    ground.data.materials.append(ground_material)
    move_to_collection(ground, studio_collection)

    light_specs = (
        ("PREVIEW_KEY", (3.6, -4.2, 5.4), 420.0, 4.0),
        ("PREVIEW_FILL", (-3.4, -1.0, 3.2), 220.0, 3.5),
        ("PREVIEW_RIM", (0.0, 4.0, 3.8), 300.0, 3.0),
    )
    for name, location, energy, size in light_specs:
        light_data = bpy.data.lights.new(name=name, type="AREA")
        light_data.energy = energy
        light_data.shape = "DISK"
        light_data.size = size
        light = bpy.data.objects.new(name, light_data)
        light.location = location
        look_at(light, (0.0, 0.0, 0.32))
        studio_collection.objects.link(light)

    camera_data = bpy.data.cameras.new("PREVIEW_CAMERA")
    camera_data.type = "ORTHO"
    camera_data.lens = 55.0
    camera = bpy.data.objects.new("PREVIEW_CAMERA", camera_data)
    studio_collection.objects.link(camera)
    bpy.context.scene.camera = camera
    return camera


def configure_scene() -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 900
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    scene.render.image_settings.color_depth = "8"
    scene.render.resolution_percentage = 100
    scene.render.fps = 24
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.filepath = str(PREVIEW_DIR / "preview.png")
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 0.1


def render_previews(camera: bpy.types.Object) -> None:
    target = (0.0, -0.02, 0.32)
    views = {
        "top": ((0.0, 0.0, 5.8), 3.35, (0.0, -0.02, 0.20)),
        "side": ((4.8, -0.05, 1.25), 3.20, target),
        "rear": ((0.0, 4.8, 1.15), 2.25, (0.0, 0.38, 0.30)),
        "three-quarter": ((3.65, -4.0, 2.75), 3.55, target),
    }
    for name, (location, ortho_scale, view_target) in views.items():
        camera.location = location
        camera.data.ortho_scale = ortho_scale
        look_at(camera, view_target)
        bpy.context.scene.render.filepath = str(PREVIEW_DIR / f"{name}.png")
        bpy.ops.render.render(write_still=True)


def build() -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    reset_scene()
    configure_scene()

    model_collection = create_collection("SAILOR_SLIPPER_MODEL")
    studio_collection = create_collection("PREVIEW_STUDIO")
    root = create_parameter_root(model_collection)

    materials = {
        "stripe1": create_material("CS_STRIPE1", (0.91, 0.82, 0.60, 1.0)),
        "stripe2": create_material("CS_STRIPE2", (0.20, 0.39, 0.29, 1.0)),
        "ankle": create_material("CS_ANKLE", (0.56, 0.12, 0.16, 1.0)),
        "sole": create_material("CS_SOLE", (0.25, 0.16, 0.12, 1.0)),
    }

    sole = create_sole(model_collection, materials["sole"])
    upper = create_upper(model_collection, materials)
    collar = create_collar(model_collection, materials["ankle"])
    for obj in (sole, upper, collar):
        obj.parent = root

    add_notes()
    camera = create_studio(studio_collection)

    print("\nSailor Slipper mesh validation")
    print("================================")
    for obj in (upper, collar, sole):
        print(f"{obj.name}: {validate_mesh(obj)}")

    # Keep preview helpers in the source file, but make their purpose explicit
    # and exclude them from any later export via the MODEL collection choice.
    studio_collection["export_exclude"] = True
    bpy.context.scene["model_collection_for_export"] = model_collection.name
    bpy.context.scene["glb_contract_note"] = (
        "Duplicate/mirror to a pair later; export MODEL collection only"
    )

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH), check_existing=False)
    render_previews(camera)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH), check_existing=False)
    print(f"Saved editable source: {BLEND_PATH}")
    print(f"Saved previews: {PREVIEW_DIR}")


if __name__ == "__main__":
    build()
