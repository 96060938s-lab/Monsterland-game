
const MW_MONSTERS = [
  {
    id: "criatura_magica",
    image: "Imagenes/misterio.png",
    kind: "✨ MAGIA",
    theme: "magic"
  },
  {
    id: "criatura_fuego",
    image: "Imagenes/flama.png",
    kind: "🔥 FUEGO",
    theme: "fire"
  },
  {
    id: "criatura_planta",
    image: "Imagenes/musguito.png",
    kind: "🌿 PLANTA",
    theme: "plant"
  },
  {
    id: "criatura_espiritu",
    image: "Imagenes/fanty.png",
    kind: "👻 ESPÍRITU",
    theme: "spirit"
  },
  {
    id: "criatura_hielo",
    image: "Imagenes/nevito.png",
    kind: "❄️ HIELO",
    theme: "ice"
  },
  {
    id: "criatura_rayo",
    image: "Imagenes/dracon.png",
    kind: "⚡ RAYO",
    theme: "lightning"
  }
];

const MW_RARITY_PROBABILITIES = [
  { rarity: "COMÚN", chance: 60, minProduction: 800, maxProduction: 1100 },
  { rarity: "POCO COMÚN", chance: 28, minProduction: 1200, maxProduction: 1800 },
  { rarity: "RARO", chance: 8, minProduction: 2000, maxProduction: 3000 },
  { rarity: "ÉPICO", chance: 3, minProduction: 3500, maxProduction: 4500 },
  { rarity: "LEGENDARIO", chance: 1, minProduction: 5000, maxProduction: 7000 }
];

function mwGetMonster(id) {
  return MW_MONSTERS.find(monster => monster.id === id) || null;
}


function mwGetOwnedMonsters(state) {
  return (state.owned || [])
    .map(id => {
      const saved = state.monsters?.[id];

      if (saved && typeof saved === "object") {
        return { ...saved, id };
      }

      const species = mwGetMonster(id);
      return species || null;
    })
    .filter(Boolean);
}

function mwRollMonster() {
  const species = MW_MONSTERS[
    Math.floor(Math.random() * MW_MONSTERS.length)
  ];

  let roll = Math.random() * 100;
  let selectedRarity = MW_RARITY_PROBABILITIES[0];

  for (const rarity of MW_RARITY_PROBABILITIES) {
    roll -= rarity.chance;

    if (roll < 0) {
      selectedRarity = rarity;
      break;
    }
  }

  const baseProduction = Math.floor(
    selectedRarity.minProduction +
    Math.random() * (
      selectedRarity.maxProduction -
      selectedRarity.minProduction + 1
    )
  );

  return {
    ...species,
    id: `${species.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    rarity: selectedRarity.rarity,
    description: "Una criatura nacida de un huevo mágico",
    price: 0,
    baseProduction
  };
}

function mwGetMonsterProduction(monster, level = 1) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  let production = Number(monster.baseProduction) || 800;

  for (let currentLevel = 2; currentLevel <= safeLevel; currentLevel++) {
    production *= currentLevel <= 5 ? 1.10 : 1.22;
  }

  return Math.floor(production);
}
