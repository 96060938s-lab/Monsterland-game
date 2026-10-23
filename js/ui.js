
function mwCreateMonsterCard(monster, state, mode = "collection") {
  if (!monster) {
    console.error("MonsterWorld: no se recibió un monstruo.");
    return "";
  }

  const owned = (state?.owned || []).includes(monster.id);
  const level = Math.max(1, Number(monster.level) || 1);

  // Evita que un error de producción impida mostrar la tarjeta.
  let production = 0;

  try {
    if (typeof mwGetMonsterProduction === "function") {
      const result = Number(mwGetMonsterProduction(monster, level));
      production = Number.isFinite(result) ? result : 0;
    }
  } catch (error) {
    console.error(
      "MonsterWorld: error al calcular la producción de",
      monster.id,
      error
    );
  }

  const formatNumber = value =>
    (Number(value) || 0).toLocaleString("es-PE");

  const monsterId = mwEscapeHTML(monster.id);
  const monsterName = mwEscapeHTML(monster.name || "Monstruo");
  const monsterImage = mwEscapeHTML(monster.image || "");
  const monsterRarity = mwEscapeHTML(monster.rarity || "COMÚN");
  const monsterKind = mwEscapeHTML(monster.kind || "✨ MÁGICO");

  const shopButton = `
    <button
      type="button"
      class="${owned ? "success" : "primary"}"
      data-monster-action="shop"
      data-monster-id="${monsterId}"
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
        onclick="mwOpenCareMenu('${monsterId}', 'food')"
        aria-label="Comer"
      >
        <span class="care-icon">🍎</span>
        <span class="care-label">Comer</span>
      </button>

      <button
        type="button"
        onclick="mwOpenCareMenu('${monsterId}', 'bath')"
        aria-label="Baño"
      >
        <span class="care-icon">🛁</span>
        <span class="care-label">Baño</span>
      </button>

      <button
        type="button"
        onclick="mwOpenCareMenu('${monsterId}', 'sleep')"
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
      data-monster-id="${monsterId}"
    >
      <div class="monster-card-top">
        <div class="monster-card-top-info">
          <span class="monster-level">
            NIVEL ${level}
          </span>

          <span class="badge">
            ${monsterRarity}
          </span>
        </div>

        <img
          class="monster-image"
          src="${monsterImage}"
          alt="${monsterName}"
          loading="lazy"
        >

        <h3 class="monster-name">${monsterName}</h3>
      </div>

      <div class="monster-card-bottom">
        <div class="monster-card-stats">
          <div class="monster-type">
            <span class="monster-stat-label">TIPO</span>
            <span class="monster-stat-value">${monsterKind}</span>
          </div>

          <div class="monster-power">
            <span class="monster-stat-label">POTENCIA</span>
            <span class="monster-power-value">
              ${formatNumber(production)} k/h
            </span>
          </div>
        </div>

        ${mode === "shop" ? shopButton : careButtons}
      </div>
    </article>
  `;
}
