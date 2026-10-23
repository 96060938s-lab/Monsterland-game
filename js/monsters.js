export const monsters = [
  {
    id: "bubu",
    name: "Bubu",
    rarity: "COMÚN",
    theme: "plant",
    rate: 900,
    desc: "Un pequeño monstruo amigable",
    emoji: "🐻"
  },
  {
    id: "flama",
    name: "Flama",
    rarity: "POCO COMÚN",
    theme: "fire",
    rate: 1500,
    desc: "Un pequeño dragón",
    emoji: "🐲"
  },
  {
    id: "bosque",
    name: "Musguito",
    rarity: "POCO COMÚN",
    theme: "plant",
    rate: 2000,
    desc: "Guardián del bosque",
    emoji: "🌱"
  },
  {
    id: "fantasma",
    name: "Fanty",
    rarity: "POCO COMÚN",
    theme: "ghost",
    rate: 2500,
    desc: "Espíritu amistoso",
    emoji: "👻"
  }
];

export function getMonsterById(id) {
  return monsters.find((monster) => monster.id === id) || null;
}
