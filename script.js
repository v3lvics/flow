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
