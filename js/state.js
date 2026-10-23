import { loadSave, saveGame } from "./save.js";

export function createGameState() {
  const state = loadSave();

  return {
    state,

    update(mutator) {
      this.state = mutator(this.state);
      saveGame(this.state);
      return this.state;
    },

    set(nextState) {
      this.state = nextState;
      saveGame(this.state);
    }
  };
}
