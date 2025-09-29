// ====== Datos de ejemplo (reemplazá por tu JSON real) ======
// Acepta youtubeId o youtubeUrl; se extrae el ID automáticamente
const allExercises = [
  { name: "Sentadilla con barra", muscle: "Piernas", youtubeId: "1xMaFs0L3ao" },
  { name: "Prensa de piernas", muscle: "Piernas", youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ" },
  { name: "Press de banca", muscle: "Pecho", youtubeId: "rT7DgCr-3pg" },
  { name: "Aperturas con mancuernas", muscle: "Pecho", youtubeUrl: "https://youtu.be/eozdVDA78K0" },
  { name: "Peso muerto convencional", muscle: "Espalda", youtubeId: "op9kVnSso6Q" },
  { name: "Remo con barra", muscle: "Espalda", youtubeUrl: "https://www.youtube.com/embed/vT2GjY_Umpw" },
  { name: "Curl de bíceps con barra", muscle: "Bíceps", youtubeId: "av7-8igSXTs" },
  { name: "Curl alterno con mancuernas", muscle: "Bíceps", youtubeUrl: "https://youtu.be/ykJmrZ5v0Oo" },
];

// ====== Elementos del DOM ======
const muscleFilter    = document.getElementById("muscleFilter");
const searchInput     = document.getElementById("searchInput");
const exerciseList    = document.getElementById("exerciseList");
const playerSection   = document.getElementById("playerSection");
const playerContainer = document.getElementById("playerContainer");
const nowPlaying      = document.getElementById("nowPlaying");
const watchOnYT       = document.getElementById("watchOnYT");

// ====== Estado ======
let selectedId = null;

// ====== Utilidades ======
function uniqueSortedMuscles(data) {
  return [...new Set(data.map(ex => ex.muscle))].sort((a, b) => a.localeCompare(b, 'es'));
}

function sanitizeText(t) {
  return (t || "").toString().trim().toLowerCase();
}

// Extrae el ID de YouTube desde ID o distintas formas de URL
function getYouTubeId(ex) {
  const raw = (ex.youtubeId || ex.youtubeUrl || "").trim();
  if (!raw) return null;
  // Si parece ID (sin http y con caracteres válidos), devolver tal cual
  if (/^[a-zA-Z0-9_-]{8,}$/.test(raw) && !raw.includes("http")) return raw;
  try {
    const url = new URL(raw);
    if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "");
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const path = url.pathname.split("/").filter(Boolean);
    const embedIdx = path.indexOf("embed");
    if (embedIdx !== -1 && path[embedIdx + 1]) return path[embedIdx + 1];
    const shortsIdx = path.indexOf("shorts");
    if (shortsIdx !== -1 && path[shortsIdx + 1]) return path[shortsIdx + 1];
    return path[path.length - 1] || null;
  } catch {
    return raw;
  }
}

function getThumbnailUrl(id) {
  // hqdefault es liviana y confiable
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function buildEmbedUrl(id, autoplay = false) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    ...(autoplay ? { autoplay: "1" } : {}),
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function buildWatchUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}

// ====== UI: llenar opciones del select ======
function fillMuscleOptions() {
  muscleFilter.innerHTML = `<option value="__ALL__">Todos los músculos</option>`;
  uniqueSortedMuscles(allExercises).forEach(m => {
    const o = document.createElement("option");
    o.value = m;
    o.textContent = m;
    muscleFilter.appendChild(o);
  });
}

// ====== Reproductor ======
function renderPlayerPlaceholder(exercise) {
  const id = getYouTubeId(exercise);
  if (!id) {
    playerContainer.innerHTML = `<div class="empty-state">Este ejercicio no tiene un video válido configurado.</div>`;
    nowPlaying.textContent = "";
    watchOnYT.href = "#";
    watchOnYT.style.visibility = "hidden";
    return;
  }

  const thumb = getThumbnailUrl(id);

  playerContainer.innerHTML = `
    <div class="player-placeholder" role="button" tabindex="0" aria-label="Reproducir ${exercise.name}">
      <button class="play-btn" aria-hidden="true">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14l11-7z"></path>
        </svg>
      </button>
    </div>
  `;

  const placeholder = playerContainer.querySelector(".player-placeholder");
  placeholder.style.backgroundImage = `url('${thumb}')`;

  const triggerPlay = () => {
    loadVideo(exercise, true);
  };

  placeholder.addEventListener("click", triggerPlay);
  placeholder.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerPlay();
    }
  });

  nowPlaying.textContent = `${exercise.name} — ${exercise.muscle}`;
  watchOnYT.href = buildWatchUrl(id);
  watchOnYT.style.visibility = "visible";
}

function loadVideo(exercise, autoplay = false) {
  const id = getYouTubeId(exercise);
  if (!id) return;

  const src = buildEmbedUrl(id, autoplay);
  playerContainer.innerHTML = `
    <iframe
      src="${src}"
      title="${exercise.name} — ${exercise.muscle}"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  `;
}

// ====== Render de ejercicios ======
function renderExercises(trigger = "init") {
  const filterValue = muscleFilter.value;
  const q = sanitizeText(searchInput.value);

  const filtered = allExercises.filter(ex => {
    const byMuscle = filterValue === "__ALL__" || ex.muscle === filterValue;
    const byText = sanitizeText(ex.name).includes(q) || sanitizeText(ex.muscle).includes(q);
    const hasId = !!getYouTubeId(ex);
    return byMuscle && byText && hasId;
  });

  exerciseList.innerHTML = "";

  if (filtered.length === 0) {
    selectedId = null;
    playerContainer.innerHTML = "";
    nowPlaying.textContent = "";
    watchOnYT.href = "#";
    watchOnYT.style.visibility = "hidden";
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No se encontraron ejercicios para ese filtro.";
    exerciseList.appendChild(empty);
    return;
  }

  // Mantener selección si sigue estando; si no, elegir el primero
  const stillSelected = filtered.find(ex => getYouTubeId(ex) === selectedId);
  const current = stillSelected || filtered[0];
  selectedId = getYouTubeId(current);

  // Pintar cards
  filtered.forEach(ex => {
    const id = getYouTubeId(ex);
    const card = document.createElement("div");
    card.className = `exercise-card${id === selectedId ? " active" : ""}`;
    card.dataset.id = id;
    card.innerHTML = `
      <h3>${ex.name}</h3>
      <p>${ex.muscle}</p>
    `;

    const selectExercise = () => {
      if (selectedId !== id) selectedId = id;
      renderPlayerPlaceholder(ex); // no autoplay al cambiar por filtro o click
      highlightSelection();
      playerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    card.addEventListener("click", selectExercise);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectExercise();
      }
    });
    card.tabIndex = 0; // accesible con teclado

    exerciseList.appendChild(card);
  });

  // Mostrar placeholder del ejercicio actual (sin cargar iframe)
  renderPlayerPlaceholder(current);
  highlightSelection();
}

function highlightSelection() {
  exerciseList.querySelectorAll(".exercise-card").forEach(card => {
    card.classList.toggle("active", card.dataset.id === selectedId);
  });
}

// ====== Eventos ======
muscleFilter.addEventListener("change", () => renderExercises("filter"));
searchInput.addEventListener("input", () => renderExercises("search"));

// ====== Inicio ======
fillMuscleOptions();
renderExercises();

/*
  ====== Integración con JSON externo (opcional) ======
  Estructura recomendada por ejercicio:
  { "name": "...", "muscle": "...", "youtubeId": "op9kVnSso6Q" }
  También acepta:
  { "youtubeUrl": "https://youtu.be/op9kVnSso6Q" } / watch?v= / embed / shorts

  Ejemplo:
  fetch("data/ejercicios.json")
    .then(r => r.json())
    .then(data => {
      allExercises.length = 0;
      allExercises.push(...data);
      fillMuscleOptions();
      renderExercises();
    });
*/
