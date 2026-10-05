// Lógica del test vocacional. El contenido (preguntas y carreras) está en data.js.

const STORAGE_KEY = "test-vocacional-v2";
const LETTERS = ["A", "B", "C", "D", "E"];
const SECTION_ORDER = ["inicio", "intereses", "temas", "habilidades", "preferencias"];
const TOP_CAREERS = 10;
const SHORT_CAREERS = 4;

// Puntaje máximo posible por área RIASEC (para pasar a porcentaje).
const RIASEC_MAX = {};
for (const q of QUESTIONS) {
  for (const o of q.options) if (o.r) RIASEC_MAX[o.r] = (RIASEC_MAX[o.r] || 0) + 1;
}

const $ = (id) => document.getElementById(id);

const esc = (str) =>
  String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// ---------------------------------------------------------------------------
// Estado (se guarda en el navegador para poder seguir después)
// ---------------------------------------------------------------------------
function newState() {
  return { name: "", current: 0, answers: {}, order: {}, favs: [], done: false };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.answers) return { ...newState(), ...saved };
  } catch (e) { /* sin almacenamiento disponible */ }
  return null;
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignorar */ }
}

let state = loadState() || newState();
let locked = false;

function shuffledIndexes(n) {
  const a = [...Array(n).keys()];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function optionOrder(q) {
  if (!state.order[q.id]) {
    state.order[q.id] = q.keepOrder ? [...q.options.keys()] : shuffledIndexes(q.options.length);
  }
  return state.order[q.id];
}

// ---------------------------------------------------------------------------
// Navegación entre pantallas
// ---------------------------------------------------------------------------
function show(screenId) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(screenId).classList.add("active");
  window.scrollTo({ top: 0 });
}

function setupStart() {
  $("total-questions").textContent = QUESTIONS.length;
  $("name-input").value = state.name || "";
  const answered = Object.keys(state.answers).length;
  $("btn-see-result").hidden = !state.done;
  $("btn-resume").hidden = state.done || answered === 0;
  $("btn-start").textContent = answered > 0 ? "Empezar de nuevo" : "Empezar el test";
}

function startQuiz(fresh) {
  const name = $("name-input").value.trim();
  if (fresh) state = newState();
  state.name = name;
  saveState();
  renderQuestion();
  show("screen-quiz");
}

// ---------------------------------------------------------------------------
// Preguntas
// ---------------------------------------------------------------------------
function renderQuestion() {
  const q = QUESTIONS[state.current];
  const section = SECTIONS[q.section];
  const sectionNumber = SECTION_ORDER.indexOf(q.section);

  $("section-label").textContent =
    sectionNumber === 0 ? section.title : `Parte ${sectionNumber} de ${SECTION_ORDER.length - 1} · ${section.title}`;
  $("progress-text").textContent = `${state.current + 1} / ${QUESTIONS.length}`;
  $("progress-bar").style.width = `${(state.current / QUESTIONS.length) * 100}%`;
  $("section-subtitle").textContent = section.subtitle;
  $("question-text").textContent = q.text;
  $("btn-back").disabled = state.current === 0;

  const isMulti = q.type === "multi";
  $("btn-next").hidden = !isMulti;
  $("multi-hint").hidden = !isMulti;

  const container = $("options");
  container.innerHTML = "";
  container.className = "options" + (isMulti && q.options.length > 6 ? " grid" : "");
  container.setAttribute("role", isMulti ? "group" : "radiogroup");

  optionOrder(q).forEach((optIndex, position) => {
    const opt = q.options[optIndex];
    const btn = document.createElement("button");
    btn.className = "option";
    btn.dataset.index = optIndex;
    const marker = isMulti ? `<span class="check">✓</span>` : `<span class="letter">${LETTERS[position]}</span>`;
    btn.innerHTML = `${marker}<span>${esc(opt.label)}</span>`;
    btn.setAttribute("role", isMulti ? "checkbox" : "radio");
    btn.addEventListener("click", () => (isMulti ? toggleMulti(q, optIndex) : chooseSingle(q, optIndex)));
    container.appendChild(btn);
  });

  refreshSelection(q);
}

function refreshSelection(q, overLimit = false) {
  const answer = state.answers[q.id];
  const selected = Array.isArray(answer) ? answer : answer == null ? [] : [answer];
  document.querySelectorAll(".option").forEach((btn) => {
    const on = selected.includes(Number(btn.dataset.index));
    btn.classList.toggle("selected", on);
    btn.setAttribute("aria-checked", on ? "true" : "false");
  });

  if (q.type === "multi") {
    const hint = $("multi-hint");
    hint.textContent = overLimit
      ? `Podés elegir hasta ${q.max}. Sacá una para elegir otra.`
      : `Elegiste ${selected.length} de ${q.max} posibles.`;
    hint.classList.toggle("limit", overLimit);
    $("btn-next").disabled = selected.length === 0;
  }
}

function chooseSingle(q, optIndex) {
  if (locked) return;
  locked = true;
  state.answers[q.id] = optIndex;
  saveState();
  refreshSelection(q);
  setTimeout(() => {
    locked = false;
    goNext();
  }, 220);
}

function toggleMulti(q, optIndex) {
  const selected = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];
  const pos = selected.indexOf(optIndex);
  if (pos >= 0) {
    selected.splice(pos, 1);
  } else if (selected.length >= q.max) {
    refreshSelection(q, true);
    return;
  } else {
    selected.push(optIndex);
  }
  state.answers[q.id] = selected;
  saveState();
  refreshSelection(q);
}

function goNext() {
  if (state.current < QUESTIONS.length - 1) {
    state.current++;
    saveState();
    renderQuestion();
    window.scrollTo({ top: 0 });
  } else {
    state.done = true;
    saveState();
    showResults();
  }
}

function goBack() {
  if (state.current > 0) {
    state.current--;
    saveState();
    renderQuestion();
  }
}

// ---------------------------------------------------------------------------
// Cálculo del resultado
// ---------------------------------------------------------------------------
function computeProfile() {
  const riasec = Object.fromEntries(Object.keys(AREAS).map((k) => [k, 0]));
  const fields = Object.fromEntries(Object.keys(FIELDS).map((k) => [k, 0]));
  const skills = Object.fromEntries(Object.keys(SKILLS).map((k) => [k, 0]));
  const prefs = {};

  for (const q of QUESTIONS) {
    const answer = state.answers[q.id];
    if (answer == null) continue;
    const picks = Array.isArray(answer) ? answer : [answer];
    const multi = q.type === "multi";
    for (const i of picks) {
      const o = q.options[i];
      if (!o) continue;
      if (o.r) riasec[o.r]++;
      // En una elección múltiple de temas cada tema vale 2; si viene de una materia, vale 1.
      (o.f || []).forEach((f) => (fields[f] += multi && !o.s ? 2 : 1));
      (o.s || []).forEach((s) => (skills[s] += multi ? 2 : 1));
      if (q.pref) prefs[q.pref] = o.v;
    }
  }

  const pct = {};
  for (const k of Object.keys(AREAS)) pct[k] = RIASEC_MAX[k] ? riasec[k] / RIASEC_MAX[k] : 0;
  const ranking = Object.keys(AREAS).sort((a, b) => pct[b] - pct[a]);

  const topOf = (obj, n) =>
    Object.entries(obj).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);

  return { riasec, pct, ranking, code: ranking.slice(0, 3), fields, skills, prefs,
    topFields: topOf(fields, 4), topSkills: topOf(skills, 4) };
}

function scoreCareer(c, p) {
  // 1) Coincidencia con el perfil RIASEC (la primera letra de la carrera pesa más).
  const maxPct = Math.max(...Object.values(p.pct)) || 1;
  const weights = [3, 2, 1];
  let riasecScore = 0;
  [...c.code].forEach((letter, i) => (riasecScore += weights[i] * (p.pct[letter] / maxPct)));
  riasecScore /= 6;

  // 2) Temas que le atraen.
  const maxField = Math.max(...Object.values(p.fields)) || 1;
  const fieldVals = c.fields.map((f) => p.fields[f] / maxField).sort((a, b) => b - a);
  const fieldScore = Math.min(1, (fieldVals[0] || 0) + 0.35 * (fieldVals[1] || 0) + 0.15 * (fieldVals[2] || 0));

  // 3) Habilidades.
  const maxSkill = Math.max(...Object.values(p.skills)) || 1;
  const skillVals = c.skills.map((s) => p.skills[s] / maxSkill).sort((a, b) => b - a);
  const skillScore = skillVals.length > 1 ? (skillVals[0] + skillVals[1]) / 2 : skillVals[0] || 0;

  let score = 0.4 * riasecScore + 0.35 * fieldScore + 0.25 * skillScore;

  // 4) Preferencias: suben o bajan el puntaje y generan avisos.
  const good = [];
  const warn = [];
  const { dur = 99, math = 2, sangre = 0, gente = 1, env, prio } = p.prefs;

  const over = c.durNum - dur;
  if (over >= 3) { score *= 0.6; warn.push(`Dura ${c.dur}: bastante más de lo que querés estudiar.`); }
  else if (over >= 1) { score *= 0.8; warn.push(`Dura ${c.dur}: un poco más de lo que querés estudiar.`); }
  else if (dur < 99) good.push(`Dura ${c.dur}, dentro de lo que querés estudiar.`);

  const mathGap = c.math - math;
  if (mathGap >= 2) { score *= 0.65; warn.push("Tiene mucha matemática y no es lo tuyo."); }
  else if (mathGap === 1) { score *= 0.88; warn.push("Tiene más matemática de la que te gustaría."); }
  else if (math === 3 && c.math === 3) { score *= 1.05; good.push("Usa mucha matemática, que es algo que disfrutás."); }
  else if (math <= 1 && c.math === 0) good.push("Casi no tiene matemática.");

  if (c.sangre && sangre === 2) { score *= 0.45; warn.push("Implica sangre, agujas o procedimientos médicos."); }
  else if (c.sangre && sangre === 1) { score *= 0.85; warn.push("Implica algo de sangre o procedimientos médicos."); }

  if (Math.abs(c.people - gente) === 2) {
    score *= 0.8;
    warn.push(c.people === 2 ? "Es de mucho contacto con gente." : "Es un trabajo bastante solitario.");
  } else if (c.people === gente && gente === 2) good.push("Tiene el contacto con gente que buscás.");

  if (env && c.env.includes(env)) { score *= 1.06; good.push("Se trabaja en el tipo de lugar que preferís."); }

  if (prio === "plata" || prio === "estable") {
    if (c.demand === 2) { score *= 1.06; good.push("Tiene muy buena salida laboral."); }
    else if (c.demand === 0) { score *= 0.92; warn.push("La salida laboral es más difícil."); }
  } else if (prio === "ayudar" && c.code.slice(0, 2).includes("S")) {
    score *= 1.06;
    good.push("Se centra en ayudar a otras personas.");
  }

  // Motivos principales (van primero).
  const reasons = [];
  const sharedAreas = c.code.slice(0, 2).split("").filter((l) => p.code.slice(0, 2).includes(l));
  if (sharedAreas.length) reasons.push(`Encaja con tu perfil ${sharedAreas.map((l) => AREAS[l].name).join(" y ")}.`);
  const likedFields = c.fields.filter((f) => p.fields[f] > 0).sort((a, b) => p.fields[b] - p.fields[a]).slice(0, 2);
  if (likedFields.length) reasons.push(`Te atraen los temas de ${likedFields.map((f) => FIELDS[f].toLowerCase()).join(" y ")}.`);
  const goodSkills = c.skills.filter((s) => p.skills[s] > 0).sort((a, b) => p.skills[b] - p.skills[a]).slice(0, 2);
  if (goodSkills.length) reasons.push(`Se te da bien ${goodSkills.map((s) => SKILLS[s]).join(" y ")}.`);

  const pct = Math.max(1, Math.min(99, Math.round(score * 100)));
  return { career: c, pct, good: [...reasons, ...good], warn };
}

function rankCareers(profile) {
  return CAREERS.map((c) => scoreCareer(c, profile)).sort((a, b) => b.pct - a.pct);
}

function matchLabel(pct) {
  if (pct >= 75) return "Muy compatible";
  if (pct >= 60) return "Compatible";
  if (pct >= 45) return "Puede interesarte";
  return "Poco compatible";
}

// ---------------------------------------------------------------------------
// Pantalla de resultados
// ---------------------------------------------------------------------------
let lastResult = null;

function showResults() {
  const profile = computeProfile();
  const ranked = rankCareers(profile);
  const top = ranked.slice(0, TOP_CAREERS);
  const topIds = new Set(top.map((r) => r.career.id));
  // Solo opciones cortas que sean razonablemente compatibles con su perfil.
  const minShort = Math.max(40, top[0].pct * 0.6);
  const short = ranked
    .filter((r) => r.career.durNum <= 2 && !topIds.has(r.career.id) && r.pct >= minShort)
    .slice(0, SHORT_CAREERS);
  const country = profile.prefs.pais || "otro";
  lastResult = { profile, ranked, top, country };

  const [a1, a2] = profile.ranking;
  const name = state.name ? `${state.name}, tu` : "Tu";
  $("result-title").textContent = `${name} perfil es ${AREAS[a1].name} – ${AREAS[a2].name}`;
  $("result-code").innerHTML = profile.code
    .map((k) => `<span class="code-chip"><b style="background:${AREAS[k].color}">${k}</b>${AREAS[k].name}</span>`)
    .join("");
  $("result-summary").textContent =
    `Tu carrera más compatible es ${top[0].career.name}. Abajo tenés tus ${TOP_CAREERS} mejores opciones explicadas una por una y un plan para decidir.`;

  renderProfile(profile);
  $("careers-list").innerHTML = top.map((r, i) => careerCard(r, i + 1, country)).join("");
  $("short-list").innerHTML = short.length
    ? short.map((r) => careerCard(r, null, country, true)).join("")
    : top.some((r) => r.career.durNum <= 2)
      ? `<p class="hint">Las opciones cortas que van con vos ya están en la lista de arriba.</p>`
      : `<p class="hint">No encontramos formaciones cortas que encajen bien con tu perfil: lo tuyo son carreras de más de 2 años.</p>`;
  renderFavs();
  renderPlan(profile, top, country);
  bindCareerButtons();

  $("progress-bar").style.width = "100%";
  show("screen-result");
}

function renderProfile(p) {
  const [a1, a2, a3] = p.ranking;
  const skillsList = p.topSkills.map((s) => `<span class="pill">${esc(SKILLS[s])}</span>`).join("");
  const fieldsList = p.topFields.map((f) => `<span class="pill">${esc(FIELDS[f])}</span>`).join("");
  $("profile-text").innerHTML = `
    <p><strong>${AREAS[a1].name} (${AREAS[a1].short}).</strong> ${AREAS[a1].description}</p>
    <p><strong>También tenés mucho de ${AREAS[a2].name} (${AREAS[a2].short.toLowerCase()})</strong>
      y algo de ${AREAS[a3].name} (${AREAS[a3].short.toLowerCase()}). ${AREAS[a2].description}</p>
    ${skillsList ? `<h3>Tus fortalezas</h3><div class="pill-list">${skillsList}</div>` : ""}
    ${fieldsList ? `<h3>Los temas que más te atraen</h3><div class="pill-list">${fieldsList}</div>` : ""}
    <h3>Tus intereses, área por área</h3>
  `;

  const bars = $("result-bars");
  bars.innerHTML = "";
  p.ranking.forEach((k) => {
    const value = Math.round(p.pct[k] * 100);
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${AREAS[k].name}</span>
      <div class="bar-track"><div class="bar-fill" style="width:0;background:${AREAS[k].color}"></div></div>
      <span>${value}%</span>`;
    bars.appendChild(row);
    requestAnimationFrame(() => (row.querySelector(".bar-fill").style.width = `${value}%`));
  });
}

function whereToStudy(c, country) {
  if (country === "uy") return c.uy;
  if (country === "ar") return c.ar;
  return `Uruguay: ${c.uy} Argentina: ${c.ar} En otros países, buscá carreras con el mismo nombre en universidades públicas e institutos.`;
}

function careerCard(r, rank, country, compact = false) {
  const c = r.career;
  const fav = state.favs.includes(c.id);
  const good = r.good.map((t) => `<li class="good">✓ ${esc(t)}</li>`).join("");
  const warn = r.warn.map((t) => `<li class="warn">⚠ ${esc(t)}</li>`).join("");
  return `
    <article class="career${compact ? " compact" : ""}">
      <div class="career-head">
        ${rank ? `<span class="career-rank">${rank}</span>` : ""}
        <div class="career-title">
          <h3>${esc(c.name)}</h3>
          <div class="career-meta">${esc(c.type)} · ${esc(c.dur)}</div>
        </div>
        <button class="fav-btn${fav ? " on" : ""}" data-fav="${c.id}" aria-pressed="${fav}"
          title="${fav ? "Quitar de favoritas" : "Agregar a favoritas"}">${fav ? "★" : "☆"}</button>
      </div>
      <div class="match">
        <div class="bar-track"><div class="bar-fill" style="width:${r.pct}%"></div></div>
        <strong>${r.pct}% · ${matchLabel(r.pct)}</strong>
      </div>
      <p>${esc(c.desc)}</p>
      <ul class="reasons">${good}${warn}</ul>
      <details>
        <summary>Ver detalles</summary>
        <div class="details-grid">
          <div><h4>Un día de trabajo</h4><p>${esc(c.dia)}</p></div>
          <div><h4>Materias que vas a tener</h4><p>${esc(c.materias.join(" · "))}</p></div>
          <div><h4>Salida laboral</h4><p>${esc(c.salida)}</p></div>
          <div><h4>Tené en cuenta</h4><p>${esc(c.ojo)}</p></div>
          <div><h4>Dónde estudiarla${country === "otro" ? "" : ` en ${COUNTRY_INFO[country].name}`}</h4><p>${esc(whereToStudy(c, country))}</p></div>
        </div>
      </details>
    </article>`;
}

function bindCareerButtons() {
  document.querySelectorAll("[data-fav]").forEach((btn) => {
    btn.onclick = () => toggleFav(btn.dataset.fav);
  });
}

function toggleFav(id) {
  const i = state.favs.indexOf(id);
  if (i >= 0) state.favs.splice(i, 1);
  else state.favs.push(id);
  saveState();
  const on = state.favs.includes(id);
  document.querySelectorAll(`[data-fav="${id}"]`).forEach((btn) => {
    btn.classList.toggle("on", on);
    btn.textContent = on ? "★" : "☆";
    btn.setAttribute("aria-pressed", on);
    btn.title = on ? "Quitar de favoritas" : "Agregar a favoritas";
  });
  renderFavs();
}

const MATH_LABEL = ["Casi nada", "Poca", "Media", "Mucha"];
const PEOPLE_LABEL = ["Poco", "Algo", "Mucho"];
const DEMAND_LABEL = ["Más difícil", "Media", "Muy buena"];

function renderFavs() {
  const box = $("favs");
  if (!lastResult) return;
  const favs = lastResult.ranked.filter((r) => state.favs.includes(r.career.id));
  if (!favs.length) {
    box.innerHTML = `<p class="hint">Todavía no marcaste ninguna. Tocá la ☆ de las carreras que te llamen la atención y acá vas a ver una tabla para compararlas.</p>`;
    return;
  }
  box.innerHTML = `
    <p class="hint">Comparalas lado a lado. Lo ideal es quedarte con 2 o 3 para investigar a fondo.</p>
    <div class="fav-table-wrap">
      <table class="fav-table">
        <thead><tr>
          <th>Carrera</th><th>Compatibilidad</th><th>Duración</th><th>Matemática</th><th>Trato con gente</th><th>Salida laboral</th>
        </tr></thead>
        <tbody>
          ${favs.map(({ career: c, pct }) => `
            <tr>
              <td><strong>${esc(c.name)}</strong></td>
              <td>${pct}%</td>
              <td>${esc(c.dur)}</td>
              <td>${MATH_LABEL[c.math]}</td>
              <td>${PEOPLE_LABEL[c.people]}</td>
              <td>${DEMAND_LABEL[c.demand]}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function renderPlan(p, top, country) {
  const [a1, a2] = p.ranking;
  const first3 = top.slice(0, 3).map((r) => r.career.name);
  const info = COUNTRY_INFO[country];
  const tryList = [...TRY_IT[a1].slice(0, 2), TRY_IT[a2][0]];

  const steps = [
    {
      when: "Hoy",
      title: "Elegí tus favoritas",
      body: `<p>Leé los detalles de tus primeras opciones (<strong>${first3.map(esc).join("</strong>, <strong>")}</strong>) y marcá con ☆ las 2 o 3 que más te entusiasmen. No elijas por lo que dicen los demás: elegí lo que te daría curiosidad estudiar.</p>`,
    },
    {
      when: "Esta semana",
      title: "Mirá el plan de estudios",
      body: `<p>Buscá en la web oficial de cada carrera su <strong>plan de estudios</strong> y leé las materias de 1º y 2º año. Si la mayoría te aburre, es una señal importante. Fijate también si hay examen de ingreso, cupos y en qué horarios se cursa.</p>`,
    },
    {
      when: "Este mes",
      title: "Hablá con alguien que trabaje de eso",
      body: `<p>Conseguí al menos 2 personas que estudien o trabajen en lo que te interesa (familia, amigos de amigos, Instagram, LinkedIn). Preguntales:</p>
        <ul>${INTERVIEW_QUESTIONS.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>`,
    },
    {
      when: "Este mes",
      title: "Probalo antes de decidir",
      body: `<p>Según tu perfil ${AREAS[a1].name} – ${AREAS[a2].name}, estas actividades te van a ayudar a confirmar si te gusta:</p>
        <ul>${tryList.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`,
    },
    {
      when: "Antes de inscribirte",
      title: `Conocé los lugares de estudio en ${info.name}`,
      body: `<ul>${info.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`,
    },
    {
      when: "Para decidir",
      title: "Decidí sin miedo",
      body: `<p>Si dudás entre dos, hacé una lista de pros y contras de cada una y preguntate: <em>¿cuál me daría más ganas de ir a clase un lunes de lluvia?</em> Ninguna elección es para siempre: muchas carreras comparten materias y cambiar de rumbo es mucho más común de lo que parece.</p>`,
    },
  ];

  $("plan").innerHTML = steps
    .map((s) => `<li><span class="when">${s.when}</span><h3>${esc(s.title)}</h3>${s.body}</li>`)
    .join("");
}

// ---------------------------------------------------------------------------
// Compartir, imprimir y reiniciar
// ---------------------------------------------------------------------------
function summaryText() {
  const { profile, top } = lastResult;
  const lines = [
    `🎓 Mi resultado del test vocacional${state.name ? ` (${state.name})` : ""}`,
    `Perfil: ${profile.code.map((k) => AREAS[k].name).join(" – ")}`,
    "",
    "Mis carreras más compatibles:",
    ...top.slice(0, 5).map((r, i) => `${i + 1}. ${r.career.name} (${r.pct}%)`),
  ];
  const favs = top.filter((r) => state.favs.includes(r.career.id));
  if (favs.length) lines.push("", `Mis favoritas: ${favs.map((r) => r.career.name).join(", ")}`);
  if (location.protocol.startsWith("http")) lines.push("", `Hacé el test: ${location.href.split("#")[0]}`);
  return lines.join("\n");
}

function copySummary() {
  const text = summaryText();
  const done = () => ($("copy-feedback").textContent = "¡Resumen copiado! Ya lo podés pegar donde quieras.");
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const area = document.createElement("textarea");
  area.value = text;
  document.body.appendChild(area);
  area.select();
  try { document.execCommand("copy"); done(); } catch (e) { /* ignorar */ }
  area.remove();
}

window.addEventListener("beforeprint", () => {
  document.querySelectorAll("#screen-result details").forEach((d) => (d.open = true));
});

// Atajos de teclado: A-E o 1-9 para responder, Enter para seguir, flecha izquierda para volver.
document.addEventListener("keydown", (e) => {
  if (!$("screen-quiz").classList.contains("active")) return;
  if (e.target.tagName === "INPUT") return;
  const options = document.querySelectorAll(".option");
  const key = e.key.toUpperCase();
  let idx = LETTERS.indexOf(key);
  if (idx === -1 && /^[1-9]$/.test(key)) idx = Number(key) - 1;
  if (idx >= 0 && options[idx]) options[idx].click();
  if (e.key === "Enter" && e.target.tagName !== "BUTTON" && !$("btn-next").hidden && !$("btn-next").disabled) goNext();
  if (e.key === "ArrowLeft") goBack();
});

$("btn-start").addEventListener("click", () => startQuiz(true));
$("btn-resume").addEventListener("click", () => startQuiz(false));
$("btn-see-result").addEventListener("click", () => {
  state.name = $("name-input").value.trim() || state.name;
  saveState();
  showResults();
});
$("btn-back").addEventListener("click", goBack);
$("btn-next").addEventListener("click", goNext);
$("btn-print").addEventListener("click", () => window.print());
$("btn-copy").addEventListener("click", copySummary);
$("btn-share").addEventListener("click", () => {
  window.open(`https://wa.me/?text=${encodeURIComponent(summaryText())}`, "_blank", "noopener");
});
$("btn-restart").addEventListener("click", () => {
  if (!confirm("¿Querés borrar tus respuestas y hacer el test de nuevo?")) return;
  state = newState();
  saveState();
  setupStart();
  show("screen-start");
});

setupStart();
