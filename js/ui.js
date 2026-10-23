
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
  const owned = state.owned.includes(monster.id);

  const buttonLabel = mode === "shop"
    ? (owned ? "ADQUIRIDO" : `COMPRAR · ${monster.price} 🪙`)
    : (owned ? "VER MONSTRUO" : "BLOQUEADO");

  const disabled = mode === "shop"
    ? owned
    : !owned;

  return `
    <article class="monster-card" data-monster-id="${mwEscapeHTML(monster.id)}">
      <img
        src="${mwEscapeHTML(monster.image)}"
        alt="${mwEscapeHTML(monster.name)}"
        loading="lazy"
      >

      <h3>${mwEscapeHTML(monster.name)}</h3>

      <span class="badge">
        ${mwEscapeHTML(monster.rarity)}
      </span>

      <p>${mwEscapeHTML(monster.description)}</p>

      <p>${mwEscapeHTML(monster.kind)}</p>

      <p>
        <strong>Producción base:</strong>
        ${mwGetMonsterProduction(monster, 1).toLocaleString("es-PE")}
        monedas/h
      </p>

      <button
        type="button"
        class="${owned ? "success" : "primary"}"
        data-monster-action="${mode}"
        data-monster-id="${mwEscapeHTML(monster.id)}"
        ${disabled ? "disabled" : ""}
      >
        ${buttonLabel}
      </button>
    </article>
  `;
}


function mwRenderMonsterCards(container, state, mode = "collection") {
  if (!container) {
    console.error("MonsterWorld: no se encontró el contenedor de monstruos.");
    return;
  }

  const monsters = mode === "shop"
    ? MW_MONSTERS
    : mwGetOwnedMonsters(state);

  if (mode === "shop") {
    container.innerHTML = monsters
      .map(monster => mwCreateMonsterCard(monster, state, mode))
      .join("");
    return;
  }

  const monsterCards = monsters
    .map(monster => mwCreateMonsterCard(monster, state, mode))
    .join("");

  const extraSpace = `
    <button
      type="button"
      class="monster-card extra-space"
      id="addMonsterSpace"
      aria-label="Comprar espacio adicional"
      onclick="mwBuyMonsterSpace()"
    >
      <span style="font-size:56px;">＋</span>
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

    if (!button || !container.contains(button)) {
      return;
    }

    if (button.disabled) {
      return;
    }

    onAction({
      action: button.dataset.monsterAction,
      monsterId: button.dataset.monsterId
    });
  });
}
