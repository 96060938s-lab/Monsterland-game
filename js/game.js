function render() {
  renderCollection();
  renderShop();

  const ownedCount = save.owned.length;
  const totalCount = monsters.length;
  const titleEl = document.getElementById("monsterCollectionTitle");

  if (titleEl) {
    titleEl.textContent = `Mis monstruos ${ownedCount} / ${totalCount} mascotas`;
  }

  document.getElementById("coins").textContent = Math.floor(save.coins);
  document.getElementById("playerLevel").textContent = save.trainerProgress.level;
  document.getElementById("count").textContent = ownedCount + " / " + save.slots.capacity;
  document.getElementById("slotText").textContent = "Espacios ocupados: " + ownedCount + " / " + save.slots.capacity;
}
