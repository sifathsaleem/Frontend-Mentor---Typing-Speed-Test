const difficultyBtn = document.querySelector("#difficulty-btn");
const modeBtn = document.querySelector("#mode-btn");
const difficultyDeskNav = document.querySelector("#difficulty-desk-nav");
const modeDeskNav = document.querySelector("#mode-desk-nav");
const difficultyBtns = document.getElementsByName("difficulty");
const modeBtns = document.getElementsByName("mode");
const inputField = document.querySelector("#input-field");

const data = {
  bestWPM: 0,
  difficulty: null,
  mode: null,
};

// ===== State =====
const state = {
  currentText: '',
  currentPosition: 0,
  startTime: null,
  correctChars: 0,
  incorrectChars: 0,
  isRunning: false,
  difficulty: 'easy'
};


class UI {

  toggleDropDown(button) {
    button.querySelector("img").classList.toggle("-rotate-90");
    const difficultyDD = button.closest('div').querySelector('.drop-down')
    difficultyDD.classList.toggle('hidden')

  }

  desktopNav(button) {
    const DeskNav = button.closest('div')
    const btns = DeskNav.querySelectorAll("button");
    btns.forEach((btn) => {
      btn.classList.remove("text-gray-50", "border-gray-50");
      btn.classList.add("text-blue-400", "border-blue-400");
    });

    if (button.closest("button")) {
      button.classList.remove("text-blue-400", "border-blue-400");
      button.classList.add("text-gray-50", "border-gray-50");
    }

  }

  selectedBtn(btns) {
    let selected = null;
    for (let btn of btns) {
    if (btn.checked) {
      selected = btn;
      break;
    }
  }

  return selected.value

}

}

// start Btn
document.querySelector("#start-btn").addEventListener("click", (e) => {
  const ui = new UI();

  if (e.target.parentElement.classList.contains("blur-overlay")) {
    ui.getStarted(e.target.parentElement);
  }
});



// Difficulty Desktop Nav
difficultyDeskNav.addEventListener("click", (e) => {
  const ui = new UI();
  ui.desktopNav(e.target)
});

// Mode Desktop Nav
modeDeskNav.addEventListener("click", (e) => {
  const ui = new UI();
  ui.desktopNav(e.target)
});




const text = `The archaeological expedition unearthed artifacts that complicated prevailing theories about Bronze Age trade networks. Obsidian from Anatolia, lapis lazuli from Afghanistan, and amber from the Baltic-all discovered in a single Mycenaean tomb-suggested commercial connections far more extensive than previously hypothesized. "We've underestimated ancient peoples' navigational capabilities and their appetite for luxury goods, "the lead researcher observed. "Globalization isn't as modern as we assume.`;
const arr = text.split("");
arr.forEach((letter) => {
  const char = document.createElement("span");
  char.classList.add("text-neutral-400");
  char.innerText = letter;
  inputField.appendChild(char);
});

    async function getData(difficulty) {
      const randID = Math.floor(Math.random() * 10);
      const response = await fetch("data.json");
      const data = await response.json();
      const text = data[difficulty];

      console.log(text[randID]);
    }


    // Hide DropDowns when looses focus
    document.addEventListener("click", (e) => {
      const difficultyDD = document.querySelector("#difficulty-dd");
      const modeDD = document.querySelector("#mode-dd");
      const difficultyBtns = document.getElementsByName("difficulty");
      const modeBtns = document.getElementsByName("mode");
      const ui = new UI()
      
      if (!difficultyBtn.contains(e.target)) {
        if (difficultyDD.contains(e.target)) {
          console.log(e.target)
          setTimeout(() => {
            difficultyBtn.querySelector("img").classList.add("-rotate-90");
            difficultyDD.classList.add("hidden");
          }, 400);
          
          difficultyBtn.innerHTML = `
          ${ui.selectedBtn(difficultyBtns)}
          <img src="./assets/images/icon-down-arrow.svg" class="transition-all" alt="">
          `;
        } else {
          difficultyBtn.querySelector("img").classList.add("-rotate-90");
          difficultyDD.classList.add("hidden");
        }
      }
    
      if (!modeBtn.contains(e.target)) {
        if (modeDD.contains(e.target)) {
          setTimeout(() => {
            modeBtn.querySelector("img").classList.add("-rotate-90");
            modeDD.classList.add("hidden");
          }, 400);
    
          const selected = ui.selectedBtn(modeBtns);
    
          modeBtn.innerHTML = `
                ${selected}
                <img src="./assets/images/icon-down-arrow.svg" class="transition-all" alt="">
                `;
              } else {
          modeBtn.querySelector("img").classList.add("-rotate-90");
          modeDD.classList.add("hidden");
        }
      }
    });
    
    // Difficulty dropDown
    difficultyBtn.addEventListener("click", (e) => {
      const ui = new UI()
      ui.toggleDropDown(e.target)
    
    });
    
    // Mode dropDown
    modeBtn.addEventListener("click", (e) => {
      const ui = new UI();
      ui.toggleDropDown(e.target);
    });
 









