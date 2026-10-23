
function mwEscapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function mwCreateMonsterCard(monster, state, mode = "collection") {
  const owned = (state.owned || []).includes(monster.id);
  const level = Math.max(1, Number(monster.level) || 1);
  const production = mwGetMonsterProduction(monster, level);

  const shopButton = `
    <button
      type="button"
      class="${owned ? "success" : "primary"}"
      data-monster-action="shop"
      data-monster-id="${mwEscapeHTML(monster.id)}"
      ${owned ? "disabled" : ""}
    >
      ${owned
        ? "ADQUIRIDO"
        : `COMPRAR · ${Number(monster.price) || 0} 🪙`}
    </button>
  `;

  const careButtons = `
    <div class="monster-care-actions">
      <button
        type="button"
        onclick="mwOpenCareMenu('${mwEscapeHTML(monster.id)}', 'food')"
      >
        🍎 COMER
      </button>

      <button
        type="button"
        onclick="mwOpenCareMenu('${mwEscapeHTML(monster.id)}', 'bath')"
      >
        🛁 BAÑO
      </button>

      <button
        type="button"
        onclick="mwOpenCareMenu('${mwEscapeHTML(monster.id)}', 'sleep')"
      >
        🌙 DORMIR
      </button>
    </div>
  `;

  return `
    <article
      class="monster-card"
      data-monster-id="${mwEscapeHTML(monster.id)}"
    >
      <img
        src="${mwEscapeHTML(monster.image)}"
        alt="${mwEscapeHTML(monster.name || monster.kind)}"
        loading="lazy"
      >

      <h3>${mwEscapeHTML(monster.name || "Monstruo")}</h3>

      <span class="badge">
        ${mwEscapeHTML(monster.rarity || "COMÚN")}
      </span>

      <p>${mwEscapeHTML(monster.kind || "✨ MÁGICO")}</p>

      <p>
        <strong>Nivel:</strong> ${level}
      </p>

      <p>
        <strong>Producción:</strong>
        ${production.toLocaleString("es-PE")} monedas/h
      </p>

      ${mode === "shop" ? shopButton : careButtons}
    </article>
  `;
}

function mwRenderMonsterCards(container, state, mode = "collection") {
  if (!container) {
    console.error(
      "MonsterWorld: no se encontró el contenedor de monstruos."
    );
    return;
  }

  const monsters = mode === "shop"
    ? MW_MONSTERS
    : mwGetOwnedMonsters(state);

  const monsterCards = monsters
    .map(monster => mwCreateMonsterCard(monster, state, mode))
    .join("");

  if (mode === "shop") {
    container.innerHTML = monsterCards;
    return;
  }

  const extraSpace = `
    <button
      type="button"
      class="monster-card extra-space"
      id="addMonsterSpace"
      aria-label="Comprar espacio adicional"
      title="Comprar espacio adicional"
      onclick="mwBuyMonsterSpace()"
    >
      <span class="extra-space-symbol">＋</span>
    </button>
  `;

  container.innerHTML = monsterCards + extraSpace;
}

function mwBindMonsterActions(container, onAction) {
  if (!container || typeof onAction !== "function") {
    return;
  }

  container.addEventListener("click", event => {
    const button = event.target.closest("[data-monster-action]");

    if (!button || !container.contains(button) || button.disabled) {
      return;
    }

    onAction({
      action: button.dataset.monsterAction,
      monsterId: button.dataset.monsterId
    });
  });
}
