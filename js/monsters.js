export const monsters = [
  {
    id: "bubu",
    name: "Bubu",
    theme: "plant",
    rarity: "COMÚN",
    rate: 900,
    desc: "Un pequeño monstruo amigable.",
    emoji: "🐻"
  },
  {
    id: "flama",
    name: "Flama",
    theme: "fire",
    rarity: "POCO COMÚN",
    rate: 1500,
    desc: "Un pequeño dragón de fuego.",
    emoji: "🐲"
  },
  {
    id: "musguito",
    name: "Musguito",
    theme: "plant",
    rarity: "RARO",
    rate: 2200,
    desc: "Un guardián del bosque.",
    emoji: "🌱"
  },
  {
    id: "fanty",
    name: "Fanty",
    theme: "ghost",
    rarity: "ÉPICO",
    rate: 3000,
    desc: "Un espíritu juguetón.",
    emoji: "👻"
  },
  {
    id: "draco",
    name: "Draco",
    theme: "fire",
    rarity: "LEGENDARIO",
    rate: 5000,
    desc: "Una criatura casi mítica.",
    emoji: "🐉"
  }
];

export const rarityWeights = {
  COMÚN: 58,
  "POCO COMÚN": 22,
  RARO: 10,
  ÉPICO: 9,
  LEGENDARIO: 1
};

export function getMonsterById(id) {
  return monsters.find((monster) => monster.id === id) || null;
}

export function getRandomRarity() {
  const entries = Object.entries(rarityWeights);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;

  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }

  return "COMÚN";
}

export function getRandomMonsterFromPool(excluded = []) {
  const available = monsters.filter((monster) => !excluded.includes(monster.id));
  if (!available.length) return null;

  return available[Math.floor(Math.random() * available.length)];
}
