const WORD_LENGTH = 5;
let currentRow = 0;
let currentWord = "";
let countCurrentWord = {};
let todaysWord;
let countTodaysWord = {};
let currentSquare = WORD_LENGTH * currentRow + currentWord.length;
const loadingIcon = document.querySelector(".loading-icon");

const getWord = "https://words.dev-apis.com/word-of-the-day";
const validWord = "https://words.dev-apis.com/validate-word";

function initialize() {
  getTodaysWord();
  document.querySelector("body").addEventListener("keydown", game);
}

function game(event) {
  if (isLetter(event.key)) {
    saveKey(event.key);
  }
  // We don't want to register backspace when first square of row is empty
  else if (event.key === "Backspace") {
    handleBackspace();
  }
  // We want to check word and display progress, then check result
  else if (event.key === "Enter") {
    checkWord();
  } else {
    // do nothing
    event.preventDefault();
  }
}

// We dont want to register keys after word has 5 letters
function saveKey(key) {
  if (currentWord.length < WORD_LENGTH) {
    document.querySelector(`.square-${currentSquare}`).innerText = key;
    currentWord += key;
    currentSquare++;
  }
}

// Return to previous letter, cut it from word and empty the square, works only on current row
function handleBackspace() {
  if (currentSquare > currentRow * WORD_LENGTH) {
    currentSquare--;
    document.querySelector(`.square-${currentSquare}`).innerText = "";
    currentWord = currentWord.slice(0, -1);
  }
}

// After waiting for response from API hide loading icon
async function getTodaysWord() {
  const promise = await fetch(getWord);
  todaysWord = await promise.json();
  loadingIcon.classList.toggle("hidden");
  todaysWord = todaysWord.word;
}

// We want only small and big letters
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

// First change currentWord to lowercase , then Send POST to API to check if entered word is valid, if no show red outline around word
async function checkWord() {
  if (currentWord.length !== WORD_LENGTH) {
    // do nothing
    return;
  }
  currentWord = currentWord.toLowerCase();
  loadingIcon.classList.toggle("hidden");
  const promise = await fetch(validWord, {
    method: "POST",
    body: JSON.stringify({ word: `${currentWord}` }),
  });
  const response = await promise.json();
  loadingIcon.classList.toggle("hidden");

  // If word is not valid, add and remove class, clear input and reset current word
  if (!response.validWord) {
    currentSquare -= currentWord.length;
    // currentWord = "";
    for (let i = 0; i < WORD_LENGTH; i++) {
      // Select each square in row
      const square = document.querySelector(`.square-${currentSquare + i}`);
      square.classList.toggle("wrong-word");
      // Remove class to allow multiple tries and set timeout to show effect
        square.innerText = "";
      setTimeout(() => {
        square.classList.toggle("wrong-word");
      }, "500");
    }
  } else {
    displayProgress();
    currentRow++;
  }

  // AFter checking word and displaying progress check for win
  if (currentWord === todaysWord) {
    handleWin();
  } else if (currentSquare === 30) {
    handleLoss();
  }

  // After all operations clear word for next round
  currentWord = "";
}

// If word is valid add corresponding classes
function displayProgress() {
  // After validation count letters in each word
  countTodaysWord = countLetters(todaysWord);
  countCurrentWord = countLetters(currentWord);

  for (let i = 0; i < WORD_LENGTH; i++) {
    // We must substract word lenght to add classses from first square
    let squareNumber = currentSquare - currentWord.length + i;
    const square = document.querySelector(`.square-${squareNumber}`);
    
    // First check if letter is in word if not its wrong
    if (todaysWord.includes(currentWord[i])) {
      // If its in same place its correct
      if (todaysWord[i] === currentWord[i]) {
        square.classList.add("correct"); 
        
        // If there is more letters in current word then in todaysword mark is as wrong if not its semi correct
      } else if (countCurrentWord[currentWord[i]] > countTodaysWord[currentWord[i]]) {
        square.classList.add("wrong");
      } else {
        square.classList.add("semi-correct");
      }
    } else {
      square.classList.add("wrong");
  }
}
}
// We want to remove event listener, so after win you can no longer interact with game , same for loss
function handleWin() {
  const message = document.querySelector(".result-message");
  message.innerText = "Congratulations, you won today's challenge!";
  message.classList.add("win", "animate");
  document.querySelector("body").removeEventListener("keydown", game);
}

function handleLoss() {
  const message = document.querySelector(".result-message");
  message.innerText = `Sorry you didn't guess, today's word was '${todaysWord.toUpperCase()}'`;
  message.classList.add("lose", "animate");
  document.querySelector("body").removeEventListener("keydown", game);
}

function countLetters(word) {
  let countLetters = {};
  for (let i = 0; i < word.length; i++) {
    let letter = word[i];
    // If there is no letter in object add it
    if (!countLetters[letter]) {
      countLetters[letter] = 1;
    } else {
      countLetters[letter]++;
    }
  }
  return countLetters;
}

initialize();
