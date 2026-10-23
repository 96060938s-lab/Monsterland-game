const portada = document.getElementById("portada");
const barra = document.getElementById("barraCarga");
const loadingCopy = document.getElementById("loadingCopy");

const phrases = [
  "Despertando monstruos...",
  "Preparando la incubadora...",
  "Revisando el bosque mágico...",
  "Conectando energía de las criaturas...",
  "Listos para jugar..."
];

if (portada && barra && loadingCopy) {
  let width = 0;
  let phraseIndex = 0;

  const interval = setInterval(() => {
    width += 10;
    barra.style.width = width + "%";

    if (width % 25 === 0 && phraseIndex < phrases.length - 1) {
      phraseIndex++;
      loadingCopy.textContent = phrases[phraseIndex];
    }

    if (width >= 100) {
      clearInterval(interval);
      loadingCopy.textContent = "Listos para jugar...";
      setTimeout(() => {
        portada.classList.add("hidden");
      }, 400);
    }
  }, 120);
}
