export function defaultSave() {
  return {
    version: 1,
    coins: 100,
    owned: [],
    petNames: {},
    inventory: {
      eggs: [
        {
          id: "starter-gift-egg",
          type: "common",
          gift: true,
          hatchProgress: 0,
          status: "sealed"
        }
      ],
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
