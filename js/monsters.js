
const MW_MONSTERS = [
  {
    id: "bubu",
    name: "Bubu",
    image: "Imagenes/bubu.png",
    price: 0,
    description: "Tu primer compañero",
    kind: "✨ MÁGICO",
    rarity: "COMÚN",
    theme: "magic",
    baseProduction: 1000
  },
  {
    id: "flama",
    name: "Flama",
    image: "Imagenes/flama.png",
    price: 40,
    description: "Un pequeño monstruo de fuego",
    kind: "🔥 FUEGO",
    rarity: "POCO COMÚN",
    theme: "fire",
    baseProduction: 1500
  },
  {
    id: "musguito",
    name: "Musguito",
    image: "Imagenes/musguito.png",
    price: 60,
    description: "Un amigo del bosque",
    kind: "🌿 PLANTA",
    rarity: "POCO COMÚN",
    theme: "plant",
    baseProduction: 2000
  },
  {
    id: "fanty",
    name: "Fanty",
    image: "Imagenes/fanty.png",
    price: 80,
    description: "Un espíritu misterioso",
    kind: "👻 ESPÍRITU",
    rarity: "POCO COMÚN",
    theme: "spirit",
    baseProduction: 2500
  },
  {
    id: "chispas",
    name: "Chispas",
    image: "Imagenes/chispas.png",
    price: 100,
    description: "Lleno de energía eléctrica",
    kind: "🔥 FUEGO",
    rarity: "ÉPICO",
    theme: "fire",
    baseProduction: 3000
  },
  {
    id: "nevito",
    name: "Nevito",
    image: "Imagenes/nevito.png",
    price: 120,
    description: "Un compañero de hielo",
    kind: "❄️ HIELO",
    rarity: "POCO COMÚN",
    theme: "ice",
    baseProduction: 3500
  },
  {
    id: "misterio",
    name: "Misterio",
    image: "Imagenes/misterio.png",
    price: 150,
    description: "Guardián de la magia",
    kind: "✨ MAGIA",
    rarity: "ÉPICO",
    theme: "magic",
    baseProduction: 4500
  },
  {
    id: "dracon",
    name: "Dracón",
    image: "Imagenes/dracon.png",
    price: 200,
    description: "Un poderoso monstruo legendario",
    kind: "⚡ RAYO",
    rarity: "LEGENDARIO",
    theme: "lightning",
    baseProduction: 6000
  }
];

function mwGetMonster(id) {
  return MW_MONSTERS.find(monster => monster.id === id) || null;
}

function mwGetOwnedMonsters(state) {
  return state.owned
    .map(id => mwGetMonster(id))
    .filter(Boolean);
}

function mwGetMonsterProduction(monster, level = 1) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  let production = monster.baseProduction;

  for (let currentLevel = 2; currentLevel <= safeLevel; currentLevel++) {
    production *= currentLevel <= 5 ? 1.10 : 1.22;
  }

  return Math.floor(production);
}
