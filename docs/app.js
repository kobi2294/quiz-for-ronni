(async function () {
  const STORAGE_KEY = "math-practice-local-state-v1";
  const app = document.getElementById("app");

  let quizzes = [];
  let quizMap = new Map();

  try {
    const registry = await fetch("quizes/index.json").then(r => r.json());
    const loaded = await Promise.all(
      registry.map(entry =>
        fetch("quizes/" + encodeURIComponent(entry.file)).then(r => r.json())
      )
    );
    quizzes = loaded;
    quizMap = new Map(quizzes.map(q => [q.id, q]));
  } catch (err) {
    console.error("Failed to load quizzes:", err);
  }

  let state = loadState();

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return normalizeState(createEmptyState());
      }

      const parsed = JSON.parse(raw);
      return normalizeState(parsed);
    } catch (error) {
      return normalizeState(createEmptyState());
    }
  }

  function createEmptyState() {
    return {
      activeTab: "pending",
      activeQuizId: null,
      progress: {}
    };
  }

  function normalizeState(rawState) {
    const base = createEmptyState();
    const nextState = {
      ...base,
      ...rawState,
      progress: {}
    };

    for (const quiz of quizzes) {
      nextState.progress[quiz.id] = normalizeQuizProgress(rawState && rawState.progress ? rawState.progress[quiz.id] : null, quiz);
    }

    return nextState;
  }

  function normalizeQuizProgress(rawProgress, quiz) {
    const questions = quiz.questions.map((question) => ({
      answers: Array.from({ length: question.answers.length }, () => ""),
      attempts: 0,
      status: "unanswered",
      isLocked: false,
      isCorrect: false,
      feedback: ""
    }));

    const base = {
      started: false,
      completed: false,
      currentIndex: 0,
      completedAt: null,
      startedAt: null,
      score: null,
      latestAccuracy: null,
      history: [],
      teacherComment: "",
      questions
    };

    if (!rawProgress || typeof rawProgress !== "object") {
      return base;
    }

    const mergedQuestions = questions.map((questionProgress, index) => {
      const existing = Array.isArray(rawProgress.questions) ? rawProgress.questions[index] : null;
      if (!existing || typeof existing !== "object") {
        return questionProgress;
      }

      const answers = Array.isArray(existing.answers)
        ? questionProgress.answers.map((fallback, answerIndex) => sanitizeAnswer(existing.answers[answerIndex] || fallback))
        : questionProgress.answers;

      return {
        ...questionProgress,
        answers,
        attempts: Number.isFinite(existing.attempts) ? existing.attempts : 0,
        status: existing.status || "unanswered",
        isLocked: Boolean(existing.isLocked),
        isCorrect: Boolean(existing.isCorrect),
        feedback: typeof existing.feedback === "string" ? existing.feedback : ""
      };
    });

    return {
      ...base,
      ...rawProgress,
      started: Boolean(rawProgress.started),
      completed: Boolean(rawProgress.completed),
      currentIndex: Number.isFinite(rawProgress.currentIndex) ? rawProgress.currentIndex : 0,
      history: Array.isArray(rawProgress.history) ? rawProgress.history : [],
      questions: mergedQuestions,
      teacherComment: typeof rawProgress.teacherComment === "string" ? rawProgress.teacherComment : ""
    };
  }

  function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function sanitizeAnswer(value) {
    return String(value || "").trim();
  }

  function countPlaceholders(text) {
    const matches = text.match(/__/g);
    return matches ? matches.length : 0;
  }

  function getQuizProgress(quizId) {
    if (!state.progress[quizId]) {
      const quiz = quizMap.get(quizId);
      if (!quiz) {
        return null;
      }

      state.progress[quizId] = normalizeQuizProgress(null, quiz);
      saveState();
    }

    return state.progress[quizId];
  }

  function getDerivedStats() {
    const allProgress = quizzes.map((quiz) => ({ quiz, progress: getQuizProgress(quiz.id) }));
    const completed = allProgress.filter(({ progress }) => progress.completed);
    const pending = allProgress.filter(({ progress }) => !progress.completed);
    const inProgress = allProgress.filter(({ progress }) => progress.started && !progress.completed);
    const totalScore = completed.reduce((sum, item) => sum + (item.progress.latestAccuracy || 0), 0);
    const average = completed.length ? Math.round(totalScore / completed.length) : 0;

    return {
      completed,
      pending,
      inProgress,
      average
    };
  }

  function getQuestionCompletionRate(progress) {
    const completedCount = progress.questions.filter((question) => question.status !== "unanswered").length;
    return Math.round((completedCount / progress.questions.length) * 100);
  }

  function getCorrectCount(progress) {
    return progress.questions.filter((question) => question.isCorrect).length;
  }

  function getIncorrectCount(progress) {
    return progress.questions.filter((question) => question.status !== "unanswered" && !question.isCorrect).length;
  }

  function getTeacherComment(quiz, accuracy) {
    if (accuracy >= 95) {
      return `${quiz.teacherName}: עבודה מצוינת. פתרת כמעט הכול נכון והראית שליטה נהדרת.`;
    }

    if (accuracy >= 75) {
      return `${quiz.teacherName}: כל הכבוד. יש בסיס חזק מאוד, וכדאי לחזור רק על כמה שאלות כדי להתחזק עוד.`;
    }

    if (accuracy >= 50) {
      return `${quiz.teacherName}: רואים שהתאמצת. שווה לנסות שוב בקצב רגוע ולבדוק כל תשובה לפני שממשיכים.`;
    }

    return `${quiz.teacherName}: התחלה טובה. כדאי לפתור שוב את המשימה לאט, צעד אחרי צעד, ולשים לב לסימני הפעולה.`;
  }

  function formatDate(value) {
    if (!value) {
      return "עדיין לא נשמר תאריך";
    }

    try {
      return new Intl.DateTimeFormat("he-IL", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  }

  function renderQuestionText(question, progressQuestion, quizId, questionIndex) {
    const lines = getQuestionLines(question);
    let placeholderIndex = 0;

    const linesHtml = lines.map((parts) => {
      const content = parts.map((part) => {
        if (isPlaceholderPart(part)) {
          const answerValue = progressQuestion.answers[placeholderIndex] || "";
          const currentPlaceholderIndex = placeholderIndex;
          placeholderIndex += 1;
          const disabled = progressQuestion.isCorrect || progressQuestion.isLocked ? "disabled" : "";
          const inputClass = progressQuestion.isCorrect ? "inline-answer inline-answer-correct" : progressQuestion.isLocked ? "inline-answer inline-answer-locked" : "inline-answer";
          return `<span class="answer-inline-wrapper"><input class="${inputClass}" inputmode="numeric" autocomplete="off" data-quiz-id="${quizId}" data-question-index="${questionIndex}" data-answer-index="${currentPlaceholderIndex}" value="${escapeAttribute(answerValue)}" ${disabled} aria-label="תשובה ${currentPlaceholderIndex + 1}"></span>`;
        }

        return renderQuestionSegment(part);
      }).join("");

      return `<span class="question-flow">${content}</span>`;
    });

    return linesHtml.join("<br>");
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(text) {
    return escapeHtml(text);
  }

  function getQuestionLines(question) {
    if (Array.isArray(question.text) && question.text.length > 0 && Array.isArray(question.text[0])) {
      return question.text.map(line => [...line].reverse());
    }

    if (Array.isArray(question.text)) {
      return [[...question.text].reverse()];
    }

    if (typeof question.text !== "string") {
      return [[]];
    }

    const parts = [];
    const chunks = question.text.split("__");

    for (let index = 0; index < chunks.length; index += 1) {
      if (chunks[index]) {
        parts.push(chunks[index]);
      }

      if (index < chunks.length - 1) {
        parts.push("__");
      }
    }

    return [parts];
  }

  function isPlaceholderPart(part) {
    return part === "__";
  }

  function isMathSegment(part) {
    return typeof part === "string" && /\d/.test(part) && !/[א-תA-Za-z]/.test(part);
  }

  function flipParentheses(text) {
    return text.replace(/[()]/g, ch => ch === "(" ? ")" : "(");
  }

  function renderQuestionSegment(part) {
    const classes = ["question-segment"];
    if (isMathSegment(part)) {
      classes.push("question-segment-math");
    }

    return `<span class="${classes.join(" ")}">${escapeHtml(flipParentheses(part))}</span>`;
  }

  function renderQuestionPreview(question) {
    const lines = getQuestionLines(question);
    return lines.map((parts) => {
      const content = parts.map((part) => {
        if (isPlaceholderPart(part)) {
          return '<span class="question-placeholder-preview">_____</span>';
        }

        return renderQuestionSegment(part);
      }).join("");
      return `<span class="question-flow">${content}</span>`;
    }).join("<br>");
  }

  function setRoute(route) {
    window.location.hash = route;
  }

  function getRoute() {
    return window.location.hash.replace(/^#/, "") || "home";
  }

  function startQuiz(quizId, options = {}) {
    const progress = getQuizProgress(quizId);
    const shouldReset = Boolean(options.reset);
    const quiz = quizMap.get(quizId);

    if (!quiz) {
      return;
    }

    if (shouldReset || !progress.started || progress.completed) {
      state.progress[quizId] = normalizeQuizProgress(null, quiz);
    }

    const nextProgress = getQuizProgress(quizId);
    nextProgress.started = true;
    nextProgress.completed = false;
    nextProgress.startedAt = nextProgress.startedAt || new Date().toISOString();
    nextProgress.currentIndex = 0;
    nextProgress.latestAccuracy = null;
    state.activeQuizId = quizId;
    saveState();
    setRoute(`quiz/${quizId}`);
  }

  function updateAnswer(quizId, questionIndex, answerIndex, value) {
    const progress = getQuizProgress(quizId);
    if (!progress) {
      return;
    }

    progress.questions[questionIndex].answers[answerIndex] = sanitizeAnswer(value);
    progress.started = true;
    progress.startedAt = progress.startedAt || new Date().toISOString();
    saveState();
  }

  function submitQuestion(quizId, questionIndex) {
    const quiz = quizMap.get(quizId);
    const progress = getQuizProgress(quizId);
    const question = quiz.questions[questionIndex];
    const progressQuestion = progress.questions[questionIndex];
    const normalizedAnswers = progressQuestion.answers.map(sanitizeAnswer);
    const emptyField = normalizedAnswers.some((answer) => !answer);
    const invalidField = normalizedAnswers.some((answer) => !/^[-+]?\d+$/.test(answer));

    if (emptyField) {
      progressQuestion.feedback = "✏️ צריך למלא את כל התשובות לפני שלוחצים על בדיקה.";
      render();
      return;
    }

    if (invalidField) {
      progressQuestion.feedback = "🔢 אפשר להקליד כאן רק מספרים.";
      render();
      return;
    }

    progressQuestion.attempts += 1;

    const isCorrect = question.answers.every((answer, index) => sanitizeAnswer(answer) === normalizedAnswers[index]);

    if (isCorrect) {
      progressQuestion.isCorrect = true;
      progressQuestion.status = "correct";
      progressQuestion.feedback = progressQuestion.attempts === 1
        ? "🌟 מעולה! פתרת נכון כבר בניסיון הראשון!"
        : "👏 כל הכבוד! הצלחת לתקן ולפתור נכון!";
    } else if (progressQuestion.attempts >= 3) {
      progressQuestion.isLocked = true;
      progressQuestion.status = "locked";
      progressQuestion.feedback = "💪 ניסית שלוש פעמים. אפשר לראות את התשובה הנכונה ולהמשיך!";
    } else {
      progressQuestion.status = "wrong";
      progressQuestion.feedback = `🤔 עדיין לא. זה ניסיון מספר ${progressQuestion.attempts}. אפשר לנסות שוב!`;
    }

    maybeCompleteQuiz(quizId);
    saveState();
    render();
  }

  function goToNextAvailableQuestion(quizId, currentIndex) {
    const progress = getQuizProgress(quizId);
    const nextIndex = progress.questions.findIndex((question, index) => index > currentIndex && !question.isCorrect && !question.isLocked);

    if (nextIndex !== -1) {
      progress.currentIndex = nextIndex;
      return;
    }

    progress.currentIndex = Math.min(currentIndex + 1, progress.questions.length - 1);
  }

  function maybeCompleteQuiz(quizId) {
    const quiz = quizMap.get(quizId);
    const progress = getQuizProgress(quizId);
    const finished = progress.questions.every((question) => question.isCorrect || question.isLocked);

    if (!finished) {
      return;
    }

    const correctCount = getCorrectCount(progress);
    const accuracy = Math.round((correctCount / quiz.questions.length) * 100);
    const summary = {
      completedAt: new Date().toISOString(),
      correctCount,
      incorrectCount: quiz.questions.length - correctCount,
      accuracy
    };

    progress.completed = true;
    progress.started = false;
    progress.completedAt = summary.completedAt;
    progress.score = correctCount;
    progress.latestAccuracy = accuracy;
    progress.teacherComment = getTeacherComment(quiz, accuracy);
    progress.history = [summary, ...progress.history].slice(0, 8);
  }

  function moveToQuestion(quizId, questionIndex) {
    const progress = getQuizProgress(quizId);
    progress.currentIndex = questionIndex;
    saveState();
    render();
  }

  function openResults(quizId) {
    state.activeQuizId = quizId;
    saveState();
    setRoute(`results/${quizId}`);
  }

  function resetAllData() {
    state = createEmptyState();
    state = normalizeState(state);
    saveState();
    setRoute("home");
  }

  function renderHomeView() {
    const stats = getDerivedStats();
    const activeTab = state.activeTab || "pending";
    const listItems = activeTab === "completed" ? stats.completed : stats.pending;

    const inProgressHtml = stats.inProgress.length ? `
      <section class="in-progress-banner">
        ${stats.inProgress.map(({ quiz, progress }) => {
          const completionRate = getQuestionCompletionRate(progress);
          const currentNumber = progress.currentIndex + 1;
          return `
            <button type="button" class="resume-banner" data-action="start-quiz" data-quiz-id="${quiz.id}">
              <div class="resume-banner-text">
                <strong>⏳ ${quiz.title}</strong>
                <span>שאלה ${currentNumber} מתוך ${quiz.questions.length} · ${completionRate}% הושלם</span>
              </div>
              <span class="resume-banner-action">להמשך ◀</span>
            </button>
          `;
        }).join("")}
      </section>
    ` : "";

    return `
      <section class="view active">
        <div class="home-layout">
          <main class="home-main">
            ${inProgressHtml}

            <div class="top-row" style="justify-content:space-between; align-items:center;">
              <div class="tabs-row">
                <button type="button" class="tab-button ${activeTab === "pending" ? "active" : ""}" data-tab="pending">📋 משימות שלא עשיתי</button>
                <button type="button" class="tab-button ${activeTab === "completed" ? "active" : ""}" data-tab="completed">✅ משימות שעשיתי</button>
              </div>
            </div>

            <div class="tasks-grid">
              ${listItems.length ? listItems.map(({ quiz, progress }) => renderTaskCard(quiz, progress, activeTab)).join("") : `<div class="empty-state">🎉 אין כרגע משימות ברשימה הזאת.</div>`}
            </div>
          </main>

          <aside class="home-sidebar">
            <div class="sidebar-stat">
              <span class="sidebar-stat-value">🏆 ${stats.completed.length}</span>
              <span class="sidebar-stat-label">משימות שסיימתי</span>
            </div>
            <div class="sidebar-stat">
              <span class="sidebar-stat-value">📚 ${quizzes.length}</span>
              <span class="sidebar-stat-label">סה״כ משימות</span>
            </div>
            <div class="sidebar-stat">
              <span class="sidebar-stat-value">⭐ ${stats.average}%</span>
              <span class="sidebar-stat-label">ממוצע הצלחה</span>
            </div>
          </aside>
        </div>
      </section>
    `;
  }

  function renderTaskCard(quiz, progress, tab) {
    const isCompleted = tab === "completed";
    const actionText = isCompleted ? "לצפייה בתוצאות" : progress.started ? "להמשך המשימה" : "להתחלת המשימה";
    const actionType = isCompleted ? "open-results" : "start-quiz";
    const completionRate = getQuestionCompletionRate(progress);

    return `
      <button type="button" class="task-card ${isCompleted ? "done" : "pending"}" data-action="${actionType}" data-quiz-id="${quiz.id}">
        <p class="eyebrow">${quiz.topic}</p>
        <h3>${quiz.title}</h3>
        <p>${quiz.questions.length} שאלות, רמת ${quiz.difficulty}</p>
        <div class="task-meta">
          <span class="meta-pill">${isCompleted ? `ציון אחרון ${progress.latestAccuracy || 0}%` : `${completionRate}% הושלם`}</span>
          <span class="meta-pill">${progress.history.length} ניסיונות שמורים</span>
        </div>
        <footer>
          <span>${actionText}</span>
          <span>◀</span>
        </footer>
      </button>
    `;
  }

  function renderResumeCard(quiz, progress) {
    const completionRate = getQuestionCompletionRate(progress);
    const currentNumber = progress.currentIndex + 1;

    return `
      <button type="button" class="resume-card" data-action="start-quiz" data-quiz-id="${quiz.id}">
        <p class="eyebrow">בדרך להשלמה</p>
        <h3>${quiz.title}</h3>
        <p>שאלה נוכחית: ${currentNumber} מתוך ${quiz.questions.length}</p>
        <div class="mini-progress" style="margin-top:12px;"><span style="width:${completionRate}%;"></span></div>
        <footer>
          <span>${completionRate}% הושלם</span>
          <span>להמשך ▶</span>
        </footer>
      </button>
    `;
  }

  function renderQuizView(quizId) {
    const quiz = quizMap.get(quizId);
    const progress = getQuizProgress(quizId);

    if (!quiz || !progress) {
      setRoute("home");
      return "";
    }

    if (progress.completed) {
      setRoute(`results/${quizId}`);
      return "";
    }

    const questionIndex = Math.min(progress.currentIndex, quiz.questions.length - 1);
    const question = quiz.questions[questionIndex];
    const progressQuestion = progress.questions[questionIndex];
    const attemptsLeft = Math.max(0, 3 - progressQuestion.attempts);

    return `
      <section class="view active">
        <div class="task-layout">
          <aside class="question-sidebar">
            <p class="eyebrow">שאלות המשימה</p>
            <h2 class="panel-title">מעבר מהיר</h2>
            <div class="question-list">
              ${quiz.questions.map((item, index) => renderQuestionJump(progress, index)).join("")}
            </div>
          </aside>

          <section class="question-panel">
            <div class="question-topline">
              <div>
                <p class="eyebrow">${quiz.title}</p>
                <h1 class="question-title">${quiz.topic}</h1>
                <div class="task-meta">
                  <span class="meta-pill">${quiz.questions.length} שאלות</span>
                  <span class="meta-pill">${quiz.difficulty}</span>
                  <span class="meta-pill">ניסיונות שנותרו: ${attemptsLeft}</span>
                </div>
              </div>
              <div class="question-counter">שאלה ${questionIndex + 1} מתוך ${quiz.questions.length}</div>
            </div>

            <div class="question-body">
              <p class="question-text">${renderQuestionText(question, progressQuestion, quizId, questionIndex)}</p>
              <div class="question-actions">
                <button type="button" class="primary-button" data-action="submit-question" data-quiz-id="${quizId}" data-question-index="${questionIndex}" ${progressQuestion.isCorrect || progressQuestion.isLocked ? "disabled" : ""}>בדיקה</button>
                <button type="button" class="secondary-button" data-action="next-question" data-quiz-id="${quizId}">לשאלה הבאה</button>
              </div>

              <div class="feedback-box ${getFeedbackClass(progressQuestion)}">
                <strong>${getFeedbackTitle(progressQuestion)}</strong>
                <p class="feedback-text">${progressQuestion.feedback || "✨ ממלאים את התשובות ולוחצים על בדיקה!"}</p>
                ${progressQuestion.isLocked ? `<div class="correct-answer-row">התשובה הנכונה: ${question.answers.join(" ,")}</div>` : ""}
                ${progressQuestion.attempts > 0 ? `<div class="correct-answer-row">מספר ניסיונות עד עכשיו: ${progressQuestion.attempts}</div>` : ""}
              </div>
            </div>
          </section>
        </div>
      </section>
    `;
  }

  function renderQuestionJump(progress, index) {
    const question = progress.questions[index];
    const classes = ["question-jump"];

    if (index === progress.currentIndex) {
      classes.push("current");
    } else if (question.isCorrect) {
      classes.push("correct");
    } else if (question.isLocked) {
      classes.push("locked");
    } else if (question.status === "wrong") {
      classes.push("wrong");
    } else if (question.status !== "unanswered") {
      classes.push("answered");
    }

    return `<button type="button" class="${classes.join(" ")}" data-action="jump-question" data-question-index="${index}">${index + 1}</button>`;
  }

  function getFeedbackClass(progressQuestion) {
    if (progressQuestion.isCorrect) {
      return "correct";
    }

    if (progressQuestion.isLocked) {
      return "locked";
    }

    if (progressQuestion.status === "wrong") {
      return "wrong";
    }

    return "";
  }

  function getFeedbackTitle(progressQuestion) {
    if (progressQuestion.isCorrect) {
      return "תשובה נכונה";
    }

    if (progressQuestion.isLocked) {
      return "נגמרו הניסיונות";
    }

    if (progressQuestion.status === "wrong") {
      return "צריך לנסות שוב";
    }

    return "מוכנים לפתור";
  }

  function renderResultsView(quizId) {
    const quiz = quizMap.get(quizId);
    const progress = getQuizProgress(quizId);

    if (!quiz || !progress || !progress.completed) {
      setRoute("home");
      return "";
    }

    const summary = progress.history[0] || {
      accuracy: progress.latestAccuracy || 0,
      correctCount: getCorrectCount(progress),
      incorrectCount: getIncorrectCount(progress),
      completedAt: progress.completedAt
    };

    return `
      <section class="view active">
        <div class="summary-layout">
          <section class="summary-card">
            <p class="eyebrow">תוצאות המשימה</p>
            <h1 class="summary-score">${summary.accuracy}% הצלחה</h1>
            <p class="panel-copy">סיימת את המשימה "${quiz.title}". הנה הסיכום המלא של הביצוע האחרון.</p>
            <div class="summary-pills">
              <span class="summary-pill">${summary.correctCount} תשובות נכונות</span>
              <span class="summary-pill">${summary.incorrectCount} תשובות שלא נפתרו נכון</span>
              <span class="summary-pill">נשמר בתאריך ${formatDate(summary.completedAt)}</span>
            </div>
            <div class="result-actions" style="margin-top:20px;">
              <button type="button" class="secondary-button" data-action="start-next-from-results">למשימה הבאה</button>
              <button type="button" class="ghost-button" data-action="go-home">חזרה לדף הבית</button>
            </div>
          </section>

          <aside class="teacher-note">
            <p class="eyebrow">משוב מהמורה</p>
            <h2 class="panel-title">הערה אישית</h2>
            <p>${progress.teacherComment}</p>
          </aside>
        </div>

        <section class="panel" style="margin-top:18px;">
          <p class="eyebrow">פירוט המשימה</p>
          <h2 class="section-title">תוצאות לפי שאלה</h2>
          <div class="results-list">
            ${quiz.questions.map((question, index) => renderQuestionResultCard(question, progress.questions[index], index)).join("")}
          </div>
        </section>
      </section>
    `;
  }

  function renderQuestionResultCard(question, progressQuestion, index) {
    const statusText = progressQuestion.isCorrect ? "נפתרה נכון" : "לא נפתרה נכון";

    return `
      <article class="result-card">
        <div class="result-header">
          <div>
            <p class="eyebrow">שאלה ${index + 1}</p>
            <h3 class="panel-title"><span class="question-flow">${renderQuestionPreview(question)}</span></h3>
          </div>
          <strong class="result-number">${statusText}</strong>
        </div>
        <p>ניסיונות: ${progressQuestion.attempts}</p>
        <p>התשובה הנכונה: <span class="answer-list">${question.answers.map(escapeHtml).join(" ,")}</span></p>
      </article>
    `;
  }

  function renderProgressView() {
    const stats = getDerivedStats();

    return `
      <section class="view active">
        <div class="panel">
          <p class="eyebrow">לוח התקדמות</p>
          <h1 class="section-title">ההתקדמות שלי</h1>
          <div class="summary-grid">
            <article class="stats-card">
              <span class="stat-label">כל המשימות</span>
              <strong>${quizzes.length}</strong>
            </article>
            <article class="stats-card">
              <span class="stat-label">משימות שהושלמו</span>
              <strong>${stats.completed.length}</strong>
            </article>
            <article class="stats-card">
              <span class="stat-label">ממוצע הצלחה</span>
              <strong>${stats.average}%</strong>
            </article>
          </div>

          <div class="results-list" style="margin-top:18px;">
            ${quizzes.map((quiz) => renderProgressRow(quiz, getQuizProgress(quiz.id))).join("")}
          </div>

          <div class="result-actions" style="margin-top:18px;">
            <button type="button" class="secondary-button" data-action="go-home">חזרה לדף הבית</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderProgressRow(quiz, progress) {
    const completionRate = progress.completed ? 100 : getQuestionCompletionRate(progress);
    const label = progress.completed
      ? `הושלם בציון ${progress.latestAccuracy || 0}%`
      : progress.started
        ? `בתהליך, ${completionRate}% הושלם`
        : "עדיין לא התחיל";

    return `
      <article class="result-card">
        <div class="result-header">
          <div>
            <p class="eyebrow">${quiz.topic}</p>
            <h3 class="panel-title">${quiz.title}</h3>
          </div>
          <strong>${label}</strong>
        </div>
        <div class="mini-progress" style="margin-top:12px;"><span style="width:${completionRate}%;"></span></div>
        <footer>
          <span>עודכן לאחרונה: ${formatDate(progress.completedAt || progress.startedAt)}</span>
          <button type="button" class="ghost-button" data-action="${progress.completed ? "open-results" : "start-quiz"}" data-quiz-id="${quiz.id}">${progress.completed ? "לתוצאות" : "לפתיחה"}</button>
        </footer>
      </article>
    `;
  }

  function render() {
    const route = getRoute();
    const [viewName, quizId] = route.split("/");

    if (viewName === "quiz" && quizId) {
      app.innerHTML = renderQuizView(quizId);
      attachDynamicHandlers();
      return;
    }

    if (viewName === "results" && quizId) {
      app.innerHTML = renderResultsView(quizId);
      attachDynamicHandlers();
      return;
    }

    if (viewName === "progress") {
      app.innerHTML = renderProgressView();
      attachDynamicHandlers();
      return;
    }

    app.innerHTML = renderHomeView();
    attachDynamicHandlers();
  }

  function attachDynamicHandlers() {
    app.querySelectorAll("[data-action]").forEach((element) => {
      element.addEventListener("click", handleActionClick);
    });

    app.querySelectorAll(".inline-answer").forEach((input) => {
      input.addEventListener("input", handleAnswerInput);
    });
  }

  function handleAnswerInput(event) {
    const target = event.currentTarget;
    updateAnswer(
      target.dataset.quizId,
      Number(target.dataset.questionIndex),
      Number(target.dataset.answerIndex),
      target.value
    );
  }

  function handleActionClick(event) {
    const target = event.currentTarget;
    const action = target.dataset.action;
    const quizId = target.dataset.quizId;
    const questionIndex = Number(target.dataset.questionIndex);

    if (action === "start-first") {
      const stats = getDerivedStats();
      const first = stats.inProgress[0] || stats.pending[0];
      if (first) {
        startQuiz(first.quiz.id);
      }
      return;
    }

    if (action === "open-progress") {
      setRoute("progress");
      return;
    }

    if (action === "go-home") {
      setRoute("home");
      return;
    }

    if (action === "start-quiz") {
      startQuiz(quizId);
      return;
    }

    if (action === "restart-quiz") {
      startQuiz(quizId, { reset: true });
      return;
    }

    if (action === "submit-question") {
      submitQuestion(quizId, questionIndex);
      return;
    }

    if (action === "jump-question") {
      const routeQuizId = getRoute().split("/")[1];
      moveToQuestion(routeQuizId, questionIndex);
      return;
    }

    if (action === "next-question") {
      const progress = getQuizProgress(quizId);
      progress.currentIndex = Math.min(progress.currentIndex + 1, quizMap.get(quizId).questions.length - 1);
      saveState();
      render();
      return;
    }

    if (action === "open-results") {
      openResults(quizId);
      return;
    }

    if (action === "start-next-from-results") {
      const stats = getDerivedStats();
      const nextQuiz = stats.pending[0] || stats.completed[0];
      if (nextQuiz) {
        startQuiz(nextQuiz.quiz.id, { reset: !getQuizProgress(nextQuiz.quiz.id).started || getQuizProgress(nextQuiz.quiz.id).completed });
      }
      return;
    }

    if (action === "reset-data") {
      const confirmed = window.confirm("למחוק את כל ההתקדמות שנשמרה במחשב הזה?");
      if (confirmed) {
        resetAllData();
      }
      return;
    }
  }

  function setActiveTab(tabName) {
    state.activeTab = tabName;
    saveState();
    render();
  }

  app.addEventListener("click", (event) => {
    const tabTarget = event.target.closest("[data-tab]");
    if (!tabTarget) {
      return;
    }

    setActiveTab(tabTarget.dataset.tab);
  });

  document.getElementById("homeShortcut").addEventListener("click", () => setRoute("home"));
  document.getElementById("progressShortcut").addEventListener("click", () => setRoute("progress"));
  window.addEventListener("hashchange", render);

  if (!window.location.hash) {
    setRoute("home");
  } else {
    render();
  }
})();