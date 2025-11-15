// src/pages/Signup.jsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Signup — realistic blinking eye, improved success popup, removed "Sign in" link
 * Backend POST: `${VITE_API_URL || 'http://localhost:8000'}/users/signup`
 */

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

/* ---------------------------
   Realistic Blinking Eye Component
   - shows open white sclera eye with pupil + highlight
   - blinks automatically at random intervals when open=true
   - when open=false, shows closed eye (horizontal eyelid)
   --------------------------- */
function BlinkingEye({ open = false, size = 20 }) {
  const [blink, setBlink] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    function schedule() {
      const t = 2500 + Math.random() * 4000; // 2.5s - 6.5s
      timeoutRef.current = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140); // short blink
        schedule();
      }, t);
    }
    // Only blink when eye is open (so visible eyes blink)
    if (open) schedule();
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // If not open -> show closed eye icon (to indicate hidden password)
  if (!open || blink) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        <path
          d="M4 24s6-12 20-12 20 12 20 12-6 12-20 12S4 24 4 24z"
          fill="#FFFFFF"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="0.8"
        />
        {/* eyelid / strike line to indicate closed */}
        <path d="M8 8l32 32" stroke="rgba(0,0,0,0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Open eye (sclera + iris+pupil + small highlight). Slight inner shadow for realism.
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {/* sclera */}
      <path
        d="M4 24s6-12 20-12 20 12 20 12-6 12-20 12S4 24 4 24z"
        fill="#FFFFFF"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.8"
      />
      {/* subtle inner shading */}
      <path d="M12 30c6 2 12 2 20-2" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* iris */}
      <circle cx="24" cy="24" r="6.2" fill="#071021" />
      {/* pupil */}
      <circle cx="24" cy="24" r="3" fill="#000" />
      {/* highlight */}
      <circle cx="26.2" cy="22.2" r="1.2" fill="rgba(255,255,255,0.95)" />
    </svg>
  );
}

/* ---------------------------
   Gender dropdown (unchanged layout)
   --------------------------- */
function GenderDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);

  const options = [
    { key: "male", label: "Male" },
    { key: "female", label: "Female" },
    { key: "other", label: "Other" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="w-full rounded-xl px-3 py-3 bg-white/6 border border-white/6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-cyan-300"
      >
        <span className={` ${value ? "text-white/95" : "text-slate-300"}`}>{options.find((o) => o.key === value)?.label || "Select gender"}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" className={`transform transition-transform ${open ? "rotate-180" : "rotate-0"} text-white/90`} fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            role="listbox"
            aria-label="Gender"
            className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden shadow-lg z-40"
            style={{ background: "linear-gradient(180deg, rgba(4,18,28,0.96), rgba(7,34,44,0.94))", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            {options.map((opt) => (
              <li
                key={opt.key}
                role="option"
                aria-selected={opt.key === value}
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className="px-4 py-3 cursor-pointer hover:bg-white/5 text-white"
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------
   Main Signup Component
   --------------------------- */
export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
    gender: "", // placeholder "Select gender"
    parentPassword: "",
    parentConfirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showParentPass, setShowParentPass] = useState(false);
  const [showParentConfirm, setShowParentConfirm] = useState(false);
  const cardRef = useRef(null);

  // more joyful particle positions for brilliant popup
  const particles = new Array(32).fill(0).map((_, i) => ({
    id: i,
    left: 4 + i * 3 + Math.random() * 6,
    delay: Math.random() * 0.22 + i * 0.02,
    rot: Math.random() * 360,
    size: 6 + Math.random() * 14,
    color: ["#dfffe8", "#fff1c2", "#ffd9f1", "#e4f0ff"][i % 4],
  }));

  const onChange = (k) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setForm((s) => ({ ...s, [k]: v }));
  };

  function validate() {
    if (!form.name.trim()) return "Please enter the child's name.";
    if (!form.email.trim()) return "Please enter parent email.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!form.parentPassword) return "Please create a parent password.";
    if (form.parentPassword.length < 6) return "Parent password must be at least 6 characters.";
    if (form.parentPassword !== form.parentConfirm) return "Parent passwords do not match.";
    return null;
  }

  async function handleSignup(e) {
    e.preventDefault();
    setErrorMsg("");
    const v = validate();
    if (v) {
      setErrorMsg(v);
      cardRef.current?.classList.add("shake-x");
      setTimeout(() => cardRef.current?.classList.remove("shake-x"), 700);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        age: form.age ? Number(form.age) : null,
        email: form.email,
        gender: form.gender,
        password: form.parentPassword,
      };

      const res = await axios.post(`${API}/users/signup`, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 8000,
      });

      if (res.status === 200 || res.status === 201) {
        // brilliant popup
        setSuccess(true);
        setTimeout(() => (window.location.href = "/login"), 1600);
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

  // password strength
  const pwScore = (() => {
    const p = form.parentPassword || "";
    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 10) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score;
  })();
  const strengthLabel = ["Very weak", "Weak", "Okay", "Good", "Strong", "Excellent"][pwScore];

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-lexend text-white antialiased">
      {/* animated gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background: "linear-gradient(120deg, #00121a 0%, #002b2b 30%, #003a52 50%, #00223a 70%, #000814 100%)",
          animation: "bgShift 20s linear infinite",
        }}
      />

      {/* nebula */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <defs>
          <linearGradient id="n1" x1="0" x2="1">
            <stop offset="0%" stopColor="#00ffb3" stopOpacity="0.06" />
            <stop offset="60%" stopColor="#3fb8ff" stopOpacity="0.02" />
          </linearGradient>
          <filter id="b1">
            <feGaussianBlur stdDeviation="50" />
          </filter>
        </defs>

        <ellipse cx="160" cy="140" rx="380" ry="160" fill="url(#n1)" filter="url(#b1)" />
        <ellipse cx="950" cy="360" rx="420" ry="170" fill="url(#n1)" filter="url(#b1)" />
      </svg>

      {/* rotating planet */}
      <div className="pointer-events-none absolute right-0 bottom-0 z-10">
        <svg viewBox="0 0 520 520" className="w-[44vw] sm:w-[36vw] md:w-[30vw] lg:w-[24vw]">
          <defs>
            <radialGradient id="pG" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#b7fff0" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#69c7ff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#00101f" stopOpacity="1" />
            </radialGradient>
            <filter id="glowP">
              <feGaussianBlur stdDeviation="20" result="g" />
              <feMerge>
                <feMergeNode in="g" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform="translate(60,60)">
            <motion.g initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }}>
              <circle cx="320" cy="320" r="240" fill="url(#pG)" filter="url(#glowP)" />
            </motion.g>
            <ellipse cx="220" cy="300" rx="210" ry="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
            <ellipse cx="220" cy="320" rx="170" ry="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
          </g>
        </svg>
      </div>

      {/* subtle stars */}
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

      {/* centered card */}
      <div className="min-h-screen flex items-center justify-center px-5 py-12 relative z-20">
        <div ref={cardRef} className="w-full max-w-xl relative rounded-2xl p-6 sm:p-8 bg-black/30 backdrop-blur-md border border-white/6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Create a child account</h1>
              <p className="text-sm text-slate-200/80 mt-1 max-w-md">Parent-assisted signup — safe, private and playful. Saarthi will cheer every step.</p>
            </div>

            <div className="ml-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-300 via-cyan-300 to-violet-400 flex items-center justify-center text-black font-bold shadow">L</div>
            </div>
          </div>

          <div className="relative">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.2" fill="none">
                <path d="M40 40 C180 120, 320 20, 460 90" />
                <path d="M460 90 C600 160, 740 60, 900 120" />
              </g>
            </svg>

            <form onSubmit={handleSignup} className="relative z-10 space-y-4">
              {/* Child name */}
              <div>
                <label className="text-xs text-slate-200/80 mb-1 block">Child's name</label>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center text-white/90">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <input value={form.name} onChange={onChange("name")} className="flex-1 rounded-xl px-4 py-3 bg-white/5 border border-white/6 focus:border-cyan-300 outline-none text-base placeholder:text-slate-200/40" placeholder="e.g., Aarav" aria-label="Child name" />
                </div>
              </div>

              {/* Age + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-200/80 mb-1 block">Age</label>
                  <input value={form.age} onChange={onChange("age")} type="number" min="6" max="14" className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/6 focus:border-cyan-300 outline-none" placeholder="8" aria-label="Age" />
                </div>

                <div>
                  <label className="text-xs text-slate-200/80 mb-1 block">Gender</label>
                  <GenderDropdown value={form.gender} onChange={(v) => setForm((s) => ({ ...s, gender: v }))} />
                </div>
              </div>

              {/* Parent email */}
              <div>
                <label className="text-xs text-slate-200/80 mb-1 block">Parent email</label>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center text-white/90">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/></svg>
                  </span>
                  <input value={form.email} onChange={onChange("email")} type="email" className="flex-1 rounded-xl px-4 py-3 bg-white/5 border border-white/6 focus:border-cyan-300 outline-none" placeholder="parent@example.com" aria-label="Parent email" />
                </div>
              </div>

              {/* Parent password */}
              <div>
                <label className="text-xs text-slate-200/80 mb-1 block">Parent password</label>
                <div className="relative">
                  <input value={form.parentPassword} onChange={onChange("parentPassword")} type={showParentPass ? "text" : "password"} placeholder="Create a parent password" aria-label="Parent password" className="w-full rounded-xl px-4 py-3 pr-12 bg-white/5 border border-white/6 focus:border-cyan-300 outline-none" />
                  <button type="button" onClick={() => setShowParentPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/90 p-1 rounded" aria-label={showParentPass ? "Hide password" : "Show password"}>
                    <BlinkingEye open={showParentPass} />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex gap-1" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`h-2 w-6 rounded ${i <= pwScore - 1 ? (pwScore <= 1 ? "bg-rose-400" : pwScore <= 3 ? "bg-yellow-300" : "bg-emerald-300") : "bg-white/6"}`} />
                    ))}
                  </div>
                  <div className="text-xs text-slate-300">{strengthLabel}</div>
                </div>
              </div>

              {/* Confirm parent password */}
              <div>
                <label className="text-xs text-slate-200/80 mb-1 block">Confirm parent password</label>
                <div className="relative">
                  <input value={form.parentConfirm} onChange={onChange("parentConfirm")} type={showParentConfirm ? "text" : "password"} placeholder="Repeat parent password" aria-label="Confirm parent password" className="w-full rounded-xl px-4 py-3 pr-12 bg-white/5 border border-white/6 focus:border-cyan-300 outline-none" />
                  <button type="button" onClick={() => setShowParentConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/90 p-1 rounded" aria-label={showParentConfirm ? "Hide confirm password" : "Show confirm password"}>
                    <BlinkingEye open={showParentConfirm} />
                  </button>
                </div>
              </div>

              {/* consent */}
              <div className="flex items-center gap-3">
                <input id="consent" required type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/4" />
                <label htmlFor="consent" className="text-sm text-slate-200/80">I confirm parental consent</label>
              </div>

              {errorMsg && <div className="text-sm text-rose-300">{errorMsg}</div>}

              {/* CTA (Sign in link removed as requested) */}
              <div className="flex items-center gap-3 mt-1">
                <button type="submit" disabled={loading} className="relative flex-1 rounded-full px-5 py-3 bg-gradient-to-r from-green-400 via-cyan-400 to-violet-500 text-black font-bold text-lg shadow-2xl overflow-hidden flex items-center justify-center">
                  <span className="z-10">{loading ? "Creating..." : "Create Account"}</span>
                  <svg className="absolute right-3 w-8 h-8" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="15.5" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
                    <motion.circle initial={{ strokeDashoffset: 94 }} animate={{ strokeDashoffset: loading ? 0 : 94 }} transition={{ duration: loading ? 1.2 : 0.6, ease: "easeInOut" }} cx="18" cy="18" r="15.5" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeDasharray="94" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* brilliant success popup */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

            <motion.div initial={{ scale: 0.9, y: 18 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.42 }} className="relative z-60 text-center max-w-sm px-6 py-6 rounded-3xl bg-gradient-to-tr from-slate-900/95 to-slate-800/80 border border-white/8 shadow-[0_30px_80px_rgba(2,6,23,0.7)]">
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.08, 1] }} transition={{ duration: 0.48 }} className="mx-auto w-32 h-32 rounded-full bg-gradient-to-tr from-green-300 to-cyan-200 shadow-inner mb-4 grid place-items-center text-6xl">
                🎉
              </motion.div>

              <motion.h3 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12 }} className="text-2xl font-extrabold mb-2">
                Registered successfully!
              </motion.h3>

              <motion.p initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm text-slate-200/85 mb-4">
                Saarthi will cheer you on — redirecting to login…
              </motion.p>

              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center">⭐</div>
                <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center">📚</div>
                <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center">✨</div>
              </div>
            </motion.div>

            {/* larger confetti burst */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ y: -20, x: `${p.left}%`, opacity: 0, scale: 0.6, rotate: p.rot }}
                  animate={{ y: 820 + Math.random() * 160, x: `${p.left + (Math.random() - 0.5) * 22}%`, opacity: 1, scale: 1.3, rotate: p.rot + 360 }}
                  transition={{ delay: p.delay + i * 0.005, duration: 1.0 + Math.random() * 0.9, ease: "easeOut" }}
                  style={{ position: "absolute", left: `${p.left}%` }}
                >
                  <svg width={p.size} height={p.size} viewBox="0 0 10 10" className="block">
                    <rect x="0" y="0" width="10" height="10" rx="2" fill={p.color} />
                  </svg>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bgShift { 0% { filter: hue-rotate(0deg) saturate(100%); } 50% { filter: hue-rotate(30deg) saturate(110%); } 100% { filter: hue-rotate(0deg) saturate(100%); } }
        @keyframes twinkle { 0% { opacity: 0.12; transform: scale(0.92);} 50% { opacity: 0.96; transform: scale(1.18);} 100% { opacity: 0.12; transform: scale(0.92);} }
        @keyframes shakeX { 0%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}100%{transform:translateX(0)} }
        .shake-x { animation: shakeX 0.7s cubic-bezier(.36,.07,.19,.97); }
        /* readable fallback for native select options */
        select option { color: #000 !important; background: #fff !important; }
        @media (max-width:420px) { .w-[44vw] { width: 56vw; } }
      `}</style>
    </div>
  );
}