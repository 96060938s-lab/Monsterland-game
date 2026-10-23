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
  }, 2200);
}

export function renderStarterEgg(state) {
  const holder = document.getElementById("starterEggHolder");
  if (!holder) return;

  const egg = state.inventory.eggs.find((item) => item.id === "starter-gift-egg");
  if (!egg) {
    holder.innerHTML = "";
    return;
  }

  const remaining = Math.max(0, 4 - Number(egg.hatchProgress || 0));

  holder.innerHTML = `
    <div class="starter-egg-card">
      <div class="starter-egg">🥚</div>
      <div class="starter-egg-info">
        <strong>Huevo de regalo</strong>
        <small>Presiona ${remaining} vez${remaining === 1 ? "" : "es"} más para abrirlo</small>
      </div>
      <button id="starterEggButton" class="starter-egg-button" type="button">Aplasta el huevo</button>
    </div>
  `;
}
