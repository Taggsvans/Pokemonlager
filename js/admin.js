/* =========================
   GLOBAL
========================= */
let currentImage = "";

/* =========================
   LOGIN
========================= */
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

  renderAdminCards(); // 🔥 viktigt
}

function logout(){
  localStorage.removeItem("isAdmin");
  location.reload();
}

/* AUTO LOGIN */
document.addEventListener("DOMContentLoaded", ()=>{
  if(localStorage.getItem("isAdmin") === "true"){
    openAdmin();
  }
});

/* =========================
   TABS
========================= */
function showTab(tab){
  document.querySelectorAll(".tab").forEach(t=>t.style.display="none");
  document.getElementById("tab-"+tab).style.display="block";

  if(tab === "manage"){
    renderAdminCards(); // 🔥 viktigt
  }
}

/* =========================
   ADD CARD
========================= */
function addCard(){
  const nameInput = document.getElementById("name");
  const priceInput = document.getElementById("price");

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value) || 0;

  if(!name) return alert("Skriv namn!");

  const id = Date.now();

  cards[id] = {
    name,
    price,
    image: currentImage || ""
  };

  db.ref("cards").set(cards);

  // reset
  nameInput.value = "";
  priceInput.value = "";
  document.getElementById("imageInput").value = "";
  currentImage = "";
}

/* =========================
   IMAGE UPLOAD
========================= */
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
   RENDER ADMIN CARDS
========================= */
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
        </div>

        <button class="delete-btn" onclick="deleteCard('${key}')">🗑</button>

      </div>
    `;
  });
}

/* =========================
   EDIT / DELETE
========================= */
function editCard(key, field, value){
  if(field === "price"){
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

/* =========================
   SEARCH ADMIN
========================= */
document.addEventListener("input", e=>{
  if(e.target.id === "adminSearch"){
    renderAdminCards();
  }
});