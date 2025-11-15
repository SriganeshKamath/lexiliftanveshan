// src/pages/Dashboard.jsx
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  // Placeholder user info – later wire from backend
  const userName = "Explorer";
  const userLevel = 2;
  const streakDays = 5;
  const starsEarned = 42;

  const [saarthiIndex, setSaarthiIndex] = useState(0);
  const [stars, setStars] = useState([]);
  const [musicOn, setMusicOn] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const audioRef = useRef(null);

  const saarthiMessages = [
    "You did awesome yesterday, ready to fly again? 🚀",
    "Even tricky words get easier each time. I’m proud of you 💛",
    "Tiny steps become giant leaps over time 🌙",
    "You’re not alone — I’m here cheering for every word ⭐",
  ];

  // rotating feedback messages
  useEffect(() => {
    const id = setInterval(
      () => setSaarthiIndex((i) => (i + 1) % saarthiMessages.length),
      5000
    );
    return () => clearInterval(id);
  }, []);

  // generate star field
  useEffect(() => {
    const arr = Array.from({ length: 30 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 110,
      size: Math.random() * 6 + 4,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.6,
    }));
    setStars(arr);
  }, []);

  // background music toggle handler
  const handleMusicToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!musicOn) {
      audio
        .play()
        .then(() => setMusicOn(true))
        .catch(() => {
          // autoplay blocked – user must tap again after some interaction
          setMusicOn(false);
        });
    } else {
      audio.pause();
      setMusicOn(false);
    }
  };

  // star animation variants
  const starMotion = (s) => ({
    initial: { opacity: 0, scale: 0.6 },
    animate: {
      opacity: [0, s.opacity, 0],
      scale: [0.8, 1.1, 0.9],
      y: [0, -6, 0],
    },
    transition: {
      duration: s.duration,
      repeat: Infinity,
      delay: s.delay,
      ease: "easeInOut",
    },
  });

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden text-white font-lexend"
      style={{
        background:
          "radial-gradient(1000px 500px at 8% 15%, rgba(66,255,203,0.06), transparent 6%), " +
          "linear-gradient(180deg, rgba(5,11,20,0.9) 0%, rgba(6,22,40,0.96) 35%, rgba(3,10,22,1) 100%)",
      }}
    >
      {/* Background audio – add your own file to public/audio/ambient.mp3 */}
      <audio
        ref={audioRef}
        src="/audio/ambient-space.mp3"
        loop
        preload="auto"
      />

      {/* Stars */}
      {stars.map((s, i) => (
        <motion.div
          key={i}
          {...starMotion(s)}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: 99,
            background: "#ffffff",
            boxShadow: "0 0 8px rgba(255,255,255,0.9)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Subtle constellation lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <g opacity="0.03" stroke="#ffffff" strokeWidth="1" fill="none">
          <path d="M140 220 L260 180 L360 230" strokeLinecap="round" />
          <path
            d="M860 140 L940 160 L1040 130 L1140 170"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Planet bottom-right */}
      <div className="pointer-events-none absolute right-0 bottom-0 z-0">
        <svg
          width="520"
          height="520"
          viewBox="0 0 520 520"
          className="w-[52vw] sm:w-[38vw] md:w-[30vw] lg:w-[24vw]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="dashPlanet" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#a6fff0" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#69d2ff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#111827" stopOpacity="1" />
            </radialGradient>
            <filter id="dashGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="22" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g transform="translate(60,60)">
            <circle
              cx="320"
              cy="320"
              r="240"
              fill="url(#dashPlanet)"
              filter="url(#dashGlow)"
            />
            <ellipse
              cx="230"
              cy="315"
              rx="190"
              ry="44"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="8"
            />
          </g>
        </svg>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8">
        {/* Top bar: greeting + music toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <motion.p
              className="text-sm sm:text-base text-slate-200/80"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Welcome back,{" "}
              <span className="font-semibold text-slate-50">{userName}</span>!
            </motion.p>
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-1 drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]"
              style={{
                fontStyle: "italic",
                letterSpacing: "0.7px",
              }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Your Reading Galaxy
            </motion.h1>
          </div>

          <div className="flex flex-row gap-2">
          {/* Music toggle */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleMusicToggle}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 border border-white/15 backdrop-blur-sm text-sm sm:text-base shadow-lg"
          >
            <span className="inline-block text-lg">
              {musicOn ? "🔊" : "🎧"}
            </span>
            <span>{musicOn ? "Pause calm music" : "Play calm music"}</span>
          </motion.button>

          {/* Settings Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 border border-white/15 backdrop-blur-sm text-sm sm:text-base shadow-lg"
          >
            <span className="text-lg">⚙️</span>
            <span>Settings</span>
          </motion.button>
          </div>
        </div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            label="Reading Level"
            value={`Lv. ${userLevel}`}
            accent="from-green-400/80 to-emerald-500/80"
          />
          <StatCard
            label="Streak"
            value={`${streakDays} days`}
            accent="from-sky-400/80 to-cyan-500/80"
          />
          <StatCard
            label="Stars Collected"
            value={starsEarned}
            accent="from-yellow-400/80 to-amber-500/80"
          />
          <StatCard
            label="Today’s Focus"
            value="Practice & Pronounce"
            accent="from-pink-400/80 to-fuchsia-500/80"
          />
        </motion.div>

        {/* Main grid of actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-2">
          {/* Left column – main actions */}
          <div className="flex flex-col gap-4">
            <DashboardCard
              title="Start Phoneme Lesson"
              subtitle="Learn how each sound works with colors & examples."
              badge="Recommended"
              onClick={() => (window.location.href = "/lesson")}
              gradient="from-green-400/20 via-emerald-400/10 to-transparent"
              icon="🔤"
            />
            <DashboardCard
              title="Practice Reading"
              subtitle="Words and sentences picked just for your level."
              onClick={() => (window.location.href = "/exercise")}
              gradient="from-sky-400/20 via-indigo-400/10 to-transparent"
              icon="📖"
            />
            <DashboardCard
              title="Pronunciation Mission"
              subtitle="Read aloud and let LexiLift listen and guide you."
              onClick={() => (window.location.href = "/pronunciation")}
              gradient="from-purple-400/20 via-fuchsia-400/10 to-transparent"
              icon="🎙️"
            />
          </div>

          {/* Right column – Saarthi + microdrills + achievements */}
          <div className="flex flex-col gap-4">
            {/* Saarthi feedback mascot */}
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-black/30 border border-white/10 backdrop-blur-md p-4 sm:p-5 shadow-xl min-h-[180px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Saarthi mascot – glowing star buddy */}
                <motion.div
                  className="relative w-16 h-16 sm:w-20 sm:h-20"
                  animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, #ffffff, #ffe6a7, rgba(255,255,255,0))",
                      boxShadow: "0 0 18px rgba(255,255,255,0.9)",
                    }}
                  />
                  <div className="absolute inset-1 rounded-full border border-white/60" />
                  {/* little orbiting dot */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div
                      className="absolute w-2.5 h-2.5 rounded-full bg-white"
                      style={{ top: "4px", left: "50%" }}
                    />
                  </motion.div>
                </motion.div>

                <div className="flex-1 text-left">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-300/80 mb-1">
                    Saarthi’s Corner
                  </p>
                  <motion.p
                    key={saarthiIndex}
                    className="text-sm sm:text-base md:text-lg text-slate-50"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {saarthiMessages[saarthiIndex]}
                  </motion.p>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300/80">
                    After each mission, Saarthi will share a special message
                    just for you.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Microdrills card */}
            <DashboardCard
              title="Microdrill Lab"
              subtitle="Fix tricky sounds with tiny focused games."
              onClick={() => (window.location.href = "/microdrills")}
              gradient="from-emerald-400/20 via-teal-400/10 to-transparent"
              icon="🧩"
            />

            
          </div>
        </div>

        {/* === SETTINGS PANEL (Cosmic Drawer) === */}
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex justify-end"
            onClick={() => setSettingsOpen(false)} // close when clicking outside
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
              className="w-80 sm:w-96 h-full bg-black/60 border-l border-white/10 backdrop-blur-xl px-6 py-8 flex flex-col shadow-2xl relative"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              <h2 className="text-2xl font-extrabold text-white mb-4 drop-shadow">
                Parent Settings
              </h2>

              {/* Edit Profile */}
              <div className="mb-6">
                <p className="text-sm uppercase tracking-widest text-slate-300/80 mb-2">
                  Edit Child Details
                </p>

                <button
                  onClick={() => (window.location.href = "/edit-profile")}
                  className="w-full text-left px-4 py-3 rounded-xl bg-black/30 border border-white/10 hover:bg-white/10 transition backdrop-blur-md text-white shadow"
                >
                  Edit Profile
                </button>
              </div>

              {/* Analytics / Progress */}
              <div className="mb-6">
                <p className="text-sm uppercase tracking-widest text-slate-300/80 mb-2">
                  Progress & Analytics
                </p>

                <button
                  onClick={() => (window.location.href = "/progress")}
                  className="w-full text-left px-4 py-3 rounded-xl bg-black/30 border border-white/10 hover:bg-white/10 transition backdrop-blur-md text-white shadow"
                >
                  View Progress
                </button>

                <p className="text-xs text-slate-300/70 mt-2">
                  (Coming soon: reading accuracy charts, phoneme mastery, ASR
                  insights)
                </p>
              </div>

              {/* Logout */}
              <div className="mt-auto">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full text-left px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-100 font-semibold hover:bg-red-500/30 transition shadow"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Bottom tagline */}
        <div className="mt-4 mb-6 text-center text-xs sm:text-sm text-slate-300/70">
          One more page, one more star in your sky ⭐ Keep going, {userName}.
        </div>
      </div>
    </div>
  );
}

/* --- Small helper components INSIDE THE SAME FILE (still "single page") --- */

function StatCard({ label, value, accent }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md px-3 py-3 sm:px-4 sm:py-4 shadow-lg"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20 pointer-events-none`}
      />
      <div className="relative flex flex-col items-start gap-1">
        <p className="text-[0.7rem] sm:text-xs uppercase tracking-[0.18em] text-slate-300/80">
          {label}
        </p>
        <p className="text-base sm:text-lg md:text-xl font-semibold text-slate-50">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function DashboardCard({ title, subtitle, onClick, gradient, icon, badge }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full text-left rounded-3xl bg-black/30 border border-white/10 backdrop-blur-md px-4 py-4 sm:px-5 sm:py-5 shadow-xl overflow-hidden"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30 pointer-events-none`}
      />
      <div className="relative flex gap-3 sm:gap-4 items-start">
        <div className="flex-shrink-0 mt-1 text-2xl sm:text-3xl">
          <span>{icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base sm:text-lg md:text-xl font-semibold text-slate-50">
              {title}
            </p>
            {badge && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/50 text-[0.65rem] sm:text-xs text-emerald-100">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm md:text-base text-slate-200/85">
            {subtitle}
          </p>
          <p className="mt-2 text-xs text-slate-300/80">
            Tap to continue this mission.
          </p>
        </div>
      </div>
    </motion.button>
  );
}
