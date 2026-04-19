db.ref("cards").on("value", snap=>{
  cards = snap.val() || {};
  render();
});

let activeCategory = "all";

function setCategory(cat){
  activeCategory = cat;
  render();

  if(typeof closeMenu === "function"){
    closeMenu(); // 🔥 stäng menyn automatiskt
  }
}

function render(){
  const grid = document.getElementById("grid");
  if(!grid) return;

  const search = (document.getElementById("search")?.value || "").toLowerCase();

  grid.innerHTML = "";

  Object.keys(cards).forEach(key => {
    const c = cards[key];
    if(!c?.name) return;

    // 🔍 search (inkl categories)
    const categoryText = (c.categories || []).join(" ").toLowerCase();

    if(
      !c.name.toLowerCase().includes(search) &&
      !categoryText.includes(search)
    ) return;

    // 📂 FILTER
    if(activeCategory !== "all"){
      if(!c.categories || !c.categories.includes(activeCategory)) return;
    }

  const isOut = (c.stock || 0) <= 0;

grid.innerHTML += `
  <div class="card ${isOut ? "out-of-stock" : ""}">

    ${isOut ? `<div class="sold-out-badge">SLUT</div>` : ""}

    ${c.image ? `<img src="${c.image}" onclick="openImage('${c.image}')">` : ""}

    <div class="card-body">
      <b>${c.name}</b>
      <div class="price">${c.price} kr</div>

      ${
        isOut
          ? ""
          : `<button onclick="openProduct('${key}')">Visa produkt</button>`
      }

    </div>
  </div>
`;
  });
}
/* SEARCH */
document.addEventListener("DOMContentLoaded", ()=>{
  const searchInput = document.getElementById("search");

  if(searchInput){
    searchInput.addEventListener("input", render);
  }
});
