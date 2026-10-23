import { loadSave, saveGame } from "./save.js";
import { getRandomMonsterFromPool, getRandomRarity } from "./monsters.js";
import { renderCollection, renderCoins, renderStarterEgg, showNotice } from "./ui.js";

const state = loadSave();

function persist() {
  saveGame(state);
}

function tryOpenStarterEgg() {
  const egg = state.inventory.eggs.find((item) => item.id === "starter-gift-egg");
  if (!egg || state.starterEggClaimed) return;

  egg.hatchProgress = Number(egg.hatchProgress || 0) + 1;

  if (egg.hatchProgress < 4) {
    const remaining = 4 - egg.hatchProgress;
    showNotice(`¡El huevo se está abriendo! Falta${remaining === 1 ? "" : "n"} ${remaining} toque${remaining === 1 ? "" : "s"}.`);
    persist();
    renderStarterEgg(state);
    return;
  }

  const rarity = getRandomRarity();
  const chosen = getRandomMonsterFromPool(state.owned);

  if (!chosen) {
    showNotice("No hay más monstruos disponibles.");
    state.starterEggClaimed = true;
    state.inventory.eggs = state.inventory.eggs.filter((item) => item.id !== "starter-gift-egg");
    persist();
    renderStarterEgg(state);
    renderCollection(state);
    return;
  }

  const monster = {
    ...chosen,
    rarity
  };

  state.owned.push(monster.id);
  state.monsterProgress[monster.id] = { level: 1, xp: 0 };

  const namePrompt = window.prompt(
    `¡Descubriste a ${monster.name} (${rarity})! ¿Cómo quieres llamarlo?`,
    monster.name
  );

  const customName = namePrompt && namePrompt.trim() ? namePrompt.trim() : monster.name;

  state.petNames[monster.id] = customName;
  state.starterEggClaimed = true;
  state.inventory.eggs = state.inventory.eggs.filter((item) => item.id !== "starter-gift-egg");

  persist();
  renderCoins(state);
  renderCollection(state);
  renderStarterEgg(state);

  showNotice(`¡${customName} ha llegado a tu vida!`);
}

function init() {
  if (!state.starterEggClaimed) {
    renderStarterEgg(state);
  }

  renderCoins(state);
  renderCollection(state);
}

document.addEventListener("click", (event) => {
  if (event.target && event.target.id === "starterEggButton") {
    tryOpenStarterEgg();
  }
});

init();
