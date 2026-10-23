import { getMonsterById } from "./monsters.js";

export function renderCollection(state) {
  const collection = document.getElementById("collection");
  if (!collection) return;

  const monsters = state.owned
    .map((id) => getMonsterById(id))
    .filter(Boolean);

  if (!monsters.length) {
    collection.innerHTML = "<p class='empty'>Todavía no tienes monstruos.</p>";
    return;
  }

  collection.innerHTML = monsters
    .map((monster) => {
      const progress = state.monsterProgress?.[monster.id] || { level: 1, xp: 0 };

      return `
        <article class="monster-card">
          <div class="monster-art ${monster.theme}">
            <span>${monster.emoji}</span>
          </div>
          <div class="monster-info">
            <h3>${monster.name}</h3>
            <small>${monster.rarity}</small>
            <p>${monster.desc}</p>
            <div class="monster-meta">
              <span>Nv. ${progress.level}</span>
              <span>${progress.xp} XP</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

export function renderCoins(state) {
  const coinsNode = document.getElementById("coins");
  if (coinsNode) {
    coinsNode.textContent = state.coins;
  }
}

export function showNotice(message) {
  const notice = document.getElementById("notice");
  if (!notice) return;

  notice.textContent = message;
  notice.classList.add("show");

  setTimeout(() => {
    notice.classList.remove("show");
  }, 2000);
}
