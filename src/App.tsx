import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { Duplex } from "./components/Duplex";

export default function App() {
  return (
    <Canvas
      camera={{
        position: [15, 10, 15],
        fov: 45,
        near: 0.1,
        far: 1000,
      }}
    >
      <color attach="background" args={["#d9d9d9"]} />

      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 20, 10]} intensity={3} />

      <Suspense fallback={null}>
        <Duplex />
      </Suspense>

      <OrbitControls makeDefault />
    </Canvas>
  );
}
