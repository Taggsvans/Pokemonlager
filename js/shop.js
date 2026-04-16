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

    const name = c.name.toLowerCase();
    const category = (c.category || "").toLowerCase();

    /* 🔍 SMART SEARCH */
    const matchesSearch =
      name.includes(search) ||
      category.includes(search) ||

      // 🔥 synonymer
      (search.includes("pokemon") && category === "pokemon") ||
      (search.includes("poke") && category === "pokemon") ||

      (search.includes("one piece") && category === "onepiece") ||
      (search.includes("op") && category === "onepiece") ||

      (search.includes("booster") && category === "booster") ||
      (search.includes("pack") && category === "booster");

    if(!matchesSearch) return;

    /* 📂 MENY FILTER */
    if(activeCategory !== "all" && c.category !== activeCategory) return;

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
/* SEARCH */
document.addEventListener("DOMContentLoaded", ()=>{
  const searchInput = document.getElementById("search");

  if(searchInput){
    searchInput.addEventListener("input", render);
  }
});
