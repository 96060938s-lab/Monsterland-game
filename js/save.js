import { createInitialState } from "./state.js";

const SAVE_KEY = "monsterWorldSave";
const PLAYER_KEY = "monsterWorldPlayerId";

function getPlayerId() {
  const stored = localStorage.getItem(PLAYER_KEY);
  if (stored && stored.trim()) return stored.trim();

  const playerId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(PLAYER_KEY, playerId);
  return playerId;
}

function normalizeSave(save, initial) {
  if (!save || typeof save !== "object" || Array.isArray(save)) {
    return initial;
  }

  const merged = { ...initial, ...save };

  merged.coins =
    typeof merged.coins === "number" && Number.isFinite(merged.coins)
      ? merged.coins
      : initial.coins;

  const objectFields = [
    "monsterProgress",
    "production",
    "needs",
    "care",
    "sleep",
    "inventory",
    "monsterSlots",
    "monsterNames"
  ];

  for (const field of objectFields) {
    if (!merged[field] || typeof merged[field] !== "object" || Array.isArray(merged[field])) {
      merged[field] = {};
    }
  }

  const arrayFields = ["eggs", "owned", "incubating"];
  for (const field of arrayFields) {
    if (!Array.isArray(merged[field])) {
      merged[field] = [];
    }
  }

  if (!merged.trainerProgress || typeof merged.trainerProgress !== "object") {
    merged.trainerProgress = { level: 1, xp: 0 };
  }

  if (typeof merged.lastDaily !== "string") {
    merged.lastDaily = "";
  }

  if (typeof merged.starterEggClaimed !== "boolean") {
    merged.starterEggClaimed = false;
  }

  if (typeof merged.spaceCount !== "number") {
    merged.spaceCount = 1;
  }

  if (typeof merged.xpBoostUntil !== "number") {
    merged.xpBoostUntil = 0;
  }

  return merged;
}

export function resetGameSave() {
  const initial = createInitialState();

  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  } catch (error) {
    console.error("No se pudo reiniciar MonsterWorld:", error);
  }

  return initial;
}

async function syncToServer(save) {
  try {
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: getPlayerId(),
        data: save
      })
    });

    if (!response.ok) {
      console.warn("MonsterWorld: no se pudo guardar en servidor, usando localStorage.");
      return false;
    }

    return true;
  } catch (error) {
    console.warn("MonsterWorld: servidor no disponible, usando localStorage.", error);
    return false;
  }
}

async function loadFromServer() {
  try {
    const playerId = getPlayerId();
    const response = await fetch(`/api/progress?playerId=${encodeURIComponent(playerId)}`);

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    if (!result || !result.ok || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.warn("MonsterWorld: servidor no disponible al cargar.", error);
    return null;
  }
}

// Guarda el progreso del jugador.
export async function saveGame(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (error) {
    console.error("No se pudo guardar MonsterWorld en localStorage:", error);
  }

  const synced = await syncToServer(save);
  return synced || true;
}

// Carga el progreso sin eliminar los datos anteriores.
export async function loadGame() {
  const initial = createInitialState();

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resetGame") === "1") {
      return resetGameSave();
    }

    const remoteSave = await loadFromServer();
    if (remoteSave) {
      const normalized = normalizeSave(remoteSave, initial);
      localStorage.setItem(SAVE_KEY, JSON.stringify(normalized));
      return normalized;
    }

    const stored = localStorage.getItem(SAVE_KEY);
    if (!stored) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(initial));
      return initial;
    }

    const previous = JSON.parse(stored);
    const normalized = normalizeSave(previous, initial);
    localStorage.setItem(SAVE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.error("Error al cargar MonsterWorld:", error);

    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (stored) {
        const previous = JSON.parse(stored);
        return normalizeSave(previous, initial);
      }
    } catch (readError) {
      console.error("No se pudo leer el guardado local:", readError);
    }

    return initial;
  }
}

if (typeof window !== "undefined") {
  window.resetMonsterWorldProgress = resetGameSave;
  window.clearMonsterWorldSave = resetGameSave;
  window.getMonsterWorldPlayerId = getPlayerId;
}
