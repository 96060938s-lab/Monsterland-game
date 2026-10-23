export function defaultSave() {
  return {
    version: 1,
    coins: 100,
    owned: [],
    inventory: {
      eggs: [],
      food: [],
      bath: [],
      sleep: []
    },
    trainer: {
      level: 1,
      xp: 0
    },
    slots: {
      capacity: 1
    },
    monsterProgress: {},
    incubating: [],
    starterEggClaimed: false
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem("monsterWorldSave");
    if (!raw) return defaultSave();

    const parsed = JSON.parse(raw);
    return migrateSave(parsed);
  } catch (error) {
    console.error("Error loading save:", error);
    return defaultSave();
  }
}

export function saveGame(state) {
  try {
    localStorage.setItem("monsterWorldSave", JSON.stringify(state));
  } catch (error) {
    console.error("Error saving game:", error);
  }
}

export function migrateSave(save) {
  const base = defaultSave();

  return {
    ...base,
    ...save,
    inventory: {
      ...base.inventory,
      ...(save.inventory || {})
    },
    trainer: {
      ...base.trainer,
      ...(save.trainer || {})
    },
    slots: {
      ...base.slots,
      ...(save.slots || {})
    },
    monsterProgress: save.monsterProgress || {},
    incubating: Array.isArray(save.incubating) ? save.incubating : []
  };
}
