
let mwState = null;

function mwUpdateWallet() {
  const coinsElement = document.getElementById("coins");
  const levelElement = document.getElementById("playerLevel");

  if (!mwState) return;

  if (coinsElement) {
    coinsElement.textContent =
      Number(mwState.coins || 0).toLocaleString("es-PE");
  }

  if (levelElement) {
    levelElement.textContent = mwState.playerLevel ?? 1;
  }
}

function mwRenderStarterEgg() {
  const area = document.getElementById("hatchArea");
  const title = document.getElementById("hatchTitle");
  const content = document.getElementById("hatchContent");

  if (!area || !title || !content || !mwState) return;

  if (!mwState.starterEgg) {
    mwState.starterEgg = {
      taps: 0,
      opened: false,
      creatureId: ""
    };
  }

  const egg = mwState.starterEgg;

  if (!mwState.monsters) {
    mwState.monsters = {};
  }

  const creature = egg.creatureId
    ? mwState.monsters[egg.creatureId]
    : null;

  area.classList.remove("hidden");

  if (egg.opened && creature) {
    title.textContent = creature.name
      ? "🎉 ¡Tu criatura ya tiene nombre!"
      : "✨ ¡Tu criatura ha nacido!";

    if (creature.name) {
      content.innerHTML = `
        <p>Tu compañero se llama
          <strong>${mwEscapeHTML(creature.name)}</strong>.
        </p>
        <p>Rareza: ${mwEscapeHTML(creature.rarity || "COMÚN")}</p>
      `;
      return;
    }

    content.innerHTML = `
      <img
        src="${mwEscapeHTML(creature.image || "")}"
        alt="Tu nueva criatura"
        style="width:160px;max-width:100%;display:block;margin:16px auto;"
      >
      <p>${mwEscapeHTML(creature.kind || "Mágico")}</p>
      <p>Rareza:
        <strong>${mwEscapeHTML(creature.rarity || "COMÚN")}</strong>
      </p>
      <p>Producción:
        <strong>${Number(creature.baseProduction || 0).toLocaleString("es-PE")} monedas/h</strong>
      </p>
      <form onsubmit="mwNameStarterCreature(event)">
        <label for="starterCreatureName">Elige su nombre:</label>
        <input
          id="starterCreatureName"
          type="text"
          maxlength="20"
          placeholder="Escribe un nombre"
          required
        >
        <button class="primary" type="submit">
          💖 Confirmar nombre
        </button>
      </form>
    `;
    return;
  }

  title.textContent = "🥚 ¡Tu huevo de regalo!";

  content.innerHTML = `
    <div
      role="button"
      tabindex="0"
      aria-label="Toca el huevo para descubrir tu compañero"
      onclick="mwTapStarterEgg()"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();mwTapStarterEgg();}"
      style="cursor:pointer;text-align:center;padding:20px 0;"
    >
      <div
        style="font-size:110px;line-height:1.4;user-select:none;"
      >🥚✨</div>
      <p>Toca el huevo para descubrir tu compañero</p>
    </div>
  `;
}

function mwTapStarterEgg() {
  if (!mwState) return;

  const egg = mwState.starterEgg;

  if (!egg || (egg.opened && egg.creatureId)) return;

  egg.taps = Math.min(5, Number(egg.taps || 0) + 1);

  if (egg.taps >= 5) {
    const creature = mwRollMonster();

    if (!creature) {
      egg.taps = 4;
      alert("No se pudo crear tu monstruo. Inténtalo de nuevo.");
      return;
    }

    creature.level = 1;
    creature.xp = 0;

    egg.opened = true;
    egg.creatureId = creature.id;

    mwState.monsters[creature.id] = creature;
  }

  if (!mwSaveState(mwState)) {
    alert("No se pudo guardar el progreso del huevo.");
    return;
  }

  mwRenderStarterEgg();
}

function mwNameStarterCreature(event) {
  event.preventDefault();

  if (!mwState) return;

  const input = document.getElementById("starterCreatureName");
  const egg = mwState.starterEgg;

  const creature = egg?.creatureId
    ? mwState.monsters?.[egg.creatureId]
    : null;

  if (!creature || !input) return;

  const name = input.value.trim();

  if (!name) {
    alert("Escribe un nombre para tu criatura.");
    return;
  }

  const previousName = creature.name || "";
  const alreadyOwned = mwState.owned.includes(creature.id);

  creature.name = name.slice(0, 20);

  if (!alreadyOwned) {
    mwState.owned.push(creature.id);
  }

  if (!mwSaveState(mwState)) {
    if (!alreadyOwned) {
      mwState.owned = mwState.owned.filter(
        id => id !== creature.id
      );
    }

    creature.name = previousName;

    alert("No se pudo guardar el nombre. Inténtalo de nuevo.");
    return;
  }

  mwRenderGame();
  alert(`¡Bienvenido, ${creature.name}!`);
}

function mwRenderGame() {
  if (!mwState) return;

  mwUpdateWallet();

  const collection = document.getElementById("collection");
  const shop = document.getElementById("shopGrid");

  if (collection) {
    mwRenderMonsterCards(collection, mwState, "collection");
  }

  if (shop) {
    mwRenderMonsterCards(shop, mwState, "shop");
  }

  mwRenderStarterEgg();
}

function mwHandleMonsterAction(data) {
  if (!mwState) return;

  const monster =
    mwState.monsters?.[data.monsterId] ||
    mwGetMonster(data.monsterId);

  if (!monster) return;

  if (data.action === "shop") {
    if (mwState.owned.includes(monster.id)) return;

    if (mwState.coins < monster.price) {
      alert("No tienes suficientes monedas.");
      return;
    }

    const confirmed = confirm(
      `¿Quieres comprar a ${monster.name} por ${monster.price} monedas?`
    );

    if (!confirmed) return;

    const previousCoins = mwState.coins;

    mwState.coins -= monster.price;

    if (!mwState.owned.includes(monster.id)) {
      mwState.owned.push(monster.id);
    }

    if (!mwSaveState(mwState)) {
      mwState.coins = previousCoins;
      mwState.owned = mwState.owned.filter(
        id => id !== monster.id
      );

      alert("No se pudo guardar la compra en este dispositivo.");
      return;
    }

    mwRenderGame();
    alert(`¡Has conseguido a ${monster.name}!`);
    return;
  }

  if (data.action === "collection") {
    if (mwState.owned.includes(monster.id)) {
      alert(`¡${monster.name} es uno de tus monstruos!`);
    }
  }
}

function mwSetupMonsterActions() {
  const collection = document.getElementById("collection");
  const shop = document.getElementById("shopGrid");

  if (collection) {
    mwBindMonsterActions(collection, mwHandleMonsterAction);
  }

  if (shop) {
    mwBindMonsterActions(shop, mwHandleMonsterAction);
  }
}

function mwSetupNavigation() {
  const tabs = document.querySelectorAll("[data-tab]");

  tabs.forEach(button => {
    button.addEventListener("click", () => {
      if (!mwState) return;

      // No permitir abandonar la incubación inicial.
      if (!mwState.starterEgg?.opened) {
        return;
      }

      const tab = button.dataset.tab;

      document.querySelectorAll("[data-page]").forEach(page => {
        page.hidden = page.dataset.page !== tab;
      });

      tabs.forEach(item => {
        item.classList.toggle("active", item === button);
      });

      mwState.activeTab = tab;
      mwSaveState(mwState);
    });
  });
}

function mwRestoreNavigation() {
  if (!mwState?.starterEgg?.opened) return;
  if (!mwState.activeTab) return;

  const button = document.querySelector(
    `[data-tab="${mwState.activeTab}"]`
  );

  if (button) {
    button.click();
  }
}

function mwStartGame() {
  mwState = mwLoadState();

  if (!mwState) {
    console.error("No se pudo cargar el estado de MonsterWorld.");
    return;
  }

  if (!mwState.starterEgg) {
    mwState.starterEgg = {
      taps: 0,
      opened: false,
      creatureId: ""
    };
  }

  mwSetupMonsterActions();
  mwSetupNavigation();
  mwRenderGame();

  if (mwState.starterEgg.opened) {
    mwRestoreNavigation();
  } else {
    // Mantener el huevo como única pantalla durante la bienvenida.
    document.querySelectorAll("[data-page]").forEach(page => {
      page.hidden = true;
    });

    document.querySelectorAll("[data-tab]").forEach(button => {
      button.classList.remove("active");
    });

    const area = document.getElementById("hatchArea");

    if (area) {
      area.classList.remove("hidden");
    }
  }

  console.log("MonsterWorld iniciado correctamente.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mwStartGame);
} else {
  mwStartGame();
}
