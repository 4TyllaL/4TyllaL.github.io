const STATUS_LABEL = {
  released: "Released",
  dev: "In Development",
  "open-source": "Open Source",
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
  }

  const badges = el("div", { class: "badges" },
    project.status.map((s) => el("span", { class: `badge ${s}`, text: STATUS_LABEL[s] })));

  const meta = el("div", { class: "meta", "data-repo": project.repo });

  const actions = el("div", { class: "actions" },
    project.links.map((link) => el("a", {
      class: `btn${link.primary ? " primary" : ""}`,
      href: link.href,
      target: "_blank",
      rel: "noopener",
      text: link.label,
    })));

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

// ---------- start ----------

const grid = document.getElementById("projects");
PROJECTS.forEach((p) => grid.append(renderCard(p)));
grid.querySelectorAll(".meta[data-repo]").forEach(fillRepoMeta);
