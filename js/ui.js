export const revealOnScroll = () => {
  const elements = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((element) => observer.observe(element));
};

export const enablePageTransition = () => {
  requestAnimationFrame(() => {
    document.body.classList.add("page--ready");
  });
};

export const setupContinueButton = () => {
  const button = document.querySelector("#continue-button");
  if (!button) return;

  const lastLesson = localStorage.getItem("lastLessonId");
  if (!lastLesson) {
    button.classList.add("hidden");
    return;
  }

  button.addEventListener("click", () => {
    window.location.href = `lesson.html?id=${lastLesson}`;
  });
};

export const formatDuration = (minutes) => {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
};

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
