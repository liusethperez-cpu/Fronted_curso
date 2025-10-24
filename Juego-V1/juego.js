/* juego.js - Mejorado para principiantes
   Comentarios en español y funciones organizadas.
   Funcionalidades añadidas:
   - Controles de duración y dificultad
   - Progreso visual del tiempo (texto + animación)
   - Sonidos generados con WebAudio (más compatibles)
   - Efectos de partículas y texto flotante al clicar
   - Accesibilidad: los pensamientos son focusables y responden a Enter/Espacio
   - Código modular y comentado para facilitar mejoras
*/

/* -------------------------
   Configuración inicial
   ------------------------- */
const gameConfig = {
  defaultDuration: 30, // segundos
  minDuration: 15,
  maxDuration: 120,
  baseSpawnInterval: 1800, // ms (se reducirá según dificultad)
  negativeThoughts: [
    "No soy lo suficientemente buena para este puesto",
    "Mis colegas son más competentes que yo",
    "No merezco el éxito que he logrado",
    "Voy a fracasar en esta presentación",
    "No tengo las habilidades de liderazgo necesarias",
    "Soy demasiado mayor para cambiar de carrera",
    "No puedo equilibrar trabajo y vida personal",
    "Mi experiencia no es suficiente",
    "Van a descubrir que no sé tanto como aparento",
    "No soy capaz de manejar más responsabilidades",
    "Mis ideas no son lo suficientemente innovadoras",
    "No tengo la confianza para negociar mi salario",
    "Soy demasiado emocional para ser líder",
    "No encajo en esta cultura corporativa",
    "Mi edad es una desventaja en el mercado laboral"
  ],
  healingPhrases: [
    { phrase: "Lo siento, te amo, perdóname, gracias", explanation: "Frases para limpiar memorias limitantes" },
    { phrase: "Soy perfecta tal como soy en este momento", explanation: "Aceptación y calma" },
    { phrase: "Mi sabiduría interior me guía hacia el éxito", explanation: "Confía en tu intuición" },
    { phrase: "Merezco abundancia y reconocimiento", explanation: "Acepta tu derecho al éxito" },
    { phrase: "Cada desafío es oportunidad", explanation: "Transforma los obstáculos" },
    { phrase: "Mi experiencia es mi fortaleza", explanation: "Valora lo aprendido" },
    { phrase: "Irradio confianza y competencia", explanation: "Permite que brille tu seguridad" },
    { phrase: "Soy canal de creatividad", explanation: "Deja fluir la inspiración" },
    { phrase: "Mi edad es sabiduría", explanation: "Celebra tu experiencia" },
    { phrase: "Equilibro con gracia mi vida", explanation: "Fluye entre tus roles" }
  ]
};

/* -------------------------
   Estado del juego
   ------------------------- */
const gameState = {
  isPlaying: false,
  score: 0,
  timeLeft: gameConfig.defaultDuration,
  thoughtsClicked: 0,
  activeThoughts: new Set(),
  spawnTimerId: null,
  gameTimerId: null,
  difficultyMultiplier: 1,
  voiceEnabled: true,
  soundEnabled: true
};

/* -------------------------
   Elementos DOM
   ------------------------- */
const elements = {
  startButton: document.getElementById('startButton'),
  gameArea: document.getElementById('game-area'),
  scoreDisplay: document.getElementById('score'),
  timeDisplay: document.getElementById('time'),
  highscoreDisplay: document.getElementById('highscore'),
  voiceToggle: document.getElementById('voiceToggle'),
  soundToggle: document.getElementById('soundToggle'),
  popSoundEl: document.getElementById('popSound'),
  bellSoundEl: document.getElementById('bellSound'),
  durationInput: document.getElementById('durationInput'),
  durationLabel: document.getElementById('durationLabel'),
  difficultySelect: document.getElementById('difficultySelect'),
  placeholder: document.getElementById('placeholder')
};

/* -------------------------
   Audio: WebAudio simple generator
   - Proporciona sonidos cortos sin necesidad de archivos externos
   ------------------------- */
let audioCtx = null;
function ensureAudioContext(){
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}
function playBeep({freq = 440, type = 'sine', duration = 0.08, gain = 0.08} = {}){
  if (!gameState.soundEnabled) return;
  try {
    ensureAudioContext();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + duration + 0.02);
  } catch (err) {
    // como fallback, intenta reproducir los elementos <audio> si existen
    try {
      if (type === 'bell' && elements.bellSoundEl) {
        elements.bellSoundEl.currentTime = 0;
        elements.bellSoundEl.play().catch(()=>{});
      } else if (elements.popSoundEl) {
        elements.popSoundEl.currentTime = 0;
        elements.popSoundEl.play().catch(()=>{});
      }
    } catch(e){}
  }
}

/* -------------------------
   Inicialización y eventos del UI
   ------------------------- */
function init() {
  // Cargar récord desde localStorage
  loadHighscore();

  // Mostrar duración inicial
  elements.durationInput.min = gameConfig.minDuration;
  elements.durationInput.max = gameConfig.maxDuration;
  elements.durationInput.value = gameConfig.defaultDuration;
  elements.durationLabel.textContent = `${gameConfig.defaultDuration} s`;
  elements.timeDisplay.textContent = formatTime(gameConfig.defaultDuration);

  // Listeners UI
  elements.startButton.addEventListener('click', toggleGame);
  elements.voiceToggle.addEventListener('change', (e) => gameState.voiceEnabled = e.target.checked);
  elements.soundToggle.addEventListener('change', (e) => gameState.soundEnabled = e.target.checked);

  elements.durationInput.addEventListener('input', (e) => {
    const sec = parseInt(e.target.value, 10);
    elements.durationLabel.textContent = `${sec} s`;
    elements.startButton.textContent = `¡Empezar (${sec} s)!`;
  });

  elements.difficultySelect.addEventListener('change', (e) => {
    gameState.difficultyMultiplier = parseFloat(e.target.value);
  });

  // Mejora para compatibilidad de voz: precargar voces si hay speechSynthesis
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices(); // disparar la carga
  }

  // Accessibility: permitir iniciar con tecla Enter desde la página
  document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying && (e.key === 'Enter' && document.activeElement === elements.startButton)) {
      toggleGame();
    }
  });
}
init();

/* -------------------------
   Iniciar / Parar juego
   ------------------------- */
function toggleGame() {
  if (gameState.isPlaying) {
    endGame();
  } else {
    startGame();
  }
}

function startGame() {
  // Preparar estado nuevo
  const duration = parseInt(elements.durationInput.value, 10) || gameConfig.defaultDuration;
  gameState.isPlaying = true;
  gameState.score = 0;
  gameState.timeLeft = duration;
  gameState.thoughtsClicked = 0;
  gameState.activeThoughts.clear();
  gameState.difficultyMultiplier = parseFloat(elements.difficultySelect.value) || 1;

  // UI
  elements.scoreDisplay.textContent = '0';
  elements.timeDisplay.textContent = formatTime(gameState.timeLeft);
  elements.startButton.textContent = 'Sanando...';
  elements.startButton.disabled = true;
  if (elements.placeholder) elements.placeholder.style.display = 'none';

  // Iniciar timers
  startGameTimer();
  scheduleNextSpawn(0); // spawn inmediato
}

function endGame() {
  gameState.isPlaying = false;

  // Limpiar timers
  if (gameState.gameTimerId) clearInterval(gameState.gameTimerId);
  if (gameState.spawnTimerId) clearTimeout(gameState.spawnTimerId);

  // Eliminar pensamientos restantes
  for (const el of Array.from(gameState.activeThoughts)) {
    if (el && el.parentElement) el.remove();
  }
  gameState.activeThoughts.clear();

  // Cancelar voz si estaba hablando
  if ('speechSynthesis' in window) speechSynthesis.cancel();

  // Guardar récord
  const isNewRecord = saveHighscore();

  // Mostrar resultados
  showResults(isNewRecord);

  // Reset UI
  const duration = parseInt(elements.durationInput.value, 10) || gameConfig.defaultDuration;
  elements.startButton.disabled = false;
  elements.startButton.textContent = `¡Empezar (${duration} s)!`;
  if (elements.placeholder) elements.placeholder.style.display = 'block';
}

/* -------------------------
   Timer principal (1s)
   ------------------------- */
function startGameTimer() {
  // Mostrar inmediatamente
  elements.timeDisplay.textContent = formatTime(gameState.timeLeft);

  gameState.gameTimerId = setInterval(() => {
    if (!gameState.isPlaying) return;
    gameState.timeLeft--;
    elements.timeDisplay.textContent = formatTime(gameState.timeLeft);

    // Efecto visual cuando queda poco tiempo
    if (gameState.timeLeft <= 5) {
      elements.timeDisplay.parentElement.style.color = '#d9534f';
    } else {
      elements.timeDisplay.parentElement.style.color = '';
    }

    if (gameState.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

/* -------------------------
   Generador y manejo de pensamientos
   ------------------------- */
function scheduleNextSpawn(delay = null) {
  if (!gameState.isPlaying) return;
  // Intervalo base reducido según dificultad y score
  const scoreFactor = Math.floor(gameState.score / 8);
  const difficulty = gameState.difficultyMultiplier + scoreFactor * 0.05;
  const spawnInterval = Math.max(600, gameConfig.baseSpawnInterval / difficulty);

  const next = delay !== null ? delay : spawnInterval;
  gameState.spawnTimerId = setTimeout(() => {
    if (!gameState.isPlaying) return;
    spawnThought();
    scheduleNextSpawn();
  }, next);
}

function spawnThought() {
  const thought = document.createElement('div');
  thought.className = 'thought';
  thought.tabIndex = 0; // focusable para accesibilidad

  // A veces producimos una variante "healing" con mayor recompensa
  const isHealing = Math.random() < 0.12; // 12% probabilidad
  if (isHealing) thought.classList.add('healing');

  const text = isHealing ? getRandomHealingPhrase().phrase : getRandomNegativeThought();
  thought.innerHTML = `<span class="text">${text}</span>`;

  // Posición aleatoria dentro del área de juego
  positionThought(thought);

  // Eventos:
  // - clic/tap
  // - teclado: Enter o Espacio
  thought.addEventListener('click', () => onThoughtClick(thought, isHealing));
  thought.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onThoughtClick(thought, isHealing);
    }
  });

  // Al perder foco, dejamos la animación normal
  thought.addEventListener('blur', () => { /* placeholder si se quiere extender */ });

  // Agregar al DOM y al estado
  elements.gameArea.appendChild(thought);
  gameState.activeThoughts.add(thought);

  // Auto-remover si no es clickeado en X tiempo (se reduce con dificultad)
  const lifeTime = Math.max(1500, 4200 / (gameState.difficultyMultiplier + gameState.score * 0.02));
  setTimeout(() => {
    if (!thought.classList.contains('clicked') && thought.parentElement) {
      // animación suave de desvanecimiento
      thought.style.transition = 'transform .4s ease, opacity .4s ease';
      thought.style.opacity = '0';
      thought.style.transform = 'scale(.9) translateY(10px)';
      setTimeout(() => {
        if (thought.parentElement) {
          thought.remove();
          gameState.activeThoughts.delete(thought);
        }
      }, 420);
    }
  }, lifeTime);
}

/* Posicionar pensamiento aleatoriamente dentro del contenedor */
function positionThought(el) {
  const rect = elements.gameArea.getBoundingClientRect();
  // Tamaño aproximado del pensamiento
  const w = Math.min(300, rect.width * 0.32);
  const h = 80;
  // Determinar máximos
  const maxX = Math.max(0, rect.width - w - 20);
  const maxY = Math.max(0, rect.height - h - 20);
  const x = Math.random() * maxX + 10;
  const y = Math.random() * maxY + 10;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

/* -------------------------
   Interacción cuando clickeas un pensamiento
   ------------------------- */
function onThoughtClick(thoughtEl, isHealing) {
  if (!gameState.isPlaying) return;
  if (thoughtEl.classList.contains('clicked')) return;

  // Marcar como clickeado para evitar dobles
  thoughtEl.classList.add('clicked');

  // Sumar puntos: las healing dan más
  const points = isHealing ? Math.ceil(2 * gameState.difficultyMultiplier) : Math.ceil(1 * gameState.difficultyMultiplier);
  gameState.score += points;
  gameState.thoughtsClicked++;
  elements.scoreDisplay.textContent = gameState.score;

  // Pequeño efecto visual de puntuación (+n)
  spawnScoreFloater(thoughtEl, `+${points}`);

  // Partículas
  spawnParticles(thoughtEl, isHealing ? ['#48bb78','#a7f3d0','#6ee7b7'] : ['#ba55d3','#ffd6f6','#9f7aea']);

  // Sonido pop y campana para healing
  if (gameState.soundEnabled) {
    playBeep({ freq: isHealing ? 880 : 540, type: 'sine', duration: 0.09, gain: 0.08 });
    if (isHealing) setTimeout(()=> playBeep({freq: 1200, type:'sine', duration:0.18, gain:0.06}), 80);
  }

  // Mostrar mensaje de sanación si es healing o mostrar frase en general
  showHealingMessage(isHealing ? getRandomHealingPhrase() : getRandomHealingPhrase());

  // Animación de desaparición
  setTimeout(() => {
    try { thoughtEl.remove(); } catch(e){}
    gameState.activeThoughts.delete(thoughtEl);
  }, 420);
}

/* -------------------------
   Mensaje de sanación (modal pequeño)
   ------------------------- */
function showHealingMessage({ phrase = "Respira y suelta", explanation = "" } = {}) {
  // Crear un modal pequeño y autodestruir
  const div = document.createElement('div');
  div.className = 'healing-message';
  div.innerHTML = `
    <h3>🌸 ${phrase} 🌸</h3>
    <p style="margin-top:8px; color:#6b7280;">${explanation}</p>
    <button id="closeHealingBtn" style="margin-top:10px; padding:8px 12px; border-radius:10px; background:linear-gradient(90deg,#48bb78,#2f855a); color:#fff; border:none;">Continuar</button>
  `;
  document.body.appendChild(div);

  // Hablar la frase si está habilitado
  if (gameState.voiceEnabled && 'speechSynthesis' in window) {
    speakText(phrase);
  }

  // Cerrar al click o después de 3.5s
  document.getElementById('closeHealingBtn').addEventListener('click', () => div.remove());
  setTimeout(() => { if (div.parentElement) div.remove(); }, 3500);
}

/* -------------------------
   Voz: síntesis (speechSynthesis)
   ------------------------- */
function speakText(text) {
  if (!('speechSynthesis' in window) || !gameState.voiceEnabled) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    u.rate = 0.9;
    u.pitch = 1.0;
    u.volume = 0.9;
    // Intentar seleccionar voz en español (si está disponible)
    const voices = speechSynthesis.getVoices();
    const v = voices.find(v => /es/.test(v.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch(e){}
}

/* -------------------------
   Partículas y efectos visuales
   ------------------------- */
function spawnParticles(originEl, colors = ['#fff']) {
  const rect = originEl.getBoundingClientRect();
  const parentRect = elements.gameArea.getBoundingClientRect();
  const originX = rect.left - parentRect.left + rect.width/2;
  const originY = rect.top - parentRect.top + rect.height/2;

  for (let i=0;i<8;i++){
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.left = `${originX}px`;
    p.style.top = `${originY}px`;
    const size = Math.random() * 8 + 6;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    elements.gameArea.appendChild(p);

    // animar con transition + transform
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 80;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    p.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(.3)`, opacity: 0 }
    ], {
      duration: 700 + Math.random() * 400,
      easing: 'cubic-bezier(.2,.8,.2,1)'
    });
    // remover después de animación
    setTimeout(()=> p.remove(), 1200);
  }
}

/* Pequeño texto flotante con la cantidad de puntos */
function spawnScoreFloater(originEl, text){
  const rect = originEl.getBoundingClientRect();
  const parentRect = elements.gameArea.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'score-floater';
  f.textContent = text;
  elements.gameArea.appendChild(f);
  f.style.left = `${rect.left - parentRect.left + rect.width/2}px`;
  f.style.top = `${rect.top - parentRect.top}px`;
  requestAnimationFrame(()=>{
    f.style.transform = 'translateY(-60px)';
    f.style.opacity = '0';
  });
  setTimeout(()=> f.remove(), 900);
}

/* -------------------------
   Utilidades: obtener pensamientos aleatorios, formato tiempo y highscore
   ------------------------- */
function getRandomNegativeThought(){
  return gameConfig.negativeThoughts[Math.floor(Math.random() * gameConfig.negativeThoughts.length)];
}
function getRandomHealingPhrase(){
  return gameConfig.healingPhrases[Math.floor(Math.random() * gameConfig.healingPhrases.length)];
}
function formatTime(seconds) {
  const m = Math.floor(seconds/60);
  const s = seconds % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/* -------------------------
   Puntuación máxima (localStorage)
   ------------------------- */
function loadHighscore(){
  const hs = parseInt(localStorage.getItem('hooponoponoHighscore') || '0', 10);
  elements.highscoreDisplay.textContent = isNaN(hs) ? '0' : hs;
}
function saveHighscore(){
  const current = parseInt(localStorage.getItem('hooponoponoHighscore') || '0', 10);
  if (gameState.score > current) {
    localStorage.setItem('hooponoponoHighscore', String(gameState.score));
    elements.highscoreDisplay.textContent = String(gameState.score);
    return true;
  }
  return false;
}

/* -------------------------
   Mostrar resultados finales
   ------------------------- */
function showResults(isNewRecord){
  const div = document.createElement('div');
  div.className = 'results';
  const rpm = Math.round((gameState.thoughtsClicked / ( (parseInt(elements.durationInput.value,10) || gameConfig.defaultDuration) / 60 )) || 0);
  div.innerHTML = `
    <h2 style="margin-top:0;">${isNewRecord ? '🌟 Nuevo Récord!' : '🌸 Sesión completada'}</h2>
    <p><strong>Puntuación:</strong> ${gameState.score}</p>
    <p><strong>Pensamientos sanados:</strong> ${gameState.thoughtsClicked}</p>
    <p><strong>Ritmo:</strong> ${rpm} /min</p>
    <p style="color:#6b7280; font-style:italic; margin-top:8px;">Cada pensamiento sanado es un paso hacia tu empoderamiento.</p>
    <div style="margin-top:12px; display:flex; gap:8px; justify-content:center;">
      <button id="closeRes" style="padding:10px 14px; border-radius:10px; background:linear-gradient(90deg,#48bb78,#2f855a); color:white; border:none;">Cerrar</button>
      <button id="again" style="padding:10px 14px; border-radius:10px; background:linear-gradient(90deg,#ba55d3,#9f7aea); color:white; border:none;">Jugar otra vez</button>
    </div>
  `;
  document.body.appendChild(div);
  document.getElementById('closeRes').addEventListener('click', ()=> div.remove());
  document.getElementById('again').addEventListener('click', ()=> {
    div.remove();
    startGame();
  });
  setTimeout(()=> { if (div.parentElement) div.remove(); }, 10000);
}

/* -------------------------
   Formato y fin del archivo
   ------------------------- */
// NOTA: Este archivo está diseñado para que un principiante pueda leer,
// entender y modificarlo. Si quieres mejorar:
// - Añade imágenes o SVG para los pensamientos
// - Guarda estadísticas más detalladas en localStorage
// - Añade niveles con metas (p. ej. 50 puntos para pasar al siguiente nivel)
// - Integra más voces o sonidos personalizados

