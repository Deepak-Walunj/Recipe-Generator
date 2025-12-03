import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import landingBg from "@/assets/backgrounds/landing_bg.jpg";
import { logOut } from "@utils/AuthUtils";

import { Button } from "@/components/pages/ui/button";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    logOut(true, []);
  }, []);

  const goUserLogin = () => navigate("/ulogin");
  const goUserRegister = () => navigate("/uregister");
  const goAdminLogin = () => navigate("/alogin");

  return (
    <main
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
      style={{ backgroundImage: `url(${landingBg})` }}
    >
      {/* NAVBAR */}
      <div className="w-full fixed top-0 left-0 p-5 flex justify-between items-center bg-black/30 backdrop-blur-sm">
        <h1 className="text-3xl font-extrabold text-white drop-shadow">
          RecipeGen
        </h1>

        <button
          onClick={goAdminLogin}
          className="bg-white text-blue-600 px-5 py-2 rounded-xl shadow hover:bg-blue-50 transition"
        >
          Admin Login
        </button>
      </div>

      {/* CENTER BUTTONS */}
      <div className="flex flex-col gap-5 mt-20 p-8 bg-black/40 rounded-2xl backdrop-blur-md shadow-xl">
        <Button
          onClick={goUserLogin}
          className="bg-orange-600 hover:bg-orange-700 text-white text-xl px-8 py-4 rounded-xl"
        >
          User Login
        </Button>

        <Button
          onClick={goUserRegister}
          className="bg-white text-orange-600 border border-orange-600 text-xl px-8 py-4 rounded-xl hover:bg-orange-50"
        >
          User Registration
        </Button>
      </div>
    </main>
  );
}
