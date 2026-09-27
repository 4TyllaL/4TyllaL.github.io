const STATUS_LABEL = {
  released: "Released",
  dev: "Em desenvolvimento",
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

// ---------- dados ao vivo do GitHub ----------

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "há 1 mês" : `há ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
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
    if (release?.tag_name) parts.push(["versão", release.tag_name]);
    if (info.stargazers_count > 0) parts.push(["★", String(info.stargazers_count)]);
    parts.push(["último commit", timeAgo(info.pushed_at)]);
    meta.replaceChildren(...parts.map(([k, v]) => el("span", {}, [`${k} `, el("b", { text: v })])));
  } catch {
    // sem rede ou limite da API: o card continua completo, só sem esses números
  }
}

// ---------- mascote do !StayAlone ----------

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

function mountMascotScene(preview) {
  const scene = el("div", { class: "scene" }, [
    el("div", { class: "start" }, [el("i"), el("i"), el("i"), el("i")]),
    el("div", { class: "tray", text: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }),
  ]);
  const canvas = el("canvas", { width: 16, height: 16 });
  const cat = el("button", { class: "mascot", type: "button", "aria-label": "Fazer carinho no Calcifer" }, canvas);
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

// ---------- start ----------

const grid = document.getElementById("projects");
PROJECTS.forEach((p) => grid.append(renderCard(p)));
grid.querySelectorAll(".meta[data-repo]").forEach(fillRepoMeta);
