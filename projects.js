// Project data. To add a new one, copy a block and adjust it.
//
// status: "released" | "dev" | "open-source" | "private"
// repo:   "user/repository" on GitHub (stars, last push and version
//         come from the public GitHub API when the page loads); leave it out
//         for private repos
// preview: { type: "image", src, alt }, { type: "studyia" }, { type: "mascot" }
//          or { type: "cloudnx" }
// links:  buttons at the bottom; with none, `note` is shown there instead
// disclaimer: optional small print at the end of the card

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
    preview: { type: "studyia" },
    links: [
      { label: "Download", href: "https://github.com/4TyllaL/StudyIA/releases/latest", primary: true },
      { label: "GitHub", href: "https://github.com/4TyllaL/StudyIA" },
    ],
  },
  {
    name: "!StayAlone",
    repo: "4TyllaL/notStayAlone",
    status: ["released", "open-source"],
    tagline: "A pixel-art pet that keeps you company on your desktop.",
    description:
      "It walks along your taskbar, naps when you step away, reminds you to drink water and stretch, and chats with you through AI (Gemini or any OpenAI-compatible API), remembering what you tell it. Four mascots plus a buddy on screen, a mascot maker (or let the AI draw one), plugins and a community gallery, dark mode, English and Portuguese, and verified self-updates. Built to be as light as possible, straight on the Win32 API, with a Common Criteria-style security review.",
    highlights: ["~780 KB", "< 5 MB RAM", "~0% CPU"],
    stack: ["Rust", "Win32 API", "Pixel art", "Gemini API"],
    preview: { type: "mascot" },
    links: [
      { label: "Download", href: "https://github.com/4TyllaL/notStayAlone/releases/latest/download/dontStayAlone.exe", primary: true },
      { label: "GitHub", href: "https://github.com/4TyllaL/notStayAlone" },
    ],
  },
  {
    name: "CloudNX",
    status: ["dev", "private"],
    tagline: "Multi-provider cloud gaming client for a handheld console.",
    description:
      "Each cloud gaming service plugs in as its own provider behind a small set of ports, so the core (session, streaming, input and catalog rules) never knows which one is running. Native WebRTC streaming with hardware video decode on the console, a pure policy layer for decode queue, frame timing and audio latency that is tested on the PC, and CI that builds and tests every push.",
    highlights: ["Clean Architecture", "148 host tests", "WebRTC + FEC"],
    stack: ["C++", "libnx", "WebRTC", "FFmpeg", "Borealis", "CMake"],
    preview: { type: "cloudnx" },
    links: [],
    note: "Private, personal project",
    disclaimer: "Unofficial project, not affiliated with or endorsed by any console maker or cloud gaming provider.",
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

// StudyIA demo: the little window answers these on its own (pick = the option
// the fake cursor clicks, so some answers come out wrong on purpose).
const STUDYIA_DEMO = {
  deck: "Mixed review",
  questions: [
    { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter"], answer: 1, pick: 0,
      why: "It's Mars: iron oxide dust covers its surface." },
    { q: "What does SM-2 decide for each card?", options: ["Its deck", "Next review", "Its color"], answer: 1, pick: 1,
      next: "4 days" },
    { q: "HTTP status 404 means...", options: ["Not Found", "Forbidden", "Timeout"], answer: 0, pick: 0,
      next: "3 days" },
  ],
};

// CloudNX demo: the console "streams" a little game and hops between providers.
const CLOUDNX_DEMO = {
  providers: [
    { name: "Provider A", sky: ["#8fd3ff", "#d8f1ff"], hills: ["#5aa469", "#3d7a4c"], ground: "#c89f65" },
    { name: "Provider B", sky: ["#ff9a76", "#ffd49a"], hills: ["#a0587a", "#6b3b5e"], ground: "#8a5a44" },
    { name: "Provider C", sky: ["#1c2250", "#3b3f86"], hills: ["#2c6e8f", "#1c4a63"], ground: "#39405e" },
  ],
};
