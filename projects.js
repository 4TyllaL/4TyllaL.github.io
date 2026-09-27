// Project data. To add a new one, copy a block and adjust it.
//
// status: "released" | "dev" | "open-source"
// repo:   "user/repository" on GitHub (stars, last push and version
//         come from the public GitHub API when the page loads)
// preview: { type: "image", src, alt } or { type: "mascot" }

const GITHUB_USER = "4TyllaL";

const PROJECTS = [
  {
    name: "StudyIA",
    repo: "4TyllaL/StudyIA",
    status: ["released", "open-source"],
    tagline: "Spaced-repetition study with AI. Offline, no server.",
    description:
      "A Windows desktop app with quizzes and flashcards, an explanation for every wrong answer and SM-2 scheduling (Anki-style). It generates questions with Gemini and has a debate mode: the AI reads your PDF and argues its central themes with you.",
    highlights: ["SM-2 · Anki-style", "AI debate mode", "0 open ports"],
    stack: ["Python", "JavaScript", "pywebview", "SQLite", "Gemini API"],
    preview: {
      type: "image",
      src: "assets/studyia-home.png",
      alt: "StudyIA home screen: decks with what is due today, accuracy and streak",
    },
    links: [
      { label: "Download", href: "https://github.com/4TyllaL/StudyIA/releases/latest", primary: true },
      { label: "GitHub", href: "https://github.com/4TyllaL/StudyIA" },
    ],
  },
  {
    name: "!StayAlone",
    repo: "4TyllaL/notStayAlone",
    status: ["dev", "open-source"],
    tagline: "A pixel-art pet that keeps you company on your desktop.",
    description:
      "It walks along your taskbar, naps when you step away, reminds you to drink water and stretch, and you can chat with it through an AI plugin. Built to be as light as possible, straight on the Win32 API.",
    highlights: ["~520 KB", "~1.7 MB RAM", "~0% CPU"],
    stack: ["Rust", "Win32 API", "Pixel art"],
    preview: { type: "mascot" },
    links: [{ label: "GitHub", href: "https://github.com/4TyllaL/notStayAlone", primary: true }],
  },
];

// Calcifer, the !StayAlone cat (sprites from assets/mascots/calcifer/mascot.txt).
const CALCIFER = {
  colors: {
    k: "#2b1e2f", o: "#f4a259", d: "#d9853b", y: "#ffe8c2",
    p: "#f59bb0", w: "#ffffff",
  },
  frames: {
    idle: [
      "................", "................", "..k..........k..", ".kpk........kpk.",
      ".kppk......kppk.", ".koookkkkkkoook.", "kooooooooooooook", "koookwooookwoook",
      "koookkooookkoook", "kooppookkooppook", "kooooyyyyyyooook", "koooyyyyyyyyoook",
      "kdooyyyyyyyyoodk", ".kddddddddddddk.", "..kkkkkkkkkkkk..", "...kk......kk...",
    ],
    blink: [
      "................", "................", "..k..........k..", ".kpk........kpk.",
      ".kppk......kppk.", ".koookkkkkkoook.", "kooooooooooooook", "kooooooooooooook",
      "koookkooookkoook", "kooppookkooppook", "kooooyyyyyyooook", "koooyyyyyyyyoook",
      "kdooyyyyyyyyoodk", ".kddddddddddddk.", "..kkkkkkkkkkkk..", "...kk......kk...",
    ],
    walk1: [
      "................", "................", "..k..........k..", ".kpk........kpk.",
      ".kppk......kppk.", ".koookkkkkkoook.", "kooooooooooooook", "kooookwooookwook",
      "kooookkooookkook", "kooppookkooppook", "kooooyyyyyyooook", "koooyyyyyyyyoook",
      "kdooyyyyyyyyoodk", ".kddddddddddddk.", "..kkkkkkkkkkkk..", "..kk........kk..",
    ],
    walk2: [
      "................", "................", "..k..........k..", ".kpk........kpk.",
      ".kppk......kppk.", ".koookkkkkkoook.", "kooooooooooooook", "kooookwooookwook",
      "kooookkooookkook", "kooppookkooppook", "kooooyyyyyyooook", "koooyyyyyyyyoook",
      "kdooyyyyyyyyoodk", ".kddddddddddddk.", "..kkkkkkkkkkkk..", "....kk....kk....",
    ],
  },
  phrases: ["Meow!", "Prrr...", "Meow meow!", "*purrs*", "Had some water today?"],
};
