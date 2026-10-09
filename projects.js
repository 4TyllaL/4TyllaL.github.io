// Project data. To add a new one, copy a block and adjust it.
//
// status: "released" | "beta" | "dev" | "open-source" | "private"
// version: optional, shown instead of the latest GitHub release tag
// repo:   "user/repository" on GitHub (stars, last push and version
//         come from the public GitHub API when the page loads); leave it out
//         for private repos
// preview: { type: "image", src, alt }, { type: "studyia" }, { type: "mascot" },
//          { type: "notch" } or { type: "dock" }
// links:  buttons at the bottom; with none, `note` is shown there instead
//         (with `noteIcon`, 🔒 by default)
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
    version: "v0.0.1-beta",
    status: ["beta", "open-source"],
    tagline: "A pixel-art pet that keeps you company on your desktop.",
    description:
      "It walks along your taskbar, naps when you step away, reminds you to drink water and stretch, and chats with you through AI (Gemini or any OpenAI-compatible API), remembering what you tell it. Four mascots plus a buddy on screen, a mascot maker (or let the AI draw one), plugins and a community gallery, dark mode, English and Portuguese, and verified self-updates. Built to be as light as possible, straight on the Win32 API, with a Common Criteria-style security review.",
    highlights: ["< 1 MB", "~2 MB RAM", "~0% CPU"],
    stack: ["Rust", "Win32 API", "Pixel art", "Gemini API"],
    preview: { type: "mascot" },
    links: [
      { label: "Download", href: "https://github.com/4TyllaL/notStayAlone/releases/latest/download/dontStayAlone.exe", primary: true },
      { label: "GitHub", href: "https://github.com/4TyllaL/notStayAlone" },
    ],
  },
  {
    name: "Notchn't",
    status: ["dev"],
    tagline: "World's Best Notch. A native Windows notch that grows into useful panels.",
    description:
      "It sits at the top of your screen and opens on hover: what's playing with media controls, audio devices and a one-tap headset mode, a timer, a file shelf, downloads, battery and Bluetooth alerts, and a Ctrl+Alt+N search that launches apps and does math. Every feature is a module on a core that knows nothing about them, and outside plugins run as sandboxed processes with only the permissions you grant.",
    highlights: ["< 1 MB binary", "~4 MB RAM", "0 idle CPU"],
    stack: ["Rust", "Win32 API", "WinRT", "Sandboxed plugins"],
    preview: { type: "notch" },
    links: [],
    note: "In development · coming soon",
    noteIcon: "🛠",
  },
  {
    name: "Dockn't",
    status: ["beta", "private"],
    tagline: "This is not a dock. A native bar for Windows 11 with your apps and live widgets.",
    description:
      "Your apps on one side, 37 live widgets on the other (clock, calendar, music, Pomodoro, battery, weather and more), each one only as wide as it needs and redrawn only when something changes. Everything is tuned in the Dock Studio with a live preview. It lives alongside the taskbar or replaces it, injects nothing into Explorer and never asks for admin. No account, no telemetry; the data stays on your PC.",
    highlights: ["37 widgets", "No admin", "No telemetry"],
    stack: ["Rust", "Win32 API", "Windows 11"],
    preview: { type: "dock" },
    links: [
      { label: "Website", href: "https://4tyllal.github.io/docknt/", primary: true },
      { label: "Release notes", href: "https://4tyllal.github.io/docknt/releases.html" },
    ],
  },
];

// Calcifer, the !StayAlone cat (32x32 sprites from assets/mascots/calcifer/mascot.txt).
const CALCIFER = {
  colors: { "B": "#ffffff", "C": "#4a3a5a", "a": "#2b1e2f", "b": "#f4a259", "c": "#f8bf88", "d": "#c67e54", "e": "#63433b", "f": "#ffe8c2", "g": "#ffedcc", "i": "#fac893", "j": "#665758", "n": "#b36a40", "o": "#5c3b32", "q": "#f59bb0", "s": "#c67991", "u": "#ceaf9e" },
  frames: {
    idle: [
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      ".......e.................e......",
      "......ede...............ede.....",
      "......edde.............edde.....",
      "......edde............ecdde.....",
      "......ebsde..........ecqdde.....",
      "......ebqdde........ecbqdde.....",
      "......ebssddeeeeeee.edssdde.....",
      "......edsssddccccddedsssdde.....",
      "..jjjeddcccccbbbbbbbccdddde.....",
      ".jguujccbbbbbbbbbbbbbbbbdde.....",
      ".jfuucbbbbbbbbbbbbbbbbbbbdde....",
      ".jfucbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbaBbbbbbbbbbbaBbbbdde...",
      ".eddbbbbbaabbbffffbbbaabbbdde...",
      ".eddbbbbbCaffffffffffCabbbdde...",
      ".eddbbqqqbffffafafafffbqqqdde...",
      ".eddbbbbbffffffafafffffbbbdde...",
      ".edddbbbffffffffffffffffbbdde...",
      "..adddbbffffffffffffffffbbdde...",
      "..edddddffffffffffffffffddda....",
      "...adddddiiiiffffffiiiiddda.....",
      "....aaaadiiiiiiiiiiiiiidaa......",
      ".......onnnnniiiiiinnnnno.......",
      ".......onnnnnaaaaaannnnno.......",
      "........aaaaa......aaaaa........",
    ],
    blink: [
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      ".......e.................e......",
      "......ede...............ede.....",
      "......edde.............edde.....",
      "......edde............ecdde.....",
      "......ebsde..........ecqdde.....",
      "......ebqdde........ecbqdde.....",
      "......ebssddeeeeeee.edssdde.....",
      "......edsssddccccddedsssdde.....",
      "..jjjeddcccccbbbbbbbccdddde.....",
      ".jguujccbbbbbbbbbbbbbbbbdde.....",
      ".jfuucbbbbbbbbbbbbbbbbbbbdde....",
      ".jfucbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbbbbbffffbbbbbbbbdde...",
      ".eddbbbbaaaaffffffffaaaabbdde...",
      ".eddbbqqqbffffafafafffbqqqdde...",
      ".eddbbbbbffffffafafffffbbbdde...",
      ".edddbbbffffffffffffffffbbdde...",
      "..adddbbffffffffffffffffbbdde...",
      "..edddddffffffffffffffffddda....",
      "...adddddiiiiffffffiiiiddda.....",
      "....aaaadiiiiiiiiiiiiiidaa......",
      ".......onnnnniiiiiinnnnno.......",
      ".......onnnnnaaaaaannnnno.......",
      "........aaaaa......aaaaa........",
    ],
    walk1: [
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      ".......e.................e......",
      "......ede...............ede.....",
      "......edde.............edde.....",
      "......edde............ecdde.....",
      "......ebsde..........ecqdde.....",
      "......ebqdde........ecbqdde.....",
      "......ebssddeeeeeee.edssdde.....",
      "......edsssddccccddedsssdde.....",
      "..jjjeddcccccbbbbbbbccdddde.....",
      ".jguujccbbbbbbbbbbbbbbbbdde.....",
      ".jfuucbbbbbbbbbbbbbbbbbbbdde....",
      ".jfucbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbaBbbbbbbbbbbaBbbdde...",
      ".eddbbbbbbaabbffffbbbbaabbdde...",
      ".eddbbbbbbCafffffffffbCabbdde...",
      ".eddbbqqqbfffffafafaffbqqqdde...",
      ".eddbbbbbfffffffafaffffbbbdde...",
      ".edddbbbffffffffffffffffbbdde...",
      "..adddbbffffffffffffffffbbdde...",
      "..edddddffffffffffffffffddda....",
      "...adddddiiiiffffffiiiiddda.....",
      "....aanndiiiiiiiiiiiiiidnno.....",
      ".....onnnnnaaiiiiiiaannnnno.....",
      ".....onnnnno.aaaaaa.onnnnno.....",
      "......aaaaa..........aaaaa......",
    ],
    walk2: [
      "................................",
      "................................",
      "................................",
      "................................",
      ".......e.................e......",
      "......ede...............ede.....",
      "......edde.............edde.....",
      "......edde............ecdde.....",
      "......ebsde..........ecqdde.....",
      "......ebqdde........ecbqdde.....",
      "......ebssddeeeeeee.edssdde.....",
      "......edsssddccccddedsssdde.....",
      ".....eddcccccbbbbbbbccdddde.....",
      "..jjjeccbbbbbbbbbbbbbbbbdde.....",
      ".jguucbbbbbbbbbbbbbbbbbbbdde....",
      ".jfucbbbbbbbbbbbbbbbbbbbbbdde...",
      ".juubbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbbbbbbbbbbbbbbbbbdde...",
      ".eddbbbbbbaBbbbbbbbbbbaBbbdde...",
      ".eddbbbbbbaabbffffbbbbaabbdde...",
      ".eddbbbbbbCafffffffffbCabbdde...",
      ".eddbbqqqbfffffafafaffbqqqdde...",
      ".eddbbbbbfffffffafaffffbbbdde...",
      ".edddbbbffffffffffffffffbbdde...",
      ".eddddbbffffffffffffffffbbdde...",
      "..adddddffffffffffffffffddda....",
      "..eddddddiiiiffffffiiiiddda.....",
      "...adddadiiiiiiiiiiiiiidaa......",
      "....aaa.aannniiiiiinnnaa........",
      ".........onnnnnaannnnno.........",
      "..........aaaaa..aaaaa..........",
      "................................",
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

// Dockn't demo: pinned apps, open apps and live widgets (no taskbar: the dock replaces it).
const DOCK_DEMO = {
  track: { title: "Night Drive", artist: "Neon Avenue", length: 214 },
  focusMinutes: 25,
};

// Notchn't demo: the notch peeks, opens its media panel and shows the volume HUD.
const NOTCH_DEMO = {
  track: { title: "Night Drive", artist: "Neon Avenue", app: "Media Player", length: 214 },
};
