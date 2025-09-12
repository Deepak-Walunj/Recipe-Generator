import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { logOut } from "@utils/AuthUtils";
import { useEffect } from "react";
import logo from "@assets/image/logo.png"
import { useInView } from "react-intersection-observer";
import RotatingText from "@/predefined_components/RotatingText";

export function Food({ modelPath }) {
  const group = React.useRef();
  const gravity = -9.8 * 0.5;
  const position = React.useRef([Math.random() * 4 - 2, 0, 0]); // random x start
  const velocity = React.useRef([Math.random() * 2 - 1, 6 + Math.random() * 2, 0]);
  const rotateSpeed = React.useRef(Math.random() * 2);
  const { scene } = useGLTF(modelPath);

  useFrame((_, delta) => {
    velocity.current[1] += gravity * delta;
    position.current[0] += velocity.current[0] * delta;
    position.current[1] += velocity.current[1] * delta;

    if (group.current) {
      group.current.position.set(...position.current);
      group.current.rotation.y += rotateSpeed.current * delta;

      if (position.current[1] < 0) {
        // reset when it falls
        position.current[1] = 0;
        velocity.current[1] = 6 + Math.random() * 2;
        velocity.current[0] = Math.random() * 2 - 1;
        position.current[0] = Math.random() * 4 - 2;
        const scale = 1 + Math.random() * 0.2;
        group.current.scale.set(scale, scale, scale);
      }
    }
  });

  return <primitive object={scene} ref={group} scale={1.5} />;
}

export default function LandingPage() {
  const [heroRef, heroInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const navigate = useNavigate();
  const handleUserLogin = () => navigate("/ulogin");
  const handleUserRegister = () => navigate("/uregister");
  const handleCompanyLogin = () => navigate("/alogin");
  useEffect(() => {
    logOut(true, []);
  }, []);
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100">
      <div className="navbar bg-transparent backdrop-blur-sm w-full fixed top-0 z-50 px-6  shadow-md flex justify-between items-center">
      {/* Left side - Logo */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="logo"
          className="h-10 w-10 rounded-full"
        />
        <h1 className="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
          RecipeGen
        </h1>
      </div>

      {/* Right side - Admin Login */}
      <button
        onClick={handleCompanyLogin}
        className="bg-white text-blue-600 sm:px-6 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition duration-300 shadow-md hover:scale-105"
      >
        💼 Admin Login
      </button>
    </div>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={staggerContainer}
        id="home"
        className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center"
        style={{
          marginTop: "0",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold text-orange-900 drop-shadow-2xl mb-4"
        >
          🍴 RecipeGen 🍴
        </motion.h1>
             {/* Canvas Background */}
        <Canvas
          shadows
          camera={{ position: [0, 10, 0], fov: 50 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -1,
            pointerEvents: "none",
          }}
        >
          <ambientLight intensity={1.0} />
          <directionalLight position={[5, 5, 5]} intensity={1.7} castShadow />
          <Food modelPath="/models/cabbage.glb" />
          <Food modelPath="/models/pizza.glb" />
          <Food modelPath="/models/pumpkin.glb" />
          <Food modelPath="/models/burger.glb" />
          <Food modelPath="/models/pound_cake.glb" />
          <Food modelPath="/models/sakura_cake_roll.glb" />
        </Canvas>

        <motion.div
          variants={fadeInUp}
          className="w-full md:w-2/3 lg:w-1/2 space-y-8"
        >
          <h2 className="text-2xl sm:text-5xl lg:text-5xl font-extrabold text-black leading-tight drop-shadow-lg flex flex-wrap items-center justify-center gap-2">
            Lets Cook Food Together On 
            {/* <span className="text-blue-600 ml-2">EduViVa</span>  */}
            <span className="text-blue-600 inline-block w-36 sm:w-48 md:w-56">
              <RotatingText
                texts={["Tasty", "Food"]}
                mainClassName="px-2 text-white sm:px-3 md:px-4 bg-green-600 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg text-base sm:text-lg md:text-3xl text-center"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </span>
             HUB!
          </h2>

          <p className="text-gray-700 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto animate-fade-in">
            <strong>Savor</strong> endless culinary inspiration
            with cutting-edge AI that tailors recipes to your tastes. Discover new flavors, master cooking techniques,
            and unlock your inner chef — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
            >
              <motion.div whileHover={{ scale: 1.1, rotate: -3, boxShadow: "0px 0px 20px rgba(255, 165, 0, 0.5)" }} whileTap={{ scale: 0.95 }}>
                  <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg rounded-2xl px-6 py-3 shadow-2xl hover:shadow-orange-200 backdrop-blur-sm"
                  onClick={handleUserLogin}
                  >
                  User Login
                  </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1, rotate: 3, boxShadow: "0px 0px 20px rgba(255, 140, 0, 0.4)" }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  className="border-orange-600 text-orange-600 hover:bg-orange-50 text-lg rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  onClick={handleUserRegister}
                  >
                  Register
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      <footer className="footer footer-center p-10 bg-black">
        <aside>
          <img src={logo} alt="logo" className="h-12 w-12 rounded-full" />
          <p className="font-bold">
            RecipeGen
          </p>
          <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
        </aside>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </a>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
              </svg>
            </a>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
          </div>
        </nav>
      </footer>
    </main>
  );
}
