// Dados dos projetos. Para adicionar um novo, copie um bloco e ajuste.
//
// status: "released" | "dev" | "open-source"
// repo:   "usuario/repositorio" no GitHub (estrelas, último push e versão
//         vêm da API pública do GitHub quando a página abre)
// preview: { type: "image", src, alt } ou { type: "mascot" }

const GITHUB_USER = "4TyllaL";

const PROJECTS = [
  {
    name: "StudyIA",
    repo: "4TyllaL/StudyIA",
    status: ["released", "open-source"],
    tagline: "Estudo com repetição espaçada e IA. Offline, sem servidor.",
    description:
      "App desktop para Windows com quizzes e flashcards, explicação a cada erro e agendamento SM-2 (estilo Anki). Gera questões com o Gemini e tem um modo debate: a IA lê seu PDF e discute os temas centrais com você.",
    highlights: ["SM-2 · estilo Anki", "Modo debate com IA", "0 portas abertas"],
    stack: ["Python", "JavaScript", "pywebview", "SQLite", "Gemini API"],
    preview: {
      type: "image",
      src: "assets/studyia-home.png",
      alt: "Tela inicial do StudyIA: baralhos com o que vence hoje, acerto e sequência",
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
    tagline: "Um mascote em pixel art que faz companhia na área de trabalho.",
    description:
      "Anda em cima da barra de tarefas, cochila quando você sai do PC, lembra de beber água e alongar, e dá para conversar com ele via plugin de IA. Feito para ser o mais leve possível, direto na API do Win32.",
    highlights: ["~520 KB", "~1,7 MB de RAM", "~0% de CPU"],
    stack: ["Rust", "Win32 API", "Pixel art"],
    preview: { type: "mascot" },
    links: [{ label: "GitHub", href: "https://github.com/4TyllaL/notStayAlone", primary: true }],
  },
];

// Calcifer, o gatinho do !StayAlone (sprites de assets/mascots/calcifer/mascot.txt).
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
  phrases: ["Miau!", "Prrr...", "Miau miau!", "*ronrona*", "Bebeu água hoje?"],
};
