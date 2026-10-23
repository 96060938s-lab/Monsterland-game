
export const monsters = [
  {
    id: "flama",
    species: "Flama",
    img: "Imagenes/flama.png"
  },
  {
    id: "bosque",
    species: "Musguito",
    img: "Imagenes/bosque.png"
  },
  {
    id: "fantasma",
    species: "Fanty",
    img: "Imagenes/fantasma.png"
  },
  {
    id: "fuego",
    species: "Chispas",
    img: "Imagenes/fuego.png"
  },
  {
    id: "hielo",
    species: "Nevito",
    img: "Imagenes/hielo.png"
  },
  {
    id: "mago",
    species: "Misterio",
    img: "Imagenes/mago.png"
  },
  {
    id: "dragon",
    species: "Dracón",
    img: "Imagenes/dragon.png"
  }
];


export const rarities = [
  {
    name: "COMÚN",
    chance: 58,
    minRate: 800,
    maxRate: 1100
  },
  {
    name: "POCO COMÚN",
    chance: 22,
    minRate: 1100,
    maxRate: 1800
  },
  {
    name: "RARO",
    chance: 10,
    minRate: 1500,
    maxRate: 2500
  },
  {
    name: "ÉPICO",
    chance: 9,
    minRate: 1800,
    maxRate: 3500
  },
  {
    name: "LEGENDARIO",
    chance: 1,
    minRate: 3500,
    maxRate: 6000
  }
];


export const monsterTypes = [
  { name: "FUEGO", emoji: "🔥" },
  { name: "HIELO", emoji: "❄️" },
  { name: "PLANTA", emoji: "🌿" },
  { name: "MAGIA", emoji: "✨" },
  { name: "ESPÍRITU", emoji: "👻" },
  { name: "RAYO", emoji: "⚡" }
];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomNumber(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

export function randomRarity() {
  const roll = Math.random() * 100;
  let accumulated = 0;

  for (const rarity of rarities) {
    accumulated += rarity.chance;

    if (roll < accumulated) {
      return rarity;
    }
  }

  return rarities[0];
}

export function createRandomMonster() {
  const species = randomItem(monsters);
  const rarity = randomRarity();
  const type = randomItem(monsterTypes);

  return {
    id: `monster-${Date.now()}-${Math.floor(
      Math.random() * 1000000
    )}`,

    speciesId: species.id,
    species: species.species,
    img: species.img,

    name: "",

    rarity: rarity.name,
    kind: `${type.emoji} ${type.name}`,

    level: 1,
    xp: 0,

    baseRate: randomNumber(
      rarity.minRate,
      rarity.maxRate
    ),

    bornAt: Date.now()
  };
}

export function getMonsterById(id) {
  return monsters.find(
    monster => monster.id === id
  ) ?? null;
}
