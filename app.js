// ===== STATE =====

const state = {
  difficulty: null,
  mode: null,
  data: {},
  currentText: "",
  currentPosition: 0,
  correctChars: 0,
  incorrectChars: 0,
  timeLeft: 0,
  timer: null,
  startTime: null,
  isRunning: false,
  isFinished: false,
  accuracy: 0,
  WPM: 0,
};

// ===== DOM ELEMENTS =====

const inputWrapper = document.querySelector(".content-area");
const resultsWrapper = document.querySelector(".result");

const desktopNav = document.querySelector(".desktop-nav");
const mobileNav = document.querySelector(".mobile-nav");

const difficultyDD = document.querySelector("#difficulty-dd");
const modeDD = document.querySelector("#mode-dd");

const deskDiffNav = desktopNav.querySelector("#desk-difficulty-nav");
const deskModeNav = desktopNav.querySelector("#desk-mode-nav");

const difficultyBtn = document.querySelector("#difficulty-btn");
const modeBtn = document.querySelector("#mode-btn");

const difficultyBtns = document.getElementsByName("difficulty");
const modeBtns = document.getElementsByName("mode");

const inputField = document.querySelector("#input-field");
const hiddenInput = document.querySelector("#hidden-input");
const blurOverlay = document.querySelector(".blur-overlay");
const inputRestart = document.querySelector("#restart-container");

const time = document.querySelector("#time");
const WPM = document.querySelector("#wpm");
const Accuracy = document.querySelector("#accuracy");
const bestWPM = document.querySelector("#best-wpm");

const restartBtn = document.querySelectorAll("#restart-btn");
const imgWrapper = document.querySelector("#img-wrapper");
const headText = document.querySelector("#text-1");
const subText = document.querySelector("#text-2");
const btnText = document.querySelector("#btn-text");

inputField.style.cursor = "text";
// ===== UTILITY FUNCTIONS =====

function setState(property, value) {
  state[property] = value.toLocaleLowerCase();
}

function toggleDropDown(button) {
  button.querySelector("img").classList.toggle("-rotate-90");
  const DD = button.closest("div").querySelector(".drop-down");
  DD.classList.toggle("hidden");
}

function closeDropdown(button, DropDown, timeOut = 0) {
  setTimeout(() => {
    button.querySelector("img").classList.add("-rotate-90");
    DropDown.classList.add("hidden");
  }, timeOut);
}

function loadMobNav(button, value) {
  const btnContent = button.querySelector("span");
  btnContent.textContent = value;
}

function loadDeskNav(targetBtns, value) {
  const difficultyDeskBtns = targetBtns.querySelectorAll("label");
  difficultyDeskBtns.forEach((label) => {
    label.classList.remove("text-gray-50", "border-gray-50");
    label.classList.add("text-blue-400", "border-blue-400");

    if (label.dataset.value === value) {
      label.classList.remove("text-blue-400", "border-blue-400");
      label.classList.add("text-gray-50", "border-gray-50");
    }
  });
}

function getSelectedRadio(targetBtns) {
  let selected = null;
  targetBtns.forEach((btn) => {
    if (btn.checked) {
      selected = btn;
    }
  });

  return selected;
}

async function loadData() {
  try {
    const res = await fetch("data.json");
    state.data = await res.json();
  } catch (error) {
    console.log("Error loading text: ", error);
  }
}

// ===== GAME LOGIC =====

function displayRandomText(difficulty) {
  const textArr = state.data[difficulty];
  const randomIndex = Math.floor(Math.random() * textArr.length);
  const text = textArr[randomIndex].text;
  state.currentText = text;

  displayText(text);
}

function Cursor() {
  const spans = inputField.querySelectorAll("span");

  if (!state.isRunning) {
    spans[state.currentPosition].classList.add("bg-neutral-500");
    return;
  }

  spans[state.currentPosition].classList.remove("bg-neutral-500");
  if (spans[state.currentPosition + 1]) {
    spans[state.currentPosition + 1].classList.add("bg-neutral-500");
  }
}

function scrollToCursor() {
  const container = document.querySelector(".input-wrapper"); // your scrollable parent
  const spans = inputField.querySelectorAll("span");
  const currentSpan = spans[state.currentPosition] || spans[state.currentPosition - 1];

  if (!currentSpan) return;

  const containerRect = container.getBoundingClientRect();
  const spanRect = currentSpan.getBoundingClientRect();
  console.log(containerRect)
  console.log(spanRect)

  // Only scroll if the char is NOT fully visible (with a small buffer)
  const buffer = 60; // px from bottom/top before we scroll
  if (spanRect.bottom > containerRect.bottom - buffer || spanRect.top < containerRect.top + buffer) {
    currentSpan.scrollIntoView({
      block: "center", // or "nearest" if you prefer minimal movement
      inline: "nearest",
      behavior: "auto", // ← "auto" or "instant" = no animation = ZERO flicker
    });
  }
}

function displayText(text) {
  inputField.innerHTML = "";
  const textArr = text.split("");
  textArr.forEach((letter) => {
    const span = document.createElement("span");
    span.textContent = letter;
    inputField.appendChild(span);
  });

  Cursor();
}

function loadMode() {
  if (state.mode === "timed") {
    time.textContent = "00:60";
  } else {
    time.textContent = "00:00";
  }
}

function startGame() {
  if (state.isRunning) return;

  state.isRunning = true;
  state.isFinished = false;
  state.startTime = Date.now();
  state.currentPosition = 0;
  state.correctChars = 0;
  state.incorrectChars = 0;
  state.elapsedTime = 0;

  startTimer(state.mode);

  inputRestart.classList.remove("hidden");
}

function resetGame() {
  if (state.timer) {
    clearInterval(state.timer);
  }

  state.isRunning = false;
  state.isFinished = false;
  state.startTime = null;
  state.currentPosition = 0;
  state.correctChars = 0;
  state.incorrectChars = 0;
  state.elapsedTime = 0;

  displayRandomText(state.difficulty);

  WPM.textContent = "0";
  Accuracy.textContent = "100%";
  loadMode();
  time.classList.remove("text-red-500", "animate-pulse");
  time.classList.add("md:text-neutral-50", "text-yellow-300");

  Cursor();
  hiddenInput.focus();
  // hiddenInput.disabled = false;

  showInput();
}

function showResults() {
  const { accuracy, WPM, correctChars, incorrectChars } = state;
  const resAccuracy = resultsWrapper.querySelector("#res-accuracy");
  resultsWrapper.querySelector("#res-wpm").textContent = `${WPM}`;
  resultsWrapper.querySelector("#res-accuracy").textContent = `${accuracy}%`;
  resultsWrapper.querySelector("#res-correct-chars").textContent = `${correctChars}`;
  resultsWrapper.querySelector("#res-incorrect-chars").textContent = `${incorrectChars}`;
  resAccuracy.classList.remove("text-green-500");

  if (accuracy > 90) {
    resAccuracy.classList.add("text-green-500");
  }

  const CbestWPM = parseInt(localStorage.getItem("bestWPM") || 0);
  const currentWPM = parseInt(WPM);

  if (CbestWPM === 0) {
    imgWrapper.innerHTML = `
                          <div class="p-2 rounded-full bg-green-500/10">
                            <img src="./assets/images/icon-completed.svg" class="border-8 rounded-full border-green-500/20" alt="" />
                          </div>`;
    headText.textContent = "Baseline Established!";
    subText.textContent = "You've set the bar. Now the real challenge begins—time to beat it.";
    btnText.textContent = "Beat This Score";
  } else if (WPM < CbestWPM) {
    imgWrapper.innerHTML = `<div class="p-2 rounded-full bg-green-500/10">
                              <img src="./assets/images/icon-completed.svg" class="border-8 rounded-full border-green-500/20" alt="" />
                            </div>`;
    headText.textContent = "Test Completed!";
    subText.textContent = "Solid run. Keep pushing to beat your high score.";
    btnText.textContent = "Go Again";
  } else if (WPM > CbestWPM && CbestWPM > 0) {
    imgWrapper.innerHTML = `
                  <div class="p-2">
                    <img src="./assets/images/icon-new-pb.svg" alt="">
                  </div>`;
    headText.textContent = "High Score Smashed!";
    subText.textContent = "You're getting faster. That was incredible typing.";
    btnText.textContent = "Beat This Score";
    celebrateHighScore();
  }

  if (currentWPM > CbestWPM) {
    bestWPM.textContent = currentWPM;
    localStorage.setItem("bestWPM", currentWPM);
  }

  inputWrapper.classList.add("opacity-0", "scale-95", "pointer-events-none");
  resultsWrapper.classList.remove("opacity-0", "scale-95", "pointer-events-none");
  inputWrapper.classList.remove("z-10");
  resultsWrapper.classList.add("z-10");
}

function showInput() {
  resultsWrapper.classList.add("opacity-0", "scale-95", "pointer-events-none");
  inputWrapper.classList.remove("opacity-0", "scale-95", "pointer-events-none");
  inputWrapper.classList.add("z-10");
  resultsWrapper.classList.remove("z-10");
}

function endGame() {
  state.isRunning = false;
  state.isFinished = true;
  clearInterval(state.timer);
  inputRestart.classList.add("hidden");

  hiddenInput.blur();
  // hiddenInput.disabled = true;
  showResults();
}

function startTimer(mode) {
  state.timeLeft = mode === "timed" ? 60 : 0;

  state.timer = setInterval(() => {
    mode === "timed" ? state.timeLeft-- : state.timeLeft++;

    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = state.timeLeft % 60;

    time.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (mode === "timed" && state.timeLeft <= 10) {
      time.classList.remove("text-yellow-300", "md:text-neutral-50");
      time.classList.add("text-red-500", "animate-pulse");
    }

    if (state.timeLeft < 0) {
      endGame();
    }
  }, 1000);
}

function handleTyping(key) {
  // e.preventDefault();

  if (!state.isRunning && !blurOverlay.classList.contains("hidden")) {
    return;
  }

  if (!state.isRunning && blurOverlay.classList.contains("hidden")) {
    startGame();
  }

  // if (e.key == "Enter" || e.key === "Backspace") return;

  // if (e.key.length !== 1) return;

  const typedChar = key;
  const expectedChar = state.currentText[state.currentPosition];
  const isCorrect = typedChar === expectedChar;

  if (isCorrect) {
    state.correctChars++;
  } else {
    state.incorrectChars++;
  }

  updateStats();

  const spans = inputField.querySelectorAll("span");
  if (spans[state.currentPosition]) {
    if (isCorrect) {
      spans[state.currentPosition].classList.add("text-green-500");
    } else {
      if (expectedChar !== " ") {
        spans[state.currentPosition].classList.add("text-red-500", "border-b-[2px]", "border-red-500");
      }
    }

    Cursor();
    scrollToCursor();
  }

  state.currentPosition++;

  if (state.currentPosition >= state.currentText.length) {
    endGame();
  }
}

function updateStats() {
  const { startTime, correctChars, incorrectChars } = state;
  // Calculate WPM
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  const words = correctChars / 5;
  const minutes = elapsedSeconds / 60;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

  // Calculate Accuracy
  const totalChars = correctChars + incorrectChars;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

  state.accuracy = accuracy;
  state.WPM = wpm;

  WPM.textContent = wpm;
  Accuracy.textContent = `${accuracy}%`;
}

function celebrateHighScore() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
  });
}

const focusHiddenInput = () => {
    hiddenInput.focus();
};

// ===== EVENT LISTENERS =====

mobileNav.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    toggleDropDown(button);
  });
});

document.addEventListener("click", (e) => {
  if (!difficultyBtn.contains(e.target) && !difficultyDD.contains(e.target)) {
    closeDropdown(difficultyBtn, difficultyDD);
  }

  if (!modeBtn.contains(e.target) && !modeDD.contains(e.target)) {
    closeDropdown(modeBtn, modeDD);
  }
});

mobileNav.addEventListener("click", (e) => {
  if (difficultyDD.contains(e.target)) {
    if (e.target.type === "radio") {
      const selectedVal = getSelectedRadio(difficultyBtns).value;
      setState("difficulty", selectedVal);
      loadMobNav(difficultyBtn, selectedVal);
      loadDeskNav(deskDiffNav, selectedVal);
      resetGame();
      closeDropdown(difficultyBtn, difficultyDD, 400);
    }
  }

  if (modeDD.contains(e.target)) {
    if (e.target.type === "radio") {
      const selectedVal = getSelectedRadio(modeBtns).value;
      loadMobNav(modeBtn, selectedVal);
      loadDeskNav(deskModeNav, selectedVal);
      setState("mode", selectedVal);
      resetGame();
      closeDropdown(modeBtn, modeDD, 400);
    }
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const difficulty = getSelectedRadio(difficultyBtns).value;
  const mode = getSelectedRadio(modeBtns).value;

  loadMobNav(difficultyBtn, difficulty);
  loadMobNav(modeBtn, mode);

  loadDeskNav(deskDiffNav, difficulty);
  loadDeskNav(deskModeNav, mode);

  setState("difficulty", difficulty);
  setState("mode", mode);

  await loadData();
  displayRandomText(state.difficulty);

  bestWPM.textContent = localStorage.getItem("bestWPM");

  // console.log(state);
});

document.querySelector("#start-btn").addEventListener("click", (e) => {
  inputField.classList.remove("blur-sm");
  blurOverlay.classList.add("hidden");

  showInput();
  hiddenInput.focus();
});

// inputField.addEventListener("keydown", (e) => {
//   handleTyping(e);
// });

restartBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    resetGame();
  });
});

hiddenInput.addEventListener("input", (e) => {
  if (e.data) {
    handleTyping(e.data);
    e.target.value = "";
  }
});



inputField.addEventListener("click", focusHiddenInput);
inputField.addEventListener("touchend", focusHiddenInput);
