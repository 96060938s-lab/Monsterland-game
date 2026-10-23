
import { loadGame, saveGame } from "./save.js";
import { createRandomMonster } from "./monsters.js";
import { initUI } from "./ui.js";

// Cargar el progreso guardado del jugador.
const save = loadGame();

// Guardar los cambios sin reemplazar el estado del juego.
function persist() {
  return saveGame(save);
}

// Compartir los datos y las funciones principales
// con los módulos de MonsterWorld.
const game = {
  save,
  persist,
  createRandomMonster
};

document.addEventListener("DOMContentLoaded", () => {
  initUI(game);
});

export { game };
