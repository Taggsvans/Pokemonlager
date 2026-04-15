let cart = loadCart();

/* SAVE / LOAD */
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

/* TOGGLE */
function toggleCart(){
  document.getElementById("cart")?.classList.toggle("open");
  document.getElementById("cartOverlay")?.classList.toggle("show");
}

/* ADD */
function addToCart(key){
  const existing = cart.find(i => i.id === key);

  if(existing){
    existing.qty++;
  } else {
    cart.push({
      id:key,
      name:cards[key].name,
      price:cards[key].price,
      image:cards[key].image,
      qty:1
    });
  }

  saveCart();
  updateCart();
}

/* UPDATE */
function updateCart(){
  const box = document.getElementById("cartItems");
  if(!box) return;

  box.innerHTML="";
  let subtotal = 0;

  cart.forEach((i,index)=>{
    subtotal += i.price * (i.qty || 1);

    box.innerHTML += `
      <div class="cart-item">
        ${i.image ? `<img src="${i.image}">` : ""}

        <div class="cart-info">
          <b>${i.name}</b>
          <div>${i.price} kr</div>

          <div class="qty-controls">
            <button onclick="decreaseQty(${index})">-</button>
            <span>${i.qty || 1}</span>
            <button onclick="increaseQty(${index})">+</button>

            <!-- 🔥 FLYTTAD REMOVE KNAPP -->
            <button class="remove-btn-inline" onclick="removeFromCart(${index})">🗑</button>
          </div>
        </div>
      </div>
    `;
  });

  // =========================
  // SHIPPING LOGIC
  // =========================
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
    cart.reduce((s,i)=>s+(i.qty||1),0);
}

/* CONTROLS */
function increaseQty(i){ cart[i].qty++; saveCart(); updateCart(); }

function decreaseQty(i){
  cart[i].qty--;
  if(cart[i].qty<=0) cart.splice(i,1);
  saveCart(); updateCart();
}

function removeFromCart(i){
  cart.splice(i,1);
  saveCart(); updateCart();
}

function clearCart(){
  if(confirm("Töm kundvagnen?")){
    cart=[];
    saveCart();
    updateCart();
  }
}