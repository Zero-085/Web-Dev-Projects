// =============================
// DOM
// =============================
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const amountSelect = document.getElementById("amount");
const difficultySelect = document.getElementById("difficulty");
const categorySelect = document.getElementById("category");

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");

const currentQuestionEl = document.getElementById("current-question");
const totalQuestionsEl = document.getElementById("total-questions");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("final-score");
const maxScoreEl = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const progressBar = document.getElementById("progress");

// =============================
// STATE
// =============================
let questions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;

// =============================
// EVENTS
// =============================
startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", () => showScreen(startScreen));

// =============================
// START QUIZ
// =============================
async function startQuiz() {
  showScreen(quizScreen);
  questionText.textContent = "Loading questions...";
  answersContainer.innerHTML = "";

  const amount = amountSelect.value;
  const difficulty = difficultySelect.value;
  const category = categorySelect.value;

  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;

  if (difficulty) url += `&difficulty=${difficulty}`;
  if (category) url += `&category=${category}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    questions = formatQuestions(data.results);
    currentIndex = 0;
    score = 0;
    scoreEl.textContent = 0;

    totalQuestionsEl.textContent = questions.length;
    maxScoreEl.textContent = questions.length;

    showQuestion();
  } catch {
    questionText.textContent = "Failed to load questions.";
  }
}

// =============================
// FORMAT DATA
// =============================
function formatQuestions(data) {
  return data.map((q) => {
    const answers = [
      ...q.incorrect_answers.map((a) => ({
        text: decodeHTML(a),
        correct: false,
      })),
      {
        text: decodeHTML(q.correct_answer),
        correct: true,
      },
    ];

    return {
      question: decodeHTML(q.question),
      answers: shuffle(answers),
    };
  });
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// =============================
// QUESTION
// =============================
function showQuestion() {
  clearInterval(timer);
  answersContainer.innerHTML = "";

  const current = questions[currentIndex];
  questionText.textContent = current.question;
  currentQuestionEl.textContent = currentIndex + 1;

  updateProgress();

  current.answers.forEach((ans) => {
    const btn = document.createElement("button");
    btn.textContent = ans.text;
    btn.classList.add("answer-btn");
    if (ans.correct) btn.dataset.correct = true;

    btn.addEventListener("click", selectAnswer);
    answersContainer.appendChild(btn);
  });

  startTimer();
}

// =============================
// TIMER
// =============================
function startTimer() {
  timeLeft = 15;

  timer = setInterval(() => {
    timeLeft--;
    questionText.textContent =
      questions[currentIndex].question + ` (${timeLeft}s)`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

// =============================
// ANSWER
// =============================
function selectAnswer(e) {
  clearInterval(timer);

  const correct = e.target.dataset.correct === "true";
  if (correct) {
    score++;
    scoreEl.textContent = score;
  }

  Array.from(answersContainer.children).forEach((btn) => {
    if (btn.dataset.correct === "true") btn.classList.add("correct");
    else btn.classList.add("incorrect");

    btn.disabled = true;
  });

  setTimeout(nextQuestion, 1000);
}

// =============================
// NEXT
// =============================
function nextQuestion() {
  currentIndex++;

  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

// =============================
// RESULTS
// =============================
function showResults() {
  showScreen(resultScreen);
  finalScoreEl.textContent = score;

  const percent = (score / questions.length) * 100;

  if (percent === 100) resultMessage.textContent = "Insane.";
  else if (percent >= 70) resultMessage.textContent = "Solid brain.";
  else resultMessage.textContent = "You need revision.";
}

// =============================
// UTIL
// =============================
function updateProgress() {
  const percent = (currentIndex / questions.length) * 100;
  progressBar.style.width = `${percent}%`;
}

function showScreen(screen) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
