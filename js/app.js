
let mwState = null;

function mwUpdateWallet() {
  const coinsElement = document.getElementById("coins");
  const levelElement = document.getElementById("playerLevel");

  if (coinsElement) {
    coinsElement.textContent = mwState.coins.toLocaleString("es-PE");
  }

  if (levelElement) {
    levelElement.textContent = mwState.playerLevel;
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
  const creature = egg.creatureId
    ? mwState.monsters?.[egg.creatureId]
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
        <p>Rareza: ${mwEscapeHTML(creature.rarity)}</p>
      `;
      return;
    }

    content.innerHTML = `
      <img
        src="${mwEscapeHTML(creature.image)}"
        alt="Tu nueva criatura"
        style="width:160px;max-width:100%;display:block;margin:16px auto;"
      >
      <p>${mwEscapeHTML(creature.kind)}</p>
      <p>Rareza: <strong>${mwEscapeHTML(creature.rarity)}</strong></p>
      <p>Producción: <strong>${Number(creature.baseProduction).toLocaleString("es-PE")} monedas/h</strong></p>
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
    <div style="font-size:76px;text-align:center;">🥚✨</div>
    <p>Toca el huevo 5 veces para descubrir tu criatura.</p>
    <p>Toques: <strong>${egg.taps} / 5</strong></p>
    <button
      class="primary"
      type="button"
      onclick="mwTapStarterEgg()"
    >
      🥚 TOCAR HUEVO
    </button>
  `;
}

function mwTapStarterEgg() {
  const egg = mwState.starterEgg;

  if (egg.opened && egg.creatureId) return;

  egg.taps = Math.min(5, egg.taps + 1);

  if (egg.taps === 5) {
    const creature = mwRollMonster();

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

  creature.name = name.slice(0, 20);

  if (!mwState.owned.includes(creature.id)) {
    mwState.owned.push(creature.id);
  }

  if (!mwSaveState(mwState)) {
    mwState.owned = mwState.owned.filter(id => id !== creature.id);
    creature.name = "";
    alert("No se pudo guardar el nombre. Inténtalo de nuevo.");
    return;
  }

  mwRenderGame();
  alert(`¡Bienvenido, ${creature.name}!`);
}

function mwRenderGame() {
  mwUpdateWallet();

  const collection = document.getElementById("collection");
  const shop = document.getElementById("shopGrid");

  if (collection) {
    mwRenderMonsterCards(collection, mwState, "collection");
  }
mwRenderStarterEgg();
  if (shop) {
    mwRenderMonsterCards(shop, mwState, "shop");
  }
}

function mwHandleMonsterAction(data) {
  const monster = mwGetMonster(data.monsterId);

  if (!monster) {
    return;
  }

  if (data.action === "shop") {
    if (mwState.owned.includes(monster.id)) {
      return;
    }

    if (mwState.coins < monster.price) {
      alert("No tienes suficientes monedas.");
      return;
    }

    const confirmed = confirm(
      `¿Quieres comprar a ${monster.name} por ${monster.price} monedas?`
    );

    if (!confirmed) {
      return;
    }

    mwState.coins -= monster.price;
    mwState.owned.push(monster.id);

    if (!mwSaveState(mwState)) {
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
  if (!mwState.activeTab) {
    return;
  }

  const button = document.querySelector(
    `[data-tab="${mwState.activeTab}"]`
  );

  if (button) {
    button.click();
  }
}

function mwStartGame() {
  mwState = mwLoadState();

  mwSetupMonsterActions();
  mwSetupNavigation();
  mwRenderGame();
  mwRestoreNavigation();

  console.log("MonsterWorld iniciado correctamente.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mwStartGame);
} else {
  mwStartGame();
}
