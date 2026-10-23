import { createGameState } from "./state.js";
import { renderCollection, renderCoins, showNotice } from "./ui.js";

const game = createGameState();

const portada = document.getElementById("portada");
const barra = document.getElementById("barraCarga");

if (portada && barra) {
  let width = 0;
  const interval = setInterval(() => {
    width += 10;
    barra.style.width = width + "%";

    if (width >= 100) {
      clearInterval(interval);
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
