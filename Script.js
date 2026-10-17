const questions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    answer: 2
  },
  {
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Jupiter", "Saturn", "Mars"],
    answer: 1
  },
  {
    question: "What is the capital of Germany?",
    options: ["Vienna", "Stockholm", "Berlin", "Amsterdam"],
    answer: 2
  },
  {
    question: "What is the capital of Japan?",
    options: ["Seoul", "Tokyo", "Beijing", "Bangkok"],
    answer: 1
  },
  {
    question: "What is the capital of Italy?",
    options: ["Rome", "Milan", "Venice", "Florence"],
    answer: 0
  },
  {
    question: "What is the capital of Spain?",
    options: ["Lisbon", "Madrid", "Barcelona", "Valencia"],
    answer: 1
  },
  {
    question: "What is the capital of Canada?",
    options: ["Toronto", "Ottawa", "Montreal", "Vancouver"],
    answer: 1
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
    answer: 2
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Mercury", "Saturn"],
    answer: 1
  },
  {
    question: "What is 9 x 7?",
    options: ["54", "63", "72", "81"],
    answer: 1
  }
];

let currentQuestionIndex = 0;
let score = 0;
let answerLocked = false;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");
const progressTextEl = document.getElementById("progress-text");
const progressBarEl = document.getElementById("progress-bar");
const questionNumberLabelEl = document.getElementById("question-number-label");
const feedbackEl = document.getElementById("feedback");
const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const questionPanel = document.querySelector(".question-panel");
const wrongSound = document.getElementById("wrongSound");

function triggerWrongShake() {
  if (!questionPanel) {
    return;
  }

  questionPanel.classList.remove("wrong-shake");
  void questionPanel.offsetWidth;
  questionPanel.classList.add("wrong-shake");

  setTimeout(() => {
    questionPanel.classList.remove("wrong-shake");
  }, 700);
}

function updateProgress() {
  const currentNumber = currentQuestionIndex + 1;
  const percentage = (currentNumber / questions.length) * 100;

  progressTextEl.textContent = `Question ${currentNumber} of ${questions.length}`;
  questionNumberLabelEl.textContent = `${currentNumber} / ${questions.length}`;
  progressBarEl.style.width = `${percentage}%`;
}

function showQuestion() {
  const currentQuestion = questions[currentQuestionIndex];

  answerLocked = false;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.hidden = true;
  startBtn.hidden = true;
  restartBtn.hidden = true;

  questionEl.textContent = currentQuestion.question;
  optionsEl.innerHTML = "";
  updateProgress();

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.textContent = option;
    button.dataset.index = String(index);
    button.setAttribute("role", "listitem");

    button.addEventListener("click", () => handleAnswer(index, button));
    optionsEl.appendChild(button);
  });
}

function handleAnswer(selectedIndex, clickedButton) {
  if (answerLocked) {
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const buttons = optionsEl.querySelectorAll("button");
  answerLocked = true;

  buttons.forEach((button) => {
    const buttonIndex = Number(button.dataset.index);
    button.disabled = true;

    if (buttonIndex === currentQuestion.answer) {
      button.classList.add("correct");
    }

    if (buttonIndex === selectedIndex && selectedIndex !== currentQuestion.answer) {
      button.classList.add("wrong");
    }
  });

  if (selectedIndex === currentQuestion.answer) {
    score++;
    scoreEl.textContent = `Score: ${score}`;
    clickedButton.classList.add("correct");
    feedbackEl.textContent = "Correct!";
    feedbackEl.classList.add("correct");
  } else {
    clickedButton.classList.add("wrong");
    feedbackEl.textContent = "Oh no!";
    feedbackEl.classList.add("wrong");

    console.log("Wrong answer selected");
    console.log("Audio element:", wrongSound);
    console.log("Audio source:", wrongSound && wrongSound.currentSrc);

    if (wrongSound) {
      wrongSound.currentTime = 0;
      const playPromise = wrongSound.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("OH NO sound is playing"))
          .catch((error) => console.error("OH NO sound FAILED:", error));
      }
    }

    triggerWrongShake();
  }

  nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? "See Results" : "Next Question";
  nextBtn.hidden = false;
}

function finishQuiz() {
  const finalMessage = score === questions.length
    ? "Perfect score!"
    : score >= questions.length / 2
      ? "Nice work!"
      : "Good try!";

  questionEl.textContent = `Quiz complete!`;
  optionsEl.innerHTML = `
    <div class="result-box">
      <div class="result-score">${score} / ${questions.length}</div>
      <p class="result-message">${finalMessage}</p>
    </div>
  `;

  scoreEl.textContent = `Final score: ${score}/${questions.length}`;
  progressTextEl.textContent = "Results";
  questionNumberLabelEl.textContent = `${questions.length} / ${questions.length}`;
  progressBarEl.style.width = "100%";
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.hidden = true;
  restartBtn.hidden = false;
}

function startQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  scoreEl.textContent = "Score: 0";
  startBtn.hidden = true;
  restartBtn.hidden = true;
  nextBtn.hidden = true;
  showQuestion();
}

nextBtn.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex += 1;
    showQuestion();
  } else {
    finishQuiz();
  }
});

restartBtn.addEventListener("click", startQuiz);
startBtn.addEventListener("click", startQuiz);
