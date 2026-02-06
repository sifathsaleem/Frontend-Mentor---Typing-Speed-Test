// ===== STATE =====

const state = {
  difficulty: null,
  mode: null,
  data: {},
  currentText: "",
  currentPosition: 0,
  correctChars: 0,
  incorrectChars: 0,
  timeLeft: 60,
  timer: null,
  startTime: null,
  isRunning: false,
  isFinished: false,
};

// ===== DOM ELEMENTS =====
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

const time = document.querySelector("#time");
const WPM = document.querySelector("#wpm");
const Accuracy = document.querySelector("#accuracy");

// ===== UTILITY FUNCTIONS =====

function setState(property, value) {
  state[property] = value.toLocaleLowerCase();
} // ✅

function toggleDropDown(button) {
  button.querySelector("img").classList.toggle("-rotate-90");
  const DD = button.closest("div").querySelector(".drop-down");
  DD.classList.toggle("hidden");
} // ✅

function closeDropdown(button, DropDown, timeOut = 0) {
  setTimeout(() => {
    button.querySelector("img").classList.add("-rotate-90");
    DropDown.classList.add("hidden");
  }, timeOut);
} // ✅

function loadMobNav(button, value) {
  // console.log("Mob-nav loaded with " + value);
  const btnContent = button.querySelector("span");
  btnContent.textContent = value;

  // loadDeskNav(difficultyDeskNav, state.difficulty);
} // ✅

function loadDeskNav(targetBtns, value) {
  // console.log("Des-nav loaded with " + value);
  const difficultyDeskBtns = targetBtns.querySelectorAll("label");
  difficultyDeskBtns.forEach((label) => {
    label.classList.remove("text-gray-50", "border-gray-50");
    label.classList.add("text-blue-400", "border-blue-400");

    if (label.dataset.value === value) {
      label.classList.remove("text-blue-400", "border-blue-400");
      label.classList.add("text-gray-50", "border-gray-50");
    }
  });
} // ✅

function getSelectedRadio(targetBtns) {
  let selected = null;
  targetBtns.forEach((btn) => {
    if (btn.checked) {
      selected = btn;
    }
  });

  return selected;
} // ✅

async function loadData() {
  try {
    const res = await fetch("data.json");
    state.data = await res.json();
  } catch (error) {
    console.log("Error loading text: ", error);
  }
} // ✅

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
  spans[state.currentPosition].classList.remove("bg-neutral-500");
  if (spans[state.currentPosition + 1]) {
    spans[state.currentPosition + 1].classList.add("bg-neutral-500");
  }
}

function displayText(text) {
  inputField.innerHTML = "";
  const textArr = text.split("");
  textArr.forEach((letter) => {
    const span = document.createElement("span");
    span.classList.add("rounded");
    span.textContent = letter;
    inputField.appendChild(span);
  });
}

function startGame() {
  state.isRunning = true;
  state.isFinished = false;
  state.startTime = Date.now();
  state.currentPosition = 0;
  state.correctChars = 0;
  state.incorrectChars = 0;
  state.elapsedTime = 0;

  // startTimer()
}

function endGame() {
  clearInterval(state.timer);
  console.log("game end");
}

function startTimer() {
  time.textContent = "00:60";

  state.timer = setInterval(() => {
    state.timeLeft--;

    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = state.timeLeft % 60;

    time.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (state.mode === "timed" && state.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function handleTyping(e) {
  e.preventDefault();

  if (!state.isRunning) return;

  if (e.key == "Enter" || e.key === "Backspace") return;
  if (e.key.length !== 1) return;

  const typedChar = e.key;
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
        spans[state.currentPosition].classList.add("text-red-500", "underline");
      }
    }

    Cursor();
  }

  state.currentPosition++;

  if (state.currentPosition >= state.currentText.length) {
    endGame();
  }
}

function updateStats() {
  console.log("updated");
  // Calculate WPM
  const elapsedSeconds = (Date.now() - state.startTime) / 1000;
  const words = state.correctChars / 5;
  const minutes = elapsedSeconds / 60;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

  // Calculate Accuracy
  const totalChars = state.correctChars + state.incorrectChars;
  const accuracy = totalChars > 0 ? Math.round((state.correctChars / totalChars) * 100) : 100;

  WPM.textContent = wpm;
  Accuracy.textContent = `${accuracy}%`;
}

// ===== EVENT LISTENERS =====

mobileNav.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    toggleDropDown(button);
  });
}); // ✅

document.addEventListener("click", (e) => {
  if (!difficultyBtn.contains(e.target) && !difficultyDD.contains(e.target)) {
    closeDropdown(difficultyBtn, difficultyDD);
  }

  if (!modeBtn.contains(e.target) && !modeDD.contains(e.target)) {
    closeDropdown(modeBtn, modeDD);
  }
}); // ✅

mobileNav.addEventListener("click", (e) => {
  if (difficultyDD.contains(e.target)) {
    if (e.target.type === "radio") {
      const selectedVal = getSelectedRadio(difficultyBtns).value;
      setState("difficulty", selectedVal);
      loadMobNav(difficultyBtn, selectedVal);
      loadDeskNav(deskDiffNav, selectedVal);
      displayRandomText(selectedVal.toLocaleLowerCase());
      closeDropdown(difficultyBtn, difficultyDD, 400);

      const spans = inputField.querySelectorAll("span");
      spans[state.currentPosition].classList.add("bg-neutral-500");
    }
  }

  if (modeDD.contains(e.target)) {
    if (e.target.type === "radio") {
      const selectedVal = getSelectedRadio(modeBtns).value;
      loadMobNav(modeBtn, selectedVal);
      loadDeskNav(deskModeNav, selectedVal);
      setState("mode", selectedVal);
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

  inputField.focus();

  await loadData();
  displayRandomText(state.difficulty);

  // console.log(state);
});

document.querySelector("#start-btn").addEventListener("click", (e) => {
  if (e.target.parentElement.classList.contains("blur-overlay")) {
    inputField.classList.remove("blur-sm");
    e.target.parentElement.remove();

    const spans = inputField.querySelectorAll("span");
    spans[state.currentPosition].classList.add("bg-neutral-500");

    inputField.focus();
    startGame();
  }
});

inputField.addEventListener("keydown", (e) => {
  handleTyping(e);
});
