// ====== Datos de ejemplo (reemplazá por tu JSON real) ======
// Agregá la propiedad youtubeId (solo el ID del video, no la URL completa)
const allExercises = [
  { name: "Sentadilla con barra", muscle: "Piernas", youtubeId: "1xMaFs0L3ao" },
  { name: "Prensa de piernas", muscle: "Piernas", youtubeId: "IZxyjW7MPJQ" },
  { name: "Press de banca", muscle: "Pecho", youtubeId: "rT7DgCr-3pg" },
  { name: "Aperturas con mancuernas", muscle: "Pecho", youtubeId: "eozdVDA78K0" },
  { name: "Peso muerto convencional", muscle: "Espalda", youtubeId: "op9kVnSso6Q" },
  { name: "Remo con barra", muscle: "Espalda", youtubeId: "vT2GjY_Umpw" },
  { name: "Curl de bíceps con barra", muscle: "Bíceps", youtubeId: "av7-8igSXTs" },
  { name: "Curl alterno con mancuernas", muscle: "Bíceps", youtubeId: "ykJmrZ5v0Oo" },
];

// ====== Elementos del DOM ======
const muscleFilter   = document.getElementById("muscleFilter");
const searchInput    = document.getElementById("searchInput");
const exerciseList   = document.getElementById("exerciseList");
const playerSection  = document.getElementById("playerSection");
const playerContainer= document.getElementById("playerContainer");
const nowPlaying     = document.getElementById("nowPlaying");

// ====== Estado ======
let selectedId = null;

// ====== Utilidades ======
function uniqueSortedMuscles(data) {
  return [...new Set(data.map(ex => ex.muscle))].sort((a, b) => a.localeCompare(b, 'es'));
}

function sanitizeText(t) {
  return (t || "").toString().trim().toLowerCase();
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
function loadVideo(exercise, autoplay = false) {
  if (!exercise || !exercise.youtubeId) {
    playerContainer.innerHTML = "";
    nowPlaying.textContent = "";
    return;
  }
  const src = `https://www.youtube-nocookie.com/embed/${exercise.youtubeId}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`;

  playerContainer.innerHTML = `
    <iframe
      src="${src}"
      title="${exercise.name} — ${exercise.muscle}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  `;

  nowPlaying.textContent = `${exercise.name} — ${exercise.muscle}`;
}

// ====== Render de ejercicios ======
function renderExercises(trigger = "init") {
  const filterValue = muscleFilter.value;
  const q = sanitizeText(searchInput.value);

  const filtered = allExercises.filter(ex => {
    const byMuscle = filterValue === "__ALL__" || ex.muscle === filterValue;
    const byText = sanitizeText(ex.name).includes(q) || sanitizeText(ex.muscle).includes(q);
    return byMuscle && byText;
  });

  exerciseList.innerHTML = "";

  if (filtered.length === 0) {
    selectedId = null;
    playerContainer.innerHTML = "";
    nowPlaying.textContent = "";
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No se encontraron ejercicios para ese filtro.";
    exerciseList.appendChild(empty);
    return;
  }

  // Mantener selección si sigue estando en el filtrado; si no, seleccionar el primero
  const stillSelected = filtered.find(ex => ex.youtubeId === selectedId);
  const current = stillSelected || filtered[0];
  if (!stillSelected) selectedId = current.youtubeId;

  // Pintar cards
  filtered.forEach(ex => {
    const card = document.createElement("div");
    card.className = `exercise-card${ex.youtubeId === selectedId ? " active" : ""}`;
    card.dataset.id = ex.youtubeId;
    card.innerHTML = `
      <h3>${ex.name}</h3>
      <p>${ex.muscle}</p>
    `;
    card.addEventListener("click", () => {
      if (selectedId !== ex.youtubeId) {
        selectedId = ex.youtubeId;
        loadVideo(ex, true); // autoplay al hacer click
        highlightSelection();
        // Scroll al reproductor para UX en móvil
        playerSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    exerciseList.appendChild(card);
  });

  // Cargar video (sin autoplay) cuando el listado cambia por filtro/búsqueda/init
  loadVideo(current, false);
  highlightSelection();
}

function highlightSelection() {
  const cards = exerciseList.querySelectorAll(".exercise-card");
  cards.forEach(card => {
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
  Si querés leer desde /data/ejercicios.json, asegurate que cada objeto tenga:
  { "name": "...", "muscle": "...", "youtubeId": "..." }

  Ejemplo rápido:
  fetch("data/ejercicios.json")
    .then(r => r.json())
    .then(data => {
      allExercises.length = 0;
      allExercises.push(...data);
      fillMuscleOptions();
      renderExercises();
    });
*/