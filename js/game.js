function monsterCard(m){
  const now=Date.now();
  const sleep=save.sleep[m.id];

  let statusText="Todo bien";
  if(sleep&&sleep.sleeping&&now<sleep.until){
    statusText="Durmiendo";
  }else if(sleep&&sleep.bonusUntil&&now<sleep.bonusUntil){
    statusText="Bono +25%";
  }

  return `
    <article class="monster-panel">
      <div class="monster-panel-top">
        <span class="monster-level-badge">Nv.${getMonsterLevel(m.id)}</span>
        <span class="monster-rarity ${m.rarity.toLowerCase().replace(/ /g,"-")}">${m.rarity}</span>
      </div>

      <div class="monster-art ${m.theme}">
        ${m.art}
      </div>

      <div class="monster-name-row">
        <h3>${m.name}</h3>
        <span class="mini-emoji">😊</span>
      </div>

      <div class="monster-meta-row">
        <span class="monster-type-badge">${m.kind}</span>
        <span class="monster-power-badge">⚡ +${(m.rate/1000).toFixed(1)}K/h</span>
      </div>

      <div class="monster-status">${statusText}</div>

      <div class="monster-actions">
        <button class="care-btn" onclick="openCareMenu('${m.id}','comer')">COMER</button>
        <button class="care-btn" onclick="openCareMenu('${m.id}','banar')">BAÑAR</button>
        <button class="care-btn" onclick="openCareMenu('${m.id}','dormir')">DORMIR</button>
      </div>
    </article>
  `;
}
