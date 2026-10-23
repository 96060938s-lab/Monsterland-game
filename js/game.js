"use strict";

const monsters = [
  { id: "bubu", name: "Bubu", art: '<img src="Imagenes/bubu.png" alt="Bubu" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span class="emoji-art" style="display:none">👾</span>', price: 0, desc: "Tu primer compañero", kind: "✨ MÁGICO", rate: 900, rarity: "COMÚN", theme: "magic" },
  { id: "flama", name: "Flama", art: '<span class="emoji-art">🐲</span>', price: 40, desc: "Un pequeño dragón", kind: "🔥 FUEGO", rate: 1500, rarity: "POCO COMÚN", theme: "fire" },
  { id: "bosque", name: "Musguito", art: '<span class="emoji-art">🌱</span>', price: 60, desc: "Guardián del bosque", kind: "🌿 PLANTA", rate: 2000, rarity: "POCO COMÚN", theme: "plant" },
  { id: "fantasma", name: "Fanty", art: '<span class="emoji-art">👻</span>', price: 80, desc: "Espíritu amistoso", kind: "🌙 ESPÍRITU", rate: 2500, rarity: "POCO COMÚN", theme: "ghost" },
  { id: "fuego", name: "Chispas", art: '<span class="emoji-art">🦊</span>', price: 100, desc: "Criatura de fuego", kind: "🔥 FUEGO", rate: 3000, rarity: "ÉPICO", theme: "fire" },
  { id: "hielo", name: "Nevito", art: '<span class="emoji-art">🐧</span>', price: 120, desc: "Amigo de las nieves", kind: "❄️ HIELO", rate: 3500, rarity: "POCO COMÚN", theme: "ice" },
  { id: "mago", name: "Misterio", art: '<span class="emoji-art">🧙</span>', price: 150, desc: "Mago de los secretos", kind: "✨ MAGIA", rate: 4500, rarity: "ÉPICO", theme: "magic" },
  { id: "dragon", name: "Dracón", art: '<span class="emoji-art">🐉</span>', price: 200, desc: "Dragón legendario", kind: "⚡ RAYO", rate: 6000, rarity: "LEGENDARIO", theme: "ray" }
];

let save;
try { save = JSON.parse(localStorage.getItem("monsterWorldSave")); } catch (e) { save = null; }

if (!save || typeof save.coins !== "number" || !Array.isArray(save.owned)) {
  save = { coins: 100, owned: [], care: {}, lastDaily: "", starterEggClaimed: false };
}

if (!save.care) save.care = {};
if (!save.lastDaily) save.lastDaily = "";
if (typeof save.starterEggClaimed !== "boolean") save.starterEggClaimed = save.owned.includes("bubu");
if (!save.trainerProgress) save.trainerProgress = { level: 1, xp: 0 };
if (!save.inventory) save.inventory = { eggs: [], care: { comer: {}, banar: {}, dormir: {} } };
if (!Array.isArray(save.inventory.eggs)) save.inventory.eggs = [];
if (!save.inventory.care) save.inventory.care = { comer: {}, banar: {}, dormir: {} };
["comer", "banar", "dormir"].forEach(a => { if (!save.inventory.care[a]) save.inventory.care[a] = {}; });
if (!Array.isArray(save.incubating)) save.incubating = [];
if (!save.slots) save.slots = { capacity: 1 };
if (typeof save.slots.capacity !== "number" || save.slots.capacity < 1) save.slots.capacity = 1;
if (typeof save.eggPurchases !== "number" || save.eggPurchases < 0) save.eggPurchases = 0;
save.owned = [...new Set(save.owned.filter(id => monsters.some(m => m.id === id)))];
if (!save.needs) save.needs = {};
if (!save.production) save.production = {};
if (!save.sleep) save.sleep = {};
if (!save.monsterSlots) save.monsterSlots = {};
if (!save.trainerProgress || typeof save.trainerProgress !== "object") save.trainerProgress = { level: 1, xp: 0 };
if (typeof save.trainerProgress.level !== "number" || save.trainerProgress.level < 1) save.trainerProgress.level = 1;
if (typeof save.trainerProgress.xp !== "number" || save.trainerProgress.xp < 0) save.trainerProgress.xp = 0;

let migrationUsed = new Set();
save.owned.forEach(id => {
  let slot = save.monsterSlots[id];
  if (!Number.isInteger(slot) || slot < 0 || migrationUsed.has(slot)) {
    slot = 0; while (migrationUsed.has(slot)) slot++;
    save.monsterSlots[id] = slot;
  }
  migrationUsed.add(slot);
});

save.incubating.forEach(e => {
  if (!Number.isInteger(e.slotIndex) || e.slotIndex < 0 || migrationUsed.has(e.slotIndex)) {
    let slot = 0; while (migrationUsed.has(slot)) slot++;
    e.slotIndex = slot;
  }
  migrationUsed.add(e.slotIndex);
});
if (migrationUsed.size > save.slots.capacity) save.slots.capacity = migrationUsed.size;

const INCUBATION_TIME = 24 * 60 * 60 * 1000;
const MAX_INCUBATION_ADS = 15;
const INCUBATION_AD_TIME = 60 * 60 * 1000;
const NORMAL_EGG_PRICE = 100;
const CARE_HOURS = 24;
const CARE_TIME = CARE_HOURS * 3600000;
const NEED_INTERVAL = 20 * 60000;
const SPECIAL_SLEEP_TIME = 4 * 3600000;
const SPECIAL_BONUS_TIME = 4 * 3600000;

if (!save.incubation24hMigrated) {
  const now = Date.now();
  save.incubating.forEach(e => {
    const oldDuration = Number(e.finishAt) - Number(e.startedAt);
    if (!e.startedAt || !e.finishAt || oldDuration < INCUBATION_TIME) {
      e.startedAt = now;
      e.finishAt = now + INCUBATION_TIME;
    }
  });
  save.incubation24hMigrated = true;
}

save.incubating.forEach(e => {
  if (typeof e.adsWatched !== "number") e.adsWatched = 0;
  if (typeof e.adTimeReduced !== "number") e.adTimeReduced = 0;
});

monsters.forEach(m => {
  if (!save.monsterProgress) save.monsterProgress = {};
  if (!save.monsterProgress[m.id]) save.monsterProgress[m.id] = { level: 1, xp: 0 };
  if (!save.needs[m.id]) save.needs[m.id] = { comer: Date.now(), banar: Date.now(), dormir: Date.now() };
  ["comer", "banar", "dormir"].forEach(a => { if (typeof save.needs[m.id][a] !== "number") save.needs[m.id][a] = Date.now(); });
});

const rarityMultiplier = { "COMÚN": 1, "POCO COMÚN": 1.5, "RARO": 2, "ÉPICO": 3, "LEGENDARIO": 4 };
const rarityWeights = { "COMÚN": 60, "POCO COMÚN": 28, "RARO": 8, "ÉPICO": 3, "LEGENDARIO": 1 };

let tonWalletConnected = false;
let tonWalletAddress = "";
let currentWalletAction = "";

function openWallet() {
  renderWallet();
  document.getElementById("walletModal").classList.remove("hidden");
}

function closeWallet() {
  document.getElementById("walletModal").classList.add("hidden");
}

function renderWallet() {
  document.getElementById("walletCoins").textContent = Math.floor(save.coins);
  const status = document.getElementById("walletConnectionStatus");
  const connectButton = document.getElementById("connectTonButton");
  const addressPanel = document.getElementById("walletAddressPanel");
  const actions = document.getElementById("walletActions");

  if (tonWalletConnected && tonWalletAddress) {
    status.innerHTML = '<span class="wallet-status-dot" style="background:#00c99a"></span><strong>Estado:</strong> Billetera TON conectada.';
    connectButton.classList.add("hidden");
    addressPanel.classList.remove("hidden");
    document.getElementById("walletAddress").textContent = tonWalletAddress;
    actions.classList.remove("hidden");
  } else {
    status.innerHTML = '<span class="wallet-status-dot"></span><strong>Estado:</strong> Billetera TON no conectada.';
    connectButton.classList.remove("hidden");
    addressPanel.classList.add("hidden");
    actions.classList.remove("hidden");
  }
}

function connectTonWallet() {
  notice("🔗 La conexión real con TON Connect todavía debe integrarse. No se ha conectado ninguna billetera.");
  document.getElementById("walletConnectionStatus").innerHTML = '<span class="wallet-status-dot"></span><strong>Conexión pendiente:</strong> falta configurar TON Connect y su manifiesto.';
}

function disconnectTonWallet() {
  tonWalletConnected = false;
  tonWalletAddress = "";
  renderWallet();
  notice("La billetera se ha desconectado de esta pantalla.");
}

function openWalletAction(action) {
  currentWalletAction = action;
  const connected = tonWalletConnected && Boolean(tonWalletAddress);
  const title = document.getElementById("walletActionTitle");
  const description = document.getElementById("walletActionDescription");
  const icon = document.getElementById("walletActionIcon");
  const info = document.getElementById("walletActionInfo");

  if (action === "depositar") {
    title.textContent = "📥 Depositar TON";
    description.textContent = "Prepara un depósito para MonsterWorld.";
    icon.textContent = "💎 Depósito de TON";
    info.textContent = connected
      ? "La cartera aparece conectada, pero todavía falta integrar la recepción y verificación segura de depósitos."
      : "Primero debes conectar una billetera TON. La conexión real todavía no está integrada.";
  } else {
    title.textContent = "📤 Retirar";
    description.textContent = "Prepara una solicitud de retiro.";
    icon.textContent = "💎 Retiro de TON";
    info.textContent = connected
      ? "La cartera aparece conectada, pero todavía falta implementar el saldo retirable, las reglas y la verificación de los pagos."
      : "Primero debes conectar una billetera TON. Los retiros reales todavía no están habilitados.";
  }

  document.getElementById("walletActionModal").classList.remove("hidden");
}

function closeWalletAction() {
  document.getElementById("walletActionModal").classList.add("hidden");
}

function walletActionPending() {
  if (currentWalletAction === "depositar") {
    notice("📥 Los depósitos TON aún no están habilitados. No se realizó ninguna transacción.");
  } else if (currentWalletAction === "retirar") {
    notice("📤 Los retiros TON aún no están habilitados. No se realizó ninguna transacción.");
  }
  closeWalletAction();
}

function persist() {
  try { localStorage.setItem("monsterWorldSave", JSON.stringify(save)); } catch (e) {}
}

function notice(t) {
  document.getElementById("notice").textContent = t;
}

function getTrainerXPRequired() {
  return save.trainerProgress.level * 100;
}

function xpMultiplier() {
  return save.xpBoostUntil && Date.now() < save.xpBoostUntil ? 2 : 1;
}

function addTrainerXP(n) {
  save.trainerProgress.xp += n * xpMultiplier();
  while (save.trainerProgress.xp >= getTrainerXPRequired()) {
    save.trainerProgress.xp -= getTrainerXPRequired();
    save.trainerProgress.level++;
  }
}

function getMonsterLevel(id) {
  return save.monsterProgress[id]?.level || 1;
}

function getXPRequired(m) {
  return Math.round(100 * getMonsterLevel(m.id) * (rarityMultiplier[m.rarity] || 1));
}

function getLevelPrice(m) {
  return Math.round(200 * getMonsterLevel(m.id) ** 2 * (rarityMultiplier[m.rarity] || 1));
}

function addMonsterXP(id, n) {
  if (save.owned.includes(id)) save.monsterProgress[id].xp += n * xpMultiplier();
}

function formatTime(ms) {
  let t = Math.max(0, Math.floor(ms / 1000));
  let d = Math.floor(t / 86400), h = Math.floor((t % 86400) / 3600), min = Math.floor((t % 3600) / 60), s = t % 60;
  if (d > 0) return d + " d " + h + " h " + min + " min";
  return h + " h " + min + " min " + s + " s";
}

function usedSlotIndexes() {
  const used = new Set();
  save.owned.forEach(id => { const i = save.monsterSlots[id]; if (Number.isInteger(i)) used.add(i); });
  save.incubating.forEach(e => { if (Number.isInteger(e.slotIndex)) used.add(e.slotIndex); });
  return used;
}

function occupiedSlots() {
  return usedSlotIndexes().size;
}

function freeSlots() {
  return Math.max(0, save.slots.capacity - occupiedSlots());
}

function findFreeSlot() {
  const used = usedSlotIndexes();
  for (let i = 0; i < save.slots.capacity; i++) if (!used.has(i)) return i;
  return -1;
}

function nextSlotPrice() {
  return Math.round(500 * Math.pow(1.5, save.slots.capacity - 1));
}

function buySlot() {
  const price = nextSlotPrice();
  if (save.coins < price) {
    notice("Necesitas " + price + " monedas para comprar otro espacio.");
    return;
  }
  updateProduction();
  save.coins -= price;
  save.slots.capacity++;
  persist();
  render();
  notice("🏡 ¡Compraste un espacio permanente!");
}

function tapSlot(index) {
  if (usedSlotIndexes().has(index)) return;
  if (save.inventory.eggs.length) {
    incubateEgg(save.inventory.eggs[0].id, index);
    return;
  }
  showPage("tienda");
  showShopCategory("huevos");
  notice("🥚 Compra un huevo y vuelve a tu espacio para incubarlo.");
}

function currentEggPrice() {
  return Math.round(NORMAL_EGG_PRICE * Math.pow(1.5, save.eggPurchases));
}

function openEgg(type) {
  if (type !== "normal") return;
  if (!save.starterEggClaimed) {
    save.starterEggClaimed = true;
    if (!save.owned.includes("bubu")) {
      let slot = findFreeSlot();
      if (slot < 0) { slot = save.slots.capacity; save.slots.capacity++; }
      save.owned.push("bubu");
      save.monsterSlots.bubu = slot;
      save.monsterProgress.bubu = save.monsterProgress.bubu || { level: 1, xp: 0 };
      resumeCare("bubu");
    }
    persist();
    render();
    showPage("monstruos");
    notice("🥚✨ ¡Tu primer huevo eclosionó! ¡Bubu es tu compañero!");
    return;
  }
  if (save.owned.length + save.incubating.length >= monsters.length) {
    notice("Ya has descubierto todos los monstruos disponibles.");
    return;
  }
  const price = currentEggPrice();
  if (save.coins < price) {
    notice("Necesitas " + price + " monedas para comprar el próximo huevo.");
    return;
  }
  updateProduction();
  save.coins -= price;
  save.eggPurchases++;
  save.inventory.eggs.push({ id: Date.now() + "-" + Math.random().toString(36).slice(2), type: "normal", boughtAt: Date.now() });
  persist();
  render();
  notice("🥚 Huevo guardado en el inventario. Puedes incubarlo cuando tengas un espacio libre.");
}

function chooseRandomMonster() {
  const reserved = save.incubating.map(e => e.monsterId);
  const available = monsters.filter(m => !save.owned.includes(m.id) && !reserved.includes(m.id));
  if (!available.length) return null;
  let total = available.reduce((s, m) => s + (rarityWeights[m.rarity] || 1), 0);
  let roll = Math.random() * total;
  for (const m of available) {
    roll -= rarityWeights[m.rarity] || 1;
    if (roll < 0) return m;
  }
  return available[available.length - 1];
}

function incubateEgg(eggId, slotIndex) {
  const egg = save.inventory.eggs.find(e => e.id === eggId);
  if (!egg) return;
  if (slotIndex === undefined) slotIndex = findFreeSlot();
  if (slotIndex < 0 || slotIndex >= save.slots.capacity || usedSlotIndexes().has(slotIndex)) {
    notice("🏡 No tienes espacios libres. Compra otro espacio.");
    return;
  }
  const m = chooseRandomMonster();
  if (!m) {
    notice("Ya no quedan monstruos nuevos por descubrir.");
    return;
  }
  const startedAt = Date.now();
  save.inventory.eggs = save.inventory.eggs.filter(e => e.id !== eggId);
  save.incubating.push({ id: egg.id, monsterId: m.id, slotIndex, startedAt, finishAt: startedAt + INCUBATION_TIME, adsWatched: 0, adTimeReduced: 0 });
  persist();
  render();
  notice("🥚✨ ¡Incubación iniciada en el espacio " + (slotIndex + 1) + "! Tu huevo nacerá en 24 horas.");
}

let selectedIncubationId = null;

function openIncubationMenu(eggId) {
  const egg = save.incubating.find(e => e.id === eggId);
  if (!egg) return;
  selectedIncubationId = eggId;
  renderIncubationMenu();
  document.getElementById("incubationModal").classList.remove("hidden");
}

function closeIncubationMenu() {
  document.getElementById("incubationModal").classList.add("hidden");
  selectedIncubationId = null;
}

function renderIncubationMenu() {
  const egg = save.incubating.find(e => e.id === selectedIncubationId);
  if (!egg) { closeIncubationMenu(); return; }
  const m = monsters.find(x => x.id === egg.monsterId);
  const remaining = Math.max(0, egg.finishAt - Date.now());
  const watched = Math.min(MAX_INCUBATION_ADS, Number(egg.adsWatched) || 0);
  const reduced = Math.min(MAX_INCUBATION_ADS, Number(egg.adTimeReduced) || 0);
  document.getElementById("incubationModalSubtitle").textContent = (m ? m.name : "Tu monstruo") + " · Espacio " + (egg.slotIndex + 1);
  document.getElementById("incubationTimeLeft").textContent = formatTime(remaining);
  document.getElementById("incubationAdsProgress").textContent = "Anuncios completados: " + watched + " / " + MAX_INCUBATION_ADS + " · Horas reducidas: " + reduced;
  document.getElementById("incubationAdsBar").style.width = (watched / MAX_INCUBATION_ADS * 100) + "%";
  const adButton = document.getElementById("incubationAdButton");
  adButton.textContent = watched >= MAX_INCUBATION_ADS ? "LÍMITE DE 15 ANUNCIOS ALCANZADO" : "VER ANUNCIO";
  adButton.disabled = watched >= MAX_INCUBATION_ADS || remaining <= 0;
  document.getElementById("incubationAdMessage").textContent = watched >= MAX_INCUBATION_ADS
    ? "Ya usaste los 15 anuncios de este huevo. Si todavía queda tiempo, tendrás que esperar o usar el nacimiento con TON cuando esté disponible."
    : "Cada anuncio confirmado reducirá una hora. La conexión con anuncios reales todavía está pendiente.";
  document.getElementById("incubationTonMessage").textContent = "Precio pendiente. Este botón todavía no cobra ni acelera el nacimiento.";
}

async function watchIncubationAd() {
  const egg = save.incubating.find(e => e.id === selectedIncubationId);
  if (!egg) { closeIncubationMenu(); return; }
  if ((Number(egg.adsWatched) || 0) >= MAX_INCUBATION_ADS) {
    notice("Ya completaste el máximo de 15 anuncios para este huevo.");
    renderIncubationMenu();
    return;
  }
  if (!window.Adsgram) {
    notice("Adsgram no se ha cargado. Recarga el juego e inténtalo de nuevo.");
    return;
  }
  try {
    const controller = window.Adsgram.init({ blockId: "55520" });
    const result = await controller.show();
    if (result && result.done === true) {
      completeIncubationAdReward(egg.id);
    } else {
      notice("El anuncio no se completó. No se redujo la incubación.");
    }
  } catch (error) {
    console.error("Error de Adsgram:", error);
    notice("No se completó el anuncio. No se entregó ninguna recompensa.");
  }
}

function completeIncubationAdReward(eggId) {
  const egg = save.incubating.find(e => e.id === eggId);
  if (!egg || (Number(egg.adsWatched) || 0) >= MAX_INCUBATION_ADS) return false;
  egg.adsWatched = (Number(egg.adsWatched) || 0) + 1;
  egg.adTimeReduced = (Number(egg.adTimeReduced) || 0) + 1;
  egg.finishAt -= INCUBATION_AD_TIME;
  if (egg.finishAt < Date.now()) egg.finishAt = Date.now();
  persist();
  updateIncubations();
  render();
  if (selectedIncubationId === eggId) renderIncubationMenu();
  notice("📺 ¡Anuncio confirmado! Se redujo 1 hora de incubación.");
  return true;
}

function incubationTonComingSoon() {
  document.getElementById("incubationTonMessage").textContent = "💎 El pago en TON estará disponible cuando configuremos el precio y conectemos una cartera. No se realizó ningún cobro.";
  notice("💎 Los pagos en TON se activarán más adelante. No se realizó ningún cobro.");
}

function updateIncubations() {
  const now = Date.now();
  const done = save.incubating.filter(e => now >= e.finishAt);
  if (!done.length) return;
  done.forEach(e => {
    const m = monsters.find(x => x.id === e.monsterId);
    save.incubating = save.incubating.filter(x => x.id !== e.id);
    if (m && !save.owned.includes(m.id)) {
      save.owned.push(m.id);
      save.monsterSlots[m.id] = e.slotIndex;
      save.monsterProgress[m.id] = save.monsterProgress[m.id] || { level: 1, xp: 0 };
      resumeCare(m.id);
      save.lastHatched = m.name;
    }
    if (selectedIncubationId === e.id) closeIncubationMenu();
  });
  persist();
  if (save.lastHatched) {
    notice("🎉 ¡El huevo eclosionó! Descubriste a " + save.lastHatched + ".");
    save.lastHatched = "";
  }
}

function buyXPBoost(hours, price) {
  updateProduction();
  if (save.coins < price) {
    notice("No tienes suficientes monedas.");
    return;
  }
  save.coins -= price;
  const now = Date.now();
  const until = save.xpBoostUntil > now ? save.xpBoostUntil : now;
  save.xpBoostUntil = until + hours * 3600000;
  persist();
  render();
  notice("⭐ Doble experiencia activada durante " + hours + " hora(s).");
}

function updateProduction() {
  const now = Date.now();
  monsters.forEach(m => {
    if (!save.owned.includes(m.id)) return;
    let p = save.production[m.id];
    if (!p) {
      p = save.production[m.id] = {
        lastAt: now,
        caredUntil: now + CARE_TIME,
        remainder: 0
      };
    }
    if (typeof p.baseRate !== "number") {
      p.baseRate = m.rarity === "COMÚN" ? Math.floor(Math.random() * 301) + 800 : m.rate;
    }
    if (typeof p.lastAt !== "number") p.lastAt = now;
    if (typeof p.caredUntil !== "number") p.caredUntil = now + CARE_TIME;
    if (typeof p.remainder !== "number") p.remainder = 0;

    const sleep = save.sleep[m.id];
    if (sleep && sleep.sleeping) {
      p.lastAt = now;
      return;
    }

    const start = p.lastAt;
    const end = Math.min(now, p.caredUntil);
    const rate = p.baseRate;

    if (end > start) {
      let earned = 0;
      const bonusStart = sleep && typeof sleep.bonusStartedAt === "number" ? sleep.bonusStartedAt : 0;
      const bonusEnd = sleep && typeof sleep.bonusUntil === "number" ? sleep.bonusUntil : 0;

      if (bonusStart > 0 && bonusEnd > bonusStart) {
        const normalBefore = Math.max(0, Math.min(end, bonusStart) - start);
        const bonusPart = Math.max(0, Math.min(end, bonusEnd) - Math.max(start, bonusStart));
        const normalAfter = Math.max(0, end - Math.max(start, bonusEnd));
        earned = rate * (normalBefore + normalAfter) / 3600000 + rate * 1.25 * bonusPart / 3600000 + p.remainder;
      } else {
        earned = rate * (end - start) / 3600000 + p.remainder;
      }
      const whole = Math.floor(earned);
      save.coins += whole;
      p.remainder = earned - whole;
    }

    p.lastAt = now;
    if (now >= p.caredUntil) p.remainder = 0;
  });
  persist();
}

function resumeCare(id) {
  const now = Date.now();
  save.production[id] = { lastAt: now, caredUntil: now + CARE_TIME, remainder: 0 };
}

function getNeedPercent(id, action) {
  const now = Date.now();
  if (!save.needs[id]) save.needs[id] = { comer: now, banar: now, dormir: now };
  if (typeof save.needs[id][action] !== "number") save.needs[id][action] = now;
  const sleep = save.sleep[id];
  const effectiveNow = sleep && sleep.sleeping && typeof sleep.startedAt === "number" ? Math.min(now, sleep.startedAt) : now;
  return Math.max(0, 100 - Math.floor((effectiveNow - save.needs[id][action]) / NEED_INTERVAL) * 10);
}

function getNeedState(id, action) {
  return getNeedPercent(id, action);
}

function startSpecialSleep(id) {
  const existing = save.sleep[id];
  if (existing && existing.sleeping) {
    notice("🌙 Este monstruo ya está durmiendo.");
    return;
  }
  updateProduction();
  const now = Date.now();
  if (!save.needs[id]) save.needs[id] = { comer: now, banar: now, dormir: now };
  save.sleep[id] = { sleeping: true, startedAt: now, until: now + SPECIAL_SLEEP_TIME, bonusStartedAt: 0, bonusUntil: 0 };
  if (save.production[id]) { save.production[id].lastAt = now; save.production[id].remainder = 0; }
  save.needs[id].dormir = now;
  addTrainerXP(5);
  addMonsterXP(id, 5);
  persist();
  render();
  notice("🌙 Tu monstruo está durmiendo. Su producción y sus estadísticas están pausadas durante 4 horas.");
}

function wakeSpecialMonster(id) {
  const s = save.sleep[id], now = Date.now();
  if (!s || !s.sleeping) return;
  if (now < s.until) {
    notice("🌙 Tu monstruo todavía está durmiendo. Tiempo restante: " + formatTime(s.until - now));
    return;
  }
  const startedAt = typeof s.startedAt === "number" ? s.startedAt : s.until - SPECIAL_SLEEP_TIME;
  const sleepDuration = Math.max(0, now - startedAt);
  if (!save.needs[id]) save.needs[id] = { comer: now, banar: now, dormir: now };
  ["comer", "banar", "dormir"].forEach(a => {
    if (typeof save.needs[id][a] !== "number") save.needs[id][a] = startedAt;
    save.needs[id][a] += sleepDuration;
  });
  if (save.production[id]) {
    const p = save.production[id];
    if (p.caredUntil > startedAt) p.caredUntil += sleepDuration;
    p.lastAt = now;
    p.remainder = 0;
  } else {
    resumeCare(id);
    save.production[id].lastAt = now;
  }
  s.sleeping = false;
  s.wokenAt = now;
  s.bonusStartedAt = now;
  s.bonusUntil = now + SPECIAL_BONUS_TIME;
  persist();
  render();
  const m = monsters.find(x => x.id === id);
  notice("⚡ ¡" + (m ? m.name : "Tu monstruo") + " despertó! Producción +25 % durante 4 horas.");
}

function showPage(page) {
  ["monstruos", "tienda", "premios", "social", "salon"].forEach(p => {
    document.getElementById("page-" + p).classList.toggle("hidden", p !== page);
    document.getElementById("nav-" + p).classList.toggle("active", p === page);
  });
  render();
  window.scrollTo(0, 0);
}

let shopCategory = "huevos";
function showShopCategory(c) {
  shopCategory = c;
  ["huevos", "alimentos", "bano", "dormir", "xp"].forEach(x => {
    document.getElementById("shop-" + x).classList.toggle("hidden", x !== c);
    document.getElementById("shop-tab-" + x).classList.toggle("active", x === c);
  });
  renderShop();
}

let selectedLevelMonster = null;
function openLevelMenu(id) {
  if (!save.owned.includes(id)) return;
  selectedLevelMonster = id;
  renderLevelMenu();
  document.getElementById("levelModal").classList.remove("hidden");
}

function closeLevelMenu() {
  document.getElementById("levelModal").classList.add("hidden");
  selectedLevelMonster = null;
}

function renderLevelMenu() {
  const m = monsters.find(x => x.id === selectedLevelMonster);
  if (!m) return;
  const p = save.monsterProgress[m.id];
  const req = getXPRequired(m);
  const price = getLevelPrice(m);

  document.getElementById("levelTitle").textContent = "⭐ " + m.name;
  document.getElementById("levelSubtitle").textContent = "Mejora a tu compañero mágico.";
  document.getElementById("levelCurrent").textContent = p.level;
  document.getElementById("levelXP").textContent = Math.floor(p.xp) + " / " + req + " XP";
  document.getElementById("levelBar").style.width = Math.min(100, p.xp / req * 100) + "%";
  document.getElementById("levelRarity").textContent = m.rarity;
  document.getElementById("levelPrice").textContent = price + " 🪙";

  const produccionActual = getMonsterProduction(m);
  const nivelSiguiente = p.level + 1;
  const progresoTemporal = { ...p, level: nivelSiguiente };
  save.monsterProgress[m.id] = progresoTemporal;
  const produccionSiguiente = getMonsterProduction(m);
  save.monsterProgress[m.id] = p;

  document.getElementById("levelProductionCurrent").textContent = Math.floor(produccionActual) + " monedas/hora";
  document.getElementById("levelProductionNext").textContent = Math.floor(produccionSiguiente) + " monedas/hora";
  document.getElementById("levelUpButton").disabled = !(p.xp >= req && save.coins >= price);
  document.getElementById("levelUpButton").textContent = p.xp >= req
    ? "⭐ SUBIR AL NIVEL " + (p.level + 1)
    : "🔒 FALTAN " + Math.max(0, req - Math.floor(p.xp)) + " XP";
  document.getElementById("levelMessage").textContent = p.xp < req
    ? "Cuida a tu monstruo para conseguir experiencia."
    : save.coins < price
      ? "Necesitas más monedas."
      : "¡Ya puedes subir de nivel!";
}

function levelUpMonster() {
  const m = monsters.find(x => x.id === selectedLevelMonster);
  if (!m) return;
  const p = save.monsterProgress[m.id];
  const req = getXPRequired(m);
  const price = getLevelPrice(m);

  if (p.xp < req || save.coins < price) {
    notice("Necesitas la experiencia y las monedas necesarias.");
    return;
  }

  updateProduction();
  save.coins -= price;
  p.xp -= req;
  p.level++;

  persist();
  render();
  renderLevelMenu();
  notice("🎉 " + m.name + " subió al nivel " + p.level + "!");
}

function monsterCard(m) {
  const sleep = save.sleep[m.id], now = Date.now();
  let state = m.desc;
  if (sleep && sleep.sleeping && now < sleep.until) state = "🌙 Durmiendo · " + formatTime(sleep.until - now) + " restantes";
  else if (sleep && sleep.sleeping && now >= sleep.until) state = "🌙 Descanso terminado · Pulsa DESPERTAR";
  else if (sleep && sleep.bonusUntil && now < sleep.bonusUntil) state = "⚡ Bono +25 % activo · " + formatTime(sleep.bonusUntil - now);
  else if (sleep && sleep.bonusUntil && now >= sleep.bonusUntil) state = "✨ Despierto";

  const needs = [["comer", "🍎 Alimentación"], ["banar", "🛁 Baño"], ["dormir", "🌙 Descanso"]];
  return `<article class="monster">
    <div class="picture ${m.theme}">${m.art}
      <button class="level-tag" onclick="openLevelMenu('${m.id}')">Nv.${getMonsterLevel(m.id)} ⬆️</button>
      <span class="rarity ${m.rarity === "ÉPICO" ? "epic" : m.rarity === "LEGENDARIO" ? "legendary" : ""}">${m.rarity}</span>
    </div>
    <div class="details">
      <h3>${m.name}</h3>
      <div class="kind">${m.kind}</div>
      <div class="rate">⚡ +${(m.rate / 1000).toFixed(1)}K/h</div>
      ${needs.map(([a, label]) => `<div class="need-line">${label}: ${getNeedPercent(m.id, a)}%<div class="need-bar"><div style="width:${getNeedPercent(m.id, a)}%;background:${getNeedPercent(m.id, a) < 30 ? "#ef5e5e" : "#00c99a"};"></div></div></div>`).join("")}
      <div class="care">
        <button onclick="openCareMenu('${m.id}','comer')"><span class="circle">🍴</span><span>COMER</span></button>
        <button onclick="openCareMenu('${m.id}','banar')"><span class="circle">💧</span><span>BAÑAR</span></button>
        <button onclick="openCareMenu('${m.id}','dormir')"><span class="circle">☾</span><span>DORMIR</span></button>
      </div>
      <p class="status">${state}</p>
    </div>
  </article>`;
}

const careProducts = {
  comer: [
    { name: "Galleta mágica", price: 10, recovery: 6, ads: 1, emoji: "🍪" },
    { name: "Fruta encantada", price: 25, recovery: 17, ads: 2, emoji: "🍎" },
    { name: "Comida energética", price: 50, recovery: 44, ads: 0, emoji: "🥗" },
    { name: "Banquete real", price: 100, recovery: 100, ads: 0, emoji: "🍱" }
  ],
  banar: [
    { name: "Esponja simple", price: 10, recovery: 6, ads: 1, emoji: "🧽" },
    { name: "Jabón mágico", price: 25, recovery: 17, ads: 2, emoji: "🧼" },
    { name: "Champú brillante", price: 50, recovery: 44, ads: 0, emoji: "🧴" },
    { name: "Baño premium", price: 100, recovery: 100, ads: 0, emoji: "🛁" }
  ],
  dormir: [
    { name: "Bebida suave", price: 10, recovery: 6, ads: 1, emoji: "🥛" },
    { name: "Bebida mediana", price: 25, recovery: 17, ads: 2, emoji: "🧃" },
    { name: "Bebida fuerte", price: 50, recovery: 44, ads: 0, emoji: "⚡" },
    { name: "Poción de sueño", price: 100, recovery: 100, ads: 0, emoji: "🌙" }
  ]
};

const categoryNames = { comer: "🍪 Alimentos", banar: "🛁 Productos de baño", dormir: "🌙 Productos de descanso" };

function getProductCount(action, name) {
  return Number(save.inventory.care[action][name]) || 0;
}

function renderCollection() {
  const collection = document.getElementById("collection");
  if (!collection) return;

  const owned = save.owned.filter(id => monsters.some(m => m.id === id));
  if (!owned.length) {
    collection.innerHTML = "";
    return;
  }

  collection.innerHTML = owned.map(id => monsterCard(monsters.find(m => m.id === id))).join("") + `
    <button class="monster extra-space" id="addMonsterSpace" aria-label="Comprar espacio adicional" title="Comprar espacio adicional" onclick="mwBuyMonsterSpace()">
      <span class="extra-space-symbol">＋</span>
    </button>`;
}

function renderShop() {
  const list = document.getElementById("shop-" + shopCategory);
  if (!list) return;
}

function render() {
  renderCollection();
  renderShop();
  document.getElementById("coins").textContent = Math.floor(save.coins);
  document.getElementById("playerLevel").textContent = save.trainerProgress.level;
  document.getElementById("count").textContent = save.owned.length + " / " + save.slots.capacity;
  document.getElementById("slotText").textContent = "Espacios ocupados: " + save.owned.length + " / " + save.slots.capacity;
}

window.addEventListener("DOMContentLoaded", () => {
  render();
  showPage("monstruos");
});

window.openWallet = openWallet;
window.closeWallet = closeWallet;
window.showPage = showPage;
window.showShopCategory = showShopCategory;
window.claimDaily = claimDaily;
window.shareGame = shareGame;
window.render = render;
window.notice = notice;
window.buyXPBoost = buyXPBoost;
window.openCareMenu = openCareMenu;
window.closeCareMenu = closeCareMenu;
window.useCareProducts = useCareProducts;
window.watchCareAds = watchCareAds;
window.goToCareShop = goToCareShop;
window.levelUpMonster = levelUpMonster;
window.closeLevelMenu = closeLevelMenu;
window.closeIncubationMenu = closeIncubationMenu;
window.watchIncubationAd = watchIncubationAd;
window.incubationTonComingSoon = incubationTonComingSoon;
window.connectTonWallet = connectTonWallet;
window.disconnectTonWallet = disconnectTonWallet;
window.openWalletAction = openWalletAction;
window.closeWalletAction = closeWalletAction;
window.walletActionPending = walletActionPending;
window.buySlot = buySlot;
window.tapSlot = tapSlot;
window.openEgg = openEgg;
window.incubateEgg = incubateEgg;
window.openIncubationMenu = openIncubationMenu;
window.startSpecialSleep = startSpecialSleep;
window.wakeSpecialMonster = wakeSpecialMonster;
window.openLevelMenu = openLevelMenu;
window.levelUpMonster = levelUpMonster;
window.mwBuyMonsterSpace = buySlot;

function claimDaily() {
  const now = Date.now();
  if (save.lastDaily && new Date(save.lastDaily).toDateString() === new Date(now).toDateString()) {
    notice("Ya reclamaste tu premio diario de hoy.");
    return;
  }
  save.coins += 20;
  save.lastDaily = new Date(now).toISOString();
  persist();
  render();
  notice("🎁 ¡Reclamaste 20 monedas diarias!");
}

function shareGame() {
  notice("📢 Comparte MonsterWorld con tus amigos.");
}

function openCareMenu(monsterId, action) {
  const modal = document.getElementById("careModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.getElementById("careModalTitle").textContent = "Cuidados";
  document.getElementById("careModalSubtitle").textContent = "Usa recursos para mejorar a tu monstruo.";
  document.getElementById("careOptions").innerHTML = "<div class=\"care-option\">No hay productos disponibles aún.</div>";
}

function closeCareMenu() {
  const modal = document.getElementById("careModal");
  if (modal) modal.classList.add("hidden");
}

function useCareProducts() {
  notice("🧰 Los productos de cuidado están listos para usarse.");
}

function watchCareAds() {
  notice("📺 Los anuncios de cuidado aún no están conectados.");
}

function goToCareShop() {
  showPage("tienda");
  showShopCategory("alimentos");
}

function getMonsterProduction(m) {
  const level = getMonsterLevel(m.id);
  const base = m.rate || 0;
  return base * level * (rarityMultiplier[m.rarity] || 1);
}

window.getMonsterProduction = getMonsterProduction;
window.monsters = monsters;
window.save = save;

console.log("MonsterWorld JS cargado.");
