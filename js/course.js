import { loadContent, getCourseById } from "./data.js";
import {
  enableAmbientBackground,
  enablePageTransition,
  revealOnScroll,
  setupContinueButton,
  formatDuration,
  formatDate,
} from "./ui.js";

enablePageTransition();
enableAmbientBackground();
setupContinueButton();

const container = document.querySelector("#course-container");

const renderCourse = (course, lessonMap) => {
  const modulesHtml = course.modules
    .map((module) => {
      const lessonsHtml = module.lessons
        .map((lessonId) => {
          const lesson = lessonMap.get(lessonId);
          if (!lesson) return "";
          return `
            <a class="lesson-row" href="lesson.html?id=${lesson.id}">
              <div>
                <strong>${lesson.title}</strong>
                <p>${lesson.description}</p>
              </div>
              <div class="lesson-row__meta">
                <span>${formatDate(lesson.createdAt)}</span>
                <span>${formatDuration(lesson.durationMinutes)}</span>
              </div>
            </a>
          `;
        })
        .join("");

      return `
        <div class="module" data-reveal>
          <h3>${module.title}</h3>
          <div class="module__lessons">
            ${lessonsHtml}
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <section class="course" data-reveal>
      <div class="course__header">
        <div>
          <p class="eyebrow">Course</p>
          <h1>${course.title}</h1>
          <p class="subtext">${course.description}</p>
        </div>
        <div class="course__meta">
          <span class="badge">${course.difficulty}</span>
          <span>${course.estimatedTime}</span>
          <span>${course.category}</span>
        </div>
      </div>

      <div class="course__outcomes" data-reveal>
        <h2>Learning outcomes</h2>
        <ul>
          ${course.outcomes.map((outcome) => `<li>${outcome}</li>`).join("")}
        </ul>
      </div>

      <div class="course__modules">
        <h2>Modules</h2>
        ${modulesHtml}
      </div>
    </section>
  `;

  revealOnScroll();
};

const initialize = async () => {
  try {
    const { courses, lessonMap } = await loadContent();
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("id");
    const course = getCourseById(courses, courseId);
    renderCourse(course, lessonMap);
  } catch (error) {
    container.innerHTML = `<p class="error">${error.message}</p>`;
  }
};

initialize();
