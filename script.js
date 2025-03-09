const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const nextButton = document.getElementById("next-btn");
const scoreElement = document.getElementById("score");
const currentElement = document.getElementById("current");
const timerElement = document.getElementById("timer");
const resultMessage = document.getElementById("result-message");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeRemaining;

// JSONデータを読み込む
async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    const allQuestions = await response.json();

    // クイズの順番をシャッフルして10問に制限
    shuffle(allQuestions);
    questions = allQuestions.slice(0, 10);
    startQuiz();
  } catch (error) {
    console.error("データの読み込みに失敗しました", error);
  }
}

// 配列をシャッフル（Fisher-Yates法）
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// クイズ開始
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  updateScoreDisplay();
  updateCurrentQuestion();
  nextButton.textContent = "次の問題";
  nextButton.style.display = "none";
  showQuestion();
}

// スコア表示を更新
function updateScoreDisplay() {
  scoreElement.textContent = `スコア: ${score} / ${questions.length}`;
}

// 現在の問題番号を更新
function updateCurrentQuestion() {
  currentElement.textContent = `${currentQuestionIndex + 1}問目 / ${questions.length}問`;
}

// 問題を表示
function showQuestion() {
  resetState();

  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;

  // 回答をシャッフル
  const shuffledAnswers = [...currentQuestion.answers];
  shuffle(shuffledAnswers);

  shuffledAnswers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.addEventListener("click", () => handleAnswer(answer, currentQuestion));
    answersElement.appendChild(button);
  });

  updateCurrentQuestion();

  // タイマー開始（10秒）
  startTimer(10);
}

// 状態をリセット
function resetState() {
  nextButton.style.display = "none";
  clearInterval(timer); // タイマーをリセット
  while (answersElement.firstChild) {
    answersElement.removeChild(answersElement.firstChild);
  }

  // メッセージを消す
  resultMessage.textContent = "";
  resultMessage.className = "";
}

// タイマー開始
function startTimer(seconds) {
  timeRemaining = seconds;
  timerElement.textContent = `制限時間: ${timeRemaining}秒`;

  timer = setInterval(() => {
    timeRemaining--;
    timerElement.textContent = `制限時間: ${timeRemaining}秒`;

    if (timeRemaining <= 0) {
      clearInterval(timer);
      handleTimeout();
    }
  }, 1000);
}

// 回答処理
function handleAnswer(selectedAnswer, currentQuestion) {
  clearInterval(timer); // タイマーを停止

  const isCorrect = currentQuestion.answers.indexOf(selectedAnswer) === currentQuestion.correct;

  // ボタンの状態をハイライト
  Array.from(answersElement.children).forEach((button) => {
    if (currentQuestion.answers.indexOf(button.textContent) === currentQuestion.correct) {
      button.classList.add("correct");
    } else {
      button.classList.add("incorrect");
    }
    button.disabled = true;
  });

  if (isCorrect) {
    score++;
    updateScoreDisplay();
    showResultMessage(true); // 正解メッセージ表示
  } else {
    showResultMessage(false); // 不正解メッセージ表示
  }

  nextButton.style.display = "block";
}

// 時間切れ時の処理
function handleTimeout() {
  Array.from(answersElement.children).forEach((button) => {
    if (questions[currentQuestionIndex].answers.indexOf(button.textContent) === questions[currentQuestionIndex].correct) {
      button.classList.add("correct");
    } else {
      button.classList.add("incorrect");
    }
    button.disabled = true;
  });

  showResultMessage(false); // 時間切れは「不正解」として扱う
  nextButton.style.display = "block";
}

// 正誤メッセージの表示
function showResultMessage(isCorrect) {
  if (isCorrect) {
    resultMessage.textContent = "正解！";
    resultMessage.className = "correct";
  } else {
    resultMessage.textContent = "不正解！";
    resultMessage.className = "incorrect";
  }

  // 1秒後にメッセージを消す
  setTimeout(() => {
    resultMessage.textContent = "";
    resultMessage.className = "";
  }, 1000);
}

// 初期化
loadQuestions();
