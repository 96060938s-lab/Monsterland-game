
import { createInitialState } from "./state.js";

const SAVE_KEY = "monsterWorldSave";

// Guarda el progreso del jugador.
export function saveGame(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch (error) {
    console.error("No se pudo guardar MonsterWorld:", error);
    return false;
  }
}

// Carga el progreso sin eliminar los datos anteriores.
export function loadGame() {
  const initial = createInitialState();

  try {
    const stored = localStorage.getItem(SAVE_KEY);

    if (!stored) {
      saveGame(initial);
      return initial;
    }

    const previous = JSON.parse(stored);

    if (!previous || typeof previous !== "object" || Array.isArray(previous)) {
      return initial;
    }

    // Los valores nuevos se añaden sin borrar los antiguos.
    const save = {
      ...initial,
      ...previous
    };

    // Comprueba que los datos esenciales tengan el formato correcto.
    save.coins =
      typeof save.coins === "number" && Number.isFinite(save.coins)
        ? save.coins
        : initial.coins;

    const objectFields = [
      "monsterProgress",
      "production",
      "needs",
      "care",
      "sleep",
      "inventory",
      "monsterSlots"
    ];

    for (const field of objectFields) {
      if (
        !save[field] ||
        typeof save[field] !== "object" ||
        Array.isArray(save[field])
      ) {
        save[field] = {};
      }
    }

    const arrayFields = ["eggs", "owned", "incubating"];

    for (const field of arrayFields) {
      if (!Array.isArray(save[field])) {
        save[field] = [];
      }
    }

    if (!save.trainerProgress || typeof save.trainerProgress !== "object") {
      save.trainerProgress = { level: 1, xp: 0 };
    }

    if (typeof save.lastDaily !== "string") {
      save.lastDaily = "";
    }

    if (typeof save.starterEggClaimed !== "boolean") {
      save.starterEggClaimed = false;
    }

    if (typeof save.spaceCount !== "number") {
      save.spaceCount = 1;
    }

    if (typeof save.xpBoostUntil !== "number") {
      save.xpBoostUntil = 0;
    }

    // Conserva el guardado y completa los campos nuevos.
    saveGame(save);

    return save;
  } catch (error) {
    console.error("Error al cargar MonsterWorld:", error);

    // No borra el guardado dañado automáticamente.
    return initial;
  }
}
