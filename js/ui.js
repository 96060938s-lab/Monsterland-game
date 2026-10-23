import { getMonsterById } from "./monsters.js";

export function renderCollection(state) {
  const collection = document.getElementById("collection");
  if (!collection) return;

  const monsters = state.owned
    .map((id) => getMonsterById(id))
    .filter(Boolean);

  if (!monsters.length) {
    collection.innerHTML = "<p class='empty'>Todavía no tienes compañeros.</p>";
    return;
  }

  collection.innerHTML = monsters
    .map((monster) => {
      const progress = state.monsterProgress?.[monster.id] || { level: 1, xp: 0 };
      const petName = state.petNames?.[monster.id] || monster.name;

      return `
        <article class="monster-card">
          <div class="monster-art ${monster.theme}">
            <span>${monster.emoji}</span>
          </div>
          <div class="monster-info">
            <h3>${petName}</h3>
            <small>${monster.rarity}</small>
            <p>${monster.desc}</p>
            <div class="monster-meta">
              <span>Nv. ${progress.level}</span>
              <span>${progress.xp} XP</span>
            </div>
            <div class="monster-actions">
              <button type="button" class="mini-action" data-action="food" data-monster-id="${monster.id}">🍽 Comer</button>
              <button type="button" class="mini-action" data-action="bath" data-monster-id="${monster.id}">🛁 Baño</button>
              <button type="button" class="mini-action" data-action="sleep" data-monster-id="${monster.id}">💤 Dormir</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}
