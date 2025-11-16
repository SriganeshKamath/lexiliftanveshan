// src/utils/microdrills.js

// List of phonemes we support:
export const PHONEMES = ["b", "d", "sh", "r", "th", "k", "g"];

// 🟣 MOVED HERE → No more import issues!
export const PHONEME_WORDS = {
  b: [
    "ball", "bat", "book", "bag", "bell", "boy", "blue", "bird", "body",
    "baby", "boat", "bed", "back", "banana", "bread", "bone", "bubble",
    "break", "basket", "bottle", "button", "build", "busy", "bright",
    "brown", "brush", "blink", "block", "bake", "bench", "burn", "barn",
    "branch", "beach", "breeze", "broom", "bucket", "borrow", "battle",
    "beetle", "bunny", "bridge", "bundle", "badge", "bamboo", "barrel",
    "biscuit", "blossom"
  ],

  d: [
    "dog", "day", "door", "doll", "desk", "duck", "dance", "dark", "deep",
    "dirt", "done", "dig", "dare", "dish", "dream", "drive", "drop",
    "drum", "dive", "dust", "dinner", "doctor", "dragon", "diamond",
    "doodle", "daisy", "donkey", "dart", "danger", "dawn", "drain",
    "drip", "drift", "draft", "drapes", "double", "dolphin", "dimple",
    "dune"
  ],

  sh: [
    "shark", "shoe", "ship", "shop", "shell", "shine", "shout", "shake",
    "shadow", "sheet", "shy", "share", "shrink", "shrimp", "sheep",
    "sharp", "shelter", "shoulder", "sugar", "shovel", "shower",
    "shield", "short", "shape", "shimmer", "shuffle", "shutter",
    "shampoo", "shepherd", "shore", "shrug", "shiny", "shimmering",
    "shadowy", "shallow"
  ],

  r: [
    "rain", "run", "red", "ride", "rope", "river", "room", "rock",
    "ring", "race", "rainbow", "rabbit", "radio", "ready", "root",
    "roll", "road", "rocket", "reach", "read", "rush", "rattle",
    "remote", "ribbon", "ruler", "robot", "round", "rough", "rumble",
    "reindeer", "reason", "riddle", "ranch", "ripple", "rapid", "robin",
    "rose"
  ],

  th: [
    "think", "thumb", "thin", "thorn", "thank", "thread", "three",
    "thigh", "thunder", "thick", "thirsty", "throat", "theme", "thief",
    "therapy", "thirty", "thousand", "thaw", "thought", "thrive",
    "threat", "thistle"
  ],

  k: [
    "cat", "cake", "king", "kite", "kid", "key", "car", "cup", "cold",
    "kick", "kind", "cook", "care", "corner", "candle", "camel", "camera",
    "color", "candy", "cave", "clock", "cloud", "clap", "clip", "clean",
    "climb", "crack", "crow", "cream", "creek", "crisp", "crown",
    "crocodile"
  ],

  g: [
    "go", "game", "gum", "gate", "gold", "good", "gift", "girl", "glad",
    "glass", "glow", "green", "grape", "grass", "grow", "group", "great",
    "globe", "grin", "grip", "grain", "ground", "gorilla", "giraffe",
    "gown", "garden", "gather", "gallop", "gasp"
  ],
};

// ✔ generate dropdown list
export function generateMicrodrillList() {
  const shuffled = [...PHONEMES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4).map((phoneme) => ({
    id: crypto.randomUUID(),
    phoneme,
    title: `Microdrill: /${phoneme}/ sound`,
    description: `Targeted practice for the /${phoneme}/ sound based on your recent mistakes.`,
  }));
}

// ✔ generate 5 words for drill
export function generateDrillWords(phoneme) {
  const list = PHONEME_WORDS[phoneme] || [];
  return [...list].sort(() => 0.5 - Math.random()).slice(0, 5);
}
