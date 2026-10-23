import { createGameState } from "./state.js";
import { renderCollection, renderCoins, showNotice } from "./ui.js";

const game = createGameState();

function init() {
  renderCoins(game.state);
  renderCollection(game.state);
  showNotice("¡MonsterWorld cargado!");
}

document.getElementById("walletButton")?.addEventListener("click", () => {
  showNotice("Billetera no conectada aún");
});

init();
