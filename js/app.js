import { loadContent } from "./data.js";
import {
  enableAmbientBackground,
  enablePageTransition,
  revealOnScroll,
  setupContinueButton,
  formatDate,
  formatDuration,
} from "./ui.js";

enablePageTransition();
enableAmbientBackground();
setupContinueButton();

const searchInput = document.querySelector("#global-search");
const clearButton = document.querySelector("#clear-search");
const resultsGrid = document.querySelector("#results-grid");
const resultsCount = document.querySelector("#results-count");
const categoryFilter = document.querySelector("#category-filter");
const difficultyFilter = document.querySelector("#difficulty-filter");
const sortFilter = document.querySelector("#sort-filter");
const tagFilter = document.querySelector("#tag-filter");

const difficultyOrder = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const state = {
  items: [],
  tags: new Set(),
  selectedTags: new Set(),
  fuse: null,
};

const createThumbnail = (title) =>
  title
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const buildItems = (courses, lessons, lessonMap) => {
  const items = [];

  courses.forEach((course) => {
    items.push({
      id: course.id,
      type: "course",
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      createdAt: course.createdAt || "2024-01-01",
      durationMinutes: course.estimatedMinutes || 180,
      category: course.category,
      tags: course.tags,
      url: `course.html?id=${course.id}`,
      bodyText: course.outcomes.join(" "),
    });
  });

  courses.forEach((course) => {
    course.modules.forEach((module) => {
      module.lessons.forEach((lessonId) => {
        const lesson = lessonMap.get(lessonId);
        if (!lesson) return;
        items.push({
          id: lesson.id,
          type: "lesson",
          title: lesson.title,
          description: lesson.description,
          difficulty: lesson.difficulty,
          createdAt: lesson.createdAt,
          durationMinutes: lesson.durationMinutes,
          category: course.category,
          tags: lesson.tags,
          url: `lesson.html?id=${lesson.id}`,
          moduleTitle: module.title,
          courseTitle: course.title,
          bodyText: lesson.sections.map((section) => section.body).join(" "),
        });
      });
    });
  });

  return items;
};

const populateFilters = (items) => {
  const categories = ["All", ...new Set(items.map((item) => item.category))];
  categoryFilter.innerHTML = categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
  difficultyFilter.innerHTML = difficulties
    .map((difficulty) => `<option value="${difficulty}">${difficulty}</option>`)
    .join("");

  items.forEach((item) => item.tags.forEach((tag) => state.tags.add(tag)));

  tagFilter.innerHTML = [...state.tags]
    .map(
      (tag) =>
        `<button type="button" class="chip" data-tag="${tag}">${tag}</button>`
    )
    .join("");
};

const matchFilters = (item) => {
  const category = categoryFilter.value;
  const difficulty = difficultyFilter.value;

  const matchesCategory = category === "All" || item.category === category;
  const matchesDifficulty = difficulty === "All" || item.difficulty === difficulty;

  const matchesTags =
    state.selectedTags.size === 0 ||
    [...state.selectedTags].every((tag) => item.tags.includes(tag));

  return matchesCategory && matchesDifficulty && matchesTags;
};

const sortItems = (items) => {
  const sortValue = sortFilter.value;
  const copy = [...items];

  if (sortValue === "newest") {
    return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (sortValue === "shortest") {
    return copy.sort((a, b) => a.durationMinutes - b.durationMinutes);
  }

  return copy.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
};

const renderItems = (items) => {
  if (!resultsGrid) return;

  resultsGrid.innerHTML = items
    .map((item) => {
      const meta = item.type === "course" ? item.category : `${item.courseTitle} · ${item.moduleTitle}`;
      return `
        <a class="card card--link" href="${item.url}" data-reveal>
          <div class="card__meta">
            <span>${formatDate(item.createdAt)} · ${formatDuration(item.durationMinutes)}</span>
            <span class="card__thumb">${createThumbnail(item.title)}</span>
          </div>
          <div class="card__title">${item.title}</div>
          <p class="card__desc">${item.description}</p>
          <div class="card__footer">
            <span class="badge">${item.difficulty}</span>
            <span class="meta">${meta}</span>
          </div>
        </a>
      `;
    })
    .join("");

  if (resultsCount) {
    resultsCount.textContent = `${items.length} result${items.length === 1 ? "" : "s"}`;
  }

  revealOnScroll();
};

const runSearch = () => {
  const query = searchInput.value.trim();
  const filtered = state.fuse && query
    ? state.fuse.search(query).map((result) => result.item)
    : state.items;

  const narrowed = filtered.filter(matchFilters);
  renderItems(sortItems(narrowed));
};

const setupTagHandlers = () => {
  tagFilter.addEventListener("click", (event) => {
    const target = event.target.closest(".chip");
    if (!target) return;

    const tag = target.dataset.tag;
    if (state.selectedTags.has(tag)) {
      state.selectedTags.delete(tag);
      target.classList.remove("chip--active");
    } else {
      state.selectedTags.add(tag);
      target.classList.add("chip--active");
    }

    runSearch();
  });
};

const setupEvents = () => {
  searchInput.addEventListener("input", runSearch);
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    runSearch();
  });
  categoryFilter.addEventListener("change", runSearch);
  difficultyFilter.addEventListener("change", runSearch);
  sortFilter.addEventListener("change", runSearch);
  setupTagHandlers();
};

const initialize = async () => {
  try {
    const { courses, lessons, lessonMap } = await loadContent();
    state.items = buildItems(courses, lessons, lessonMap);

    state.fuse = new Fuse(state.items, {
      keys: ["title", "description", "bodyText"],
      threshold: 0.3,
    });

    populateFilters(state.items);
    setupEvents();
    runSearch();
  } catch (error) {
    resultsGrid.innerHTML = `<p class="error">${error.message}</p>`;
  }
};

initialize();
