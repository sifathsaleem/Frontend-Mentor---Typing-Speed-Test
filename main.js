// ===== CONFIGURATION =====
const CONFIG = {
  TIME_LIMIT: 60,
  CHARS_PER_WORD: 5,
  DROPDOWN_DELAY: 400,
};

// ===== STATE =====
const state = {
  currentText: "",
  currentPosition: 0,
  startTime: null,
  correctChars: 0,
  incorrectChars: 0,
  isRunning: false,
  isFinished: false,
  difficulty: "easy",
  mode: "timed",
  timer: null,
  elapsedTime: 0,
};

// ===== DOM ELEMENTS =====
const DOM = {
  // Stats
  wpm: document.querySelector("#wpm"),
  accuracy: document.querySelector("#accuracy"),
  time: document.querySelector("#time"),
  bestWPM: document.querySelector("#best-wpm"),

  // Input
  inputField: document.querySelector("#input-field"),
  startBtn: document.querySelector("#start-btn"),
  blurOverlay: document.querySelector(".blur-overlay"),

  // Dropdowns
  difficultyBtn: document.querySelector("#difficulty-btn"),
  modeBtn: document.querySelector("#mode-btn"),
  difficultyDD: document.querySelector("#difficulty-dd"),
  modeDD: document.querySelector("#mode-dd"),

  // Radio buttons
  difficultyBtns: document.getElementsByName("difficulty"),
  modeBtns: document.getElementsByName("mode"),

  // Desktop nav
  difficultyDeskNav: document.querySelector("#difficulty-desk-nav"),
  modeDeskNav: document.querySelector("#mode-desk-nav"),

  // Results section
  resultSection: document.querySelector(".result"),
  mainSection: document.querySelector("main"),
};

// ===== UTILITY FUNCTIONS =====

function getSelectedValue(radioButtons) {
  const selected = Array.from(radioButtons).find((btn) => btn.checked);
  return selected?.value || null;
}

function toggleDropdown(button) {
  const arrow = button.querySelector("img");
  const dropdown = button.closest("div").querySelector(".drop-down");

  arrow.classList.toggle("-rotate-90");
  dropdown.classList.toggle("hidden");
}

function closeDropdown(button, dropdown) {
  button.querySelector("img").classList.add("-rotate-90");
  dropdown.classList.add("hidden");
}

function updateDesktopNav(clickedButton, container) {
  const buttons = container.querySelectorAll("button");

  // Reset all buttons
  buttons.forEach((btn) => {
    btn.classList.remove("text-gray-50", "border-gray-50");
    btn.classList.add("text-blue-400", "border-blue-400");
  });

  // Activate clicked button
  clickedButton.classList.remove("text-blue-400", "border-blue-400");
  clickedButton.classList.add("text-gray-50", "border-gray-50");
}

// ===== GAME LOGIC =====

async function loadText(difficulty) {
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    const randomIndex = Math.floor(Math.random() * 10);

    // ✅ FIX: Access the 'text' property from the object
    const textObject = data[difficulty][randomIndex];
    const text = textObject.text;

    state.currentText = text;
    displayText(text);
  } catch (error) {
    console.error("Error loading text:", error);
  }
}

function displayText(text) {
  DOM.inputField.innerHTML = "";

  text.split("").forEach((letter) => {
    const span = document.createElement("span");
    span.classList.add("text-neutral-400");
    span.textContent = letter;
    DOM.inputField.appendChild(span);
  });
}

function startGame() {
  if (state.isRunning) return;

  state.isRunning = true;
  state.isFinished = false;
  state.startTime = Date.now();
  state.currentPosition = 0;
  state.correctChars = 0;
  state.incorrectChars = 0;
  state.elapsedTime = 60;

  startTimer();
  console.log("Game started!");
}

function startTimer() {
  DOM.time.textContent = "00:00";

  state.timer = setInterval(() => {
    state.elapsedTime++;

    const minutes = Math.floor(state.elapsedTime / 60);
    const seconds = state.elapsedTime % 60;
    DOM.time.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // End game if time limit reached (for timed mode)
    if (state.mode === "timed" && state.elapsedTime >= CONFIG.TIME_LIMIT) {
      endGame();
    }
  }, 1000);
}

function handleTyping(e) {
  // Prevent default for contenteditable
  if (e.key === "Enter" || e.key === "Backspace") {
    e.preventDefault();
    return;
  }

  // Only accept single character keys
  if (e.key.length !== 1) return;

  e.preventDefault();

  // Start game on first keypress
  if (!state.isRunning && !state.isFinished) {
    startGame();
  }

  if (!state.isRunning) return;

  const typedChar = e.key;
  const expectedChar = state.currentText[state.currentPosition];
  const isCorrect = typedChar === expectedChar;

  // Update character appearance
  const spans = DOM.inputField.querySelectorAll("span");
  if (spans[state.currentPosition]) {
    spans[state.currentPosition].classList.remove("text-neutral-400");
    spans[state.currentPosition].classList.add(isCorrect ? "text-green-500" : "text-red-500");
  }

  // Update stats
  if (isCorrect) {
    state.correctChars++;
  } else {
    state.incorrectChars++;
  }

  state.currentPosition++;
  updateStats();

  // Check if finished
  if (state.currentPosition >= state.currentText.length) {
    endGame();
  }
}

function updateStats() {
  // Calculate WPM
  const elapsedSeconds = (Date.now() - state.startTime) / 1000;
  const words = state.correctChars / CONFIG.CHARS_PER_WORD;
  const minutes = elapsedSeconds / 60;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

  // Calculate Accuracy
  const totalChars = state.correctChars + state.incorrectChars;
  const accuracy = totalChars > 0 ? Math.round((state.correctChars / totalChars) * 100) : 100;

  // Update UI
  DOM.wpm.textContent = wpm;
  DOM.accuracy.textContent = `${accuracy}%`;
  DOM.accuracy.classList.remove("text-red-500", "md:text-neutral-50");
  DOM.accuracy.classList.add(accuracy < 95 ? "text-red-500" : "md:text-neutral-50");
}

function endGame() {
  state.isRunning = false;
  state.isFinished = true;

  clearInterval(state.timer);

  // Update best WPM
  const currentWPM = parseInt(DOM.wpm.textContent);
  const bestWPM = parseInt(localStorage.getItem("bestWPM") || "0");

  if (currentWPM > bestWPM) {
    localStorage.setItem("bestWPM", currentWPM);
    DOM.bestWPM.textContent = currentWPM;
  }

  // Show results
  showResults();
}

function showResults() {
  const wpm = DOM.wpm.textContent;
  const accuracy = DOM.accuracy.textContent;
  const correctChars = state.correctChars;
  const incorrectChars = state.incorrectChars;

  // Update result section
  DOM.resultSection.querySelector(".text-2xl.text-neutral-50.font-semibold").textContent = wpm;
  DOM.resultSection.querySelector(".text-2xl.text-red-500.font-semibold").textContent = accuracy;
  DOM.resultSection.querySelector(".text-green-500").textContent = correctChars;
  DOM.resultSection.querySelector(".text-red-500").textContent = incorrectChars;

  // Hide main, show results
  DOM.mainSection.classList.add("hidden");
  DOM.resultSection.classList.remove("hidden");
}

async function resetGame() {
  // Clear timer
  if (state.timer) {
    clearInterval(state.timer);
  }

  // Reset state
  state.isRunning = false;
  state.isFinished = false;
  state.currentPosition = 0;
  state.correctChars = 0;
  state.incorrectChars = 0;
  state.elapsedTime = 0;
  state.startTime = null;

  // Reset UI
  DOM.wpm.textContent = "0";
  DOM.accuracy.textContent = "100%";
  DOM.time.textContent = "00:00";

  // Hide results, show main
  DOM.resultSection.classList.add("hidden");
  DOM.mainSection.classList.remove("hidden");

  // Load new text
  await loadText(state.difficulty);
}

// ===== EVENT LISTENERS =====

// Start button
DOM.startBtn.addEventListener("click", () => {
  DOM.blurOverlay.remove();
  DOM.inputField.classList.remove("blur-sm");
  DOM.inputField.focus();
});

// Typing
DOM.inputField.addEventListener("keydown", handleTyping);

// Difficulty dropdown (mobile)
DOM.difficultyBtn.addEventListener("click", () => {
  toggleDropdown(DOM.difficultyBtn);
});

// Mode dropdown (mobile)
DOM.modeBtn.addEventListener("click", () => {
  toggleDropdown(DOM.modeBtn);
});

// Desktop nav - Difficulty
DOM.difficultyDeskNav.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    updateDesktopNav(e.target, DOM.difficultyDeskNav);
    state.difficulty = e.target.value.toLowerCase();
    resetGame();
  }
});

// Desktop nav - Mode
DOM.modeDeskNav.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    updateDesktopNav(e.target, DOM.modeDeskNav);
    state.mode = e.target.value.includes("Timed") ? "timed" : "passage";
  }
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  // Difficulty dropdown
  if (!DOM.difficultyBtn.contains(e.target)) {
    if (DOM.difficultyDD.contains(e.target)) {
      setTimeout(() => {
        closeDropdown(DOM.difficultyBtn, DOM.difficultyDD);
      }, CONFIG.DROPDOWN_DELAY);

      const selected = getSelectedValue(DOM.difficultyBtns);
      console.log(selected)
      DOM.difficultyBtn.innerHTML = `
        ${selected}
        <img src="./assets/images/icon-down-arrow.svg" class="transition-all" alt="">
      `;
      state.difficulty = selected.toLowerCase();
      resetGame();
    } else {
      closeDropdown(DOM.difficultyBtn, DOM.difficultyDD);
    }
  }

  // Mode dropdown
  if (!DOM.modeBtn.contains(e.target)) {
    if (DOM.modeDD.contains(e.target)) {
      setTimeout(() => {
        closeDropdown(DOM.modeBtn, DOM.modeDD);
      }, CONFIG.DROPDOWN_DELAY);

      const selected = getSelectedValue(DOM.modeBtns);
      DOM.modeBtn.innerHTML = `
        ${selected}
        <img src="./assets/images/icon-down-arrow.svg" class="transition-all" alt="">
      `;
      state.mode = selected.includes("Timed") ? "timed" : "passage";
    } else {
      closeDropdown(DOM.modeBtn, DOM.modeDD);
    }
  }
});

// Beat This Score button
document.querySelector(".result button").addEventListener("click", resetGame);

// ===== INITIALIZATION =====
(async function init() {
  // Load best WPM from localStorage
  DOM.bestWPM.textContent = localStorage.getItem("bestWPM") || "0";

  // Load initial text
  await loadText(state.difficulty);

  console.log("Typing Speed Tracker Initialized");
})();
