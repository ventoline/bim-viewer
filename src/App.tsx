import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useState, useRef, useEffect } from "react";
import { Duplex, type SceneItem } from "./components/Duplex";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three/webgpu";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { EffectComposer } from "@react-three/postprocessing";

function NavigationControls({ focus }: { focus: SceneItem | null }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const targetGoal = useRef(new THREE.Vector3());
  const cameraGoal = useRef(new THREE.Vector3());

  const animating = useRef(false);

  useEffect(() => {
    if (!focus || !controls.current) return;

    const nextTarget = new THREE.Vector3(...focus.center);

    // How far the orbit pivot is moving
    const delta = nextTarget.clone().sub(controls.current.target);

    // Current viewing direction
    const direction = camera.position
      .clone()
      .sub(controls.current.target)
      .normalize();

    const orbitDistance = 5; // try 3–6

    targetGoal.current.copy(nextTarget);

    // Move camera by the same amount.
    // This preserves the viewing angle/distance.
    cameraGoal.current
      .copy(nextTarget)
      .add(direction.multiplyScalar(orbitDistance));

    animating.current = true;
  }, [focus, camera]);

  useFrame((_, dt) => {
    const orbit = controls.current;

    if (!orbit || !animating.current) return;

    const ease = 1 - Math.exp(-5 * dt);

    orbit.target.lerp(targetGoal.current, ease);
    camera.position.lerp(cameraGoal.current, ease);

    orbit.update();

    const targetDone = orbit.target.distanceTo(targetGoal.current) < 0.01;

    const cameraDone = camera.position.distanceTo(cameraGoal.current) < 0.01;

    if (targetDone && cameraDone) {
      orbit.target.copy(targetGoal.current);
      camera.position.copy(cameraGoal.current);

      animating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      onStart={() => {
        animating.current = false;
      }}
    />
  );
} // <-- closes NavigationControls

export default function App() {
  //name objects
  const [hoveredObject, setHoveredObject] = useState<string>("");

  // rooms navigation

  const [items, setItems] = useState<SceneItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SceneItem | null>(null);

  return (
    <div className="viewer">
      <div
        className={`object-label ${hoveredObject ? "" : "empty"}`}
        style={{
          position: "absolute",
          zIndex: 100,
          top: "10px",
          left: "10px",
          width: "200px",
          height: "150px",
          minHeight: "100px",
          background: "rgba(15, 15, 18, 0.72)",
          backdropFilter: "blur(10px)",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p>Hovered Object: </p>
        <p>{hoveredObject}</p>
      </div>

      <Canvas
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer({
            ...props,
            antialias: true,
          });
        }}
        shadows
        camera={{
          position: [15, 10, 15],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.85;
        }}
      >
        <Environment preset="sunset" />
        <color attach="background" args={["#315363"]} />
        <fog attach="fog" args={["#353849", 25, 100]} />{" "}
        <ambientLight intensity={0.2} color="#8b94c4" />
        <directionalLight
          position={[-15, 20, 10]}
          intensity={2}
          color="#f0b6ac"
          castShadow
        />
        {/*   <Atmosphere date={Date.now()}>
          <Sky />
          <group position={ ECEF coordinate in meters  [1000, -1000, 0]}>
            <SkyLight />
            <SunLight />
          </group>
          
          
           */}
        <Suspense fallback={null}>
          <Duplex onHover={setHoveredObject} onItemsReady={setItems} />
        </Suspense>
        <mesh position={[0, 2, -3]}>
          <sphereGeometry args={[0.2, 64, 64]} />

          <meshStandardMaterial color="white" metalness={1} roughness={0.05} />
        </mesh>
        {/*   <EffectComposer enableNormalPass>
            <AerialPerspective sunLight skyLight />
          </EffectComposer>
        </Atmosphere> */}
        {/*  <OrbitControls enableDamping /> */}
        <NavigationControls focus={selectedItem} />
      </Canvas>

      <div className="scene-panel">
        <div
          className="scene-panel-title"
          style={{
            position: "absolute",
            zIndex: 200,
            top: "210px",
            left: "10px",
            width: "200px",
            height: "220px",
            overflow: "auto",
            padding: "12px",
            background: "rgba(15, 15, 18, 0.72)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
          }}
        >
          <p> Rooms / Levels</p>

          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {items.map((item) => (
              <li key={item.id}>
                {" "}
                <button
                  key={item.id}
                  className={
                    selectedItem?.id === item.id
                      ? "scene-item active"
                      : "scene-item"
                  }
                  onClick={() => setSelectedItem(item)}
                >
                  {item.name
                    .replace(/_/g, " ")
                    .replace(/Ifc/g, "")
                    .replace(/\d+/g, "")

                    .replace(" x ", "")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
