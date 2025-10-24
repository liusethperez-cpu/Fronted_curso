avaScript (juego.js):

// Configuración del juego Ho'oponopono
const gameConfig = {
  duration: 30000, // 30 segundos
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
    {
      phrase: "Lo siento, te amo, perdóname, gracias",
      explanation: "Las cuatro frases sagradas del Ho'oponopono para limpiar memorias limitantes"
    },
    {
      phrase: "Soy perfecta tal como soy en este momento",
      explanation: "Acepto mi perfección divina y mi proceso de crecimiento"
    },
    {
      phrase: "Mi sabiduría interior me guía hacia el éxito",
      explanation: "Confío en mi intuición y experiencia acumulada"
    },
    {
      phrase: "Merezco abundancia y reconocimiento por mi trabajo",
      explanation: "Abrazo mi derecho divino a la prosperidad y el éxito"
    },
    {
      phrase: "Cada desafío es una oportunidad de crecimiento",
      explanation: "Transformo los obstáculos en escalones hacia mi evolución"
    },
    {
      phrase: "Mi experiencia de vida es mi mayor fortaleza",
      explanation: "Honro la sabiduría que he ganado a través de mis experiencias"
    },
    {
      phrase: "Irradio confianza y competencia natural",
      explanation: "Mi luz interior brilla y atrae oportunidades perfectas"
    },
    {
      phrase: "Soy un canal de creatividad e innovación",
      explanation: "Permito que la inspiración divina fluya a través de mí"
    },
    {
      phrase: "Mi edad es sabiduría, mi experiencia es poder",
      explanation: "Celebro cada año como una acumulación de conocimiento valioso"
    },
    {
      phrase: "Equilibro con gracia todos los aspectos de mi vida",
      explanation: "Fluyo armoniosamente entre mis diferentes roles y responsabilidades"
    }
  ]
};

// Variables del juego
let gameState = {
  isPlaying: false,
  score: 0,
  timeLeft: 30,
  thoughtsClicked: 0,
  activeThoughts: [],
  gameTimer: null,
  spawnTimer: null,
  difficulty: 1,
  voiceEnabled: true,
  soundEnabled: true
};

// Elementos del DOM
const elements = {
  startButton: document.getElementById('startButton'),
  gameArea: document.getElementById('game-area'),
  scoreDisplay: document.getElementById('score'),
  timeDisplay: document.getElementById('time'),
  highscoreDisplay: document.getElementById('highscore'),
  voiceToggle: document.getElementById('voiceToggle'),
  soundToggle: document.getElementById('soundToggle'),
  popSound: document.getElementById('popSound'),
  bellSound: document.getElementById('bellSound')
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  loadHighscore();
  setupEventListeners();
  
  // Verificar soporte de síntesis de voz
  if (!('speechSynthesis' in window)) {
    elements.voiceToggle.disabled = true;
    elements.voiceToggle.parentElement.style.opacity = '0.5';
  }
});

// Configurar event listeners
function setupEventListeners() {
  elements.startButton.addEventListener('click', startGame);
  elements.voiceToggle.addEventListener('change', (e) => {
    gameState.voiceEnabled = e.target.checked;
  });
  elements.soundToggle.addEventListener('change', (e) => {
    gameState.soundEnabled = e.target.checked;
  });
}

// Cargar puntuación más alta
function loadHighscore() {
  const highscore = localStorage.getItem('hooponoponoHighscore') || 0;
  elements.highscoreDisplay.textContent = highscore;
}

// Guardar puntuación más alta
function saveHighscore() {
  const currentHighscore = parseInt(localStorage.getItem('hooponoponoHighscore') || 0);
  if (gameState.score > currentHighscore) {
    localStorage.setItem('hooponoponoHighscore', gameState.score);
    elements.highscoreDisplay.textContent = gameState.score;
    return true;
  }
  return false;
}

// Iniciar juego
function startGame() {
  if (gameState.isPlaying) return;
  
  // Resetear estado
  gameState = {
    ...gameState,
    isPlaying: true,
    score: 0,
    timeLeft: 30,
    thoughtsClicked: 0,
    activeThoughts: [],
    difficulty: 1
  };
  
  // Actualizar UI
  elements.startButton.textContent = 'Sanando...';
  elements.startButton.disabled = true;
  elements.scoreDisplay.textContent = '0';
  elements.gameArea.innerHTML = '';
  
  // Iniciar timers
  startGameTimer();
  startThoughtSpawning();
}

// Timer principal del juego
function startGameTimer() {
  gameState.gameTimer = setInterval(() => {
    gameState.timeLeft--;
    updateTimeDisplay();
    
    if (gameState.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Actualizar display del tiempo
function updateTimeDisplay() {
  const minutes = Math.floor(gameState.timeLeft / 60);
  const seconds = gameState.timeLeft % 60;
  elements.timeDisplay.textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Generar pensamientos
function startThoughtSpawning() {
  function spawnThought() {
    if (!gameState.isPlaying) return;
    
    createThought();
    
    // Aumentar dificultad gradualmente
    gameState.difficulty = Math.min(2.5, 1 + Math.floor(gameState.score / 8));
    const spawnRate = Math.max(1200, 2500 - (gameState.difficulty * 400));
    
    gameState.spawnTimer = setTimeout(spawnThought, spawnRate);
  }
  
  spawnThought();
}

// Crear pensamiento individual
function createThought() {
  const thought = document.createElement('div');
  thought.className = 'thought';
  
  const negativeThought = getRandomNegativeThought();
  thought.innerHTML = `<span>${negativeThought}</span>`;
  
  // Posición aleatoria
  positionThought(thought);
  
  // Event listener
  thought.addEventListener('click', () => handleThoughtClick(thought, negativeThought));
  
  // Agregar al DOM
  elements.gameArea.appendChild(thought);
  gameState.activeThoughts.push(thought);
  
  // Auto-remover después de un tiempo
  setTimeout(() => {
    if (thought.parentNode && !thought.classList.contains('clicked')) {
      removeThought(thought);
    }
  }, 5000 - (gameState.difficulty * 800));
}

// Posicionar pensamiento aleatoriamente
function positionThought(thought) {
  const gameAreaRect = elements.gameArea.getBoundingClientRect();
  const maxX = gameAreaRect.width - 320; // Ancho máximo del pensamiento
  const maxY = gameAreaRect.height - 120; // Alto máximo del pensamiento
  
  const x = Math.random() * Math.max(0, maxX);
  const y = Math.random() * Math.max(0, maxY);
  
  thought.style.left = `${x}px`;
  thought.style.top = `${y}px`;
}

// Manejar click en pensamiento
function handleThoughtClick(thought, negativeThought) {
  if (thought.classList.contains('clicked')) return;
  
  thought.classList.add('clicked');
  gameState.thoughtsClicked++;
  gameState.score += Math.ceil(gameState.difficulty);
  
  elements.scoreDisplay.textContent = gameState.score;
  
  // Reproducir sonido
  playSound('pop');
  
  // Mostrar frase sanadora
  showHealingMessage();
  
  // Remover pensamiento después de la animación
  setTimeout(() => {
    removeThought(thought);
  }, 400);
}

// Mostrar mensaje de sanación
function showHealingMessage() {
  const healingData = getRandomHealingPhrase();
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'healing-message';
  messageDiv.innerHTML = `
    <h3>🌸 Sanación Ho'oponopono 🌸</h3>
    <p><strong>"${healingData.phrase}"</strong></p>
    <p style="font-size: 0.95rem; color: #666;">${healingData.explanation}</p>
    <button onclick="this.parentNode.remove()">Continuar Sanando</button>
  `;
  
  document.body.appendChild(messageDiv);
  
  // Reproducir frase con síntesis de voz
  if (gameState.voiceEnabled) {
    speakPhrase(healingData.phrase);
  }
  
  // Reproducir sonido de campana
  playSound('bell');
  
  // Auto-remover después de 4 segundos
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 4000);
}

// Síntesis de voz
function speakPhrase(text) {
  if ('speechSynthesis' in window && gameState.voiceEnabled) {
    // Cancelar cualquier síntesis anterior
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    utterance.volume = 0.7;
    
    // Intentar usar una voz femenina si está disponible
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.lang.includes('es') && 
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('mujer') ||
       voice.name.toLowerCase().includes('maria'))
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    speechSynthesis.speak(utterance);
  }
}

// Remover pensamiento
function removeThought(thought) {
  if (thought.parentNode) {
    thought.parentNode.removeChild(thought);
  }
  
  const index = gameState.activeThoughts.indexOf(thought);
  if (index > -1) {
    gameState.activeThoughts.splice(index, 1);
  }
}

// Obtener pensamiento negativo aleatorio
function getRandomNegativeThought() {
  return gameConfig.negativeThoughts[Math.floor(Math.random() * gameConfig.negativeThoughts.length)];
}

// Obtener frase sanadora aleatoria
function getRandomHealingPhrase() {
  return gameConfig.healingPhrases[Math.floor(Math.random() * gameConfig.healingPhrases.length)];
}

// Reproducir sonido
function playSound(type) {
  if (!gameState.soundEnabled) return;
  
  try {
    const sound = type === 'bell' ? elements.bellSound : elements.popSound;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Silenciar errores de audio si no están disponibles
      });
    }
  } catch (error) {
    // Silenciar errores de audio
  }
}

// Finalizar juego
function endGame() {
  gameState.isPlaying = false;
  
  // Limpiar timers
  if (gameState.gameTimer) {
    clearInterval(gameState.gameTimer);
  }
  if (gameState.spawnTimer) {
    clearTimeout(gameState.spawnTimer);
  }
  
  // Cancelar síntesis de voz
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  
  // Limpiar pensamientos activos
  gameState.activeThoughts.forEach(thought => {
    if (thought.parentNode) {
      thought.parentNode.removeChild(thought);
    }
  });
  gameState.activeThoughts = [];
  
  // Verificar nuevo récord
  const isNewRecord = saveHighscore();
  
  // Mostrar resultados
  showGameResults(isNewRecord);
  
  // Resetear botón
  elements.startButton.textContent = '¡Empezar (30 s)!';
  elements.startButton.disabled = false;
}

// Mostrar resultados del juego
function showGameResults(isNewRecord) {
  const resultsDiv = document.createElement('div');
  resultsDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 35px;
    border-radius: 25px;
    text-align: center;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(15px);
    border: 2px solid rgba(186, 85, 211, 0.2);
    z-index: 1000;
    max-width: 450px;
    width: 90%;
  `;
  
  const thoughtsPerMinute = Math.round((gameState.thoughtsClicked / 30) * 60);
  
  resultsDiv.innerHTML = `
    <h3 style="color: #2d3748; margin-bottom: 25px; font-size: 1.6rem;">
      ${isNewRecord ? '🌟 ¡Nuevo Récord de Sanación!' : '🌸 ¡Sesión Completada!'}
    </h3>
    <div style="color: #4a5568; font-size: 1.1rem; line-height: 1.8;">
      <p><strong>Puntuación:</strong> ${gameState.score}</p>
      <p><strong>Pensamientos sanados:</strong> ${gameState.thoughtsClicked}</p>
      <p><strong>Ritmo de sanación:</strong> ${thoughtsPerMinute} por minuto</p>
      ${isNewRecord ? '<p style="color: #ba55d3; font-weight: 600; margin-top: 15px;">¡Has alcanzado un nuevo nivel de sanación!</p>' : ''}
      <p style="font-style: italic; margin-top: 20px; color: #666;">
        "Cada pensamiento sanado es un paso hacia tu empoderamiento personal"
      </p>
    </div>
    <button onclick="this.parentNode.remove()" style="
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 15px;
      cursor: pointer;
      font-weight: 500;
      margin-top: 25px;
      transition: all 0.3s ease;
      font-size: 1rem;
    ">Continuar mi Crecimiento</button>
  `;
  
  document.body.appendChild(resultsDiv);
  
  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (resultsDiv.parentNode) {
      resultsDiv.remove();
    }
  }, 10000);
}

// Cargar voces cuando estén disponibles
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = function() {
    // Las voces están ahora disponibles
  };
}

