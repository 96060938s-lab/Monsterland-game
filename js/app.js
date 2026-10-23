
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

function mwRenderGame() {
  mwUpdateWallet();

  const collection = document.getElementById("collection");
  const shop = document.getElementById("shopGrid");

  if (collection) {
    mwRenderMonsterCards(collection, mwState, "collection");
  }

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
  const collection = document.getElementById("monstersGrid");
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
