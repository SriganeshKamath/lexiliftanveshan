// src/pages/Microdrill.jsx
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateMicrodrillList,
  generateDrillWords,
} from "../utils/microdrills";

const AI_BASE = import.meta.env.VITE_AI_BASE_URL || "http://localhost:8001";

export default function Microdrill() {
  const [microdrills, setMicrodrills] = useState([]);
  const [selected, setSelected] = useState(null);

  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState([]);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [mascotText, setMascotText] = useState(
    "Welcome explorer! Choose a microdrill to begin targeted pronunciation practice ✨"
  );

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // On mount, generate dummy microdrills
  useEffect(() => {
    const list = generateMicrodrillList();
    setMicrodrills(list);
  }, []);

  // When selecting a microdrill, generate new words
  function handleSelect(drill) {
    const drillWords = generateDrillWords(drill.phoneme);
    setSelected(drill);
    setWords(drillWords);
    setIndex(0);
    setResults([]);
    setSummaryOpen(false);

    setMascotText(
      `Great! Let's practice the /${drill.phoneme}/ sound using these 5 words 🚀`
    );
  }

  // -----------------------------
  // TTS
  // -----------------------------
  async function speak(text) {
    if (!text) return;
    try {
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
      audio.onended = () => URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  // -----------------------------
  // Recording (ASR)
  // -----------------------------
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (e) =>
        audioChunks.current.push(e.data);

      mediaRecorder.current.onstop = handleStop;

      mediaRecorder.current.start();
      setRecording(true);
      setMascotText("I'm listening… say it clearly! 🌟");
    } catch (err) {
      console.error(err);
      setMascotText("Mic not available. Check permissions ❗");
    }
  }

  async function stopRecording() {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
      mediaRecorder.current.stream
        .getTracks()
        .forEach((t) => t.stop());

      setMascotText("Analyzing with cosmic ASR…");
    }
  }

  // -----------------------------
  // ASR Evaluation
  // -----------------------------
  async function handleStop() {
    const expected = words[index];
    const blob = new Blob(audioChunks.current, { type: "audio/wav" });

    const fd = new FormData();
    fd.append("file", blob, "audio.wav");
    fd.append("expected_text", expected);

    try {
      setLoading(true);

      const res = await fetch(`${AI_BASE}/asr/evaluate`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      const analysis = data.analysis;

      const newEntry = {
        word: expected,
        analysis,
      };

      setResults((prev) => [...prev, newEntry]);

      const acc = analysis.accuracy;

      if (acc >= 0.8) {
        setMascotText("Beautiful pronunciation! 🌈✨");
      } else if (acc >= 0.5) {
        setMascotText("Good try! You're improving 💫");
      } else {
        setMascotText("No worries! Let's keep practicing 🚀");
      }

      if (index < words.length - 1) {
        setTimeout(() => setIndex((i) => i + 1), 900);
      } else {
        setTimeout(() => setSummaryOpen(true), 900);
      }
    } catch (err) {
      console.error(err);
      setMascotText("ASR error — cosmic interference 💥");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // SUMMARY HELPERS
  // -----------------------------
  const correctCount = results.filter(
    (r) => r.analysis.accuracy >= 0.8
  ).length;

  const wrongCount = results.length - correctCount;

  const overallAccuracy =
    results.reduce((a, r) => a + (r.analysis.accuracy || 0), 0) /
    Math.max(1, results.length);

  // -----------------------------
  // SUMMARY TTS
  // -----------------------------
  async function speakSummary() {
    const msg = `You completed the microdrill. You pronounced ${correctCount} words correctly and ${wrongCount} words need more practice. Your accuracy was ${(overallAccuracy *
      100).toFixed(0)} percent. Amazing work space explorer!`;
    speak(msg);
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div
      className="min-h-screen text-white px-4 py-6 relative overflow-hidden font-lexend"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(100,200,255,0.15), transparent), radial-gradient(circle at 80% 80%, rgba(255,100,200,0.15), transparent), #050b14",
      }}
    >
      {/* Stars */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full opacity-40"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.1, 0.8, 0.1], y: [-3, 3, -3] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity }}
        />
      ))}

      <motion.h1
        className="text-3xl sm:text-4xl font-extrabold italic drop-shadow-lg text-center mb-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Microdrills
      </motion.h1>

      <p className="text-center text-white/70 mb-6">
        Personalized drills generated from your phoneme weaknesses ✨
      </p>

      {/* Select microdrill */}
      <div className="max-w-lg mx-auto mb-6">
        <div className="bg-white/5 border border-white/20 rounded-2xl p-4">
          <label className="text-white/80 text-sm">Choose a microdrill</label>
          <select
            className="w-full mt-2 bg-black/30 border border-white/20 rounded-xl p-2 text-sm"
            value={selected?.id || ""}
            onChange={(e) => {
              const drill = microdrills.find((m) => m.id === e.target.value);
              if (drill) handleSelect(drill);
            }}
          >
            <option className="text-black" value="">
              -- Select --
            </option>
            {microdrills.map((m) => (
              <option key={m.id} value={m.id} className="text-black">
                {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selected && !summaryOpen && (
        <motion.div
          className="max-w-2xl mx-auto bg-white/5 border border-white/20 rounded-3xl p-6 backdrop-blur-xl shadow-xl text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold mb-4">{selected.title}</h2>

          <p className="text-white/70 mb-4 text-sm">{selected.description}</p>

          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-3xl sm:text-4xl font-extrabold mb-3"
          >
            {words[index]}
          </motion.div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => speak(words[index])}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm"
            >
              🔊 Listen
            </button>

            <motion.button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              animate={
                recording
                  ? {
                      scale: [1, 1.15, 1],
                      boxShadow: ["0 0 0", "0 0 40px #f87171", "0 0 0"],
                    }
                  : {}
              }
              transition={{
                repeat: recording ? Infinity : 0,
                duration: 0.7,
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-lg shadow-lg ${
                recording ? "bg-red-500" : "bg-emerald-400 text-black"
              }`}
            >
              🎤
            </motion.button>
          </div>

          <p className="text-white/60 text-sm mt-4">
            {recording
              ? "Release to stop"
              : loading
              ? "Analyzing..."
              : "Hold the mic and read the word"}
          </p>

          <div className="mt-6 text-white/80 text-sm">{mascotText}</div>
        </motion.div>
      )}

      <AnimatePresence>
        {summaryOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-xl w-full bg-white/10 border border-white/20 p-6 rounded-3xl backdrop-blur-xl shadow-xl relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold mb-3">Microdrill Summary</h2>

              <p className="text-white/70 text-sm">
                Correct: {correctCount} / {results.length}
              </p>
              <p className="text-white/70 text-sm mb-4">
                Overall Accuracy: {(overallAccuracy * 100).toFixed(0)}%
              </p>

              {results.map((r, i) => (
                <div
                  key={i}
                  className="bg-black/40 border border-white/20 rounded-xl p-3 mb-2"
                >
                  <p className="text-white font-semibold">{r.word}</p>
                  <p className="text-white/70 text-sm">
                    Accuracy: {(r.analysis.accuracy * 100).toFixed(0)}%
                  </p>
                </div>
              ))}

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setSummaryOpen(false)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm"
                >
                  Close
                </button>
                <button
                  onClick={speakSummary}
                  className="px-4 py-2 bg-emerald-400 text-black rounded-full text-sm"
                >
                  🔊 Hear Summary
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
