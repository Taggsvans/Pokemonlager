let cart = loadCart();

/* =========================
   SAVE / LOAD
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

/* =========================
   STOCK HELPERS
========================= */
function getAvailableStock(product){
  return (product.stock || 0) - (product.reserved || 0);
}

/* =========================
   CART TOGGLE
========================= */
function toggleCart(){
  const cartEl = document.getElementById("cart");
  const overlay = document.getElementById("cartOverlay");

  if(!cartEl || !overlay) return;

  cartEl.classList.toggle("open");
  overlay.classList.toggle("show");
}

/* =========================
   ADD TO CART
========================= */
function addToCart(key){

  const product = cards[key];
  if(!product) return;

  const item = cart.find(i => i.key === key);
  const currentQty = item ? item.qty : 0;

  const available = getAvailableStock(product);

  if(available <= 0){
    alert("Hoppsan, det verkar som att någon köpte varan innan dig.");
    return;
  }

  if(currentQty >= available){
    alert(`Endast ${available} kvar i lager`);
    return;
  }

  const expiresAt = Date.now() + 15 * 60 * 1000;

  if(item){
    item.qty++;
    item.expiresAt = expiresAt;
  } else {
    cart.push({
      key,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
      expiresAt
    });
  }

  // reservera i databasen
  db.ref(`cards/${key}/reserved`).transaction(v => (v || 0) + 1);

  saveCart();
  updateCart();
}

/* =========================
   FORMAT TIMER
========================= */
function formatTime(ms){
  const sec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2,"0")}`;
}

/* =========================
   UPDATE CART
========================= */
function updateCart(){
  const box = document.getElementById("cartItems");
  if(!box) return;

  box.innerHTML = "";
  let subtotal = 0;

  cart.forEach((i,index)=>{
    subtotal += i.price * i.qty;

    const remainingTime = i.expiresAt ? i.expiresAt - Date.now() : 0;

    box.innerHTML += `
      <div class="cart-item">
        ${i.image ? `<img src="${i.image}">` : ""}

        <div>
          <b>${i.name}</b>
          <div>${i.price} kr</div>

          <div class="qty-controls">
            <button onclick="decreaseQty(${index})">-</button>
            <span>${i.qty}</span>
            <button onclick="increaseQty(${index})">+</button>
            <button onclick="removeFromCart(${index})">🗑</button>
          </div>

          <div style="font-size:12px; opacity:0.7; margin-top:4px;">
            ⏳ ${formatTime(remainingTime)}
          </div>
        </div>
      </div>
    `;
  });

  /* =========================
     SHIPPING LOGIC (🔥 tillbaka)
  ========================= */
  const shipping = subtotal < 1500 && subtotal > 0 ? 55 : 0;
  const total = subtotal + shipping;

  const remaining = subtotal < 1500 ? (1500 - subtotal) : 0;

  let shippingInfo = "";

  if(subtotal === 0){
    shippingInfo = "";
  }
  else if(subtotal < 1500){
    shippingInfo = `
      <div style="margin-top:10px; font-size:12px; color:#6b7280;">
        Handla för <b>${remaining} kr</b> till för fri frakt!
      </div>
    `;
  }
  else{
    shippingInfo = `
      <div style="margin-top:10px; font-size:12px; color:#16a34a;">
        🎉 Du har fri frakt!
      </div>
    `;
  }

  const summary = `
    <hr>
    <div>Subtotal: <b>${subtotal} kr</b></div>
    <div>Frakt: <b>${shipping} kr</b></div>
    <div><b>Total: ${total} kr</b></div>
  `;

  document.getElementById("total").innerHTML = shippingInfo + summary;

  document.getElementById("cartCount").innerText =
    cart.reduce((s,i)=>s+i.qty,0);
}

/* =========================
   INCREASE
========================= */
function increaseQty(index){

  const item = cart[index];
  const product = cards[item.key];

  const available = getAvailableStock(product);

  if(item.qty >= available){
    alert("Finns inte fler i lager");
    return;
  }

  item.qty++;
  item.expiresAt = Date.now() + 15 * 60 * 1000;

  db.ref(`cards/${item.key}/reserved`).transaction(v => (v || 0) + 1);

  saveCart();
  updateCart();
}

/* =========================
   DECREASE
========================= */
function decreaseQty(index){

  const item = cart[index];

  item.qty--;

  db.ref(`cards/${item.key}/reserved`).transaction(v => (v || 1) - 1);

  if(item.qty <= 0){
    cart.splice(index,1);
  }

  saveCart();
  updateCart();
}

/* =========================
   REMOVE
========================= */
function removeFromCart(index){

  const item = cart[index];

  db.ref(`cards/${item.key}/reserved`).transaction(v => (v || 1) - item.qty);

  cart.splice(index,1);

  saveCart();
  updateCart();
}

/* =========================
   CLEAR
========================= */
function clearCart(){

  if(!confirm("Töm kundvagn?")) return;

  cart.forEach(i=>{
    db.ref(`cards/${i.key}/reserved`).transaction(v => (v || 1) - i.qty);
  });

  cart = [];
  saveCart();
  updateCart();
}

/* =========================
   AUTO EXPIRE
========================= */
function removeExpiredItems(){

  const now = Date.now();

  cart = cart.filter(item => {

    if(!item.expiresAt) return true;

    if(item.expiresAt > now) return true;

    // släpp reservation
    db.ref(`cards/${item.key}/reserved`).transaction(v => (v || 1) - item.qty);

    return false;
  });

  saveCart();
  updateCart();
}

/* =========================
   AUTO TIMERS
========================= */

// uppdatera UI varje sekund (timer)
setInterval(()=>{
  updateCart();
}, 1000);

// rensa expired varor
setInterval(removeExpiredItems, 5000);
