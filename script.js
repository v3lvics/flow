const lessons = [
  {
    title: "Welding Fundamentals",
    description: "Learn safety, joints, and clean welding techniques with step-by-step demos.",
    createdAt: "2024-04-12",
    slug: "welding",
    thumb: "WF",
  },
  {
    title: "Astronomy Essentials",
    description: "Map the night sky, track constellations, and understand cosmic scale.",
    createdAt: "2024-03-05",
    slug: "astronomy",
    thumb: "AE",
  },
  {
    title: "UX Design Flow",
    description: "Structure user journeys, craft wireframes, and validate with real feedback.",
    createdAt: "2024-02-18",
    slug: "ux-design",
    thumb: "UX",
  },
  {
    title: "Spanish for Daily Life",
    description: "Short lessons to speak comfortably for travel, work, and everyday moments.",
    createdAt: "2024-01-28",
    slug: "spanish",
    thumb: "ES",
  },
];

const searchInput = document.querySelector("#search-input");
const resultsGrid = document.querySelector("#results-grid");
const resultsCount = document.querySelector("#results-count");
const clearButton = document.querySelector("#clear-search");

const formatDate = (value) => new Date(value).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const renderCards = (items) => {
  if (!resultsGrid) return;

  resultsGrid.innerHTML = items
    .map(
      (item) => `
        <a class="card card__link" href="${item.slug}.html">
          <div class="card__meta">
            <span>${formatDate(item.createdAt)}</span>
            <span class="card__thumb">${item.thumb}</span>
          </div>
          <div>
            <div class="card__title">${item.title}</div>
            <p class="card__desc">${item.description}</p>
          </div>
        </a>
      `
    )
    .join("");

  if (resultsCount) {
    resultsCount.textContent = `${items.length} result${items.length === 1 ? "" : "s"}`;
  }
};

const filterLessons = () => {
  const query = searchInput?.value.trim().toLowerCase() || "";
  const filtered = lessons.filter((lesson) => {
    const haystack = `${lesson.title} ${lesson.description}`.toLowerCase();
    return haystack.includes(query);
  });
  renderCards(filtered);
};

if (searchInput) {
  searchInput.addEventListener("input", filterLessons);
}

if (clearButton && searchInput) {
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    renderCards(lessons);
  });
}

renderCards(lessons);

const updateBackground = (event) => {
  const { innerWidth, innerHeight } = window;
  const x = (event.clientX / innerWidth) * 100;
  const y = (event.clientY / innerHeight) * 100;
  document.documentElement.style.setProperty("--mx", x.toFixed(2));
  document.documentElement.style.setProperty("--my", y.toFixed(2));
};

window.addEventListener("mousemove", updateBackground);
window.addEventListener("touchmove", (event) => {
  if (event.touches[0]) {
    updateBackground(event.touches[0]);
  }
});
const greeting = document.querySelector(".hero__eyebrow");
const hour = new Date().getHours();

const period = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

if (greeting) {
  greeting.textContent = `${period}, curious mind ✨`;
}

const search = document.querySelector(".search");
const input = document.querySelector(".search input");

if (search && input) {
  search.addEventListener("submit", (event) => {
    event.preventDefault();
    input.value = "";
    input.placeholder = "Tell us what you want to learn next...";
  });
}
