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
  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value) || 0;
  const stock = parseInt(document.getElementById("stock").value) || 0;

  if(!name) return alert("Skriv namn!");

  const id = Date.now();

  let category = "uncategorized";

  if(document.getElementById("catPokemon").checked) category = "pokemon";
  else if(document.getElementById("catOnePiece").checked) category = "onepiece";
  else if(document.getElementById("catBooster").checked) category = "booster";

  cards[id] = {
    name,
    price,
    image: currentImage || "",
    category,
    stock
  };

  db.ref("cards").set(cards);

  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("stock").value = "";
  document.getElementById("imageInput").value = "";

  document.getElementById("catPokemon").checked = false;
  document.getElementById("catOnePiece").checked = false;
  document.getElementById("catBooster").checked = false;

  currentImage = "";
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

/* ADMIN RENDER */
function renderAdminCards(){
  const box = document.getElementById("adminCards");
  if(!box) return;

  const search = document.getElementById("adminSearch")?.value.toLowerCase() || "";

  box.innerHTML = "";

  Object.keys(cards || {}).forEach(key=>{
    const c = cards[key];
    if(!c?.name) return;

    if(!c.name.toLowerCase().includes(search)) return;

    box.innerHTML += `
      <div class="admin-card">

        ${c.image ? `<img src="${c.image}" class="admin-thumb" onclick="openImage('${c.image}')">` : ""}

        <div class="admin-fields">
          <input value="${c.name}" onchange="editCard('${key}','name',this.value)">
          <input type="number" value="${c.price}" onchange="editCard('${key}','price',this.value)">
          <input type="number" value="${c.stock || 0}" onchange="editCard('${key}','stock',this.value)">
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
    db.ref("cards").set(cards);
  }
}