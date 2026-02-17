# Frontend Mentor - Typing Speed Test solution

This is my solution to the [Typing Speed Test challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/typing-speed-test).

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
- [Author](#author)

## Overview

### The challenge

Users should be able to:
- Choose between Easy / Medium / Hard difficulty
- Switch between Timed (60s) and Passage mode
- See real-time WPM and accuracy
- Get instant visual feedback (green/red letters + moving cursor)
- Save their personal best score
- Celebrate a new high score with confetti

### Screenshot

(placeholder – I’ll add one soon)

### Links

- Live Site URL: [https://typing-speed-checkerr.netlify.app/]


## My process

### Built with

- Semantic HTML5 markup
- Tailwind CSS (via CDN – my first time using Tailwind!)
- Vanilla JavaScript (no frameworks)
- `contenteditable` + span-by-span DOM manipulation
- Fetch API to load texts from `data.json`
- LocalStorage for personal best
- canvas-confetti for the high-score celebration

### What I learned

This project was a big step up for me. Here are the things I’m most proud of and what I learned:

- **Syncing mobile & desktop UI**  
  The hardest part was keeping the selected difficulty and mode in sync between the mobile dropdowns and the desktop pill buttons. I originally used separate radio groups with the same `name`, which caused crazy cross-triggering bugs. The fix was to use **one shared set of radio inputs** and update both UIs from a single event handler. That was a huge “aha!” moment.

- **Cursor logic + real-time letter coloring**  
  Manually splitting the text into `<span>`s, tracking `currentPosition`, and applying `text-green-500` / `text-red-500` + underline on mistakes felt really satisfying. The cursor highlight moving smoothly was the part I showed my friends first.

- **Real-time WPM & accuracy**  
  Calculating WPM `(correctChars / 5) / (elapsed / 60)` and accuracy on every keystroke taught me how to keep state clean and update the DOM efficiently.

- **Other cool stuff**  
  - First time using `contenteditable`  
  - Building a proper timer with `setInterval` and conditional styling (red pulse when <10s left)  
  - State management in pure JS (a single `state` object + `setState` helper)  
  - Conditional rendering of result screen vs typing screen with opacity/scale transitions

Here’s a small snippet I’m proud of (the typing handler):

```js
function handleTyping(e) {
  if (e.key.length !== 1) return;

  const typed = e.key;
  const expected = state.currentText[state.currentPosition];
  const isCorrect = typed === expected;

  isCorrect ? state.correctChars++ : state.incorrectChars++;

  updateStats();

  const spans = inputField.querySelectorAll("span");
  if (spans[state.currentPosition]) {
    if (isCorrect) {
      spans[state.currentPosition].classList.add("text-green-500");
    } else {
      spans[state.currentPosition].classList.add("text-red-500", "border-b-2", "border-red-500");
    }
  }

  state.currentPosition++;
  Cursor();

  if (state.currentPosition >= state.currentText.length) endGame();
}