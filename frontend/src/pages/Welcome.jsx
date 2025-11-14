// src/pages/Welcome.jsx
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

/**
 * Dark, heavenly, spatial Welcome page
 * - Single file (no components)
 * - Mobile responsive
 * - Uses Tailwind utility classes and inline SVGs / styles
 * - Requires: framer-motion, tailwind, Lexend & Atkinson fonts installed
 */

export default function Welcome() {
  const quotes = [
    "Your words are tiny rockets — launch them!",
    "Every read is a step closer to the stars",
    "You are brave. You are curious. You are LexiLift.",
    "Small practice, big magic — keep going!",
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [loadedStars, setLoadedStars] = useState([]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const parallaxX = useTransform(pointerX, [0, 1], [-8, 8]);
  const parallaxY = useTransform(pointerY, [0, 1], [-8, 8]);
  const heroRef = useRef(null);

  // rotate quotes every 3.6s
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
    }, 3600);
    return () => clearInterval(id);
  }, []);

  // generate star positions once
  useEffect(() => {
    const stars = Array.from({ length: 40 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 110,
      size: Math.random() * 8 + 6,
      twinkle: Math.random() * 3 + 2,
      opacity: Math.random() * 0.6 + 0.4,
      delay: Math.random() * 6,
    }));
    setLoadedStars(stars);
  }, []);

  // pointer parallax (normalized)
  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    const onMove = (e) => {
      const rect = node.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const ny = (e.clientY - rect.top) / Math.max(rect.height, 1);
      pointerX.set(nx);
      pointerY.set(ny);
    };
    node.addEventListener("mousemove", onMove);
    node.addEventListener("touchmove", (ev) => {
      if (ev.touches && ev.touches[0]) onMove(ev.touches[0]);
    }, { passive: true });
    return () => {
      node.removeEventListener("mousemove", onMove);
    };
  }, [pointerX, pointerY]);

  // helper for random motion variants for stars
  const starMotion = (i, s) => ({
    initial: { opacity: 0, scale: 0.5 },
    animate: {
      opacity: [0.2, s.opacity, 0.2],
      scale: [0.8, 1.15, 0.9],
      y: [0, -6 - (i % 3), 0],
    },
    transition: {
      duration: s.twinkle,
      repeat: Infinity,
      delay: s.delay,
      ease: "easeInOut",
    },
  });

  return (
    <div
      ref={heroRef}
      className="min-h-screen w-full relative overflow-hidden text-white font-lexend"
      style={{
        // Deep cosmic gradient: green-blue -> deep blue -> black
        background:
          "radial-gradient(1200px 600px at 10% 20%, rgba(66,255,203,0.06), transparent 6%), " +
          "linear-gradient(180deg, rgba(5,11,20,0.8) 0%, rgba(6,22,40,0.86) 35%, rgba(2,8,18,1) 100%)",
      }}
    >
      {/* Nebula / subtle fog layers (CSS inside style tag below for keyframes) */}
      <div className="pointer-events-none absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 800 600"
        >
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#0ff2cf" stopOpacity="0.06" />
              <stop offset="60%" stopColor="#00a3ff" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="g2" x1="0" x2="1">
              <stop offset="0%" stopColor="#a6ffea" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#4cc2ff" stopOpacity="0.01" />
            </linearGradient>
            <filter id="blur1">
              <feGaussianBlur stdDeviation="40" />
            </filter>
          </defs>

          {/* soft green-blue cloud */}
          <ellipse cx="200" cy="150" rx="260" ry="130" fill="url(#g1)" filter="url(#blur1)" />
          {/* second faint cloud */}
          <ellipse cx="600" cy="300" rx="300" ry="160" fill="url(#g2)" filter="url(#blur1)" />
        </svg>
      </div>

      {/* Shooting star (CSS animation using keyframes below) */}
      <div className="pointer-events-none">
        <div className="shooting-star shooting-1" />
        <div className="shooting-star shooting-2" />
      </div>

      {/* Stars */}
      {loadedStars.map((s, i) => (
        <motion.div
          key={i}
          {...starMotion(i, s)}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: 99,
            background: "#ffffff",
            opacity: s.opacity,
            boxShadow: "0 0 8px rgba(255,255,255,0.8)",
          }}
        />
      ))}

      {/* Subtle constellations lines (decorative) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <g opacity="0.03" stroke="#ffffff" strokeWidth="1" fill="none">
          <path d="M120 200 L240 180 L320 240 L420 220" strokeLinecap="round" />
          <path d="M800 100 L880 140 L940 110 L1020 150" strokeLinecap="round" />
        </g>
      </svg>

      {/* Main content container */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 py-10 text-center">
        {/* Title area */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{
            transform: "translateZ(0)",
          }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="mx-auto w-fit mb-6">
            {/* Logo simple: circular ring, no face */}
            <svg width="92" height="92" viewBox="0 0 120 120" className="mx-auto">
              <defs>
                <radialGradient id="lg" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#9fffd7" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#6ecbff" stopOpacity="0.12" />
                </radialGradient>
              </defs>
              <circle cx="60" cy="60" r="44" fill="url(#lg)" opacity="0.92" />
              <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="transparent" />
              <circle cx="60" cy="60" r="16" fill="rgba(255,255,255,0.06)" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-xl">
            LexiLift
          </h1>

          <p className="mt-3 text-base sm:text-lg md:text-xl text-slate-200/90 max-w-xl mx-auto">
            A gentle space to build reading confidence. Tiny steps, huge sky.
          </p>
        </motion.div>

        {/* Animated Quote ticker */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="mt-8 mb-6 w-full max-w-2xl"
        >
          <div className="relative mx-auto overflow-hidden px-4 py-3 rounded-xl bg-black/20 border border-white/6 backdrop-blur-sm shadow-lg">
            <motion.div
              style={{ x: parallaxX, y: parallaxY }}
              className="text-white/95 text-lg sm:text-xl md:text-2xl font-semibold"
            >
              <span className="inline-block animate-quote">
                {quotes[quoteIndex]}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => (window.location.href = "/signup")}
            className="relative z-30 px-8 py-3 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-green-400/90 via-cyan-400/80 to-violet-500/80 text-black font-bold text-lg sm:text-xl shadow-2xl transform-gpu"
            aria-label="Tap to begin Lexilift"
          >
            Tap to Begin!
          </motion.button>

          
        </div>
      </div>

      {/* Curved planet / moon bottom-right with glow */}
      <div className="pointer-events-none absolute right-0 bottom-0 z-10">
        <svg
          width="520"
          height="520"
          viewBox="0 0 520 520"
          className="w-[40vw] sm:w-[34vw] md:w-[28vw] lg:w-[24vw] opacity-100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="planetGrad" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#a6fff0" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#69d2ff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2b1b4b" stopOpacity="1" />
            </radialGradient>
            <filter id="pglow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="24" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform="translate(60,60)">
            {/* Big planet circle (cropped by view to appear curved) */}
            <circle cx="320" cy="320" r="240" fill="url(#planetGrad)" filter="url(#pglow)" />
            {/* subtle rings */}
            <ellipse cx="220" cy="300" rx="190" ry="48" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
            <ellipse cx="220" cy="320" rx="160" ry="36" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
          </g>
        </svg>
      </div>

      {/* Styles for shooting stars & tiny keyframes - injected here so single-file keeps everything */}
      <style>{`
        /* Shooting stars */
        .shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0.05));
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(255,255,255,0.8);
          transform: rotate(-20deg);
        }
        .shooting-1 {
          top: 8%;
          left: 10%;
          width: 120px;
          height: 2px;
          opacity: 0;
          animation: shoot1 6s linear infinite;
        }
        .shooting-2 {
          top: 18%;
          left: 60%;
          width: 140px;
          height: 2px;
          opacity: 0;
          animation: shoot2 8s linear infinite;
        }
        @keyframes shoot1 {
          0% { transform: translate(-10px, 0) rotate(-20deg); opacity: 0; }
          10% { opacity: 1; transform: translate(40vw, 8vh) rotate(-20deg); }
          40% { opacity: 0; transform: translate(80vw, 14vh) rotate(-20deg); }
          100% { opacity: 0; transform: translate(0,0) rotate(-20deg); }
        }
        @keyframes shoot2 {
          0% { transform: translate(0, 0) rotate(-18deg); opacity: 0; }
          12% { opacity: 1; transform: translate(32vw, 6vh) rotate(-18deg); }
          42% { opacity: 0; transform: translate(70vw, 12vh) rotate(-18deg); }
          100% { opacity: 0; transform: translate(0,0) rotate(-18deg); }
        }

        /* gentle scroll effect for quote text */
        .animate-quote {
          display: inline-block;
          transform-origin: left center;
          will-change: transform, opacity;
        }

        /* small responsive tweaks to prevent overflow */
        @media (max-width: 420px) {
          .shooting-1, .shooting-2 { display: none; }
        }
      `}</style>
    </div>
  );
}
