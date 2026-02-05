// ===== STATE =====

const state = {
  difficulty: null,
  mode: null,
  data: {},
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
  console.log("Mob-nav loaded");
  const btnContent = button.querySelector("span");
  btnContent.textContent = value;

  // loadDeskNav(difficultyDeskNav, state.difficulty);
}

// function desktopNav(target) {
//   const labels = target.closest("div#desk").querySelectorAll("label");
//   labels.forEach((label) => {
//     label.classList.remove("text-gray-50", "border-gray-50");
//     label.classList.add("text-blue-400", "border-blue-400");
//   });

//   if (target.closest("label")) {
//     if (target.name === "des-difficulty") {
//       setDifficulty(target.value);
//     }

//     if (target.name === "des-mode") {
//       setMode(target.value);
//     }

//     const label = target.closest("label");
//     label.classList.remove("text-blue-400", "border-blue-400");
//     label.classList.add("text-gray-50", "border-gray-50");
//     console.log(label)
//   }
// }

function loadDeskNav(targetBtns, value) {
  console.log("Des-nav loaded");
  const difficultyDeskBtns = targetBtns.querySelectorAll("input");
  difficultyDeskBtns.forEach((input) => {
    const label = input.closest("label");
    label.classList.remove("text-gray-50", "border-gray-50");
    label.classList.add("text-blue-400", "border-blue-400");

    if (input.value === value) {
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

async function getData() {
  const res = await fetch("data.json");
  const data = await res.json();

  if (data) {
    state.data = data;
  }
}

// }

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
      loadMobNav(difficultyBtn, selectedVal, "difficulty");
      setState("difficulty", selectedVal);
      closeDropdown(difficultyBtn, difficultyDD, 400);
    }
  }

  if (modeDD.contains(e.target)) {
    if (e.target.type === "radio") {
      const selectedVal = getSelectedRadio(modeBtns).value;
      loadMobNav(modeBtn, selectedVal, "mode");
      loadDeskNav(deskModeNav, selectedVal);
      setState("mode", selectedVal);
      closeDropdown(modeBtn, modeDD, 400);
    }
  }
});

desktopNav.addEventListener("click", (e) => {
  if (e.target.type === "radio") {
    const selectedVal = e.target.value;
    if (deskDiffNav.contains(e.target)) {
      loadDeskNav(deskDiffNav, selectedVal);
      loadMobNav(difficultyBtn, selectedVal);
      setState("difficulty", selectedVal);
    }

    if (deskModeNav.contains(e.target)) {
      loadDeskNav(deskModeNav, selectedVal);
      loadMobNav(modeBtn, selectedVal);
      setState("mode", selectedVal);
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const difficulty = getSelectedRadio(difficultyBtns).value;
  const mode = getSelectedRadio(modeBtns).value;

  loadMobNav(difficultyBtn, difficulty, "difficulty");
  loadMobNav(modeBtn, mode, "mode");

  getData();

  // console.log(state);
});
