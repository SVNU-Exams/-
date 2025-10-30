
// Select Elements
let countSpan = document.querySelector(".count span");
let bullets = document.querySelector(".bullets");
let bulletsSpanContainer = document.querySelector(".bullets .spans");
let quizArea = document.querySelector(".quiz-area");
let answersArea = document.querySelector(".answers-area");
let submitButton = document.querySelector(".submit-button");
let resultsContainer = document.querySelector(".results");
let countdownElement = document.querySelector(".countdown");

// Set Options
let currentIndex = 0;
let rightAnswers = 0;
let countdownInterval;

// Global questions holder
let questionsObject = [];

// Total duration for whole quiz (45 minutes)
const totalDuration = 45 * 60; // seconds
let remainingTime = totalDuration;
let countdownStarted = false;

function getQuestions() {
  let myRequest = new XMLHttpRequest();

  myRequest.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      questionsObject = JSON.parse(this.responseText); // store globally
      let qCount = questionsObject.length;

      // Create Bullets + Set Questions Count
      createBullets(qCount);

      // Add Question Data
      addQuestionData(questionsObject[currentIndex], qCount);

      // Start the single total CountDown (only once)
      if (!countdownStarted) {
        startTotalCountdown(qCount);
        countdownStarted = true;
      }

      // Click On Submit
      submitButton.onclick = () => {
        // Get Right Answer
        let theRightAnswer = questionsObject[currentIndex].right_answer;

        // Increase Index
        currentIndex++;

        // Check The Answer
        checkAnswer(theRightAnswer, qCount);

        // Remove Previous Question
        quizArea.innerHTML = "";
        answersArea.innerHTML = "";

        // Add Question Data (if any left)
        addQuestionData(questionsObject[currentIndex], qCount);

        // Handle Bullets Class
        handleBullets();

        // NOTE: Do NOT restart the countdown here because it's total-time for whole quiz

        // Show Results (if finished)
        showResults(qCount);
      };
    }
  };

  myRequest.open("GET", "html_questions.json", true);
  myRequest.send();
}

getQuestions();

function createBullets(num) {
  countSpan.innerHTML = num;

  // Create Spans
  for (let i = 0; i < num; i++) {
    // Create Bullet
    let theBullet = document.createElement("span");

    // Check If Its First Span
    if (i === 0) {
      theBullet.className = "on";
    }

    // Append Bullets To Main Bullet Container
    bulletsSpanContainer.appendChild(theBullet);
  }
}

function addQuestionData(obj, count) {
  if (!obj) return; // safety
  if (currentIndex < count) {
    // Create H2 Question Title
    let questionTitle = document.createElement("h2");

    // Create Question Text
    let questionText = document.createTextNode(obj["title"]);

    // Append Text To H2
    questionTitle.appendChild(questionText);

    // Append The H2 To The Quiz Area
    quizArea.appendChild(questionTitle);

    // Create The Answers
    for (let i = 1; i <= 4; i++) {
      // Create Main Answer Div
      let mainDiv = document.createElement("div");

      // Add Class To Main Div
      mainDiv.className = "answer";

      // Create Radio Input
      let radioInput = document.createElement("input");

      // Add Type + Name + Id + Data-Attribute
      radioInput.name = "question";
      radioInput.type = "radio";
      radioInput.id = `answer_${i}`;
      radioInput.dataset.answer = obj[`answer_${i}`];

      // Make First Option Selected
      if (i === 1) {
        radioInput.checked = true;
      }

      // Create Label
      let theLabel = document.createElement("label");

      // Add For Attribute
      theLabel.htmlFor = `answer_${i}`;

      // Create Label Text
      let theLabelText = document.createTextNode(obj[`answer_${i}`]);

      // Add The Text To Label
      theLabel.appendChild(theLabelText);

      // Add Input + Label To Main Div
      mainDiv.appendChild(radioInput);
      mainDiv.appendChild(theLabel);

      // Append All Divs To Answers Area
      answersArea.appendChild(mainDiv);
    }
  }
}

function checkAnswer(rAnswer, count) {
  let answers = document.getElementsByName("question");
  let theChoosenAnswer;

  for (let i = 0; i < answers.length; i++) {
    if (answers[i].checked) {
      theChoosenAnswer = answers[i].dataset.answer;
    }
  }

  if (rAnswer === theChoosenAnswer) {
    rightAnswers++;
  }
}

function handleBullets() {
  let bulletsSpans = document.querySelectorAll(".bullets .spans span");
  let arrayOfSpans = Array.from(bulletsSpans);
  arrayOfSpans.forEach((span, index) => {
    if (currentIndex === index) {
      span.className = "on";
    }
  });
}

function showResults(count) {
  let theResults;
  if (currentIndex === count) {
    quizArea.remove();
    answersArea.remove();
    submitButton.remove();
    bullets.remove();

    if (rightAnswers > count / 2 && rightAnswers < count) {
      theResults = `<span class="good">Good</span>, ${rightAnswers} From ${count}`;
    } else if (rightAnswers === count) {
      theResults = `<span class="perfect">Perfect</span>, All Answers Is Good`;
    } else {
      theResults = `<span class="bad">Bad</span>, ${rightAnswers} From ${count}`;
    }

    resultsContainer.innerHTML = theResults;
    resultsContainer.style.padding = "10px";
    resultsContainer.style.backgroundColor = "white";
    resultsContainer.style.marginTop = "10px";

    // Stop countdown if still running
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  }
}

// Start a single total countdown for the whole quiz
function startTotalCountdown(totalQuestionsCount) {
  // remainingTime is in seconds (initialized to totalDuration)
  updateCountdownDisplay(remainingTime);

  countdownInterval = setInterval(function () {
    remainingTime--;

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      countdownElement.innerHTML = "00:00";
      // Time finished -> we should check current question's answer (if any) and then show results
      try {
        // If there is still an unanswered question (currentIndex < totalQuestionsCount), evaluate current selection
        if (currentIndex < totalQuestionsCount && questionsObject[currentIndex]) {
          let theRightAnswer = questionsObject[currentIndex].right_answer;
          checkAnswer(theRightAnswer, totalQuestionsCount);
        }
      } catch (e) {
        console.warn("Error while checking last answer at timeout:", e);
      }

      // Move index to end to trigger results display logic
      currentIndex = totalQuestionsCount;
      showResults(totalQuestionsCount);
      alert("انتهى الوقت! تم إنهاء الاختبار.");
      return;
    }

    updateCountdownDisplay(remainingTime);
  }, 1000);
}

function updateCountdownDisplay(seconds) {
  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;

  let minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  let secStr = secs < 10 ? `0${secs}` : `${secs}`;

  countdownElement.innerHTML = `${minStr}:${secStr}`;
}


