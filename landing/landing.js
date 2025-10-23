// script.js con modo oscuro activable
document.getElementById("cta").addEventListener("click", function() {
  window.scrollTo({
    top: document.getElementById("services").offsetTop,
    behavior: "smooth"
  });
});

const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Gracias por tu mensaje. Te contactaré pronto 🌙");
  form.reset();
});

// Menú responsive
document.getElementById('nav-toggle').addEventListener('click', function() {
  document.getElementById('nav-links').classList.toggle('active');
});

// Modo oscuro
const themeBtn = document.getElementById("darkToggle");
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeBtn.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});
