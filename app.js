let cards = {};
let cart = loadCart();
let currentImage = "";
let orders = {};

/* =========================
   FIREBASE
========================= */
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "pokemonlager-64d21.firebaseapp.com",
  databaseURL: "https://pokemonlager-64d21-default-rtdb.europe-west1.firebasedatabase.app",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* =========================
   CART SYSTEM
========================= */
function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart(){
  try{
    return JSON.parse(localStorage.getItem("cart")) || [];
  }catch{
    return [];
  }
}

function toggleCart(){
  document.getElementById("cart")?.classList.toggle("open");
  document.getElementById("cartOverlay")?.classList.toggle("show");
}

function addToCart(key){
  const existing = cart.find(i => i.id === key);

  if(existing){
    existing.qty++;
  } else {
    cart.push({
      id: key,
      name: cards[key].name,
      price: cards[key].price,
      image: cards[key].image,
      qty: 1
    });
  }

  saveCart();
  updateCart();
}

function updateCart(){
  const box = document.getElementById("cartItems");
  if(!box) return;

  box.innerHTML = "";
  let total = 0;

  cart.forEach((i,index)=>{
    total += i.price * i.qty;

    box.innerHTML += `
      <div class="cart-item">

        ${i.image ? `<img src="${i.image}">` : ""}

        <div class="cart-info">
          <b>${i.name}</b>
          <div>${i.price} kr</div>

          <div class="qty-controls">
            <button onclick="decreaseQty(${index})">➖</button>
            <span>${i.qty}</span>
            <button onclick="increaseQty(${index})">➕</button>
          </div>
        </div>

        <button class="remove-btn" onclick="removeFromCart(${index})">✖</button>

      </div>
    `;
  });

  document.getElementById("total").innerText = "Total: " + total + " kr";
  document.getElementById("cartCount").innerText = cart.reduce((s,i)=>s+i.qty,0);
}

function increaseQty(index){
  cart[index].qty++;
  saveCart();
  updateCart();
}

function decreaseQty(index){
  cart[index].qty--;

  if(cart[index].qty <= 0){
    cart.splice(index,1);
  }

  saveCart();
  updateCart();
}

function removeFromCart(index){
  cart.splice(index,1);
  saveCart();
  updateCart();
}

function clearCart(){
  if(confirm("Töm kundvagnen?")){
    cart = [];
    saveCart();
    updateCart();
  }
}
/* =========================
   LOAD CARDS
========================= */
db.ref("cards").on("value", snap=>{
  cards = snap.val() || {};
  render();
  renderAdminCards();
});

/* =========================
   SHOP RENDER
========================= */
function render(){
  const grid = document.getElementById("grid");
  if(!grid) return;

  const s = (document.getElementById("search")?.value || "").toLowerCase();
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

const searchInput = document.getElementById("search");

if(searchInput){
  searchInput.addEventListener("input", render);
}

/* =========================
   ADMIN LOGIN + TABS
========================= */
function login(){
  if(document.getElementById("pass")?.value === "admin123"){
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    loadOrders();
    showTab("add");
  }
}

function showTab(tab){
  document.querySelectorAll(".tab").forEach(t=>t.style.display="none");
  document.getElementById("tab-"+tab).style.display="block";
}

/* =========================
   ADD CARD
========================= */
function addCard(){
  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value) || 0;

  if(!name) return alert("Skriv namn!");

  const id = Date.now();

  cards[id] = {
    name,
    price,
    image: currentImage || ""
  };

  db.ref("cards").set(cards);

  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("imageInput").value = "";
  currentImage = "";
}

/* IMAGE UPLOAD */
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
   ADMIN MANAGE (EDIT/DELETE)
========================= */
function renderAdminCards(){
  const box = document.getElementById("adminCards");
  if(!box) return;

  const s = (document.getElementById("adminSearch")?.value || "").toLowerCase();
  box.innerHTML = "";

  Object.keys(cards).forEach(key=>{
    const c = cards[key];
    if(!c?.name) return;
    if(!c.name.toLowerCase().includes(s)) return;

    box.innerHTML += `
      <div class="admin-card">

        <img src="${c.image || ''}" class="admin-thumb" onclick="openImage('${c.image}')">

        <div class="admin-fields">
          <input value="${c.name}" onchange="editCard('${key}','name',this.value)">
          <input type="number" value="${c.price}" onchange="editCard('${key}','price',this.value)">
        </div>

        <button class="delete-btn" onclick="deleteCard('${key}')">🗑</button>

      </div>
    `;
  });
}

function editCard(key, field, value){
  if(field === "price") value = parseFloat(value) || 0;
  cards[key][field] = value;
  db.ref("cards").set(cards);
}

function deleteCard(key){
  if(confirm("Ta bort kort?")){
    delete cards[key];
    db.ref("cards").set(cards);
  }
}

document.addEventListener("input", e=>{
  if(e.target.id === "adminSearch") renderAdminCards();
});

/* =========================
   ORDERS
========================= */
function loadOrders(){
  db.ref("orders").on("value", snap=>{
    orders = snap.val() || {};
    renderOrders();
  });
}

function renderOrders(){
  const box = document.getElementById("orders");
  if(!box) return;

  box.innerHTML = "";

  Object.keys(orders || {}).forEach(id=>{
    const o = orders[id];
    if(!o) return;

    const customer = o.customer || {name:"Okänd",email:"-",phone:"-"};

    let items = "";
    (o.items || []).forEach(i=>{
      items += `
        <div class="order-item">
          ${i?.image ? `<img src="${i.image}" onclick="openImage('${i.image}')">` : ""}
          <div class="order-item-info">
            <div>${i?.name || "?"}</div>
            <small>${i?.price || 0} kr</small>
          </div>
        </div>
      `;
    });

    box.innerHTML += `
      <div class="order-card">
        <label>
          <input type="checkbox" class="orderCheck" value="${id}">
        
        </label>

        <h3>${o.id || id}</h3>

        <b>Kund:</b><br>
        ${customer.name}<br>
        ${customer.email}<br>
        ${customer.phone}

        <hr>
        ${items}
        <hr>
        <b>Total: ${o.total || 0} kr</b>
      </div>
    `;
  });
}

/* =========================
   EXPORT + DELETE ORDERS
========================= */
function markAsShipped(){
  const checks = document.querySelectorAll(".orderCheck:checked");

  if(checks.length === 0){
    alert("Välj minst en order");
    return;
  }

  let exportData = [];

  checks.forEach(c=>{
    const id = c.value;
    const order = orders[id];

    if(order){
      exportData.push(order);
      db.ref("orders/" + id).remove();
    }
  });

  downloadJSON(exportData, "shipped-orders.json");
}

function downloadJSON(data, filename){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/* =========================
   CHECKOUT
========================= */
function checkout(){
  if(cart.length === 0){
    alert("Varukorgen är tom");
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach(i=>{
    total += i.price;
    html += `<div>${i.name} - ${i.price} kr</div>`;
  });

  document.getElementById("checkoutSummary").innerHTML =
    html + `<hr><b>Total: ${total} kr</b>`;

  document.getElementById("modal").style.display = "flex";
}

function confirmCheckout(){
  const name = document.getElementById("custName").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const phone = document.getElementById("custPhone").value.trim();

  if(!name || !email || !phone){
    alert("Fyll i alla fält");
    return;
  }

  const id = "ORD-" + Math.random().toString(36).substring(2,8).toUpperCase();

  const order = {
    id,
    customer:{name,email,phone},
    items:cart,
    total:cart.reduce((s,i)=>s+i.price,0)
  };

  db.ref("orders/"+id).set(order);

  cart = [];
  saveCart();
  updateCart();

  closeModal();
  toggleCart();

  alert("Order skapad: " + id);
}

function closeModal(){
  document.getElementById("modal").style.display = "none";
}

/* =========================
   IMAGE MODAL
========================= */
function openImage(src){
  document.getElementById("imgModalContent").src = src;
  document.getElementById("imgModal").style.display = "flex";
}

function closeImageModal(){
  document.getElementById("imgModal").style.display = "none";
}

/* INIT */
updateCart();