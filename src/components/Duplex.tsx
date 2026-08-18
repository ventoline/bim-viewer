import { useGLTF } from "@react-three/drei";
import * as THREE from "three/webgpu";
import { useEffect } from "react";
import { WoodNodeMaterial } from "three/addons/materials/WoodNodeMaterial.js";

export type SceneItem = {
  id: string;
  name: string;
  center: [number, number, number];
};

type DuplexProps = {
  onHover: (name: string | null) => void;
  onItemsReady: (items: SceneItem[]) => void;
};

export function Duplex({ onHover, onItemsReady }: DuplexProps) {
  const { scene } = useGLTF("/models/duplex_B.glb");

  //Materials
  useEffect(() => {
    const materials = new Map();
    const wood = WoodNodeMaterial.fromPreset("walnut", "gloss");
    /*  const wood = new WoodNodeMaterial({
      centerSize: 1.2,
      ringThickness: 1 / 40,

      darkGrainColor: new THREE.Color("#2b160b"),
      lightGrainColor: new THREE.Color("#9a6034"),

      clearcoat: 0.35,
      clearcoatRoughness: 0.45,
    });
 */
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#dbe8ef",
      metalness: 0,
      roughness: 0.02,
      transmission: 0.9,
      ior: 1.52,
      thickness: 0.05,
      envMapIntensity: 3,
    });

    const metal = new THREE.MeshStandardMaterial({
      color: "#777777",
      metalness: 1,
      roughness: 0.25,
      envMapIntensity: 6,
    });

    const plaster = new THREE.MeshStandardMaterial({
      color: "#ddd8cf",
      metalness: 0,
      roughness: 0.8,
    });

    scene.traverse((object) => {
      //   object.castShadow = true;
      //  if (!(object instanceof THREE.Mesh)) return;
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      const meshMaterials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      meshMaterials.forEach((material) => {
        if (!material) return;

        const name = material.name.toLowerCase();
        const og = material;

        if (
          name.includes("wood") ||
          name.includes("cabinets") ||
          name.includes("rail") ||
          name.includes("stair") ||
          name.includes("floor")
        ) {
          material = wood;
          mesh.material = material;
          // object.material.color = og.color;
        }

        if (name.includes("glass")) {
          material = glass;
          mesh.material = material;
          mesh.material.color = og.color;
        }
        if (
          name.includes("metal") ||
          name.includes("sash") ||
          name.includes("steel")
        ) {
          material = metal;
          mesh.material = material;
          mesh.material.color = og.color;
        }

        //  if (name.includes("plaster")) return plaster;

        //   material.castShadow = true;
        //  material.receiveShadow = true;
        materials.set(material.uuid, {
          name: material.name,
          type: material.type,
          color:
            "color" in material && material.color
              ? `#${material.color.getHexString()}`
              : undefined,
          hasMap: "map" in material && !!material.map,
          /*  castShadow: true,
          receiveShadow: true, */
        });
      });
    });
  }, [scene]);

  //NAV
  useEffect(() => {
    console.log("Scene children:", scene.children);
    const items: SceneItem[] = scene.children[0].children[0].children
      .map((child, index) => {
        const box = new THREE.Box3().setFromObject(child);

        if (box.isEmpty()) return null;

        const center = new THREE.Vector3();
        box.getCenter(center);

        return {
          id: child.uuid,
          name: child.name || `Level ${index + 1}`,
          center: [center.x, center.y, center.z] as [number, number, number],
        };
      })
      .filter((item): item is SceneItem => item !== null);

    onItemsReady(items);
  }, [scene, onItemsReady]);

  return (
    <primitive
      object={scene}
      onPointerOver={(e) => {
        e.stopPropagation();

        const object = e.object;

        let text = object.name || object.parent?.name || "Unnamed object";
        const result = text
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
          .replace(/_/g, " ");

        text.replace("_", " ");
        onHover(result);
      }}
      onPointerOut={() => {
        onHover("");
      }}
    />
  );
}
