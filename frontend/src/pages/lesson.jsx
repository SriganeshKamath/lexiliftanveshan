// src/pages/Lesson.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const PHONEME_OPTIONS = [
  "b",
  "d",
  "p",
  "t",
  "k",
  "g",
  "m",
  "n",
  "s",
  "sh",
  "ch",
  "l",
  "r",
  "f",
  "v",
];

export default function Lesson() {
  const [phoneme, setPhoneme] = useState("b");
  const [difficulty, setDifficulty] = useState(1);
  const [lesson, setLesson] = useState(null); // normalised: { explanation, examples, phoneme_color_hints }
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [mascotMessage, setMascotMessage] = useState(
    "Hi there! Let’s explore a new sound together. Tap a word and I’ll say it for you!"
  );

  const audioRef = useRef(null);

  // --------- Fetch lesson from AI layer ---------
  async function fetchLesson(
    selectedPhoneme = phoneme,
    selectedDifficulty = difficulty
  ) {
    setLoading(true);
    setError(null);
    setLesson(null);

    try {
      const fd = new FormData();
      fd.append("phoneme", selectedPhoneme);
      fd.append("difficulty", selectedDifficulty);

      const res = await fetch("http://localhost:8001/llm/generate_lesson", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error(`AI lesson error: ${res.status}`);
      }

      const data = await res.json();
      const normalized = data.lesson || data; // handle {lesson:{...}} or plain object
      setLesson(normalized);
      setMascotMessage(
        `We are learning the /${selectedPhoneme}/ sound. Tap a word below to hear it!`
      );
    } catch (err) {
      console.error("Error fetching lesson:", err);
      setError("Oops, I couldn’t load this sound. Please try again.");
      setMascotMessage("Hmm, my star map got fuzzy. Try again in a moment!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------- TTS Speak helper ---------
  async function speak(text) {
    if (!text) return;
    try {
      setIsPlaying(true);
      const fd = new FormData();
      fd.append("text", text);

      const res = await fetch("http://localhost:8001/tts/speak", {
        method: "POST",
        body: fd,
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => setIsPlaying(false);
      } else {
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("TTS error:", err);
      setIsPlaying(false);
    }
  }

  // --------- Phoneme color helper (no HTML string) ---------
  function renderColoredWord(word) {
    if (
      !lesson ||
      !lesson.phoneme_color_hints ||
      !lesson.phoneme_color_hints.length
    ) {
      return <span>{word}</span>;
    }

    // Find the first matching phoneme mapping from backend
    // Example: ["b:#4F46E5","a:#FB923C","t:#10B981"]
    const mappings = lesson.phoneme_color_hints
      .map((pair) => {
        const [ph, col] = pair.split(":");
        return { ph, col };
      })
      .filter((m) => m.ph && m.col);

    // Ideally highlight the phoneme currently chosen
    const target =
      mappings.find((m) => m.ph.toLowerCase() === phoneme.toLowerCase()) ||
      mappings[0];

    if (!target) return <span>{word}</span>;

    const { ph, col } = target;
    const lower = word.toLowerCase();
    const idx = lower.indexOf(ph.toLowerCase());

    if (idx === -1) {
      return <span>{word}</span>;
    }

    const before = word.slice(0, idx);
    const match = word.slice(idx, idx + ph.length);
    const after = word.slice(idx + ph.length);

    return (
      <span>
        {before}
        <span style={{ color: col, fontWeight: "700" }}>{match}</span>
        {after}
      </span>
    );
  }

  // Handle phoneme change from dropdown
  function handlePhonemeChange(e) {
    const value = e.target.value;
    setPhoneme(value);
    fetchLesson(value, difficulty);
  }

  // Update difficulty
  function handleDifficultyChange(e) {
    const level = Number(e.target.value);
    setDifficulty(level);
    fetchLesson(phoneme, level);
  }

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden text-white font-lexend px-5 py-6"
      style={{
        background:
          "radial-gradient(1000px 500px at 8% 15%, rgba(66,255,203,0.06), transparent 6%), " +
          "linear-gradient(180deg, rgba(5,11,20,0.9) 0%, rgba(6,22,40,0.96) 35%, rgba(3,10,22,1) 100%)",
      }}
    >
      <audio ref={audioRef} />

      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="text-white/80 text-lg mb-4 hover:text-white transition"
      >
        ← Back
      </button>

      {/* Top controls: Phoneme selector + difficulty */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-lg"
          style={{ fontStyle: "italic" }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Phoneme Lesson
        </motion.h1>

        <div className="flex flex-wrap gap-3 items-center justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base text-white/80">Sound:</span>
            <select
              value={phoneme}
              onChange={handlePhonemeChange}
              className="bg-black/40 border border-white/20 rounded-full px-1 py-1 text-sm sm:text-base outline-none"
            >
              {PHONEME_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  /{p}/
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-center mt-16 text-lg text-white/80 animate-pulse">
          Preparing your lesson in the stars...
        </div>
      )}

      {error && !loading && (
        <div className="text-center mt-16 text-lg text-red-300">{error}</div>
      )}

      {/* Main lesson card */}
      {lesson && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl relative overflow-hidden"
        >
          {/* Soft floating stars inside card */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 4 + 3,
                  height: Math.random() * 4 + 3,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  y: [-5, 0, -5],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>

          <div className="relative z-20 flex flex-col lg:flex-row gap-8">
            {/* Left: text + examples + quiz */}
            <div className="flex-1">
              {/* Explanation */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  How to say /{phoneme}/
                </h2>

                <motion.p
                  className="text-base sm:text-lg text-slate-200/90"
                  animate={isPlaying ? { scale: [1, 1.03, 1] } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: isPlaying ? Infinity : 0,
                  }}
                >
                  {lesson.explanation}
                </motion.p>

                {/* TTS button */}
                <motion.button
                  className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-green-400/80 to-cyan-400/80 text-black font-bold shadow-xl text-sm sm:text-base"
                  onClick={() => {
                    setMascotMessage(
                      `Listen carefully to how we say the /${phoneme}/ sound.`
                    );
                    speak(lesson.explanation);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? "🔊 Speaking..." : "▶ Hear Explanation"}
                </motion.button>
              </div>

              {/* Legend for phoneme coloring */}
              {lesson.phoneme_color_hints &&
                lesson.phoneme_color_hints.length > 0 && (
                  <div className="mb-4 flex items-center gap-3 text-sm text-white/80">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#4F46E5" }}
                    />
                    <span>
                      Colored letters show where the /{phoneme}/ sound appears
                      in the word.
                    </span>
                  </div>
                )}

              {/* Example words */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3">Example Words</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(lesson.examples || []).map((word, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.06, translateY: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setMascotMessage(
                          `This word is "${word}". Listen for the /${phoneme}/ sound!`
                        );
                        speak(word);
                      }}
                      className="px-4 py-3 rounded-2xl bg-black/50 backdrop-blur-md border border-white/12 shadow-md text-center text-lg font-semibold flex flex-col gap-1"
                    >
                      <span className="block">{renderColoredWord(word)}</span>
                      <span className="text-xs text-slate-300/80">
                        Tap to hear
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Mini quiz */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-3">Mini Quiz</h2>
                <p className="text-white/80 mb-3">
                  Tap the word that begins with the /{phoneme}/ sound:
                </p>

                <Quiz
                  phoneme={phoneme}
                  speak={speak}
                  setMascotMessage={setMascotMessage}
                  examples={lesson.examples}
                />
              </div>
            </div>

            {/* Right: Astronaut mascot + speech bubble */}
            <div className="w-full lg:w-72 flex flex-col items-center justify-between">
              {/* Astronaut */}
              <motion.div
                className="relative h-40 sm:h-48 mb-4"
                animate={{
                  y: [0, -10, 0],
                  rotate: [-3, 3, -3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg width="160" height="160" viewBox="0 0 200 200">
                  {/* glow */}
                  <circle
                    cx="100"
                    cy="72"
                    r="48"
                    fill="rgba(255,255,255,0.1)"
                  />
                  {/* helmet */}
                  <circle
                    cx="100"
                    cy="72"
                    r="34"
                    fill="rgba(255,255,255,0.14)"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="5"
                  />
                  {/* body */}
                  <rect
                    x="72"
                    y="104"
                    width="56"
                    height="68"
                    rx="18"
                    fill="rgba(255,255,255,0.13)"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="4"
                  />
                  {/* arms */}
                  <rect
                    x="44"
                    y="114"
                    width="30"
                    height="18"
                    rx="10"
                    fill="rgba(255,255,255,0.12)"
                  />
                  <rect
                    x="126"
                    y="114"
                    width="30"
                    height="18"
                    rx="10"
                    fill="rgba(255,255,255,0.12)"
                  />
                  {/* legs */}
                  <rect
                    x="80"
                    y="168"
                    width="20"
                    height="30"
                    rx="10"
                    fill="rgba(255,255,255,0.13)"
                  />
                  <rect
                    x="102"
                    y="168"
                    width="20"
                    height="30"
                    rx="10"
                    fill="rgba(255,255,255,0.13)"
                  />
                  {/* pack */}
                  <rect
                    x="68"
                    y="108"
                    width="64"
                    height="30"
                    rx="10"
                    fill="rgba(255,255,255,0.06)"
                  />
                  {/* pink glow */}
                  <ellipse
                    cx="100"
                    cy="208"
                    rx="30"
                    ry="12"
                    fill="rgba(255,180,220,0.28)"
                  />
                </svg>
              </motion.div>

              {/* Speech bubble */}
              <motion.div
                className="w-full bg-black/60 border border-white/15 rounded-2xl px-4 py-3 text-sm sm:text-base text-left backdrop-blur-md shadow-lg relative"
                animate={isPlaying ? { scale: [1, 1.03, 1] } : {}}
                transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0 }}
              >
                <div className="absolute -top-2 left-10 w-4 h-4 bg-black/60 border-l border-t border-white/15 rotate-45" />
                <p className="text-slate-100/95">{mascotMessage}</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────── */
/* Mini Quiz Component                           */
/* ────────────────────────────────────────────── */

function Quiz({ phoneme, speak, setMascotMessage, examples }) {
  // Get examples from backend lesson
  const backendExamples = examples || [];

  // ----- Build correct options -----
  const correct = backendExamples.filter((w) =>
    w.toLowerCase().startsWith(phoneme.toLowerCase())
  );

  // If backend gives no correct word, fallback to first example
  const guaranteedCorrect =
    correct.length > 0 ? correct : backendExamples.slice(0, 1);

  // ----- Build distractors -----
  function createDistractor(word) {
    if (!word) return null;
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    const first = word[0].toLowerCase();
    const rest = word.slice(1);

    // choose ANY letter except the phoneme
    const pool = alphabet.filter(
      (a) => a !== first && a !== phoneme.toLowerCase()
    );
    const newFirst = pool[Math.floor(Math.random() * pool.length)];

    return newFirst + rest;
  }

  // Generate up to 3 distractors
  const distractors = backendExamples
    .map(createDistractor)
    .filter(Boolean)
    .slice(0, 3);

  // Merge
  let finalOptions = [...guaranteedCorrect, ...distractors];

  // Ensure exactly 4 options
  while (finalOptions.length < 4) {
    finalOptions.push(`${phoneme}${finalOptions.length}`);
  }

  // Shuffle
  finalOptions = finalOptions
    .map((w) => ({ w, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((o) => o.w);

  // ----- Handle answer -----
  function startsWithPhoneme(word, p) {
    return word.toLowerCase().startsWith(p.toLowerCase());
  }

  function explainWrong(word) {
    const first = word[0];
    return `"${word}" begins with /${first}/, not /${phoneme}/. Try listening again to how /${phoneme}/ starts.`;
  }

  function explainCorrect(word) {
    return `Correct! "${word}" starts with the /${phoneme}/ sound!`;
  }

  function handleClick(word) {
    if (startsWithPhoneme(word, phoneme)) {
      const msg = explainCorrect(word);
      setMascotMessage(msg);
      speak(msg);
    } else {
      const msg = explainWrong(word);
      setMascotMessage(msg);
      speak(msg);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {finalOptions.map((w, i) => (
          <motion.button
            key={i}
            className="px-4 py-3 rounded-xl bg-black/45 border border-white/12 backdrop-blur-md shadow text-lg font-semibold"
            whileHover={{ scale: 1.08, translateY: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleClick(w)}
          >
            {w}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
