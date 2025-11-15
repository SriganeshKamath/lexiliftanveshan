// src/pages/Login.jsx
import { useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:8000";  // backend root

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const cardRef = useRef(null);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    if (!form.email.trim()) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!form.password.trim()) return "Please enter your password.";
    return null;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");

    const v = validate();
    if (v) {
      setErrorMsg(v);
      cardRef.current?.classList.add("shake-x");
      setTimeout(() => cardRef.current?.classList.remove("shake-x"), 650);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/users/login`,
        form,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 8000,
        }
      );

      if (res.status === 200) {
        const user = res.data;

        // ----------------------------------------
        // ✅ Save user details locally (No JWT)
        // ----------------------------------------
        localStorage.setItem(
          "lexilift_user",
          JSON.stringify({
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            level: user.level,
          })
        );

        setSuccess(true);

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } else {
        setErrorMsg("Login failed. Try again.");
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  // Confetti particles
  const particles = new Array(40).fill(0).map((_, i) => {
    const colors = ["#00ffb3", "#3fb8ff", "#a78bfa", "#fbbf24", "#f472b6", "#22d3ee"];
    return {
      id: i,
      left: 5 + i * 2.5 + Math.random() * 3,
      delay: Math.random() * 0.3 + i * 0.015,
      rot: Math.random() * 360,
      size: 4 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.5 ? "circle" : "rect",
    };
  });

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-lexend text-white antialiased">

      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(135deg, #000814, #001a2e, #003a52, #00223a, #00121a)",
          animation: "bgShift 25s linear infinite",
        }}
      />

      {/* Nebula */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none -z-10"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="n1" x1="0" x2="1">
            <stop offset="0%" stopColor="#00ffb3" stopOpacity="0.08" />
            <stop offset="60%" stopColor="#3fb8ff" stopOpacity="0.03" />
          </linearGradient>
          <filter id="b1"><feGaussianBlur stdDeviation="60" /></filter>
        </defs>
        <ellipse cx="160" cy="140" rx="380" ry="160" fill="url(#n1)" filter="url(#b1)" />
        <ellipse cx="950" cy="360" rx="420" ry="170" fill="url(#n1)" filter="url(#b1)" />
      </svg>

      {/* Stars */}
      <div className="absolute inset-0 -z-5 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => {
          const l = Math.random() * 100;
          const t = Math.random() * 100;
          const s = 2 + Math.random() * 5;
          const d = Math.random() * 8;
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
                opacity: 0.5,
                boxShadow: `0 0 ${s * 2}px rgba(255,255,255,0.8)`,
                animation: `twinkle ${3 + (d % 5)}s ease-in-out ${d}s infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Login Card */}
      <div className="min-h-screen flex items-center justify-center px-5 py-12 relative z-20">
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-xl rounded-3xl p-8 sm:p-10 bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden"
        >

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between mb-8">
            <div>
              <motion.h1 
                className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-emerald-100 bg-clip-text text-transparent"
              >
                Welcome back
              </motion.h1>
              <p className="text-sm text-slate-300/90 mt-2">
                Log in to continue your journey
              </p>
            </div>

            <motion.div
              className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-lg shadow-lg grid place-items-center text-2xl"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              👋
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-xs text-slate-300 uppercase">Email</label>
              <input
                value={form.email}
                onChange={onChange("email")}
                type="email"
                className="w-full rounded-xl px-5 py-3.5 bg-white/5 border border-white/10 outline-none focus:border-cyan-300"
                placeholder="parent@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-slate-300 uppercase">Password</label>
              <input
                value={form.password}
                onChange={onChange("password")}
                type="password"
                className="w-full rounded-xl px-5 py-3.5 bg-white/5 border border-white/10 outline-none focus:border-cyan-300"
                placeholder="•••••••"
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 text-sm rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-300"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-full px-6 py-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 text-black font-extrabold shadow-xl"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>

          </form>
        </motion.div>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
              <div className="mx-auto w-32 h-32 bg-gradient-to-br from-emerald-300 via-cyan-200 to-violet-300 rounded-full flex items-center justify-center text-6xl shadow-2xl">
                🎉
              </div>
              <h2 className="text-4xl font-extrabold mt-4 bg-gradient-to-r from-white via-cyan-100 to-emerald-100 bg-clip-text text-transparent">
                Welcome back!
              </h2>
              <p className="text-slate-200 mt-2">Loading dashboard…</p>
            </motion.div>

            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ y: -30, x: `${p.left}%`, opacity: 0 }}
                  animate={{
                    y: 900,
                    x: `${p.left + (Math.random() - 0.5) * 30}%`,
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ delay: p.delay, duration: 2 }}
                  style={{
                    position: "absolute",
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    borderRadius: p.shape === "circle" ? "50%" : "4px",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bgShift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(20deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .shake-x { animation: shakeX 0.6s; }
      `}</style>

    </div>
  );
}
