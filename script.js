const STATUS_LABEL = {
  released: "Released",
  beta: "Beta",
  dev: "In Development",
  "open-source": "Open Source",
  private: "Private",
};

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) if (child) node.append(child);
  return node;
}

function renderCard(project) {
  const preview = el("div", { class: "preview" });
  if (project.preview.type === "image") {
    preview.append(el("img", { src: project.preview.src, alt: project.preview.alt, loading: "lazy" }));
  } else if (project.preview.type === "mascot") {
    mountMascotScene(preview);
  } else if (project.preview.type === "studyia") {
    mountStudyScene(preview);
  } else if (project.preview.type === "notch") {
    mountNotchScene(preview);
  } else if (project.preview.type === "dock") {
    mountDockScene(preview);
  } else if (project.preview.type === "wall") {
    mountWallScene(preview, project.preview.src);
  }

  const badges = el("div", { class: "badges" },
    project.status.map((s) => el("span", { class: `badge ${s}`, text: STATUS_LABEL[s] })));

  const meta = project.repo ? el("div", { class: "meta", "data-repo": project.repo, ...(project.version && { "data-version": project.version }) }) : null;

  const actions = project.links.length
    ? el("div", { class: "actions" }, project.links.map((link) => el("a", {
      class: `btn${link.primary ? " primary" : ""}`,
      href: link.href,
      target: "_blank",
      rel: "noopener",
      text: link.label,
    })))
    : el("p", { class: "private-note" }, [el("span", { class: "lock", "aria-hidden": "true", text: project.noteIcon || "🔒" }), project.note]);

  return el("article", { class: "card" }, [
    preview,
    el("div", { class: "body" }, [
      el("div", { class: "title-row" }, [el("h2", { text: project.name }), badges]),
      el("p", { class: "tagline", text: project.tagline }),
      el("p", { class: "desc", text: project.description }),
      el("ul", { class: "highlights" }, project.highlights.map((h) => el("li", { text: h }))),
      el("div", { class: "stack" }, project.stack.map((s) => el("span", { text: s }))),
      meta,
      actions,
      project.disclaimer ? el("p", { class: "disclaimer", text: project.disclaimer }) : null,
    ]),
  ]);
}

// ---------- live GitHub data ----------

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

async function fetchJSON(url) {
  const cacheKey = `gh:${url}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey));
    if (cached && Date.now() - cached.t < 10 * 60 * 1000) return cached.data;
  } catch {}
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  const data = res.ok ? await res.json() : null;
  try { sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), data })); } catch {}
  return data;
}

async function fillRepoMeta(meta) {
  const repo = meta.dataset.repo;
  if (!repo) return;
  try {
    const [info, releases] = await Promise.all([
      fetchJSON(`https://api.github.com/repos/${repo}`),
      fetchJSON(`https://api.github.com/repos/${repo}/releases?per_page=1`),
    ]);
    if (!info) return;
    const parts = [];
    const release = releases?.[0];
    const version = meta.dataset.version || release?.tag_name;
    if (version) parts.push(["version", version]);
    if (info.stargazers_count > 0) parts.push(["★", String(info.stargazers_count)]);
    parts.push(["last commit", timeAgo(info.pushed_at)]);
    meta.replaceChildren(...parts.map(([k, v]) => el("span", {}, [`${k} `, el("b", { text: v })])));
  } catch {
    // offline or rate-limited: the card stays complete, just without these numbers
  }
}

// ---------- Dockn't dock demo ----------

const DOCK_GLYPHS = {
  start: '<svg viewBox="0 0 16 16"><path fill="#fff" d="M2 2h5.5v5.5H2zM8.5 2H14v5.5H8.5zM2 8.5h5.5V14H2zM8.5 8.5H14V14H8.5z"/></svg>',
  search: '<svg viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><circle cx="7" cy="7" r="4"/><path d="M10 10l3.2 3.2"/></svg>',
  files: '<svg viewBox="0 0 16 16"><path fill="#fff6d6" d="M2 4.5c0-.8.6-1.5 1.5-1.5h3l1.5 1.5h4.5c.8 0 1.5.7 1.5 1.5V12c0 .8-.7 1.5-1.5 1.5h-9C2.6 13.5 2 12.8 2 12z"/></svg>',
  term: '<svg viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 5l3 3-3 3M8.5 11.5h4"/></svg>',
  code: '<svg viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4.5L2.5 8 6 11.5M10 4.5l3.5 3.5-3.5 3.5"/></svg>',
  chat: '<svg viewBox="0 0 16 16"><path fill="#fff" d="M3 3.5h10c.6 0 1 .4 1 1v6c0 .6-.4 1-1 1H7l-3 2.5v-2.5H3c-.6 0-1-.4-1-1v-6c0-.6.4-1 1-1z"/></svg>',
};

function mountDockScene(preview) {
  const { track, focusMinutes } = DOCK_DEMO;
  const scene = el("div", { class: "scene scene-dock" });

  const app = (glyph, color, label, running = false) => {
    const tile = el("button", { class: `dk-app${running ? " running" : ""}`, type: "button", "aria-label": label });
    tile.style.setProperty("--tile", color);
    tile.innerHTML = DOCK_GLYPHS[glyph];
    return tile;
  };

  const pinned = [
    app("start", "#3b82f6", "Start"),
    app("search", "#7c6cf2", "Search"),
    app("files", "#f2a93b", "Files", true),
  ];
  const term = app("term", "#2f3442", "Terminal");
  const open = [app("code", "#2b7de9", "Code editor", true), app("chat", "#e2574c", "Chat", true), term];

  // clock: the real time, like the widget on the real dock
  const clockTime = el("b");
  const clockDate = el("span");
  const clock = el("div", { class: "dk-w dk-clock" }, [clockTime, clockDate]);

  // music: same track as the notch demo; it changes width on its own
  const musicFill = el("i");
  const music = el("div", { class: "dk-w dk-music", "data-size": "3" }, [
    el("span", { class: "dk-art" }, el("span", { class: "nt-eq", "aria-hidden": "true" }, [el("i"), el("i"), el("i")])),
    el("div", { class: "dk-track" }, [
      el("b", { text: track.title }),
      el("span", { text: track.artist }),
      el("div", { class: "dk-progress" }, musicFill),
    ]),
  ]);

  // pomodoro: a ring that empties as the focus time runs
  const focusLabel = el("b");
  const ring = el("span", { class: "dk-ring" });
  const focus = el("div", { class: "dk-w dk-focus" }, [ring, focusLabel]);

  const bar = el("div", { class: "dk-bar" }, [
    ...pinned, el("i", { class: "dk-sep" }), ...open, el("i", { class: "dk-sep" }), clock, music, focus,
  ]);
  scene.append(bar);
  preview.append(scene);

  let pos = 92;
  let left = focusMinutes * 60 - 37;
  function tick() {
    const now = new Date();
    clockTime.textContent = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const start = new Date(now.getFullYear(), 0, 1);
    const day = Math.floor((now - start) / 86400000) + 1;
    clockDate.textContent = `Day ${day} of 365`;
    pos = (pos + 1) % track.length;
    musicFill.style.width = `${(pos / track.length) * 100}%`;
    left = left > 0 ? left - 1 : focusMinutes * 60;
    focusLabel.textContent = fmtTime(left);
    ring.style.setProperty("--p", `${(left / (focusMinutes * 60)) * 100}%`);
  }
  tick();
  setInterval(tick, 1000);
  if (REDUCED_MOTION) return;

  // every widget picks the width it needs: the music one cycles through its sizes,
  // and now and then an app is opened (it bounces and gets its dot)
  const sizes = ["3", "2", "1", "2"];
  let s = 0;
  setInterval(() => { s = (s + 1) % sizes.length; music.dataset.size = sizes[s]; }, 2600);
  setInterval(() => {
    term.classList.remove("launch");
    void term.offsetWidth;
    term.classList.add("launch");
    term.classList.toggle("running");
  }, 5200);
}

// ---------- !StayAlone mascot ----------

function drawFrame(ctx, frame) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  frame.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = CALCIFER.colors[ch];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });
  });
}

// The "desktop" both previews live on: wallpaper, taskbar and clock.
function desktopScene(variant = "") {
  return el("div", { class: `scene ${variant}`.trim() }, [
    el("div", { class: "start" }, [el("i"), el("i"), el("i"), el("i")]),
    el("div", { class: "tray", text: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }),
  ]);
}

// IsNotAEngine: the wallpaper itself, drawn behind the same desktop frame the other cards use.
function mountWallScene(preview, src) {
  const scene = desktopScene("scene-wall");
  scene.style.setProperty("--wall", `url("${src}")`); // via CSSOM: the page CSP forbids inline style attributes
  preview.append(scene);
}

function mountMascotScene(preview) {
  const scene = desktopScene();
  const size = CALCIFER.frames.idle.length;
  const canvas = el("canvas", { width: size, height: size });
  const cat = el("button", { class: "mascot", type: "button", "aria-label": "Pet Calcifer" }, canvas);
  const bubble = el("div", { class: "bubble", "aria-live": "polite" });
  scene.append(cat, bubble);
  preview.append(scene);

  const ctx = canvas.getContext("2d");
  const state = { x: 40, dir: 1, speed: 38, pause: 0, frameTime: 0, step: 0, blinkAt: 2, last: 0 };

  function say(text) {
    bubble.textContent = text;
    bubble.style.left = `${state.x + 32}px`;
    bubble.classList.add("show");
    clearTimeout(say.t);
    say.t = setTimeout(() => bubble.classList.remove("show"), 1600);
  }

  cat.addEventListener("click", () => {
    const phrases = CALCIFER.phrases;
    say(phrases[Math.floor(Math.random() * phrases.length)]);
    state.pause = 1.8;
    drawFrame(ctx, CALCIFER.frames.idle);
  });

  function place() {
    cat.style.transform = `translateX(${state.x}px) scaleX(${state.dir})`;
    if (bubble.classList.contains("show")) bubble.style.left = `${state.x + 32}px`;
  }

  if (REDUCED_MOTION) {
    drawFrame(ctx, CALCIFER.frames.idle);
    place();
    return;
  }

  function tick(now) {
    const dt = Math.min((now - (state.last || now)) / 1000, 0.1);
    state.last = now;
    const maxX = scene.clientWidth - 64;

    if (state.pause > 0) {
      state.pause -= dt;
      state.blinkAt -= dt;
      if (state.blinkAt < 0) {
        drawFrame(ctx, CALCIFER.frames.blink);
        if (state.blinkAt < -0.15) { drawFrame(ctx, CALCIFER.frames.idle); state.blinkAt = 1.5 + Math.random() * 2; }
      }
    } else {
      state.x += state.dir * state.speed * dt;
      if (state.x > maxX) { state.x = maxX; state.dir = -1; }
      if (state.x < 0) { state.x = 0; state.dir = 1; }
      state.frameTime += dt;
      if (state.frameTime > 0.18) {
        state.frameTime = 0;
        state.step ^= 1;
        drawFrame(ctx, state.step ? CALCIFER.frames.walk1 : CALCIFER.frames.walk2);
      }
      if (Math.random() < dt * 0.25) {
        state.pause = 1.5 + Math.random() * 2.5;
        drawFrame(ctx, CALCIFER.frames.idle);
        if (Math.random() < 0.3) state.dir *= -1;
      }
    }
    place();
    requestAnimationFrame(tick);
  }

  drawFrame(ctx, CALCIFER.frames.idle);
  requestAnimationFrame(tick);
}

// ---------- StudyIA demo window ----------

const SVG_NS = "http://www.w3.org/2000/svg";

function cursorIcon() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 12 18");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M1 1v14l3.5-3.5 2.5 5.5 2.5-1-2.5-5.5H12z");
  path.setAttribute("fill", "#fff");
  path.setAttribute("stroke", "#0b0e14");
  path.setAttribute("stroke-width", "1.2");
  path.setAttribute("stroke-linejoin", "round");
  svg.append(path);
  return svg;
}

function mountStudyScene(preview) {
  const scene = desktopScene("scene-study");
  const count = el("span", { class: "sw-count" });
  const bar = el("i");
  const question = el("p", { class: "sw-q" });
  const options = el("div", { class: "sw-opts" });
  const feedback = el("p", { class: "sw-fb", "aria-live": "polite" });
  const cursor = el("div", { class: "sw-cursor" }, cursorIcon());

  const win = el("div", { class: "study-win" }, [
    el("div", { class: "sw-title" }, [
      el("span", { class: "sw-logo", text: "✓" }),
      el("span", {}, ["Study", el("b", { text: "IA" })]),
      el("span", { class: "sw-ctrl", "aria-hidden": "true", text: "— ▢ ✕" }),
    ]),
    el("div", { class: "sw-body" }, [
      el("div", { class: "sw-head" }, [el("span", { text: STUDYIA_DEMO.deck }), count]),
      el("div", { class: "sw-bar" }, bar),
      question,
      options,
      feedback,
    ]),
    cursor,
  ]);
  scene.append(win);
  preview.append(scene);

  const qs = STUDYIA_DEMO.questions;
  let index = 0;
  let gen = 0; // bumps on every new run, so stale timers of an old run do nothing
  let answered = false;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function show(i) {
    const item = qs[i];
    answered = false;
    count.textContent = `${i + 1} / ${qs.length}`;
    bar.style.width = `${((i + 1) / qs.length) * 100}%`;
    question.textContent = item.q;
    feedback.replaceChildren();
    feedback.className = "sw-fb";
    options.replaceChildren(...item.options.map((text, n) => {
      const btn = el("button", { class: "sw-opt", type: "button" }, [el("b", { text: "ABC"[n] }), text]);
      btn.addEventListener("click", () => userAnswer(n));
      return btn;
    }));
  }

  function reveal(pick) {
    const item = qs[index];
    const buttons = options.children;
    const right = pick === item.answer;
    answered = true;
    buttons[item.answer].classList.add("right");
    if (!right) buttons[pick].classList.add("wrong");
    feedback.className = `sw-fb show ${right ? "ok" : "bad"}`;
    feedback.replaceChildren(
      right ? "✓ Correct " : `✗ ${item.why || `It's ${item.options[item.answer]}.`} `,
      el("span", { class: "sw-pill", text: right ? `next review in ${item.next || "3 days"}` : "↺ back in 1 min" }),
    );
  }

  function moveCursor(target) {
    const w = win.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const x = t.left - w.left + t.width * 0.55;
    const y = t.top - w.top + t.height * 0.55;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
  }

  function restCursor() {
    cursor.style.transform = `translate(${win.clientWidth * 0.86}px, ${win.clientHeight * 0.9}px)`;
  }

  async function autoplay(myGen) {
    while (myGen === gen) {
      show(index);
      await wait(1300);
      if (myGen !== gen) return;
      const target = options.children[qs[index].pick];
      cursor.classList.remove("away");
      moveCursor(target);
      await wait(800);
      if (myGen !== gen) return;
      cursor.classList.add("click");
      target.classList.add("pressed");
      await wait(160);
      cursor.classList.remove("click");
      target.classList.remove("pressed");
      reveal(qs[index].pick);
      await wait(500);
      cursor.classList.add("away"); // a real cursor would drift off too; keeps the feedback readable
      await wait(2400);
      if (myGen !== gen) return;
      index = (index + 1) % qs.length;
    }
  }

  // The visitor can answer too: that pauses the demo, then it moves on.
  async function userAnswer(n) {
    if (answered) return;
    const myGen = ++gen;
    reveal(n);
    cursor.classList.add("away");
    await wait(3500);
    if (myGen !== gen) return;
    index = (index + 1) % qs.length;
    if (REDUCED_MOTION) show(index);
    else autoplay(myGen);
  }

  show(index);
  if (REDUCED_MOTION) {
    cursor.hidden = true;
    return;
  }
  // wait until the card is in the page (sizes are known), then place the cursor
  // without animating it in from the corner
  setTimeout(() => {
    restCursor();
    cursor.getBoundingClientRect();
    cursor.classList.add("ready");
    autoplay(gen);
  }, 0);
}

// ---------- Notchn't demo ----------

function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const ICONS = {
  prev: "M6 5h2v14H6zM20 5v14L9 12z",
  pause: "M7 5h4v14H7zM13 5h4v14h-4z",
  next: "M16 5h2v14h-2zM4 5v14l11-7z",
  speaker: "M3 9h4l5-4v14l-5-4H3z",
  waves: "M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12",
};

function icon(name) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", ICONS[name]);
  path.setAttribute("fill", "currentColor");
  svg.append(path);
  if (name === "speaker") {
    const waves = document.createElementNS(SVG_NS, "path");
    waves.setAttribute("d", ICONS.waves);
    waves.setAttribute("fill", "none");
    waves.setAttribute("stroke", "currentColor");
    waves.setAttribute("stroke-width", "1.8");
    waves.setAttribute("stroke-linecap", "round");
    svg.append(waves);
  }
  return svg;
}

function mountNotchScene(preview) {
  const track = NOTCH_DEMO.track;
  const scene = desktopScene("scene-notch");
  const eq = () => el("span", { class: "nt-eq", "aria-hidden": "true" }, [el("i"), el("i"), el("i")]);

  const fill = el("i");
  const elapsed = el("span");
  const hudFill = el("i");
  const hudLabel = el("span", { class: "nt-hud-val" });

  const peek = el("div", { class: "nt-view nt-peek" }, [
    el("span", { class: "nt-art small" }),
    el("span", { class: "nt-peek-title", text: track.title }),
    eq(),
  ]);

  const panel = el("div", { class: "nt-view nt-panel" }, [
    el("div", { class: "nt-tabs", "aria-hidden": "true" }, [el("i", { class: "on" }), el("i"), el("i")]),
    el("span", { class: "nt-art" }),
    el("div", { class: "nt-info" }, [
      el("b", { text: track.title }),
      el("span", { class: "nt-artist", text: track.artist }),
      el("span", { class: "nt-app", text: track.app }),
      el("div", { class: "nt-progress" }, fill),
      el("div", { class: "nt-times" }, [elapsed, el("span", { text: fmtTime(track.length) })]),
      el("div", { class: "nt-controls", "aria-hidden": "true" }, [
        icon("prev"), el("span", { class: "play" }, icon("pause")), icon("next"),
      ]),
    ]),
  ]);

  const hud = el("div", { class: "nt-view nt-hud" }, [
    el("span", { class: "nt-hud-icon" }, icon("speaker")),
    el("div", { class: "nt-hud-bar" }, hudFill),
    hudLabel,
  ]);

  const notch = el("button", { class: "notch", type: "button", "data-state": "idle", "aria-label": "Open the notch" },
    [peek, panel, hud]);
  scene.append(notch);
  preview.append(scene);

  let pos = 71;
  let volume = 40;
  let gen = 0;
  let hovering = false;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function setState(state) {
    notch.dataset.state = state;
  }

  function renderTrack() {
    fill.style.width = `${(pos / track.length) * 100}%`;
    elapsed.textContent = fmtTime(pos);
  }

  function renderVolume() {
    hudFill.style.width = `${volume}%`;
    hudLabel.textContent = `${volume}%`;
  }

  // the song keeps playing whatever state the notch is in
  setInterval(() => { pos = (pos + 1) % track.length; renderTrack(); }, 1000);
  renderTrack();
  renderVolume();

  async function loop(myGen) {
    const step = async (state, ms) => {
      if (myGen !== gen) return false;
      setState(state);
      await wait(ms);
      return myGen === gen;
    };
    while (myGen === gen) {
      if (!await step("idle", 1600)) return;
      if (!await step("peek", 2000)) return;
      if (!await step("panel", 3800)) return;
      if (!await step("idle", 1600)) return;
      volume = 40;
      renderVolume();
      if (!await step("hud", 350)) return;
      for (let v = 45; v <= 60; v += 5) {
        volume = v;
        renderVolume();
        await wait(300);
        if (myGen !== gen) return;
      }
      if (!await step("hud", 1300)) return;
    }
  }

  // like the real one: hover peeks, click opens the panel, leaving tucks it back in
  notch.addEventListener("mouseenter", () => {
    hovering = true;
    gen++;
    if (notch.dataset.state !== "panel") setState("peek");
  });
  notch.addEventListener("click", async () => {
    const myGen = ++gen;
    setState(notch.dataset.state === "panel" ? "peek" : "panel");
    // on touch there is no mouseleave: fold back and resume on our own
    await wait(6000);
    if (myGen === gen && !hovering && !REDUCED_MOTION) loop(myGen);
  });
  notch.addEventListener("mouseleave", async () => {
    hovering = false;
    const myGen = ++gen;
    setState("idle");
    if (REDUCED_MOTION) return;
    await wait(2000);
    if (myGen === gen && !hovering) loop(myGen);
  });

  if (REDUCED_MOTION) {
    setState("panel");
    return;
  }
  loop(gen);
}

// ---------- start ----------

const grid = document.getElementById("projects");
PROJECTS.forEach((p) => grid.append(renderCard(p)));
grid.querySelectorAll(".meta[data-repo]").forEach(fillRepoMeta);
