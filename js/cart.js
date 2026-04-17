let cart = loadCart();

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

/* ADD TO CART MED STOCK */
function addToCart(key){
  const product = cards[key];
  if(!product) return;

  const existing = cart.find(i => i.id === key);
  const currentQty = existing ? existing.qty : 0;

  if((product.stock || 0) <= currentQty){
    alert("Hoppsan, det verkar som om någon hann före. Den här produkten är för tillfället slut :(");
    return;
  }

  if(existing){
    existing.qty++;
  } else {
    cart.push({
      id:key,
      name:product.name,
      price:product.price,
      image:product.image,
      qty:1
    });
  }

  saveCart();
  updateCart();
}

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
            <button class="remove-btn-inline" onclick="removeFromCart(${index})">🗑</button>
          </div>
        </div>
      </div>
    `;
  });

  document.getElementById("cartCount").innerText =
    cart.reduce((s,i)=>s+(i.qty||1),0);
}

/* MAX STOCK */
function increaseQty(i){
  const item = cart[i];
  const product = cards[item.id];

  if(product && item.qty >= (product.stock || 0)){
    alert("Finns inte fler i lager");
    return;
  }

  item.qty++;
  saveCart();
  updateCart();
}

function decreaseQty(i){
  cart[i].qty--;
  if(cart[i].qty<=0) cart.splice(i,1);
  saveCart();
  updateCart();
}

function removeFromCart(i){
  cart.splice(i,1);
  saveCart();
  updateCart();
}

function clearCart(){
  if(confirm("Töm kundvagnen?")){
    cart=[];
    saveCart();
    updateCart();
  }
}

function toggleCart(){
  document.getElementById("cart")?.classList.toggle("open");
  document.getElementById("cartOverlay")?.classList.toggle("show");
}
