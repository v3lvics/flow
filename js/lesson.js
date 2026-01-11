import { loadContent, getLessonById, getCourseModuleForLesson } from "./data.js";
import {
  enablePageTransition,
  revealOnScroll,
  setupContinueButton,
  formatDate,
  formatDuration,
} from "./ui.js";

enablePageTransition();
setupContinueButton();

const sidebar = document.querySelector("#sidebar");
const content = document.querySelector("#lesson-content");
const progressBar = document.querySelector("#progress-bar");

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const storeProgress = (lessonId, progress) => {
  const current = JSON.parse(localStorage.getItem("lessonProgress") || "{}");
  current[lessonId] = progress;
  localStorage.setItem("lessonProgress", JSON.stringify(current));
  localStorage.setItem("lastLessonId", lessonId);
};

const getProgress = (lessonId) => {
  const current = JSON.parse(localStorage.getItem("lessonProgress") || "{}");
  return current[lessonId] || 0;
};

const updateProgressBar = (lessonId) => {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? Math.min(window.scrollY / scrollHeight, 1) : 0;
  progressBar.style.width = `${progress * 100}%`;
  storeProgress(lessonId, Math.round(progress * 100));
};

const renderSidebar = (course, currentLessonId, lessonMap) => {
  const modulesHtml = course.modules
    .map((module) => {
      const lessonsHtml = module.lessons
        .map((lessonId) => {
          const lesson = lessonMap.get(lessonId);
          if (!lesson) return "";
          const active = lessonId === currentLessonId ? "sidebar__link--active" : "";
          return `<a class="sidebar__link ${active}" href="lesson.html?id=${lessonId}">${lesson.title}</a>`;
        })
        .join("");

      return `
        <div class="sidebar__section">
          <p>${module.title}</p>
          ${lessonsHtml}
        </div>
      `;
    })
    .join("");

  sidebar.innerHTML = `
    <div class="sidebar__header">
      <span class="eyebrow">Course</span>
      <strong>${course.title}</strong>
      <a href="course.html?id=${course.id}">View course</a>
    </div>
    ${modulesHtml}
  `;
};

const renderQuiz = (quiz) => {
  if (!quiz?.length) return "";

  const questionsHtml = quiz
    .map(
      (item, index) => `
        <div class="quiz__item">
          <p>${index + 1}. ${item.question}</p>
          ${item.options
            .map(
              (option, optionIndex) => `
                <label>
                  <input type="radio" name="quiz-${index}" value="${optionIndex}" />
                  ${option}
                </label>
              `
            )
            .join("")}
          <p class="quiz__feedback" data-feedback="${index}"></p>
        </div>
      `
    )
    .join("");

  return `
    <div class="card" data-reveal>
      <h3>Mini quiz</h3>
      <div class="quiz">
        ${questionsHtml}
      </div>
      <button class="primary" id="check-quiz" type="button">Check answers</button>
    </div>
  `;
};

const renderLesson = (lesson, course, module, lessonMap) => {
  const tocItems = lesson.sections
    .map((section) => {
      const id = slugify(section.title);
      return `<a href="#${id}">${section.title}</a>`;
    })
    .join("");

  const sectionsHtml = lesson.sections
    .map((section) => {
      const id = slugify(section.title);
      return `
        <section id="${id}" data-reveal>
          <h2>${section.title}</h2>
          <p>${section.body}</p>
        </section>
      `;
    })
    .join("");

  const lessonOrder = course.modules.flatMap((moduleItem) => moduleItem.lessons);
  const lessonIndex = lessonOrder.indexOf(lesson.id);
  const prevLesson = lessonMap.get(lessonOrder[lessonIndex - 1]);
  const nextLesson = lessonMap.get(lessonOrder[lessonIndex + 1]);

  const relatedLessons = [...lessonMap.values()]
    .filter((item) => item.id !== lesson.id)
    .filter((item) => item.tags.some((tag) => lesson.tags.includes(tag)))
    .slice(0, 3);

  content.innerHTML = `
    <div class="breadcrumb" data-reveal>
      <a href="index.html">Courses</a>
      <span>›</span>
      <a href="course.html?id=${course.id}">${course.title}</a>
      <span>›</span>
      <span>${lesson.title}</span>
    </div>

    <div class="lesson__header" data-reveal>
      <h1>${lesson.title}</h1>
      <p class="subtext">${lesson.description}</p>
      <div class="lesson__meta">
        <span>${formatDate(lesson.createdAt)}</span>
        <span>${formatDuration(lesson.durationMinutes)}</span>
        <span class="badge">${lesson.difficulty}</span>
      </div>
    </div>

    <div class="card tldr" data-reveal>
      <strong>TL;DR</strong>
      <p>${lesson.tldr}</p>
    </div>

    <div class="toc" data-reveal>
      <h3>On this lesson</h3>
      ${tocItems}
    </div>

    ${sectionsHtml}

    <div class="lesson__nav" data-reveal>
      <div>
        ${prevLesson ? `<a class="ghost" href="lesson.html?id=${prevLesson.id}">← ${prevLesson.title}</a>` : ""}
      </div>
      <div>
        ${nextLesson ? `<a class="primary" href="lesson.html?id=${nextLesson.id}">${nextLesson.title} →</a>` : ""}
      </div>
    </div>

    ${renderQuiz(lesson.quiz)}

    <div class="card" data-reveal>
      <h3>Related lessons</h3>
      <div class="related">
        ${relatedLessons
          .map(
            (item) => `
              <a href="lesson.html?id=${item.id}">
                <strong>${item.title}</strong>
                <span>${item.description}</span>
              </a>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  const progress = getProgress(lesson.id);
  if (progress > 0) {
    progressBar.style.width = `${progress}%`;
  }

  renderSidebar(course, lesson.id, lessonMap);
  revealOnScroll();

  const quizButton = document.querySelector("#check-quiz");
  if (quizButton) {
    quizButton.addEventListener("click", () => {
      lesson.quiz.forEach((question, index) => {
        const selected = document.querySelector(`input[name="quiz-${index}"]:checked`);
        const feedback = document.querySelector(`[data-feedback="${index}"]`);
        if (!feedback) return;
        if (!selected) {
          feedback.textContent = "Pick an answer to check.";
          feedback.classList.add("quiz__feedback--warn");
          return;
        }
        const isCorrect = Number(selected.value) === question.answerIndex;
        feedback.textContent = isCorrect ? "Correct!" : question.explanation;
        feedback.classList.toggle("quiz__feedback--warn", !isCorrect);
      });
    });
  }

  window.addEventListener("scroll", () => updateProgressBar(lesson.id));
};

const initialize = async () => {
  try {
    const { courses, lessonMap } = await loadContent();
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get("id") || courses[0].modules[0].lessons[0];
    const lesson = getLessonById(lessonMap, lessonId);
    const context = getCourseModuleForLesson(courses, lessonId);
    if (!lesson || !context) {
      throw new Error("Lesson not found");
    }
    renderLesson(lesson, context.course, context.module, lessonMap);
  } catch (error) {
    content.innerHTML = `<p class="error">${error.message}</p>`;
  }
};

initialize();
