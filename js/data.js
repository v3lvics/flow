const COURSE_URL = "content/courses.json";

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
};

const collectLessonIds = (courses) =>
  courses.flatMap((course) =>
    course.modules.flatMap((module) => module.lessons.map((lessonId) => lessonId))
  );

const loadLessons = async (lessonIds) => {
  const uniqueIds = [...new Set(lessonIds)];
  const lessons = await Promise.all(
    uniqueIds.map((lessonId) => fetchJson(`content/lessons/${lessonId}.json`))
  );
  return lessons;
};

export const loadContent = async () => {
  const { courses } = await fetchJson(COURSE_URL);
  const lessonIds = collectLessonIds(courses);
  const lessons = await loadLessons(lessonIds);
  const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  return { courses, lessons, lessonMap };
};

export const getCourseById = (courses, id) =>
  courses.find((course) => course.id === id) ?? courses[0];

export const getLessonById = (lessonMap, id) => lessonMap.get(id);

export const getCourseModuleForLesson = (courses, lessonId) => {
  for (const course of courses) {
    for (const module of course.modules) {
      if (module.lessons.includes(lessonId)) {
        return { course, module };
      }
    }
  }
  return null;
};
