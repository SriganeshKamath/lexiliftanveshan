// src/pages/Assessment.jsx
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// --------------------------
// 15 QUESTIONS
// --------------------------
const QUESTIONS = [
  "bat",
  "dog",
  "sun",
  "fish",
  "map",
  "red",
  "cup",
  "glass",
  "The cat ran fast",
  "I see a big dog",
  "She sat on the mat",
  "The sun is bright",
  "Pick up the cup",
  "Tom got a red ball",
  "We play in the park",
];

export default function Assessment() {
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mascotText, setMascotText] = useState(
    "Hi explorer! Let's begin your space pronunciation mission! Tap the mic and try your best! 🚀"
  );

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const navigate = useNavigate();

  // --------------------------
  // Start Recording
  // --------------------------
  async function startRecording() {
    try {
      setRecording(true);
      setMascotText("I'm listening… say it clearly!");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (e) =>
        audioChunks.current.push(e.data);

      mediaRecorder.current.onstop = handleStop;

      mediaRecorder.current.start();
    } catch (err) {
      console.error(err);
      setMascotText("Oops! I couldn't access your microphone.");
    }
  }

  // --------------------------
  // Stop Recording
  // --------------------------
  async function stopRecording() {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
      setMascotText("Processing what you said…");
    }
  }

  // --------------------------
  // ASR Evaluation
  // --------------------------
  async function handleStop() {
    const blob = new Blob(audioChunks.current, { type: "audio/wav" });
    const fd = new FormData();
    fd.append("file", blob, "audio.wav");
    fd.append("expected_text", QUESTIONS[index]);

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8001/asr/evaluate", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      const newResult = {
        question: QUESTIONS[index],
        analysis: data.analysis,
      };

      setResults((prev) => [...prev, newResult]);

      // Mascot feedback
      if (data.analysis.accuracy >= 0.8) {
        setMascotText("Great job! You're doing awesome 🌟");
      } else if (data.analysis.accuracy >= 0.5) {
        setMascotText("Almost! Keep trying, you can do it 💫");
      } else {
        setMascotText("That's okay! Space heroes learn by practicing 🚀");
      }

      // Next question or complete
      if (index < QUESTIONS.length - 1) {
        setTimeout(() => setIndex((i) => i + 1), 1200);
      } else {
        setMascotText("Mission complete! Finalizing your space report…");
        setTimeout(() => submitAssessment(), 1500);
      }
    } catch (err) {
      console.error(err);
      setMascotText("Hmm… cosmic noise! Try saying it again.");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------
  // Fake Backend (MVP)
  // --------------------------
  async function submitAssessment() {
    // ① Start loading overlay
    setLoading(true);
    setMascotText("Generating your pronunciation report… please wait…");

    // ② 60 second delay (fake complex processing)
    await new Promise((resolve) => setTimeout(resolve, 60000));

    // ③ Generate fake phoneme difficulty profile
    const fakeProfile = {
      b: Math.floor(Math.random() * 5),
      d: Math.floor(Math.random() * 5),
      sh: Math.floor(Math.random() * 5),
      r: Math.floor(Math.random() * 3),
      th: Math.floor(Math.random() * 4),
    };

    // ④ Final fake report
    const report = {
      overall_accuracy: calculateOverall(results),
      phoneme_profile: fakeProfile,
      completed_at: new Date().toISOString(),
    };

    // ⑤ Save to localStorage
    localStorage.setItem("lexilift_assessment", JSON.stringify(report));

    // ⑥ Go to dashboard
    navigate("/dashboard");
  }

  // --------------------------
  // Overall Accuracy
  // --------------------------
  function calculateOverall(res) {
    let total = 0;
    res.forEach((r) => (total += r.analysis.accuracy || 0));
    return Number((total / res.length).toFixed(3));
  }

  // --------------------------
  // UI
  // --------------------------
  return (
    <div
      className="min-h-screen w-full text-white font-lexend overflow-hidden relative px-5 py-6"
      style={{
        background:
          "radial-gradient(1000px 500px at 8% 15%, rgba(66,255,203,0.06), transparent 6%), " +
          "linear-gradient(180deg, #050b14 0%, #061628 40%, #030a16 100%)",
      }}
    >
      {/* Stars */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full opacity-50"
          style={{
            width: Math.random() * 3 + 2,
            height: Math.random() * 3 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2], y: [-5, 5, -5] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity }}
        />
      ))}

      {/* Progress */}
      <div className="w-full max-w-xl mx-auto my-4">
        <div className="text-center mb-2 text-white/80">
          Question {index + 1} / {QUESTIONS.length}
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto mt-6 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl relative overflow-hidden"
      >
        {/* Floating Stars inside */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0.3, 1, 0.3], y: [-5, 0, -5] }}
              transition={{
                duration: 2.5 + Math.random() * 2,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        {/* Question */}
        <motion.h1
          className="text-3xl sm:text-4xl font-extrabold text-center mb-6 italic"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {QUESTIONS[index]}
        </motion.h1>

        {/* Mic Button */}
        <div className="flex justify-center my-6">
          <motion.button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={loading}
            animate={recording ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.6, repeat: recording ? Infinity : 0 }}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-md
              ${recording ? "bg-red-500" : "bg-green-400/80"}
            `}
          >
            <svg width="50" height="50" fill="black">
              <path d="M25 35c5 0 9-4 9-9V14c0-5-4-9-9-9s-9 4-9 9v12c0 5 4 9 9 9zm13-9c0 7-6 13-13 13S12 33 12 26H8c0 9 7 16 16 16s16-7 16-16h-4z" />
            </svg>
          </motion.button>
        </div>

        <p className="text-center text-white/70 text-sm">
          {recording ? "Release to stop" : "Hold to speak"}
        </p>

        {loading && (
          <div className="text-center mt-4 text-white/70 animate-pulse">
            Listening to the stars...
          </div>
        )}
      </motion.div>

      {/* Astronaut + Speech Bubble */}
      <div className="mt-10 flex justify-center">
        <div className="flex flex-col items-center">
          {/* Astronaut */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <svg width="130" height="130" viewBox="0 0 200 200">
              <circle cx="100" cy="72" r="50" fill="rgba(255,255,255,0.08)" />
              <circle
                cx="100"
                cy="72"
                r="35"
                fill="rgba(255,255,255,0.18)"
                stroke="white"
                strokeWidth="4"
              />
              <rect
                x="70"
                y="110"
                width="60"
                height="70"
                rx="18"
                fill="rgba(255,255,255,0.15)"
              />
              <rect
                x="45"
                y="120"
                width="30"
                height="20"
                rx="10"
                fill="rgba(255,255,255,0.12)"
              />
              <rect
                x="125"
                y="120"
                width="30"
                height="20"
                rx="10"
                fill="rgba(255,255,255,0.12)"
              />
            </svg>
          </motion.div>

          {/* Speech bubble */}
          <motion.div
            className="bg-white/10 border border-white/20 rounded-2xl p-4 mt-3 max-w-sm text-center backdrop-blur-md shadow-xl"
            animate={{ scale: recording ? [1, 1.03, 1] : 1 }}
            transition={{ duration: 0.4, repeat: recording ? Infinity : 0 }}
          >
            {mascotText}
          </motion.div>
        </div>
      </div>

      {/* LOADING OVERLAY (60-second processing) */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex flex-col items-center justify-center text-white z-[999]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="w-28 h-28 border-4 border-cyan-400 border-t-transparent rounded-full mb-6"
          />
          <p className="text-xl opacity-80 mt-4">Analyzing your space voice…</p>
          <p className="text-sm opacity-50 mt-2">This may take up to 1 minute</p>
        </div>
      )}
    </div>
  );
}
