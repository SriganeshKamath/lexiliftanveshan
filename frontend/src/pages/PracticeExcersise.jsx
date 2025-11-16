// src/pages/PracticeExercise.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AI_BASE =
  import.meta.env.VITE_AI_BASE_URL || "http://localhost:8001";
const BACKEND_BASE =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8000";

const DEFAULT_COUNT = 8;

export default function PracticeExercise() {
  const [level, setLevel] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("lexilift_user") || "{}");
      return user.level || 1;
    } catch {
      return 1;
    }
  });

  const [exercises, setExercises] = useState([]); // [{id,text,type}]
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [listening, setListening] = useState(false); // TTS
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [results, setResults] = useState([]); // [{exerciseIndex, text, analysis}]
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [mascotText, setMascotText] = useState(
    "Welcome back, explorer! Let's practice reading with the stars 🌌"
  );
  const [microdrills, setMicrodrills] = useState([]);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // -----------------------------
  // Helpers
  // -----------------------------
  const currentExercise = exercises[currentIndex];

  const userId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("lexilift_user") || "{}");
      return user.id || user._id || null;
    } catch {
      return null;
    }
  })();

  const hasStarted = exercises.length > 0;

  // -----------------------------
  // Generate New Exercises
  // -----------------------------
  async function handleGenerate() {
    try {
      setLoading(true);
      setMascotText(
        "Generating a new cosmic reading mission for you… ✨"
      );

      const fd = new FormData();
      fd.append("level", String(level || 1));
      fd.append("patterns", "{}");
      fd.append("count", String(DEFAULT_COUNT));

      const res = await fetch(`${AI_BASE}/llm/generate_exercises`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      let raw = data.exercises || [];

      // Normalize: support both ["text"] and [{text,type}]
      const normalized = raw.map((item, idx) => {
        if (typeof item === "string") {
          return {
            id: idx,
            text: item,
            type: item.trim().includes(" ") ? "sentence" : "word",
          };
        }
        return {
          id: item.id ?? idx,
          text: item.text ?? "",
          type:
            item.type ??
            (item.text && item.text.trim().includes(" ")
              ? "sentence"
              : "word"),
        };
      });

      setExercises(normalized);
      setCurrentIndex(0);
      setResults([]);
      setSummaryOpen(false);
      setMicrodrills([]);
      setMascotText(
        "Mission ready! Tap the mic and read each card aloud, star hero 🚀"
      );
    } catch (err) {
      console.error(err);
      setMascotText(
        "Hmm… the space server is a bit sleepy. Try generating again!"
      );
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // TTS: Listen to the current exercise
  // -----------------------------
  async function playTTS(text) {
    if (!text) return;
    try {
      setListening(true);
      const fd = new FormData();
      fd.append("text", text);

      const res = await fetch(`${AI_BASE}/tts/speak`, {
        method: "POST",
        body: fd,
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setListening(false);
      };
    } catch (err) {
      console.error(err);
      setListening(false);
      setMascotText(
        "I couldn't reach the TTS stars. It's okay, you can still read it yourself!"
      );
    }
  }

  // -----------------------------
  // Recording (ASR)
  // -----------------------------
  async function startRecording() {
    if (!currentExercise) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (e) =>
        audioChunks.current.push(e.data);

      mediaRecorder.current.onstop = handleStop;

      mediaRecorder.current.start();
      setRecording(true);
      setMascotText("I'm listening… read it clearly, space explorer 👂✨");
    } catch (err) {
      console.error(err);
      setMascotText(
        "I couldn't access your microphone. Check permissions and try again."
      );
    }
  }

  async function stopRecording() {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setRecording(false);
      setMascotText("Processing your reading with cosmic ASR…");
    }
  }

  // -----------------------------
  // Handle recorded audio → ASR
  // -----------------------------
  async function handleStop() {
    const exercise = currentExercise;
    if (!exercise) return;

    const blob = new Blob(audioChunks.current, { type: "audio/wav" });
    const fd = new FormData();
    fd.append("file", blob, "audio.wav");
    fd.append("expected_text", exercise.text);

    try {
      setLoading(true);
      const res = await fetch(`${AI_BASE}/asr/evaluate`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      const analysis = data.analysis || data; // fallback

      const newEntry = {
        exerciseIndex: currentIndex,
        text: exercise.text,
        analysis,
      };

      setResults((prev) => [...prev, newEntry]);

      const acc = analysis.accuracy ?? 0;

      if (acc >= 0.9) {
        setMascotText("Perfect reading! That was stellar 🌟");
      } else if (acc >= 0.7) {
        setMascotText("Nice job! A tiny bit more practice and you'll shine 💫");
      } else {
        setMascotText(
          "Good attempt! Let's keep practicing — space heroes improve with every try 🚀"
        );
      }

      // Move to next or show summary
      if (currentIndex < exercises.length - 1) {
        setTimeout(() => setCurrentIndex((i) => i + 1), 900);
      } else {
        setTimeout(() => {
          openSummaryAndSubmit([...results, newEntry]);
        }, 900);
      }
    } catch (err) {
      console.error(err);
      setMascotText(
        "Cosmic noise disturbed the signal. Try reading that one again."
      );
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // Calculate summary & submit to backend
  // -----------------------------
  function computeOverallAccuracy(allResults) {
    if (!allResults.length) return 0;
    const total = allResults.reduce(
      (sum, r) => sum + (r.analysis?.accuracy || 0),
      0
    );
    return Number((total / allResults.length).toFixed(3));
  }

  function computeCorrectWrong(allResults) {
    let correct = 0;
    let wrong = 0;
    allResults.forEach((r) => {
      const acc = r.analysis?.accuracy || 0;
      if (acc >= 0.8) correct += 1;
      else wrong += 1;
    });
    return { correct, wrong };
  }

  async function openSummaryAndSubmit(allResults) {
    setSummaryOpen(true);
    const overallAccuracy = computeOverallAccuracy(allResults);
    const { correct, wrong } = computeCorrectWrong(allResults);

    setMascotText(
      `Mission complete! You read ${correct} cards really well and ${wrong} still need stardust practice.`
    );

    // Fire & forget backend submit
    if (!userId) {
      console.warn("No user_id found in localStorage. Skipping /exercises/submit.");
      return;
    }

    setSubmitting(true);
    try {
      const flattenedWords = allResults.flatMap((r) =>
        (r.analysis?.words || []).map((w) => ({
          ...w,
          exercise_text: r.text,
        }))
      );

      const payload = {
        user_id: userId,
        level,
        source: "practice_exercise",
        accuracy: overallAccuracy,
        words: flattenedWords,
      };

      const res = await fetch(`${BACKEND_BASE}/exercises/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const drills = data.microdrills || [];
      setMicrodrills(drills);
    } catch (err) {
      console.error("Error submitting exercise session:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // -----------------------------
  // TTS Explanation per question
  // -----------------------------
  function buildExplanation(entry) {
    const analysis = entry.analysis || {};
    const words = analysis.words || [];
    const incorrect = words.filter((w) => w.error_type !== "correct");
    if (!incorrect.length) {
      return `Great job! You read "${entry.text}" very clearly. Keep it up!`;
    }

    const first = incorrect[0];
    const expected = first.expected || "";
    const spoken = first.spoken || "";
    return `You read "${entry.text}". The word "${expected}" sounded like "${spoken}". Try saying it again slowly and match the sounds.`;
  }

  async function speakExplanation(entry) {
    const text = buildExplanation(entry);
    await playTTS(text);
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div
      className="min-h-screen w-full text-white font-lexend overflow-hidden relative px-4 sm:px-8 py-6"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% 0%, rgba(88,196,255,0.12), transparent 50%), " +
          "radial-gradient(900px 500px at 90% 100%, rgba(244,114,182,0.16), transparent 55%), " +
          "linear-gradient(180deg, #020617 0%, #020617 60%, #000814 100%)",
      }}
    >
      {/* STARFIELD */}
      {[...Array(45)].map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute bg-white rounded-full opacity-40"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.1, 0.8, 0.1], y: [-4, 3, -4] }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* HEADER */}
      <div className="relative max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-lg"
            style={{ fontStyle: "italic" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Practice Mission
          </motion.h1>
          <p className="text-white/70 mt-1 text-sm sm:text-base">
            Listen, read, and let our cosmic ASR help you improve your
            pronunciation.
          </p>
        </div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2 backdrop-blur-sm">
            <span className="text-xs text-white/60">Level</span>
            <select
              className="bg-transparent text-sm outline-none border-none text-white"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
            >
              <option className="text-black" value={1}>
                1 – Beginner
              </option>
              <option className="text-black" value={2}>
                2 – Explorer
              </option>
              <option className="text-black" value={3}>
                3 – Captain
              </option>
            </select>
          </div>

          <motion.button
            onClick={handleGenerate}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold shadow-lg shadow-cyan-500/30 border border-white/20 text-sm"
          >
            {loading ? "Generating…" : "New Practice Mission"}
          </motion.button>
        </motion.div>
      </div>

      {/* PROGRESS BAR */}
      {hasStarted && (
        <div className="relative max-w-3xl mx-auto mb-4">
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>
              Card {currentIndex + 1} / {exercises.length}
            </span>
            <span>
              {results.length}/{exercises.length} completed
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-400 to-fuchsia-400"
              initial={{ width: 0 }}
              animate={{
                width: `${
                  ((currentIndex + (recording ? 0.5 : 0)) /
                    Math.max(1, exercises.length)) *
                  100
                }%`,
              }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* MAIN CARD (current exercise) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Floating inner stars */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
            {[...Array(18)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 4 + 2,
                  height: Math.random() * 4 + 2,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{ opacity: [0.3, 1, 0.3], y: [-3, 2, -3] }}
                transition={{
                  duration: 2.5 + Math.random() * 2,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white/90">
                {hasStarted
                  ? "Read this card out loud"
                  : "Generate a mission to begin"}
              </h2>
              {hasStarted && (
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70">
                  {currentExercise?.type === "sentence"
                    ? "Sentence practice"
                    : "Word practice"}
                </span>
              )}
            </div>

            {/* Exercise Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentExercise ? currentExercise.id : "empty"}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="bg-black/20 border border-white/15 rounded-2xl py-6 px-5 sm:px-7 text-center shadow-inner"
              >
                {currentExercise ? (
                  <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide">
                    {currentExercise.text}
                  </p>
                ) : (
                  <p className="text-white/60 text-sm">
                    Tap{" "}
                    <span className="font-semibold text-cyan-300">
                      “New Practice Mission”
                    </span>{" "}
                    to get your reading cards.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Controls: TTS + Mic */}
            {hasStarted && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-2">
                {/* TTS */}
                <motion.button
                  whileHover={{ scale: listening ? 1 : 1.03 }}
                  whileTap={{ scale: listening ? 1 : 0.96 }}
                  onClick={() => !listening && playTTS(currentExercise.text)}
                  className={`px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center gap-2 text-sm shadow-lg ${
                    listening ? "opacity-60 cursor-wait" : ""
                  }`}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-black text-xs font-bold">
                    ▶
                  </span>
                  {listening ? "Playing…" : "Listen to Saarthi read it"}
                </motion.button>

                {/* Mic */}
                <motion.button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={() => recording && stopRecording()}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={loading || !currentExercise}
                  animate={
                    recording
                      ? { scale: [1, 1.12, 1], boxShadow: ["0 0 0 0", "0 0 32px 0 rgba(248,113,113,0.9)", "0 0 0 0"] }
                      : {}
                  }
                  transition={{ duration: 0.7, repeat: recording ? Infinity : 0 }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl border border-white/30 backdrop-blur-md ${
                    recording
                      ? "bg-red-500"
                      : "bg-gradient-to-br from-emerald-400 to-sky-400"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <svg width="44" height="44" viewBox="0 0 50 50" fill="black">
                    <path d="M25 35c5 0 9-4 9-9V14c0-5-4-9-9-9s-9 4-9 9v12c0 5 4 9 9 9zm13-9c0 7-6 13-13 13S12 33 12 26H8c0 9 7 16 16 16s16-7 16-16h-4z" />
                  </svg>
                </motion.button>
              </div>
            )}

            {/* Status text */}
            <div className="text-center text-xs sm:text-sm text-white/70 mt-2">
              {recording
                ? "Hold the mic and read. Release when you finish."
                : loading
                ? "Processing your voice among the stars…"
                : hasStarted
                ? "You can listen first, then hold the mic to read."
                : "Start a mission to begin your practice."}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Mascot + Attempts list */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          {/* Mascot */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-xl flex flex-col items-center">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="110" height="110" viewBox="0 0 200 200">
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

            <motion.div
              className="bg-black/40 border border-white/20 rounded-2xl px-4 py-3 mt-3 text-center text-xs sm:text-sm text-white/90 max-w-xs"
              animate={{ scale: recording ? [1, 1.03, 1] : 1 }}
              transition={{
                duration: 0.5,
                repeat: recording ? Infinity : 0,
              }}
            >
              {mascotText}
            </motion.div>
          </div>

          {/* Attempts list */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/90">
                Your attempts
              </h3>
              <span className="text-[11px] text-white/60">
                {results.length} / {exercises.length || 0} completed
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {results.length === 0 && (
                <p className="text-xs text-white/60">
                  After each card you read, your accuracy will appear here.
                </p>
              )}

              {results.map((entry, idx) => {
                const acc = entry.analysis?.accuracy ?? 0;
                return (
                  <div
                    key={`${entry.exerciseIndex}-${idx}`}
                    className="flex items-center justify-between gap-3 text-xs bg-black/30 border border-white/10 rounded-2xl px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-white/80">
                        {entry.text}
                      </p>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        Accuracy: {(acc * 100).toFixed(0)}%
                      </p>
                    </div>
                    <button
                      onClick={() => speakExplanation(entry)}
                      className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
                    >
                      Explain 🔊
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* SUMMARY MODAL */}
      <AnimatePresence>
        {summaryOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
            >
              {/* Glow */}
              <div className="pointer-events-none absolute -top-32 -right-32 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl" />

              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">
                  Mission Report
                </h2>
                <p className="text-xs sm:text-sm text-white/70 mb-4">
                  Here's how you did in this practice session.
                </p>

                {/* Summary numbers */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-xs sm:text-sm">
                  <div className="bg-black/40 border border-emerald-400/40 rounded-2xl p-3 flex flex-col items-center">
                    <span className="text-emerald-300/90 font-semibold">
                      {computeCorrectWrong(results).correct}
                    </span>
                    <span className="text-white/70 mt-1">Good cards</span>
                  </div>
                  <div className="bg-black/40 border border-rose-400/40 rounded-2xl p-3 flex flex-col items-center">
                    <span className="text-rose-300/90 font-semibold">
                      {computeCorrectWrong(results).wrong}
                    </span>
                    <span className="text-white/70 mt-1">Needs practice</span>
                  </div>
                  <div className="bg-black/40 border border-sky-400/40 rounded-2xl p-3 flex flex-col items-center">
                    <span className="text-sky-300/90 font-semibold">
                      {(computeOverallAccuracy(results) * 100).toFixed(0)}%
                    </span>
                    <span className="text-white/70 mt-1">Overall accuracy</span>
                  </div>
                </div>

                {/* Per question list */}
                <div className="max-h-60 overflow-y-auto pr-1 mb-4 space-y-2 text-xs sm:text-sm">
                  {results.map((entry, idx) => {
                    const acc = entry.analysis?.accuracy ?? 0;
                    const explanation = buildExplanation(entry);
                    return (
                      <div
                        key={idx}
                        className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-white/90 truncate">
                            {entry.text}
                          </p>
                          <span className="text-[10px] text-white/60">
                            {(acc * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="mt-1 text-white/70 text-[11px]">
                          {explanation}
                        </p>
                        <button
                          onClick={() => speakExplanation(entry)}
                          className="mt-1 text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
                        >
                          Play explanation 🔊
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Microdrills preview (static-ish UI) */}
                {microdrills && microdrills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-white/90 mb-1">
                      Recommended microdrills
                    </h3>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {microdrills.slice(0, 6).map((d, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-full bg-white/10 border border-white/20 text-white/80"
                        >
                          {typeof d === "string" ? d : d.text || "Drill"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    onClick={() => setSummaryOpen(false)}
                    className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm"
                  >
                    Close report
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSummaryOpen(false);
                        handleGenerate();
                      }}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 text-black font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-500/30"
                    >
                      New practice mission
                    </button>
                    {submitting && (
                      <span className="text-[10px] text-white/60 self-center">
                        Saving to your cosmic log…
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
