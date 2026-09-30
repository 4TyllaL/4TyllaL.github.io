const STATUS_LABEL = {
  released: "Released",
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
  } else if (project.preview.type === "cloudnx") {
    mountCloudScene(preview);
  } else if (project.preview.type === "notch") {
    mountNotchScene(preview);
  }

  const badges = el("div", { class: "badges" },
    project.status.map((s) => el("span", { class: `badge ${s}`, text: STATUS_LABEL[s] })));

  const meta = project.repo ? el("div", { class: "meta", "data-repo": project.repo }) : null;

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
    if (release?.tag_name) parts.push(["version", release.tag_name]);
    if (info.stargazers_count > 0) parts.push(["★", String(info.stargazers_count)]);
    parts.push(["last commit", timeAgo(info.pushed_at)]);
    meta.replaceChildren(...parts.map(([k, v]) => el("span", {}, [`${k} `, el("b", { text: v })])));
  } catch {
    // offline or rate-limited: the card stays complete, just without these numbers
  }
}

// ---------- !StayAlone mascot ----------

function drawFrame(ctx, frame) {
  ctx.clearRect(0, 0, 16, 16);
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

function mountMascotScene(preview) {
  const scene = desktopScene();
  const canvas = el("canvas", { width: 16, height: 16 });
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

// ---------- CloudNX console demo ----------

const RUNNER = {
  colors: { h: "#ffd8a8", k: "#2b1e2f", b: "#ef476f", l: "#3a3f5c" },
  frames: [
    ["..kk..", ".khhk.", "..bb..", ".bbbb.", "b.bb.b", "..bb..", ".l..l.", "l....l"],
    ["..kk..", ".khhk.", "..bb..", ".bbbb.", ".bbbb.", "..bb..", "..ll..", "..l.l."],
  ],
};

function mountCloudScene(preview) {
  const W = 128, H = 72, GROUND = 58;
  const scene = desktopScene("scene-nx");
  const canvas = el("canvas", { width: W, height: H });
  const provider = el("span", { class: "nx-provider" });
  const stats = el("span", { class: "nx-stats" });
  const status = el("div", { class: "nx-connect" });
  const screen = el("button", { class: "nx-screen", type: "button", "aria-label": "Jump" },
    [canvas, el("div", { class: "nx-hud" }, [provider, stats]), status]);
  const joy = (side) => el("div", { class: `nx-joy ${side}`, "aria-hidden": "true" }, [el("i", { class: "stick" }), el("i", { class: "btns" })]);
  scene.append(el("div", { class: "nx" }, [joy("left"), el("div", { class: "nx-body" }, screen), joy("right")]));
  preview.append(scene);

  const ctx = canvas.getContext("2d");
  const providers = CLOUDNX_DEMO.providers;
  const state = {
    p: 0, phase: "connecting", phaseLeft: 1.4, t: 0, last: 0,
    y: 0, vy: 0, crates: [], spawnIn: 1.2, statsIn: 0, frameT: 0, step: 0,
  };

  function setPhase(phase) {
    state.phase = phase;
    const name = providers[state.p].name;
    if (phase === "connecting") {
      state.phaseLeft = 1.4;
      state.crates = [];
      status.textContent = `Connecting to ${name}...`;
      screen.classList.add("connecting");
    } else {
      state.phaseLeft = 6;
      provider.textContent = name;
      screen.classList.remove("connecting");
    }
  }

  function jump() {
    if (state.y === 0 && state.phase === "live") state.vy = 78;
  }
  screen.addEventListener("click", jump);

  function drawRunner(x, y, frame) {
    RUNNER.frames[frame].forEach((row, dy) => {
      [...row].forEach((ch, dx) => {
        const c = RUNNER.colors[ch];
        if (!c) return;
        ctx.fillStyle = c;
        ctx.fillRect(x + dx, y + dy, 1, 1);
      });
    });
  }

  function hills(offset, base, amp, freq, color) {
    ctx.fillStyle = color;
    for (let x = 0; x < W; x++) {
      const h = base + amp * Math.sin((x + offset) * freq) + amp * 0.5 * Math.sin((x + offset) * freq * 2.3);
      ctx.fillRect(x, Math.round(h), 1, GROUND - Math.round(h));
    }
  }

  function draw() {
    const pal = providers[state.p];
    if (state.phase === "connecting") {
      ctx.fillStyle = "#07080c";
      ctx.fillRect(0, 0, W, H);
      return;
    }
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, pal.sky[0]);
    sky.addColorStop(1, pal.sky[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, GROUND);
    ctx.fillStyle = "rgba(255, 246, 214, .9)";
    ctx.beginPath();
    ctx.arc(102, 14, 6, 0, Math.PI * 2);
    ctx.fill();
    hills(state.t * 6, 38, 5, 0.05, pal.hills[0]);
    hills(state.t * 16 + 40, 47, 3.5, 0.08, pal.hills[1]);
    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = "rgba(0, 0, 0, .18)";
    for (let x = -((state.t * 42) % 10); x < W; x += 10) ctx.fillRect(Math.round(x), GROUND + 3, 5, 1);
    ctx.fillStyle = "rgba(0, 0, 0, .12)";
    ctx.fillRect(0, GROUND, W, 1);
    for (const c of state.crates) {
      ctx.fillStyle = "#6b4226";
      ctx.fillRect(Math.round(c), GROUND - 6, 6, 6);
      ctx.fillStyle = "#a26a3a";
      ctx.fillRect(Math.round(c) + 1, GROUND - 5, 4, 4);
    }
    drawRunner(22, GROUND - 8 - Math.round(state.y), state.y > 0 ? 0 : state.step);
  }

  function update(dt) {
    state.phaseLeft -= dt;
    if (state.phaseLeft <= 0) {
      if (state.phase === "connecting") setPhase("live");
      else { state.p = (state.p + 1) % providers.length; setPhase("connecting"); }
    }
    if (state.phase !== "live") return;
    state.t += dt;

    state.spawnIn -= dt;
    if (state.spawnIn <= 0) { state.crates.push(W + 2); state.spawnIn = 1.3 + Math.random() * 1.6; }
    state.crates = state.crates.map((c) => c - 42 * dt).filter((c) => c > -8);
    // autopilot: jump over the next crate (clicking jumps too)
    if (state.crates.some((c) => c > 24 && c < 38)) jump();

    if (state.y > 0 || state.vy > 0) {
      state.y += state.vy * dt;
      state.vy -= 260 * dt;
      if (state.y <= 0) { state.y = 0; state.vy = 0; }
    }
    state.frameT += dt;
    if (state.frameT > 0.14) { state.frameT = 0; state.step ^= 1; }

    state.statsIn -= dt;
    if (state.statsIn <= 0) {
      state.statsIn = 0.6;
      stats.textContent = `1080p60 · ${18 + Math.round(Math.random() * 14)} ms`;
    }
  }

  function tick(now) {
    const dt = Math.min((now - (state.last || now)) / 1000, 0.1);
    state.last = now;
    update(dt);
    draw();
    requestAnimationFrame(tick);
  }

  if (REDUCED_MOTION) {
    setPhase("live");
    state.crates = [70];
    stats.textContent = "1080p60 · 24 ms";
    draw();
    return;
  }
  setPhase("connecting");
  draw();
  requestAnimationFrame(tick);
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
