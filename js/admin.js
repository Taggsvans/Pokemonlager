let currentImage = "";

function login(){
  const pass = document.getElementById("pass")?.value;

  if(pass === "admin123"){
    localStorage.setItem("isAdmin", "true");
    openAdmin();
  } else {
    alert("Fel lösenord");
  }
}

function openAdmin(){
  document.getElementById("loginBox").style.display="none";
  document.getElementById("adminPanel").style.display="block";

  loadOrders();
  showTab("add");
  renderAdminCards();
}

function logout(){
  localStorage.removeItem("isAdmin");
  location.reload();
}

document.addEventListener("DOMContentLoaded", ()=>{
  if(localStorage.getItem("isAdmin") === "true"){
    openAdmin();
  }

  /* 🔥 FIX: SÖK LYSSNARE */
  const input = document.getElementById("adminSearch");
  if(input){
    input.addEventListener("input", renderAdminCards);
  }
});

function showTab(tab){
  document.querySelectorAll(".tab").forEach(t=>t.style.display="none");
  document.getElementById("tab-"+tab).style.display="block";

  if(tab === "manage"){
    renderAdminCards();
  }
}

/* =========================
   ADD CARD (MED STOCK)
========================= */
function addCard(){
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const description = document.getElementById("description").value;
  const stock = parseInt(document.getElementById("stock").value) || 0;
  const file = document.getElementById("imageInput").files[0];

  if(!name || !price){
    alert("Fyll i namn och pris");
    return;
  }

  const categories = [];

  if(document.getElementById("catPokemon").checked) categories.push("pokemon");
  if(document.getElementById("catOnePiece").checked) categories.push("onepiece");
  if(document.getElementById("catBooster").checked) categories.push("booster");
  if(document.getElementById("catSingel").checked) categories.push("singel");

  const id = db.ref("cards").push().key;

  if(file){
    const reader = new FileReader();
    reader.onload = e=>{
      db.ref("cards/" + id).set({
        name,
        price: Number(price),
        stock,
        categories,
        image: e.target.result
      });
    };
    reader.readAsDataURL(file);
  } else {
    db.ref("cards/" + id).set({
      name,
      price: Number(price),
      stock,
      categories
    });
  }

  alert("Kort tillagt!");

  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("stock").value = "";
  document.getElementById("imageInput").value = "";

  document.getElementById("catPokemon").checked = false;
  document.getElementById("catOnePiece").checked = false;
  document.getElementById("catBooster").checked = false;
  document.getElementById("catSingel").checked = false;
}

/* IMAGE */
document.addEventListener("change", e=>{
  if(e.target.id === "imageInput"){
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = ev => currentImage = ev.target.result;
    reader.readAsDataURL(file);
  }
});

/* =========================
   ADMIN RENDER (FIXAD SÖK)
========================= */
function renderAdminCards(){
  const box = document.getElementById("adminCards");
  if(!box) return;

  const search = document.getElementById("adminSearch")?.value.toLowerCase() || "";

  box.innerHTML = "";

  Object.keys(cards || {}).forEach(key=>{
    const c = cards[key];
    if(!c?.name) return;

    /* 🔥 FIX: SÖK I NAMN + KATEGORI */
    const categoryText = (c.categories || []).join(" ").toLowerCase();

    if(
      !c.name.toLowerCase().includes(search) &&
      !categoryText.includes(search)
    ) return;

    const categories = c.categories || [];

    box.innerHTML += `
      <div class="admin-card">

        ${c.image ? `<img src="${c.image}" class="admin-thumb" onclick="openImage('${c.image}')">` : ""}

        <div class="admin-fields">
          <input value="${c.name}" onchange="editCard('${key}','name',this.value)">
          <input type="number" value="${c.price}" onchange="editCard('${key}','price',this.value)">
          <input type="number" value="${c.stock || 0}" onchange="editCard('${key}','stock',this.value)">
          <input value="${c.description || ""}" onchange="editCard('${key}','description',this.value)">
        </div>

        <div class="admin-categories">

          <label>
            <input type="checkbox"
              ${categories.includes("pokemon") ? "checked" : ""}
              onchange="toggleCategory('${key}','pokemon',this.checked)">
            Pokémon
          </label>

          <label>
            <input type="checkbox"
              ${categories.includes("onepiece") ? "checked" : ""}
              onchange="toggleCategory('${key}','onepiece',this.checked)">
            One Piece
          </label>

          <label>
            <input type="checkbox"
              ${categories.includes("booster") ? "checked" : ""}
              onchange="toggleCategory('${key}','booster',this.checked)">
            Booster
          </label>

          <label>
            <input type="checkbox"
              ${categories.includes("singel") ? "checked" : ""}
              onchange="toggleCategory('${key}','singel',this.checked)">
            Singel
          </label>

        </div>

        <button class="delete-btn" onclick="deleteCard('${key}')">🗑</button>

      </div>
    `;
  });
}

function editCard(key, field, value){
  if(field === "price" || field === "stock"){
    value = parseFloat(value) || 0;
  }

  cards[key][field] = value;
  db.ref("cards").set(cards);
}

function deleteCard(key){
  if(confirm("Ta bort kort?")){
    delete cards[key];

    db.ref("cards").set(cards).then(()=>{
      renderAdminCards();
    });
  }
}

function toggleCategory(key, category, checked){
  const card = cards[key];
  if(!card) return;

  if(!card.categories) card.categories = [];

  if(checked){
    if(!card.categories.includes(category)){
      card.categories.push(category);
    }
  } else {
    card.categories = card.categories.filter(c => c !== category);
  }

  db.ref("cards").set(cards);
}