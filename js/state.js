export function createInitialState() {
  return {
    coins: 1000,

    // El primer huevo se entrega gratis.
    starterEggClaimed: false,
    eggs: [
      {
        id: "starter-egg",
        type: "starter",
        createdAt: Date.now()
      }
    ],

    // No hay monstruos hasta abrir el huevo.
    owned: [],
    monsterProgress: {},
    monsterNames: {},
    production: {},
    needs: {},
    care: {},
    sleep: {},

    // Datos de la partida.
    lastDaily: "",
    trainerProgress: {
      level: 1,
      xp: 0
    },

    inventory: {},
    incubating: [],

    // Espacios iniciales.
    spaceCount: 1,
    monsterSlots: {},

    xpBoostUntil: 0
  };
}
