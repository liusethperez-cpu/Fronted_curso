/* -----------------------------------------------------------
   Hooponopono — Juego de "sanación" de pensamientos negativos
   Versión comentada: explicaciones en español añadidas
   -----------------------------------------------------------

   Este archivo contiene la lógica principal del juego:
   - Configuración (frases, tiempos, sonidos)
   - Estado global del juego
   - Inicialización de la UI y eventos
   - Generación/posicionamiento de "pensamientos" (elementos)
   - Manejo de clics / animaciones / partículas
   - Sonido y síntesis de voz (opcional)
   - Guardado de highscore en localStorage

   He añadido comentarios explicativos en cada bloque y función
   para que entiendas qué hace cada parte y por qué.
   ----------------------------------------------------------- */

 /* -------------------------
    Configuración
    ------------------------- */
 // gameConfig agrupa valores estáticos y listas de frases usadas
 const gameConfig = {
   // Duración por defecto (segundos) y límites para el input del usuario
   defaultDuration: 30,
   minDuration: 15,
   maxDuration: 120,

   // Intervalo base (ms) entre "spawn" de pensamientos; se ajusta por dificultad
   baseSpawnInterval: 1800,

   // Lista de pensamientos negativos que aparecen en pantalla
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

   // Frases "sanadoras" con una breve explicación (se muestran al clicar)
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
 // gameState almacena el estado actual (mutado durante el juego)
 const gameState = {
   isPlaying: false,             // si la partida está en curso
   score: 0,                     // puntuación actual
   timeLeft: gameConfig.defaultDuration, // tiempo restante (segundos)
   thoughtsClicked: 0,           // contador de pensamientos "sanados"
   activeThoughts: new Set(),    // conjunto de elementos DOM actualmente en pantalla
   spawnTimerId: null,           // id del timeout de spawn
   gameTimerId: null,            // id del interval del temporizador general
   difficultyMultiplier: 1,      // multiplicador de dificultad (ajustable)
   voiceEnabled: true,           // activar/desactivar voz TTS
   soundEnabled: true            // activar/desactivar sonidos WebAudio
 };

 /* -------------------------
    Elementos DOM
    ------------------------- */
 // Cacheamos referencias a elementos del DOM para usarlas en el juego
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
    Audio (WebAudio) - genera tonos cortos
    ------------------------- */
 // Usamos WebAudio para generar sonidos cortos tipo "beep".
 // Si falla (por permisos o compatibilidad), hay un fallback
 // que intenta reproducir un elemento <audio> si existe.
 let audioCtx = null;
 function ensureAudioContext(){
   if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
 }

 // playBeep: crea un oscilador breve y lo reproduce.
 // Parámetros opcionales: freq, type, duration, gain
 function playBeep({freq = 440, type = 'sine', duration = 0.08, gain = 0.08} = {}){
   if (!gameState.soundEnabled) return; // respeta la preferencia de sonido
   try {
     ensureAudioContext();
     const o = audioCtx.createOscillator();
     const g = audioCtx.createGain();
     o.type = type;
     o.frequency.value = freq;
     g.gain.setValueAtTime(gain, audioCtx.currentTime);
     // decaimiento rápido para que el sonido no sea abrupto
     g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
     o.connect(g);
     g.connect(audioCtx.destination);
     o.start();
     o.stop(audioCtx.currentTime + duration + 0.02);
   } catch (err) {
     // Fallback: si WebAudio falla, intentamos reproducir un <audio> predefinido
     try {
       if (elements.popSoundEl) { elements.popSoundEl.currentTime = 0; elements.popSoundEl.play().catch(()=>{}); }
     } catch(e){}
   }
 }

 /* -------------------------
    Inicialización
    ------------------------- */
 // init: configura UI inicial, cargas y event listeners.
 function init() {
   loadHighscore(); // carga highscore desde localStorage
   // configuramos límites del input de duración
   elements.durationInput.min = gameConfig.minDuration;
   elements.durationInput.max = gameConfig.maxDuration;
   elements.durationInput.value = gameConfig.defaultDuration;
   elements.durationLabel.textContent = `${gameConfig.defaultDuration} s`;
   elements.timeDisplay.textContent = formatTime(gameConfig.defaultDuration);

   // Botón iniciar / detener
   elements.startButton.addEventListener('click', toggleGame);

   // Toggles para voz y sonido (checkboxes)
   elements.voiceToggle.addEventListener('change', (e) => gameState.voiceEnabled = e.target.checked);
   elements.soundToggle.addEventListener('change', (e) => gameState.soundEnabled = e.target.checked);

   // Input de duración: actualiza etiqueta y texto del botón
   elements.durationInput.addEventListener('input', (e) => {
     const s = parseInt(e.target.value,10);
     elements.durationLabel.textContent = `${s} s`;
     elements.startButton.textContent = `¡Empezar (${s} s)!`;
   });

   // Selección de dificultad (multiplicador)
   elements.difficultySelect.addEventListener('change', (e) => {
     gameState.difficultyMultiplier = parseFloat(e.target.value);
   });

   // Pre-carga de voces (algunas implementaciones requieren llamada previa)
   if ('speechSynthesis' in window) speechSynthesis.getVoices();

   // Atajo teclado: si el foco está en el botón y se presiona Enter, se inicia
   document.addEventListener('keydown', (e) => {
     if (!gameState.isPlaying && (e.key === 'Enter' && document.activeElement === elements.startButton)) {
       toggleGame();
     }
   });
 }
 init();

 /* -------------------------
    Iniciar / detener
    ------------------------- */
 // toggleGame: alterna entre startGame y endGame
 function toggleGame() {
   if (gameState.isPlaying) endGame();
   else startGame();
 }

 // startGame: inicializa variables de partida y lanza timers
 function startGame() {
   const duration = parseInt(elements.durationInput.value,10) || gameConfig.defaultDuration;
   gameState.isPlaying = true;
   gameState.score = 0;
   gameState.timeLeft = duration;
   gameState.thoughtsClicked = 0;
   gameState.activeThoughts.clear();
   gameState.difficultyMultiplier = parseFloat(elements.difficultySelect.value) || 1;

   elements.scoreDisplay.textContent = '0';
   elements.timeDisplay.textContent = formatTime(gameState.timeLeft);
   elements.startButton.textContent = 'Sanando...';
   elements.startButton.disabled = true;
   if (elements.placeholder) elements.placeholder.style.display = 'none';

   startGameTimer();       // contador principal
   scheduleNextSpawn(0);   // primer spawn inmediato (delay = 0)
 }

 // endGame: detiene timers, limpia elementos y guarda el resultado
 function endGame() {
   gameState.isPlaying = false;
   if (gameState.gameTimerId) clearInterval(gameState.gameTimerId);
   if (gameState.spawnTimerId) clearTimeout(gameState.spawnTimerId);

   // Eliminamos todos los pensamientos activos del DOM
   for (const el of Array.from(gameState.activeThoughts)) {
     if (el && el.parentElement) el.remove();
   }
   gameState.activeThoughts.clear();

   // Cancelamos TTS si se estaba reproduciendo
   if ('speechSynthesis' in window) speechSynthesis.cancel();

   const isNewRecord = saveHighscore();
   showResults(isNewRecord);

   const duration = parseInt(elements.durationInput.value,10) || gameConfig.defaultDuration;
   elements.startButton.disabled = false;
   elements.startButton.textContent = `¡Empezar (${duration} s)!`;
   if (elements.placeholder) elements.placeholder.style.display = 'block';
 }

 /* -------------------------
    Timer
    ------------------------- */
 // startGameTimer: actualiza UI cada segundo y finaliza partida al llegar a 0
 function startGameTimer() {
   elements.timeDisplay.textContent = formatTime(gameState.timeLeft);
   gameState.gameTimerId = setInterval(() => {
     if (!gameState.isPlaying) return;
     gameState.timeLeft--;
     elements.timeDisplay.textContent = formatTime(gameState.timeLeft);
     // Cambia color cuando quedan pocos segundos
     if (gameState.timeLeft <= 5) elements.timeDisplay.parentElement.style.color = '#d9534f';
     else elements.timeDisplay.parentElement.style.color = '';
     if (gameState.timeLeft <= 0) endGame();
   }, 1000);
 }

 /* -------------------------
    Spawn pensamientos
    ------------------------- */
 // scheduleNextSpawn: calcula intervalo dinámico y programa spawn siguiente
 function scheduleNextSpawn(delay = null) {
   if (!gameState.isPlaying) return;
   // Aumenta dificultad suavemente según puntuación
   const scoreFactor = Math.floor(gameState.score / 8);
   const difficulty = gameState.difficultyMultiplier + scoreFactor * 0.05;
   // Calcula intervalo (ms) con tope mínimo para evitar spawn excesivo
   const spawnInterval = Math.max(600, gameConfig.baseSpawnInterval / difficulty);
   const next = delay !== null ? delay : spawnInterval;
   gameState.spawnTimerId = setTimeout(() => {
     if (!gameState.isPlaying) return;
     spawnThought();
     scheduleNextSpawn();
   }, next);
 }

 // spawnThought: crea elemento DOM con pensamiento / frase sanadora y lo posiciona
 function spawnThought() {
   const thought = document.createElement('div');
   thought.className = 'thought';
   thought.tabIndex = 0; // hace el elemento enfocables para accesibilidad

   // Pequeña probabilidad de que el pensamiento sea "sanador"
   const isHealing = Math.random() < 0.12;
   if (isHealing) thought.classList.add('healing');

   // Icono visible (emoji) y texto: healing usa frases sanadoras
   const icon = isHealing ? '🌿' : '💭';
   const text = isHealing ? getRandomHealingPhrase().phrase : getRandomNegativeThought();
   thought.innerHTML = `<span class="icon">${icon}</span><span class="text">${text}</span>`;

   positionThought(thought); // coloca el pensamiento dentro del área de juego

   // Manejo de interacción: click y teclas (Enter / Space)
   thought.addEventListener('click', () => onThoughtClick(thought, isHealing));
   thought.addEventListener('keydown', (e) => {
     if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onThoughtClick(thought, isHealing); }
   });

   elements.gameArea.appendChild(thought);
   gameState.activeThoughts.add(thought);

   // Duración de vida del pensamiento antes de desaparecer solo
   const lifeTime = Math.max(1500, 4200 / (gameState.difficultyMultiplier + gameState.score * 0.02));
   setTimeout(() => {
     // Si no se ha clicado, se desvanece y removemos del DOM/estado
     if (!thought.classList.contains('clicked') && thought.parentElement) {
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

 // positionThought: calcula una posición aleatoria dentro del área de juego
 function positionThought(el) {
   const rect = elements.gameArea.getBoundingClientRect();
   // Tamaño máximo del pensamiento para no ocupar demasiado espacio
   const w = Math.min(320, rect.width * 0.36);
   const h = 90;
   const maxX = Math.max(0, rect.width - w - 20);
   const maxY = Math.max(0, rect.height - h - 20);
   const x = Math.random() * maxX + 10;
   const y = Math.random() * maxY + 10;
   el.style.left = `${x}px`;
   el.style.top = `${y}px`;
 }

 /* -------------------------
    Al clicar pensamiento: animaciones mejoradas
    ------------------------- */
 // onThoughtClick: lógica que ocurre al "sanar" un pensamiento
 function onThoughtClick(thoughtEl, isHealing) {
   if (!gameState.isPlaying) return;
   if (thoughtEl.classList.contains('clicked')) return; // evita doble conteo

   thoughtEl.classList.add('clicked');

   // Puntos: los sanadores otorgan más por defecto
   const points = isHealing ? Math.ceil(2 * gameState.difficultyMultiplier) : Math.ceil(1 * gameState.difficultyMultiplier);
   gameState.score += points;
   gameState.thoughtsClicked++;
   elements.scoreDisplay.textContent = gameState.score;

   // Pequeño texto flotante que muestra los puntos ganados
   spawnScoreFloater(thoughtEl, `+${points}`);

   // Añadimos clases/efectos visuales: explode, partículas y icons
   thoughtEl.classList.add('explode');

   // Colores de partículas según si es healing o negativo
   spawnParticles(thoughtEl, isHealing ? ['#48bb78','#a7f3d0','#6ee7b7'] : ['#ba55d3','#ffd6f6','#9f7aea']);

   // Iconos voladores (emoji) como decoración
   spawnFlyingIcons(thoughtEl, isHealing ? ['🌿','✨','🕊️'] : ['✨','🌸','🦋']);

   // Sonidos: beep(s) cortos; se respetan preferencias de sonido
   if (gameState.soundEnabled) {
     playBeep({ freq: isHealing ? 880 : 540, type: 'sine', duration: 0.09, gain: 0.08 });
     if (isHealing) setTimeout(()=> playBeep({freq:1200,type:'sine',duration:0.16,gain:0.06}),90);
   }

   // Mostrar brevemente un mensaje sanador con explicación
   showHealingMessage(getRandomHealingPhrase());

   // Removemos el elemento tras la animación (coincide con la duración CSS)
   setTimeout(() => {
     try { thoughtEl.remove(); } catch(e){}
     gameState.activeThoughts.delete(thoughtEl);
   }, 480);
 }

 /* -------------------------
    Mensajes / voz
    ------------------------- */
 // showHealingMessage: crea un popup temporal con la frase sanadora + explicación
 function showHealingMessage({ phrase = "Respira y suelta", explanation = "" } = {}) {
   const div = document.createElement('div');
   div.className = 'healing-message';
   div.innerHTML = `
     <h3>🌸 ${phrase} 🌸</h3>
     <p style="margin-top:8px; color:#6b7280;">${explanation}</p>
     <button id="closeHealingBtn" style="margin-top:10px; padding:8px 12px; border-radius:10px; background:linear-gradient(90deg,#48bb78,#2f855a); color:#fff; border:none;">Continuar</button>
   `;
   document.body.appendChild(div);
   // Si está activada la voz, la reproducimos
   if (gameState.voiceEnabled && 'speechSynthesis' in window) speakText(phrase);
   document.getElementById('closeHealingBtn').addEventListener('click', () => div.remove());
   // Auto-cierre tras unos segundos para no bloquear la UI
   setTimeout(() => { if (div.parentElement) div.remove(); }, 3500);
 }

 // speakText: síntesis de voz con configuración básica (es-ES por defecto)
 function speakText(text) {
   if (!('speechSynthesis' in window) || !gameState.voiceEnabled) return;
   try {
     speechSynthesis.cancel(); // cancelamos posibles voces previas
     const u = new SpeechSynthesisUtterance(text);
     u.lang = 'es-ES';
     u.rate = 0.9;
     u.pitch = 1.0;
     u.volume = 0.9;
     // Intentamos seleccionar una voz en español si existe
     const voices = speechSynthesis.getVoices();
     const v = voices.find(v => /es/.test(v.lang));
     if (v) u.voice = v;
     speechSynthesis.speak(u);
   } catch(e){}
 }

 /* -------------------------
    Efectos visuales: partículas y flying icons
    ------------------------- */
 // spawnParticles: crea pequeñas "partículas" que explotan desde el origen
 function spawnParticles(originEl, colors = ['#fff']) {
   const rect = originEl.getBoundingClientRect();
   const parentRect = elements.gameArea.getBoundingClientRect();
   // Coordenadas relativas al contenedor del juego
   const originX = rect.left - parentRect.left + rect.width/2;
   const originY = rect.top - parentRect.top + rect.height/2;

   for (let i=0;i<10;i++){
     const p = document.createElement('div');
     p.className = 'particle';
     p.style.background = colors[Math.floor(Math.random()*colors.length)];
     p.style.left = `${originX}px`;
     p.style.top = `${originY}px`;
     const size = Math.random() * 10 + 6;
     p.style.width = `${size}px`;
     p.style.height = `${size}px`;
     elements.gameArea.appendChild(p);

     // Calculamos movimiento aleatorio radial
     const angle = Math.random() * Math.PI * 2;
     const distance = 30 + Math.random() * 100;
     const dx = Math.cos(angle) * distance;
     const dy = Math.sin(angle) * distance;
     p.animate([
       { transform: 'translate(0,0) scale(1)', opacity: 1 },
       { transform: `translate(${dx}px, ${dy}px) scale(.2)`, opacity: 0 }
     ], {
       duration: 700 + Math.random() * 500,
       easing: 'cubic-bezier(.2,.8,.2,1)'
     });
     // Eliminamos el nodo tras la animación
     setTimeout(()=> p.remove(), 1200);
   }
 }

 /* Iconos voladores (emoji) que suben y desaparecen */
 function spawnFlyingIcons(originEl, icons = ['✨']) {
   const rect = originEl.getBoundingClientRect();
   const parentRect = elements.gameArea.getBoundingClientRect();
   const originX = rect.left - parentRect.left + rect.width/2;
   const originY = rect.top - parentRect.top + 8;

   for (let i=0;i<3;i++){
     const ico = document.createElement('div');
     ico.className = 'particle';
     ico.style.width = '20px';
     ico.style.height = '20px';
     ico.style.borderRadius = '4px';
     ico.style.fontSize = '18px';
     ico.style.display = 'flex';
     ico.style.alignItems = 'center';
     ico.style.justifyContent = 'center';
     ico.textContent = icons[Math.floor(Math.random()*icons.length)];
     ico.style.left = `${originX + (Math.random()*30-15)}px`;
     ico.style.top = `${originY}px`;
     elements.gameArea.appendChild(ico);

     const dx = (Math.random()-0.5) * 80;
     const dy = -60 - Math.random()*80;
     ico.animate([
       { transform: 'translate(0,0) scale(1)', opacity:1 },
       { transform: `translate(${dx}px, ${dy}px) scale(.7)`, opacity:0 }
     ], {
       duration: 900 + Math.random()*400,
       easing: 'cubic-bezier(.2,.8,.2,1)'
     });
     setTimeout(()=> ico.remove(), 1200);
   }
 }

 /* Texto flotante +puntos */
 function spawnScoreFloater(originEl, text){
   const rect = originEl.getBoundingClientRect();
   const parentRect = elements.gameArea.getBoundingClientRect();
   const f = document.createElement('div');
   f.className = 'score-floater';
   f.textContent = text;
   elements.gameArea.appendChild(f);
   f.style.left = `${rect.left - parentRect.left + rect.width/2}px`;
   f.style.top = `${rect.top - parentRect.top}px`;
   // Forzamos el frame para animar transform/opacity con CSS
   requestAnimationFrame(()=>{
     f.style.transform = 'translateY(-60px)';
     f.style.opacity = '0';
   });
   setTimeout(()=> f.remove(), 900);
 }

 /* -------------------------
    Utilidades y highscore
    ------------------------- */
 // Selección aleatoria de pensamientos / frases
 function getRandomNegativeThought(){ return gameConfig.negativeThoughts[Math.floor(Math.random()*gameConfig.negativeThoughts.length)]; }
 function getRandomHealingPhrase(){ return gameConfig.healingPhrases[Math.floor(Math.random()*gameConfig.healingPhrases.length)]; }

 // formatea segundos a MM:SS para mostrar en UI
 function formatTime(seconds){ const m = Math.floor(seconds/60); const s = seconds%60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }

 // Carga highscore desde localStorage y actualiza UI
 function loadHighscore(){
   const hs = parseInt(localStorage.getItem('hooponoponoHighscore') || '0', 10);
   elements.highscoreDisplay.textContent = isNaN(hs) ? '0' : hs;
 }

 // Guarda highscore si la puntuación actual es mayor
 function saveHighscore(){
   const current = parseInt(localStorage.getItem('hooponoponoHighscore') || '0', 10);
   if (gameState.score > current) {
     localStorage.setItem('hooponoponoHighscore', String(gameState.score));
     elements.highscoreDisplay.textContent = String(gameState.score);
     return true;
   }
   return false;
 }

 /* Resultados finales */
 function showResults(isNewRecord){
   const div = document.createElement('div');
   div.className = 'results';
   const duration = parseInt(elements.durationInput.value,10) || gameConfig.defaultDuration;
   // Calcula RPM (pensamientos por minuto) como estadística sencilla
   const rpm = Math.round((gameState.thoughtsClicked / (duration / 60)) || 0);
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
   document.getElementById('again').addEventListener('click', ()=> { div.remove(); startGame(); });
   // Auto-cierre tras 10s para evitar que bloquee la experiencia
   setTimeout(()=> { if (div.parentElement) div.remove(); }, 10000);
 }

 /* Fin del archivo - sugerencias para mejorar:
    - Cambiar la ruta del logo si es necesario
    - Añadir más assets (SVG) para reemplazar los emojis por iconos vectoriales
    - Ajustar colores y tiempos de animación según preferencia
 */