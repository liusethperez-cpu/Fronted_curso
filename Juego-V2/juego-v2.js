import { GoogleGenAI, Type } from "@google/genai";

// --- CONFIG & CONSTANTS ---
const GAME_DURATION = 30; // seconds
const API_KEY = process.env.API_KEY;

// --- GEMINI SERVICE ---
let ai;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("API_KEY is not set. Gemini features will be disabled.");
}

const defaultDoubts = [
  "No soy lo suficientemente buena.",
  "Pronto descubrirán que soy un fraude.",
  "Fue solo suerte.",
  "No merezco este éxito.",
  "Todos los demás saben más que yo.",
  "¿Y si fallo?",
  "No estoy preparada para esto.",
  "Tengo que trabajar el doble para demostrar mi valía.",
  "Mi opinión no es importante.",
  "Cualquiera podría haber hecho esto.",
  "No pertenezco aquí.",
  "Estoy engañando a todos.",
  "Eventualmente, decepcionaré a la gente.",
  "Me van a juzgar.",
  "No sé lo que estoy haciendo.",
];

async function generateDoubts() {
  if (!API_KEY || !ai) return defaultDoubts;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Genera una lista de 20 pensamientos negativos o dudas cortas asociadas con el síndrome del impostor en mujeres. Los pensamientos deben estar en español. Deben ser concisos, de 3 a 8 palabras.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            doubts: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "Un pensamiento de duda o síndrome del impostor."
              }
            }
          }
        }
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result.doubts || defaultDoubts;
  } catch (error) {
    console.error("Error generating doubts with Gemini:", error);
    return defaultDoubts;
  }
}

// --- DOM ELEMENTS ---
const gameArea = document.getElementById('game-area');
const gameOverlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const scoreValue = document.getElementById('score-value');
const timeValue = document.getElementById('time-value');
const highscoreValue = document.getElementById('highscore-value');
const startButton = document.getElementById('start-button');

// --- GAME STATE ---
let gameState = 'loading'; // loading | idle | playing | finished
let score = 0;
let timeLeft = GAME_DURATION;
let highScore = Number(localStorage.getItem('doubtDestroyerHighScore') || 0);
let doubtsOnScreen = []; // Array of doubt objects { id, element }
let doubtList = [];
let timerInterval = null;
let doubtSpawnInterval = null;

// --- UTILITY FUNCTIONS ---
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const clearTimers = () => {
    if (timerInterval) clearInterval(timerInterval);
    if (doubtSpawnInterval) clearInterval(doubtSpawnInterval);
    timerInterval = null;
    doubtSpawnInterval = null;
};

// --- DOM UPDATE FUNCTIONS ---
const updateScoreDisplay = () => scoreValue.textContent = score;
const updateTimeDisplay = () => timeValue.textContent = formatTime(timeLeft);
const updateHighScoreDisplay = () => highscoreValue.textContent = highScore;

const showOverlay = (title, text) => {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    gameOverlay.style.display = 'flex';
};

const hideOverlay = () => {
    gameOverlay.style.display = 'none';
};

const updateButtonState = () => {
    if (gameState === 'loading') {
        startButton.textContent = 'Cargando...';
        startButton.disabled = true;
    } else if (gameState === 'playing') {
        startButton.textContent = `¡Empezar (${GAME_DURATION}s)!`;
        startButton.disabled = true;
    } else {
        startButton.textContent = `¡Empezar (${GAME_DURATION}s)!`;
        startButton.disabled = false;
    }
};

// --- GAME LOGIC ---
const handleDoubtClick = (doubtId, doubtElement) => {
    score++;
    updateScoreDisplay();

    doubtElement.classList.replace('scale-100', 'scale-50');
    doubtElement.classList.replace('opacity-100', 'opacity-0');

    setTimeout(() => {
        doubtElement.remove();
        doubtsOnScreen = doubtsOnScreen.filter(d => d.id !== doubtId);
    }, 200);
};

const createDoubtElement = () => {
    const doubtData = {
        id: Date.now(),
        text: doubtList[Math.floor(Math.random() * doubtList.length)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
    };

    const button = document.createElement('button');
    button.className = `absolute transition-all duration-300 ease-out text-center p-3 md:p-4 rounded-full shadow-lg cursor-pointer transform opacity-0 scale-50 bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400`;
    button.style.top = `${doubtData.y}%`;
    button.style.left = `${doubtData.x}%`;
    button.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 10 - 5}deg)`;
    button.style.minWidth = '120px';
    button.style.maxWidth = '220px';

    const span = document.createElement('span');
    span.className = 'text-sm md:text-base font-medium text-gray-700';
    span.textContent = doubtData.text;
    button.appendChild(span);

    button.onclick = () => handleDoubtClick(doubtData.id, button);

    // Fade in animation
    setTimeout(() => {
        button.classList.replace('opacity-0', 'opacity-100');
        button.classList.replace('scale-50', 'scale-100');
    }, 50);

    // Auto-remove after time
    const lifetimeTimeout = setTimeout(() => {
        if (button.parentElement) {
            handleDoubtClick(doubtData.id, button); // count as a miss by just removing
        }
    }, 4000);

    doubtsOnScreen.push({ id: doubtData.id, element: button, timeout: lifetimeTimeout });
    gameArea.appendChild(button);
};

const startGame = () => {
    if (gameState !== 'idle') return;

    score = 0;
    timeLeft = GAME_DURATION;
    doubtsOnScreen.forEach(d => {
        d.element.remove();
        clearTimeout(d.timeout);
    });
    doubtsOnScreen = [];
    
    gameState = 'playing';
    updateScoreDisplay();
    updateTimeDisplay();
    updateButtonState();
    hideOverlay();
    
    // Timer interval
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimeDisplay();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Doubt spawner
    const spawnLoop = () => {
        createDoubtElement();
        const spawnRate = Math.max(2000 - score * 50, 500);
        doubtSpawnInterval = setTimeout(spawnLoop, spawnRate);
    };
    spawnLoop();
};

const endGame = () => {
    gameState = 'finished';
    clearTimers();
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('doubtDestroyerHighScore', highScore.toString());
        updateHighScoreDisplay();
    }
    
    showOverlay('¡Tiempo agotado!', `Tu puntuación final: ${score}`);

    setTimeout(() => {
        gameState = 'idle';
        hideOverlay();
        updateButtonState();
        doubtsOnScreen.forEach(d => {
             d.element.remove();
             clearTimeout(d.timeout);
        });
        doubtsOnScreen = [];
    }, 5000);
};

// --- INITIALIZATION ---
async function initializeApp() {
    updateHighScoreDisplay();
    updateTimeDisplay();
    updateButtonState();
    
    doubtList = await generateDoubts();
    
    gameState = 'idle';
    updateButtonState();
    
    startButton.addEventListener('click', startGame);
}

document.addEventListener('DOMContentLoaded', initializeApp);
export {};

