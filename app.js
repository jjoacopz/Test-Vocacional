// Test vocacional basado en el modelo RIASEC (Holland).
// Cada opción suma un punto a un área. Al final se muestran las áreas con más puntos.

const AREAS = {
  R: {
    name: "Realista",
    short: "Técnico-práctico",
    color: "#e0794c",
    description:
      "Te gusta trabajar con las manos, con herramientas, máquinas o al aire libre. Preferís ver resultados concretos de lo que hacés.",
    careers: [
      "Ingeniería mecánica", "Ingeniería civil", "Arquitectura", "Agronomía",
      "Técnico en electrónica", "Profesorado de educación física", "Veterinaria",
      "Mecánica automotriz", "Guardaparque",
    ],
  },
  I: {
    name: "Investigador",
    short: "Científico-analítico",
    color: "#3d8bd9",
    description:
      "Te atrae entender cómo funcionan las cosas, analizar datos y resolver problemas complejos con lógica y curiosidad.",
    careers: [
      "Medicina", "Biología", "Bioquímica", "Física", "Ciencias de la computación",
      "Ciencia de datos", "Psicología (investigación)", "Farmacia", "Geología",
    ],
  },
  A: {
    name: "Artístico",
    short: "Creativo-expresivo",
    color: "#d64fa6",
    description:
      "Necesitás expresarte y crear cosas originales. Te sentís cómodo en ambientes libres, con poca rutina.",
    careers: [
      "Diseño gráfico", "Diseño de indumentaria", "Bellas artes", "Música",
      "Cine y audiovisual", "Letras", "Teatro / Actuación", "Diseño UX/UI",
      "Fotografía",
    ],
  },
  S: {
    name: "Social",
    short: "Servicio a las personas",
    color: "#2fa776",
    description:
      "Disfrutás ayudar, enseñar, escuchar y acompañar a otros. Te importa generar un impacto positivo en la gente.",
    careers: [
      "Psicología", "Profesorado / Docencia", "Enfermería", "Trabajo social",
      "Psicopedagogía", "Terapia ocupacional", "Nutrición", "Kinesiología",
      "Recursos humanos",
    ],
  },
  E: {
    name: "Emprendedor",
    short: "Liderazgo y negocios",
    color: "#e2a521",
    description:
      "Te gusta liderar, convencer, tomar decisiones y asumir riesgos. Te motivan los desafíos y los objetivos ambiciosos.",
    careers: [
      "Administración de empresas", "Marketing", "Comercio internacional",
      "Abogacía", "Ciencias políticas", "Relaciones públicas", "Turismo y hotelería",
      "Periodismo", "Emprendedurismo",
    ],
  },
  C: {
    name: "Convencional",
    short: "Organización y método",
    color: "#7a68d8",
    description:
      "Sos ordenado, prolijo y metódico. Te sentís bien con tareas claras, datos, números y procesos bien definidos.",
    careers: [
      "Contador público", "Economía", "Actuario", "Administración pública",
      "Bibliotecología", "Analista de sistemas", "Escribanía", "Logística",
      "Finanzas",
    ],
  },
};

const QUESTIONS = [
  {
    text: "Tenés un sábado libre. ¿Qué preferís hacer?",
    options: [
      ["Arreglar algo de la casa o armar un mueble", "R"],
      ["Mirar documentales o investigar un tema que me intriga", "I"],
      ["Dibujar, escribir o hacer música", "A"],
      ["Juntarme con amigos o hacer un voluntariado", "S"],
    ],
  },
  {
    text: "En un trabajo en grupo, ¿qué rol solés tomar?",
    options: [
      ["Lidero y reparto las tareas", "E"],
      ["Organizo el cronograma y reviso que todo esté completo", "C"],
      ["Me encargo del diseño y la presentación", "A"],
      ["Me aseguro de que todos se lleven bien y participen", "S"],
    ],
  },
  {
    text: "¿Cuál de estas materias te gusta (o gustaba) más?",
    options: [
      ["Biología, química o física", "I"],
      ["Matemática o contabilidad", "C"],
      ["Arte, música o literatura", "A"],
      ["Tecnología, taller o educación física", "R"],
    ],
  },
  {
    text: "¿Qué te gustaría que digan de vos?",
    options: [
      ["Que sos una persona empática y que sabe escuchar", "S"],
      ["Que sos convincente y vas por tus metas", "E"],
      ["Que sos curioso/a e inteligente", "I"],
      ["Que sos muy hábil con las manos", "R"],
    ],
  },
  {
    text: "¿Cómo sería tu lugar de trabajo ideal?",
    options: [
      ["Al aire libre, en un taller o en una obra", "R"],
      ["Una oficina ordenada, con tareas claras", "C"],
      ["Un estudio creativo, sin horarios rígidos", "A"],
      ["Moviéndome, en reuniones y viajando", "E"],
    ],
  },
  {
    text: "Frente a un problema complicado, ¿qué hacés primero?",
    options: [
      ["Busco información y analizo los datos", "I"],
      ["Lo charlo con otras personas para escuchar opiniones", "S"],
      ["Sigo un método paso a paso", "C"],
      ["Tomo una decisión rápido y me pongo en acción", "E"],
    ],
  },
  {
    text: "Si pudieras crear una app, ¿de qué sería?",
    options: [
      ["Una red para que artistas muestren sus obras", "A"],
      ["Una que use datos para predecir enfermedades o el clima", "I"],
      ["Una para acompañar la salud mental de las personas", "S"],
      ["Una para controlar robots o la casa a distancia", "R"],
    ],
  },
  {
    text: "¿Qué tipo de libro, serie o podcast elegís?",
    options: [
      ["Ciencia, misterios del universo o del cuerpo humano", "I"],
      ["Fantasía, arte o historias muy creativas", "A"],
      ["Biografías de emprendedores y líderes", "E"],
      ["Economía, finanzas o cómo funcionan las empresas", "C"],
    ],
  },
  {
    text: "Te sumás a un voluntariado. ¿Qué tarea elegís?",
    options: [
      ["Dar clases de apoyo a chicos", "S"],
      ["Construir o reparar viviendas", "R"],
      ["Llevar el registro de donaciones y el inventario", "C"],
      ["Conseguir sponsors y difundir la campaña", "E"],
    ],
  },
  {
    text: "¿Qué es lo que más disfrutás?",
    options: [
      ["Expresar ideas de forma original", "A"],
      ["Entender por qué pasan las cosas", "I"],
      ["Ver el resultado concreto de lo que hice", "R"],
      ["Que todo quede en orden y sin errores", "C"],
    ],
  },
  {
    text: "Si ganaras un premio, ¿cuál te gustaría que fuera?",
    options: [
      ["Mejor emprendimiento del año", "E"],
      ["Reconocimiento por ayudar a mi comunidad", "S"],
      ["Un premio científico por un descubrimiento", "I"],
      ["Un premio en un festival de cine o música", "A"],
    ],
  },
  {
    text: "¿Con qué herramienta te sentís más cómodo/a?",
    options: [
      ["Una caja de herramientas", "R"],
      ["Una planilla de cálculo", "C"],
      ["Un microscopio o un telescopio", "I"],
      ["Una cámara, pinceles o una guitarra", "A"],
    ],
  },
  {
    text: "¿Qué es lo que más te frustra?",
    options: [
      ["El desorden y la improvisación", "C"],
      ["No poder tomar las decisiones", "E"],
      ["Ver a alguien mal y no poder ayudar", "S"],
      ["Estar quieto/a todo el día frente a una pantalla", "R"],
    ],
  },
  {
    text: "¿A qué charla irías?",
    options: [
      ["Avances en medicina e inteligencia artificial", "I"],
      ["Cómo negociar y vender cualquier idea", "E"],
      ["Cómo despertar tu creatividad", "A"],
      ["Educación y psicología para ayudar a otros", "S"],
    ],
  },
  {
    text: "¿Cómo te imaginás en 10 años?",
    options: [
      ["Trabajando con máquinas, la naturaleza o el deporte", "R"],
      ["Con un trabajo estable, claro y bien pago", "C"],
      ["Al frente de mi propia empresa", "E"],
      ["Trabajando con personas y cambiándoles la vida", "S"],
    ],
  },
];

const LETTERS = ["A", "B", "C", "D"];

// Cantidad máxima de puntos posibles por área (para calcular porcentajes).
const MAX_POINTS = {};
for (const q of QUESTIONS) {
  for (const [, area] of q.options) MAX_POINTS[area] = (MAX_POINTS[area] || 0) + 1;
}

let current = 0;
let answers = [];
let shuffledOptions = [];
let locked = false;

const $ = (id) => document.getElementById(id);

function show(screenId) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(screenId).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  current = 0;
  answers = new Array(QUESTIONS.length).fill(null);
  // Mezclamos las opciones para que el orden no influya en las respuestas.
  shuffledOptions = QUESTIONS.map((q) => shuffle(q.options));
  renderQuestion();
  show("screen-quiz");
}

function renderQuestion() {
  const q = QUESTIONS[current];
  $("progress-text").textContent = `Pregunta ${current + 1} de ${QUESTIONS.length}`;
  $("progress-bar").style.width = `${(current / QUESTIONS.length) * 100}%`;
  $("question-text").textContent = q.text;
  $("btn-back").disabled = current === 0;

  const container = $("options");
  container.innerHTML = "";
  shuffledOptions[current].forEach(([label, area], i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", answers[current] === area ? "true" : "false");
    if (answers[current] === area) btn.classList.add("selected");
    btn.innerHTML = `<span class="letter">${LETTERS[i]}</span><span></span>`;
    btn.lastChild.textContent = label;
    btn.addEventListener("click", () => choose(area, btn));
    container.appendChild(btn);
  });
}

function choose(area, btn) {
  if (locked) return;
  locked = true;
  answers[current] = area;
  document.querySelectorAll(".option").forEach((o) => o.classList.remove("selected"));
  btn.classList.add("selected");

  // Pequeña pausa para que se vea la selección antes de avanzar.
  setTimeout(() => {
    if (current < QUESTIONS.length - 1) {
      current++;
      renderQuestion();
    } else {
      showResults();
    }
    locked = false;
  }, 220);
}

function goBack() {
  if (current > 0) {
    current--;
    renderQuestion();
  }
}

function showResults() {
  const scores = {};
  Object.keys(AREAS).forEach((k) => (scores[k] = 0));
  answers.forEach((a) => a && scores[a]++);

  const ranking = Object.keys(AREAS)
    .map((k) => ({ key: k, pct: Math.round((scores[k] / MAX_POINTS[k]) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const [first, second] = ranking;
  const top = [first];
  // Si la segunda área está cerca de la primera, también la mostramos como principal.
  if (second.pct >= first.pct - 20) top.push(second);

  $("result-title").textContent =
    top.length > 1
      ? `Sos ${AREAS[first.key].name} y ${AREAS[second.key].name}`
      : `Tu perfil es ${AREAS[first.key].name}`;

  $("result-summary").textContent =
    top.length > 1
      ? "Combinás dos áreas de interés fuertes. Estas son algunas opciones que te pueden gustar:"
      : "Tenés un área de interés muy marcada. Estas son algunas opciones que te pueden gustar:";

  const topContainer = $("result-top");
  topContainer.innerHTML = "";
  top.forEach(({ key }) => {
    const area = AREAS[key];
    const el = document.createElement("div");
    el.className = "area";
    el.style.setProperty("--color", area.color);
    el.innerHTML = `
      <h4>${area.name} · ${area.short}</h4>
      <p>${area.description}</p>
      <div class="tags">${area.careers.map((c) => `<span class="tag">${c}</span>`).join("")}</div>
    `;
    topContainer.appendChild(el);
  });

  const bars = $("result-bars");
  bars.innerHTML = "";
  ranking.forEach(({ key, pct }) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${AREAS[key].name}</span>
      <div class="bar-track"><div class="bar-fill" style="width:0;background:${AREAS[key].color}"></div></div>
      <span>${pct}%</span>
    `;
    bars.appendChild(row);
    requestAnimationFrame(() => {
      row.querySelector(".bar-fill").style.width = `${pct}%`;
    });
  });

  $("progress-bar").style.width = "100%";
  show("screen-result");
}

// Atajos de teclado: A-D o 1-4 para responder, flecha izquierda para volver.
document.addEventListener("keydown", (e) => {
  if (!$("screen-quiz").classList.contains("active")) return;
  const key = e.key.toUpperCase();
  let idx = LETTERS.indexOf(key);
  if (idx === -1 && /^[1-4]$/.test(key)) idx = Number(key) - 1;
  const options = document.querySelectorAll(".option");
  if (idx >= 0 && options[idx]) options[idx].click();
  if (e.key === "ArrowLeft") goBack();
});

$("total-questions").textContent = QUESTIONS.length;
$("btn-start").addEventListener("click", startQuiz);
$("btn-back").addEventListener("click", goBack);
$("btn-restart").addEventListener("click", () => show("screen-start"));
