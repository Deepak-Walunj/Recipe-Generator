import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@components/pages/css/LandingPage.css";
import landingBg from "@assets/backgrounds/landing_bg.jpg";
import { logOut } from "@utils/AuthUtils";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    logOut(true, []);
  }, []);

  const goUserLogin = () => navigate("/ulogin");
  const goUserRegister = () => navigate("/uregister");
  const goGuestLogin = () => navigate("/guest");
  const goAdminLogin = () => navigate("/alogin");
return (
    <main className="landing" style={{ backgroundImage: `url(${landingBg})` }} aria-labelledby="landing-title">
      <div className="landing__overlay" aria-hidden="true" />
      {/* HEADER */}
      <header className="landing__header container" role="banner">
        <div className="brand" title="RecipeGen">
          <div className="brand__logo" aria-hidden="true">
            R
          </div>
          <div className="brand__title">
            RecipeGen
            <div className="brand__tag">Cooking companion</div>
          </div>
        </div>

        <div className="header__actions">
          <button
            className="btn btn--ghost"
            onClick={goAdminLogin}
            aria-label="Admin login"
            title="Admin login"
          >
            Admin
          </button>
        </div>
      </header>

      {/* MAIN HERO */}
      <section className="landing__main" role="main">
        <div className="hero">
          {/* left column */}
          <div className="hero__content">
            <div className="hero__eyebrow">Discover • Cook • Share</div>

            <h1 id="landing-title" className="hero__title">
              Cook smarter with a personal AI chef
            </h1>

            <p className="hero__lead">
              Explore global cuisines, discover unique recipes, follow step-by-step
              guided video instructions and save your favorites.
              Designed for home cooks and creators who want beautiful results, fast.
            </p>

            <div className="features" aria-hidden="false">
              <div className="feature">Smart suggestions</div>
              <div className="feature">Step-by-step videos</div>
              <div className="feature">Save & share</div>
            </div>
          </div>

          {/* right column — action card */}
          <aside className="hero__card" aria-label="Get started actions">
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>
              Get started
            </h2>

            <p className="hero__meta">
              Create an account or continue as a guest — try RecipeGen for free.
            </p>

            <div style={{ width: "100%", display: "grid", gap: "0.7rem", marginTop: "0.6rem" }}>
              <button
                className="btn btn--primary"
                onClick={goUserLogin}
                aria-label="User login"
              >
                Sign in
              </button>

              <button
                className="btn btn--ghost"
                onClick={goUserRegister}
                aria-label="User register"
              >
                Create account
              </button>

              <button
                className="btn btn--secondary"
                onClick={goGuestLogin}
                aria-label="Continue as guest"
              >
                Continue as guest
              </button>
            </div>

            <div className="hero__meta" style={{ marginTop: "0.6rem", opacity: 0.9 }}>
              <small>No credit card required • Cancel anytime</small>
            </div>
          </aside>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing__footer container" role="contentinfo">
        <div className="footer__left">
          <div className="footer__brand">
            <div style={{ fontWeight: 800 }}>RecipeGen</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.95rem" }}>
              Built by Deepak Walunj
            </div>
          </div>
        </div>

        <nav className="footer__links" aria-label="Footer links">
          <a href="https://github.com/Deepak-Walunj/" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://linkedin.com/in/deepak-walunj-3a479925b/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="mailto:deepak.22211041@viit.ac.in">Email</a>
        </nav>
      </footer>
    </main>
  );
}
