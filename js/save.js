
let mwState = null;
let mwHatchTimer = null;

/* =====================================
   MONEDAS Y NIVEL DEL JUGADOR
===================================== */

function mwUpdateWallet() {
  if (!mwState) return;

  const coinsElement = document.getElementById("coins");
  const levelElement = document.getElementById("playerLevel");

  if (coinsElement) {
    coinsElement.textContent =
      Number(mwState.coins || 0).toLocaleString("es-PE");
  }

  if (levelElement) {
    levelElement.textContent = mwState.playerLevel ?? 1;
  }
}

/* =====================================
   HUEVO INICIAL Y RECUPERACIÓN
===================================== */

function mwEnsureStarterEgg() {
  if (!mwState.starterEgg || typeof mwState.starterEgg !== "object") {
    mwState.starterEgg = {
      taps: 0,
      opened: false,
      creatureId: "",
      named: false,
      revealed: false
    };
  }

  const egg = mwState.starterEgg;

  egg.taps = Math.min(5, Math.max(0, Number(egg.taps) || 0));
  egg.opened = egg.opened === true;
  egg.creatureId =
    typeof egg.creatureId === "string" ? egg.creatureId : "";
  egg.named = egg.named === true;
  egg.revealed = egg.revealed === true;

  if (
    !mwState.monsters ||
    typeof mwState.monsters !== "object" ||
    Array.isArray(mwState.monsters)
  ) {
    mwState.monsters = {};
  }

  if (!Array.isArray(mwState.owned)) {
    mwState.owned = [];
  }

  return egg;
}

function mwGetStarterCreature() {
  const egg = mwEnsureStarterEgg();

  if (!egg.creatureId) return null;

  return mwState.monsters[egg.creatureId] || null;
}

/*
  Recupera el nacimiento cuando el monstruo y su nombre
  ya están guardados. No vuelve a pedir el nombre.
*/
function mwRecoverStarterHatch() {
  if (!mwState) return;

  const egg = mwEnsureStarterEgg();
  const creature = mwGetStarterCreature();

  if (!egg.opened || !creature) return;

  const savedName =
    typeof creature.name === "string" ? creature.name.trim() : "";

  if (!savedName) return;

  creature.name = savedName.slice(0, 20);

  mwState.owned = mwState.owned.filter(
    id => id !== creature.id
  );

  mwState.owned.unshift(creature.id);

  egg.named = true;
  egg.revealed = true;
  mwState.activeTab = "monstruos";

  if (!mwSaveState(mwState)) {
    console.error(
      "MonsterWorld: no se pudo recuperar el nacimiento."
    );
  }
}

/* =====================================
   MOSTRAR EL HUEVO Y EL NACIMIENTO
===================================== */

function mwRenderStarterEgg() {
  const area = document.getElementById("hatchArea");
  const title = document.getElementById("hatchTitle");
  const content = document.getElementById("hatchContent");

  if (!area || !title || !content || !mwState) return;

  const egg = mwEnsureStarterEgg();
  const creature = mwGetStarterCreature();

  // Ocultar el proceso solo cuando el nacimiento terminó.
  if (egg.named && egg.revealed && creature) {
    area.classList.add("hidden");
    area.style.display = "";
    return;
  }

  area.classList.remove("hidden");
  area.style.display = "flex";

  // ETAPA 1: huevo de regalo.
  if (!egg.opened || !creature) {
    title.textContent = "🥚 ¡Tu huevo de regalo!";

    content.innerHTML = `
      <div
        role="button"
        tabindex="0"
        aria-label="Toca el huevo para descubrir tu compañero"
        onclick="mwTapStarterEgg()"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();mwTapStarterEgg();}"
        style="cursor:pointer;text-align:center;padding:24px 0;"
      >
        <div style="
          font-size:110px;
          line-height:1.4;
          user-select:none;
        ">🥚✨</div>

        <p>Toca el huevo para descubrir tu compañero</p>

        <p style="opacity:.8;font-size:14px;">
          Toques: ${egg.taps} / 5
        </p>
      </div>
    `;

    return;
  }

  // ETAPA 2: elegir el nombre.
  if (!egg.named) {
    title.textContent = "✨ ¡Tu criatura ha nacido!";

    content.innerHTML = `
      <img
        src="${mwEscapeHTML(creature.image || "")}"
        alt="${mwEscapeHTML(creature.kind || "Tu monstruo")}"
        style="
          width:180px;
          max-width:80%;
          display:block;
          margin:18px auto;
        "
      >

      <h3>${mwEscapeHTML(creature.kind || "Criatura mágica")}</h3>

      <p>
        Rareza:
        <strong>${mwEscapeHTML(creature.rarity || "COMÚN")}</strong>
      </p>

      <p>
        Producción:
        <strong>
          ${Number(creature.baseProduction || 0).toLocaleString("es-PE")}
          monedas/h
        </strong>
      </p>

      <form onsubmit="mwNameStarterCreature(event)">
        <label for="starterCreatureName">
          Elige el nombre de tu compañero:
        </label>

        <input
          id="starterCreatureName"
          type="text"
          maxlength="20"
          placeholder="Escribe su nombre"
          autocomplete="off"
          required
        >

        <button class="primary" type="submit">
          💖 Confirmar nombre
        </button>
      </form>
    `;

    return;
  }

  // ETAPA 3: mostrar la ficha del monstruo.
  title.textContent = "🎉 ¡Conoce a tu nuevo compañero!";

  content.innerHTML = `
    <img
      src="${mwEscapeHTML(creature.image || "")}"
      alt="${mwEscapeHTML(creature.name || "Tu monstruo")}"
      style="
        width:180px;
        max-width:80%;
        display:block;
        margin:18px auto;
      "
    >

    <h2>${mwEscapeHTML(creature.name || "Nuevo compañero")}</h2>

    <p>
      Rareza:
      <strong>${mwEscapeHTML(creature.rarity || "COMÚN")}</strong>
    </p>

    <p>
      Tipo:
      <strong>${mwEscapeHTML(creature.kind || "Mágico")}</strong>
    </p>

    <p>
      Nivel:
      <strong>${Math.max(1, Number(creature.level) || 1)}</strong>
    </p>

    <p>
      Producción:
      <strong>
        ${Number(creature.baseProduction || 0).toLocaleString("es-PE")}
        monedas/h
      </strong>
    </p>

    <p>¡Tu aventura está a punto de comenzar!</p>
  `;

  if (!mwHatchTimer) {
    mwHatchTimer = setTimeout(() => {
      mwHatchTimer = null;
      mwFinishStarterHatch();
    }, 4000);
  }
}

/* =====================================
   TOCAR EL HUEVO
===================================== */

function mwTapStarterEgg() {
  if (!mwState) return;

  const egg = mwEnsureStarterEgg();

  if (egg.opened) return;

  egg.taps = Math.min(5, egg.taps + 1);

  if (egg.taps >= 5) {
    if (typeof mwRollMonster !== "function") {
      console.error("MonsterWorld: no existe mwRollMonster().");
      alert("No se pudo cargar el sistema de monstruos.");
      return;
    }

    const creature = mwRollMonster();

    if (!creature || !creature.id) {
      egg.taps = 4;
      mwSaveState(mwState);

      alert("No se pudo crear tu monstruo. Inténtalo de nuevo.");
      mwRenderStarterEgg();
      return;
    }

    creature.level = 1;
    creature.xp = 0;
    creature.name = "";

    egg.opened = true;
    egg.creatureId = creature.id;
    egg.named = false;
    egg.revealed = false;

    mwState.monsters[creature.id] = creature;
  }

  if (!mwSaveState(mwState)) {
    alert("No se pudo guardar el progreso del huevo.");
    return;
  }

  mwRenderStarterEgg();
}

/* =====================================
   GUARDAR EL NOMBRE ELEGIDO
===================================== */

function mwNameStarterCreature(event) {
  event.preventDefault();

  if (!mwState) return;

  const input = document.getElementById("starterCreatureName");
  const egg = mwEnsureStarterEgg();
  const creature = mwGetStarterCreature();

  if (!input || !creature || !egg.opened) return;

  const name = input.value.trim();

  if (!name) {
    alert("Escribe un nombre para tu criatura.");
    return;
  }

  const oldName = creature.name || "";
  const oldOwned = [...mwState.owned];
  const oldNamed = egg.named;
  const oldRevealed = egg.revealed;

  creature.name = name.slice(0, 20);

  mwState.owned = mwState.owned.filter(
    id => id !== creature.id
  );

  mwState.owned.unshift(creature.id);

  egg.named = true;
  egg.revealed = false;

  if (!mwSaveState(mwState)) {
    creature.name = oldName;
    mwState.owned = oldOwned;
    egg.named = oldNamed;
    egg.revealed = oldRevealed;

    alert("No se pudo guardar el nombre. Inténtalo de nuevo.");
    return;
  }

  mwRenderStarterEgg();
}

/* =====================================
   TERMINAR EL NACIMIENTO
===================================== */

function mwFinishStarterHatch() {
  if (!mwState) return;

  const egg = mwEnsureStarterEgg();
  const creature = mwGetStarterCreature();

  if (
    !creature ||
    !egg.named ||
    typeof creature.name !== "string" ||
    !creature.name.trim()
  ) {
    return;
  }

  egg.revealed = true;

  mwState.owned = mwState.owned.filter(
    id => id !== creature.id
  );

  mwState.owned.unshift(creature.id);
  mwState.activeTab = "monstruos";

  if (!mwSaveState(mwState)) {
    egg.revealed = false;
    alert("No se pudo guardar el progreso. Inténtalo de nuevo.");
    return;
  }

  if (mwHatchTimer) {
    clearTimeout(mwHatchTimer);
    mwHatchTimer = null;
  }

  const area = document.getElementById("hatchArea");

  if (area) {
    area.classList.add("hidden");
    area.style.display = "";
  }

  const game = document.getElementById("gameInterface");

  if (game) game.style.display = "";

  document.querySelectorAll("[data-page]").forEach(page => {
    const isCollection = page.dataset.page === "monstruos";

    page.hidden = !isCollection;
    page.classList.toggle("hidden", !isCollection);
  });

  document.querySelectorAll(".bottom-nav button").forEach(button => {
    button.classList.toggle(
      "active",
      button.id === "nav-monstruos"
    );
  });

  document.querySelectorAll("[data-tab]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.tab === "monstruos"
    );
  });

  mwRenderGame();
  mwUpdateWallet();
}

/* =====================================
   MOSTRAR COLECCIÓN Y TIENDA
===================================== */

function mwRenderGame() {
  if (!mwState) return;

  mwUpdateWallet();

  const collection = document.getElementById("collection");
  const shop = document.getElementById("shopGrid");

  if (
    collection &&
    typeof mwRenderMonsterCards === "function"
  ) {
    mwRenderMonsterCards(collection, mwState, "collection");
  }

  if (
    shop &&
    typeof mwRenderMonsterCards === "function"
  ) {
    mwRenderMonsterCards(shop, mwState, "shop");
  }

  mwRenderStarterEgg();
}

/* =====================================
   ACCIONES DE LAS TARJETAS
===================================== */

function mwHandleMonsterAction(data) {
  if (!mwState || !data) return;

  const monster =
    mwState.monsters?.[data.monsterId] ||
    (typeof mwGetMonster === "function"
      ? mwGetMonster(data.monsterId)
      : null);

  if (!monster) return;

  if (data.action !== "shop") return;

  if (mwState.owned.includes(monster.id)) return;

  const price = Number(monster.price) || 0;

  if (Number(mwState.coins) < price) {
    alert("No tienes suficientes monedas.");
    return;
  }

  if (!confirm(
    `¿Quieres comprar a ${monster.name || monster.kind} por ${price} monedas?`
  )) {
    return;
  }

  const previousCoins = mwState.coins;
  const previousOwned = [...mwState.owned];
  const previousMonster = mwState.monsters[monster.id];

  mwState.coins -= price;

  if (!mwState.monsters[monster.id]) {
    mwState.monsters[monster.id] = {
      ...monster,
      level: 1,
      xp: 0
    };
  }

  if (!mwState.owned.includes(monster.id)) {
    mwState.owned.push(monster.id);
  }

  if (!mwSaveState(mwState)) {
    mwState.coins = previousCoins;
    mwState.owned = previousOwned;

    if (previousMonster) {
      mwState.monsters[monster.id] = previousMonster;
    } else {
      delete mwState.monsters[monster.id];
    }

    alert("No se pudo guardar la compra en este dispositivo.");
    return;
  }

  mwRenderGame();
  alert(`¡Has conseguido a ${monster.name || monster.kind}!`);
}

function mwSetupMonsterActions() {
  const collection = document.getElementById("collection");
  const shop = document.getElementById("shopGrid");

  if (
    collection &&
    typeof mwBindMonsterActions === "function"
  ) {
    mwBindMonsterActions(collection, mwHandleMonsterAction);
  }

  if (
    shop &&
    typeof mwBindMonsterActions === "function"
  ) {
    mwBindMonsterActions(shop, mwHandleMonsterAction);
  }
}

/* =====================================
   NAVEGACIÓN
===================================== */

function mwSetupNavigation() {
  document.querySelectorAll(".bottom-nav button").forEach(button => {
    if (button.dataset.mwEggGuard === "true") return;

    button.dataset.mwEggGuard = "true";

    button.addEventListener("click", () => {
      const egg = mwEnsureStarterEgg();

      // No permitir entrar a otras secciones antes del nacimiento.
      if (!egg.revealed) return;
    });
  });
}

function mwRestoreNavigation() {
  if (!mwState) return;

  const egg = mwEnsureStarterEgg();

  if (!egg.revealed) return;

  const tab = mwState.activeTab || "monstruos";

  if (typeof showPage === "function") {
    showPage(tab);
  }
}

/* =====================================
   INICIO DEL JUEGO
===================================== */

function mwStartGame() {
  if (typeof mwLoadState !== "function") {
    console.error("MonsterWorld: no existe mwLoadState().");
    return;
  }

  mwState = mwLoadState();

  if (!mwState) {
    console.error("No se pudo cargar el estado de MonsterWorld.");
    return;
  }

  const egg = mwEnsureStarterEgg();
  const creature = mwGetStarterCreature();

  /*
    CORRECCIÓN PRINCIPAL:
    Si el huevo todavía no tiene una criatura con nombre,
    debe mostrarse el regalo, aunque el guardado anterior
    tenga por error revealed=true.

    No se reinician las monedas ni los demás monstruos.
  */
  const completed =
    egg.opened === true &&
    !!creature &&
    typeof creature.name === "string" &&
    creature.name.trim() !== "";

  if (!completed) {
    egg.named = false;
    egg.revealed = false;
  }

  mwRecoverStarterHatch();

  mwSetupMonsterActions();
  mwSetupNavigation();

  const currentEgg = mwEnsureStarterEgg();
  const game = document.getElementById("gameInterface");
  const area = document.getElementById("hatchArea");

  if (!currentEgg.revealed) {
    if (game) game.style.display = "none";

    if (area) {
      area.classList.remove("hidden");
      area.style.display = "flex";
    }

    document.querySelectorAll("[data-page]").forEach(page => {
      page.hidden = true;
    });

    document.querySelectorAll(".bottom-nav button").forEach(button => {
      button.classList.remove("active");
    });

    mwRenderStarterEgg();

    // Guardar la corrección del estado del huevo.
    if (!mwSaveState(mwState)) {
      console.error("No se pudo guardar el estado del huevo inicial.");
    }

  } else {
    if (game) game.style.display = "";

    if (area) {
      area.classList.add("hidden");
      area.style.display = "";
    }

    document.querySelectorAll("[data-page]").forEach(page => {
      const isCollection = page.dataset.page === "monstruos";

      page.hidden = !isCollection;
      page.classList.toggle("hidden", !isCollection);
    });

    document.querySelectorAll(".bottom-nav button").forEach(button => {
      button.classList.toggle(
        "active",
        button.id === "nav-monstruos"
      );
    });

    document.querySelectorAll("[data-tab]").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.tab === "monstruos"
      );
    });

    mwRestoreNavigation();
    mwRenderGame();
  }

  mwUpdateWallet();

  console.log("MonsterWorld iniciado correctamente.");
}

/* =====================================
   EJECUTAR AL CARGAR LA PÁGINA
===================================== */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mwStartGame);
} else {
  mwStartGame();
}
