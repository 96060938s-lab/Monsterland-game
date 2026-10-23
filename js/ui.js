
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
        aria-label="Comer"
      >
        <span class="care-icon">🍎</span>
        <span class="care-label">Comer</span>
      </button>

      <button
        type="button"
        onclick="mwOpenCareMenu('${mwEscapeHTML(monster.id)}', 'bath')"
        aria-label="Baño"
      >
        <span class="care-icon">🛁</span>
        <span class="care-label">Baño</span>
      </button>

      <button
        type="button"
        onclick="mwOpenCareMenu('${mwEscapeHTML(monster.id)}', 'sleep')"
        aria-label="Dormir"
      >
        <span class="care-icon">🌙</span>
        <span class="care-label">Dormir</span>
      </button>
    </div>
  `;

  return `
    <article
      class="monster-card"
      data-monster-id="${mwEscapeHTML(monster.id)}"
    >
      <!-- PARTE SUPERIOR -->
      <div class="monster-card-top">

        <div class="monster-card-top-info">
          <span class="monster-level">
            NIVEL ${level}
          </span>

          <span class="badge">
            ${mwEscapeHTML(monster.rarity || "COMÚN")}
          </span>
        </div>

        <img
          class="monster-image"
          src="${mwEscapeHTML(monster.image)}"
          alt="${mwEscapeHTML(monster.name || monster.kind || "Monstruo")}"
          loading="lazy"
        >

        <h3 class="monster-name">
          ${mwEscapeHTML(monster.name || "Monstruo")}
        </h3>

      </div>

      <!-- PARTE INFERIOR -->
      <div class="monster-card-bottom">

        <div class="monster-card-stats">

          <div class="monster-type">
            <span class="monster-stat-label">TIPO</span>

            <span class="monster-stat-value">
              ${mwEscapeHTML(monster.kind || "✨ MÁGICO")}
            </span>
          </div>

          <div class="monster-power">
            <span class="monster-stat-label">POTENCIA</span>

            <span class="monster-power-value">
              ${production.toLocaleString("es-PE")} k/h
            </span>
          </div>

        </div>

        ${mode === "shop" ? shopButton : careButtons}

      </div>
    </article>
  `;
}
