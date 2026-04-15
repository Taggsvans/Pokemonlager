db.ref("cards").on("value", snap=>{
  cards = snap.val() || {};
  render();
});

/* =========================
   RENDER SHOP
========================= */
function render(){
  const grid = document.getElementById("grid");
  if(!grid) return;

  const searchInput = document.getElementById("search");
  const s = searchInput ? searchInput.value.toLowerCase() : "";

  grid.innerHTML = "";

  Object.keys(cards).forEach(key=>{
    const c = cards[key];
    if(!c?.name) return;

    if(!c.name.toLowerCase().includes(s)) return;

    grid.innerHTML += `
      <div class="card">
        ${c.image ? `<img src="${c.image}" onclick="openImage('${c.image}')">` : ""}
        <div class="card-body">
          <b>${c.name}</b>
          <div class="price">${c.price} kr</div>
          <button onclick="addToCart('${key}')">🛒 Köp</button>
        </div>
      </div>
    `;
  });
}

/* LIVE SEARCH (viktig fix) */
document.addEventListener("input", e=>{
  if(e.target.id === "search"){
    render();
  }
});