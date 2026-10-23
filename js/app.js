import { createGameState } from "./state.js";
import { renderCollection, renderCoins, showNotice } from "./ui.js";

const game = createGameState();

const portada = document.getElementById("portada");
const barra = document.getElementById("barraCarga");
const loadingCopy = document.getElementById("loadingCopy");

const phrases = [
  "Cargando mundo...",
  "Despertando monstruos...",
  "Preparando la incubadora...",
  "Revisando el bosque mágico...",
  "Listos para jugar..."
];

if (portada && barra && loadingCopy) {
  let width = 0;
  let phraseIndex = 0;

  const interval = setInterval(() => {
    width += 10;
    barra.style.width = width + "%";

    if (width % 25 === 0 && phraseIndex < phrases.length - 1) {
      phraseIndex += 1;
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

function init() {
  renderCoins(game.state);
  renderCollection(game.state);
  showNotice("¡MonsterWorld cargado!");
}

document.getElementById("walletButton")?.addEventListener("click", () => {
  showNotice("Billetera no conectada aún");
});

init();
