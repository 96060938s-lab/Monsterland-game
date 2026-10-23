
const MW_DEFAULT_STATE = {
  coins: 100,
  playerLevel: 1,
  owned: ["bubu"],
  monsters: {},
  care: {},
  lastDaily: "",
  activeTab: "monstruos"
};

function mwCreateInitialState() {
  return JSON.parse(JSON.stringify(MW_DEFAULT_STATE));
}

function mwNormalizeState(data) {
  const defaults = mwCreateInitialState();

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return defaults;
  }

  const coins = Number(data.coins);
  const playerLevel = Number(data.playerLevel);

  return {
    ...defaults,
    ...data,
    coins: Number.isFinite(coins) && coins >= 0
      ? Math.floor(coins)
      : defaults.coins,
    playerLevel: Number.isFinite(playerLevel) && playerLevel >= 1
      ? Math.floor(playerLevel)
      : defaults.playerLevel,
    owned: Array.isArray(data.owned)
      ? [...new Set(data.owned.filter(
          id => typeof id === "string"
        ))]
      : [...defaults.owned],
    monsters: data.monsters &&
      typeof data.monsters === "object" &&
      !Array.isArray(data.monsters)
      ? data.monsters
      : {},
    care: data.care &&
      typeof data.care === "object" &&
      !Array.isArray(data.care)
      ? data.care
      : {},
    lastDaily: typeof data.lastDaily === "string"
      ? data.lastDaily
      : "",
    activeTab: typeof data.activeTab === "string"
      ? data.activeTab
      : defaults.activeTab
  };
}
