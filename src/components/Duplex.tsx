import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect } from "react";

export function Duplex() {
  const { scene } = useGLTF("/models/duplex_A.glb");

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    console.log("Bounding box:", box);
    console.log("Size:", size);
    console.log("Center:", center);
  }, [scene]);

  return <primitive object={scene} />;
}
