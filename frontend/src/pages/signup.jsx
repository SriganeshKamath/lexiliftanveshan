// src/pages/Signup.jsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Next-level Signup page (single-file)
 * - Animated gradient background (slow-moving)
 * - Layered parallax nebula + rotating planet with rings
 * - Interactive input icons + connecting constellation animation
 * - Progress ring around CTA that animates while posting to backend
 * - Success particle burst (designed confetti)
 * - Uses axios to POST to http://localhost:8000/users/signup
 *
 * Requirements:
 * - framer-motion, axios, tailwindcss installed
 * - Tailwind + fonts already configured
 */

export default function Signup() {
  const [form, setForm] = useState({ name: "", age: "", email: "", level: "1" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    // small safe check: if backend unreachable, show friendly message later on error
  }, []);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Helper: validate minimal fields
  function validate() {
    if (!form.name.trim()) return "Please enter the child's name.";
    if (!form.email.trim()) return "Please enter a parent email.";
    // optional: basic email pattern
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    return null;
  }

  async function handleSignup(e) {
    e.preventDefault();
    setErrorMsg("");
    const v = validate();
    if (v) {
      setErrorMsg(v);
      // small shake animation trigger via class (handled in JSX)
      cardRef.current?.classList.add("shake-x");
      setTimeout(() => cardRef.current?.classList.remove("shake-x"), 650);
      return;
    }

    setLoading(true);
    try {
      // POST to backend
      const payload = {
        name: form.name,
        age: form.age ? Number(form.age) : null,
        email: form.email,
        level: Number(form.level || 1),
      };

      const res = await axios.post("http://localhost:8000/users/signup", payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 8000,
      });

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        // optional: play chime or TTS (hook point)
        // const audio = new Audio('/sounds/chime.mp3'); audio.play();
        setTimeout(() => (window.location.href = "/dashboard"), 1600);
      } else {
        setErrorMsg("Signup failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || "Network or server error. Check backend.");
    } finally {
      setLoading(false);
    }
  }

  // particles for success (pre-generate positions)
  const particles = new Array(22).fill(0).map((_, i) => ({
    id: i,
    left: 10 + i * 3.6 + Math.random() * 4,
    delay: Math.random() * 0.25 + i * 0.02,
    rot: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-lexend text-white antialiased">
      {/* Animated gradient background (slow) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(120deg, #00121a 0%, #002b2b 30%, #003a52 50%, #00223a 70%, #000814 100%)",
          animation: "bgShift 20s linear infinite",
        }}
      />

      {/* Nebula layers (SVG blurred ellipses for depth) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <defs>
          <linearGradient id="n1" x1="0" x2="1">
            <stop offset="0%" stopColor="#00ffb3" stopOpacity="0.06" />
            <stop offset="60%" stopColor="#3fb8ff" stopOpacity="0.02" />
          </linearGradient>
          <filter id="b1"><feGaussianBlur stdDeviation="50" /></filter>
        </defs>

        <ellipse cx="160" cy="140" rx="380" ry="160" fill="url(#n1)" filter="url(#b1)" />
        <ellipse cx="950" cy="360" rx="420" ry="170" fill="url(#n1)" filter="url(#b1)" />
      </svg>

      {/* Rotating Planet with Rings (bottom-right, prominent) */}
      <div className="pointer-events-none absolute right-0 bottom-0 z-10">
        <svg viewBox="0 0 520 520" className="w-[44vw] sm:w-[36vw] md:w-[30vw] lg:w-[24vw]">
          <defs>
            <radialGradient id="pG" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#b7fff0" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#69c7ff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#00101f" stopOpacity="1" />
            </radialGradient>
            <filter id="glowP"><feGaussianBlur stdDeviation="20" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          <g transform="translate(60,60)">
            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            >
              <circle cx="320" cy="320" r="240" fill="url(#pG)" filter="url(#glowP)" />
            </motion.g>
            <ellipse cx="220" cy="300" rx="210" ry="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
            <ellipse cx="220" cy="320" rx="170" ry="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
          </g>
        </svg>
      </div>

      {/* subtle stars (static but twinkle via CSS) */}
      <div className="absolute inset-0 -z-5 pointer-events-none">
        {Array.from({ length: 28 }).map((_, i) => {
          const l = Math.random() * 100;
          const t = Math.random() * 110;
          const s = 3 + Math.random() * 6;
          const d = Math.random() * 6;
          return (
            <span
              key={i}
              style={{
                left: `${l}%`,
                top: `${t}%`,
                width: s,
                height: s,
                position: "absolute",
                borderRadius: 99,
                background: "#fff",
                boxShadow: "0 0 8px rgba(255,255,255,0.9)",
                opacity: 0.6,
                animation: `twinkle ${4 + (d % 4)}s ease-in-out ${d}s infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Main centered card */}
      <div className="min-h-screen flex items-center justify-center px-5 py-12 relative z-20">
        <div
          ref={cardRef}
          className="w-full max-w-xl relative rounded-2xl p-6 sm:p-8 bg-black/30 backdrop-blur-md border border-white/6 shadow-2xl"
        >
          {/* Heading */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Create a child account</h1>
              <p className="text-sm text-slate-200/80 mt-1 max-w-md">Parent-assisted signup — safe, private and playful. Saarthi will cheer every step.</p>
            </div>

            {/* small orbital icon */}
            <div className="ml-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-300 via-cyan-300 to-violet-400 flex items-center justify-center text-black font-bold shadow">
                L
              </div>
            </div>
          </div>

          {/* connecting constellation (SVG) */}
          <div className="relative">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.2" fill="none">
                <path d="M40 40 C180 120, 320 20, 460 90" />
                <path d="M460 90 C600 160, 740 60, 900 120" />
              </g>
            </svg>

            {/* Form */}
            <form onSubmit={handleSignup} className="relative z-10 space-y-4">
              {/* Name */}
              <div className="relative">
                <label className="text-xs text-slate-200/80 mb-1 block">Child's name</label>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center text-white/90">
                    {/* icon morphs on focus (visual only) */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <input
                    value={form.name}
                    onChange={onChange("name")}
                    className="flex-1 rounded-xl px-4 py-3 bg-white/5 border border-white/6 focus:border-cyan-300 outline-none text-base placeholder:text-slate-200/40"
                    placeholder="e.g., Aarav"
                    aria-label="Child name"
                  />
                </div>
              </div>

              {/* Age + Level row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-200/80 mb-1 block">Age</label>
                  <input
                    value={form.age}
                    onChange={onChange("age")}
                    type="number"
                    min="6"
                    max="14"
                    className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/6 focus:border-cyan-300 outline-none"
                    placeholder="8"
                    aria-label="Age"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-200/80 mb-1 block">Level</label>
                  <select
                    value={form.level}
                    onChange={onChange("level")}
                    className="w-full rounded-xl px-3 py-3 bg-white/5 border border-white/6 focus:border-cyan-300 outline-none"
                    aria-label="Level"
                  >
                    <option value="1">Level 1 — Words</option>
                    <option value="2">Level 2 — Short sentences</option>
                    <option value="3">Level 3 — Full sentences</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs text-slate-200/80 mb-1 block">Parent email</label>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center text-white/90">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/></svg>
                  </span>
                  <input
                    value={form.email}
                    onChange={onChange("email")}
                    type="email"
                    className="flex-1 rounded-xl px-4 py-3 bg-white/5 border border-white/6 focus:border-cyan-300 outline-none"
                    placeholder="parent@example.com"
                    aria-label="Parent email"
                  />
                </div>
              </div>

              {/* Parental consent */}
              <div className="flex items-center gap-3">
                <input id="consent" required type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/4" />
                <label htmlFor="consent" className="text-sm text-slate-200/80">I confirm parental consent</label>
              </div>

              {/* Error message */}
              {errorMsg && <div className="text-sm text-rose-300">{errorMsg}</div>}

              {/* CTA row: button + progress ring */}
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative flex-1 rounded-full px-5 py-3 bg-gradient-to-r from-green-400 via-cyan-400 to-violet-500 text-black font-bold text-lg shadow-2xl overflow-hidden flex items-center justify-center"
                >
                  <span className="z-10">{loading ? "Creating..." : "Create Account"}</span>

                  {/* progress ring */}
                  <svg className="absolute right-3 w-8 h-8" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="15.5" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
                    <motion.circle
                      initial={{ strokeDashoffset: 94 }}
                      animate={{ strokeDashoffset: loading ? 0 : 94 }}
                      transition={{ duration: loading ? 1.2 : 0.6, ease: "easeInOut" }}
                      cx="18"
                      cy="18"
                      r="15.5"
                      stroke="#000"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="94"
                    />
                  </svg>
                </button>

                <a
                  href="/login"
                  className="inline-block px-4 py-3 rounded-full border border-white/10 text-sm text-white/90 backdrop-blur-sm"
                >
                  Sign in
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success overlay with designed particle burst */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="relative z-50 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold mb-2">Welcome aboard!</div>
              <div className="text-slate-200/80 mb-4">A tiny first lesson is being prepared. Saarthi will cheer you on ✨</div>

              <div className="mx-auto w-40 h-40 rounded-full bg-gradient-to-tr from-green-300 to-cyan-200 shadow-2xl mb-6" />
            </motion.div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ y: -40, x: p.left + "%", opacity: 0, scale: 0.6, rotate: p.rot }}
                  animate={{ y: 760 + Math.random() * 120, x: p.left + (Math.random() - 0.5) * 12 + "%", opacity: 1, scale: 1.2, rotate: p.rot + 360 }}
                  transition={{ delay: p.delay, duration: 1.2 + Math.random() * 0.9, ease: "easeOut" }}
                  style={{ position: "absolute", left: `${p.left}%` }}
                >
                  <svg width={p.size} height={p.size} viewBox="0 0 10 10" className="block">
                    <circle cx="5" cy="5" r="5" fill="#dfffe8" />
                  </svg>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* small page-level styles (keeps single-file) */}
      <style>{`
        @keyframes bgShift {
          0% { filter: hue-rotate(0deg) saturate(100%); }
          50% { filter: hue-rotate(30deg) saturate(110%); }
          100% { filter: hue-rotate(0deg) saturate(100%); }
        }
        @keyframes twinkle {
          0% { opacity: 0.12; transform: scale(0.92); }
          50% { opacity: 0.96; transform: scale(1.18); }
          100% { opacity: 0.12; transform: scale(0.92); }
        }
        @keyframes shakeX {
          0% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
        .shake-x { animation: shakeX 0.7s cubic-bezier(.36,.07,.19,.97); }

        /* small responsive tweaks */
        @media (max-width: 420px) {
          .w-[44vw] { width: 56vw; } /* scale planet for tiny screens */
        }
      `}</style>
    </div>
  );
}