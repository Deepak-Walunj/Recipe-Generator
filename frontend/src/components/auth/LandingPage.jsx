import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import capsicumModel from "@assets/models/capsicum.glb"


function FlyingObject({ modelPath, onSlice }) {
  const groupRef = useRef();
  const { scene } = useGLTF(modelPath);
  const speed = useMemo(() => 0.03 + Math.random() * 0.02, []);
  const rotSpeed = useMemo(() => (Math.random() - 0.5) * 0.02, []);
  const { camera } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y += speed;
      groupRef.current.rotation.y += rotSpeed;
      if (groupRef.current.position.y > 6) {
        groupRef.current.position.set(...getRandomPosition());
      }
    }
  });

  return <primitive ref={groupRef} object={scene} scale={0.5} />;
}

function FlyingScene({ mouseTrail }) {
  const objectRefs = useRef([]);
  const { camera } = useThree();
  const objects = useMemo(() => [capsicumModel], []);
  useFrame(() => {
    objectRefs.current.forEach((obj) => {
      if (checkSlice(obj, mouseTrail, camera)) {
        obj.visible = false;
        setTimeout(() => {
          obj.position.set(...getRandomPosition());
          obj.visible = true;
        }, 500);
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      {objects.map((path, i) => (
        <FlyingObject key={i} modelPath={path} ref={(el) => (objectRefs.current[i] = el)} />
      ))}
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
}

function getRandomPosition() {
  return [(Math.random() - 0.5) * 12, -5, (Math.random() - 0.5) * 6];
}

function checkSlice(mesh, trail, camera) {
  if (!mesh) return false;
  const vector = new THREE.Vector3();
  vector.setFromMatrixPosition(mesh.matrixWorld);
  vector.project(camera);

  const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const screenY = (-vector.y * 0.5 + 0.5) * window.innerHeight;

  return trail.some((p) => Math.hypot(p.x - screenX, p.y - screenY) < 50);
}

export default function LandingPage() {
  const [mouseTrail, setMouseTrail] = useState([]);

  useEffect(() => {
    function handleMove(e) {
      setMouseTrail((prev) => [...prev.slice(-10), { x: e.clientX, y: e.clientY }]);
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <FlyingScene mouseTrail={mouseTrail} />
        </Canvas>
      </div>

      {/* Navbar */}
      <nav className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold text-orange-700">🍲 RecipeGen</h1>
        <Button variant="outline" className="bg-white/40 backdrop-blur-lg">
          Admin Login
        </Button>
      </nav>

      {/* Hero */}
      <main className="flex flex-col flex-grow justify-center items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-extrabold text-orange-900 mb-4"
        >
          Discover, Create & Share Recipes
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8"
        >
          Your AI-powered recipe assistant — generate unique recipes, tweak ingredients, and share with the world.
        </motion.p>
        <div className="flex gap-4">
          <Button className="bg-orange-600 text-white rounded-2xl px-6 py-3">
            User Login
          </Button>
          <Button variant="outline" className="border-orange-600 text-orange-600 rounded-2xl px-6 py-3">
            Register
          </Button>
        </div>
      </main>
    </div>
  );
}
