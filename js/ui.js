function openImage(src){
  document.getElementById("imgModalContent").src = src;
  document.getElementById("imgModal").style.display="flex";
}

function closeImageModal(){
  document.getElementById("imgModal").style.display="none";
}

/* =========================
   SHIPPING LOGIC
========================= */
function calculateShipping(total){
  return total < 1500 ? 55 : 0;
}

/* =========================
   CHECKOUT PREVIEW
========================= */
function checkout(){
  if(cart.length === 0){
    alert("Varukorgen är tom");
    return;
  }

  let html = "";
  let subtotal = 0;

  cart.forEach(i=>{
    subtotal += i.price * (i.qty || 1);
    html += `<div>${i.name} x${i.qty || 1} - ${i.price * (i.qty || 1)} kr</div>`;
  });

  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  html += `<hr>`;
  html += `<div>Subtotal: <b>${subtotal} kr</b></div>`;
  html += `<div>Frakt: <b>${shipping} kr</b></div>`;
  html += `<div><b>Totalt: ${total} kr</b></div>`;

  document.getElementById("checkoutSummary").innerHTML = html;
  document.getElementById("modal").style.display="flex";
}

/* =========================
   CONFIRM ORDER
========================= */
function confirmCheckout(){
  const name = document.getElementById("custName").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const phone = document.getElementById("custPhone").value.trim();

  const address = document.getElementById("custAddress").value.trim();
  const zip = document.getElementById("custZip").value.trim();
  const city = document.getElementById("custCity").value.trim();
  const country = document.getElementById("custCountry").value.trim();

  if(!name || !email || !phone || !address || !zip || !city){
    alert("Fyll i alla fält");
    return;
  }

  const subtotal = cart.reduce((s,i)=> s + (i.price * (i.qty || 1)), 0);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  const id = "ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const order = {
    id,
    customer: {
      name,
      email,
      phone,
      address,
      zip,
      city,
      country
    },
    items: cart.map(i => ({
      name: i.name,
      price: i.price,
      image: i.image,
      qty: i.qty || 1
    })),
    subtotal,
    shipping,
    total
  };

  db.ref("orders/" + id).set(order);

  cart = [];
  saveCart();
  updateCart();

  closeModal();
  toggleCart();

  alert("Order skapad: " + id);
}

/* =========================
   CLOSE MODAL
========================= */
function closeModal(){
  document.getElementById("modal").style.display="none";
}

/* =========================
   ZIP CLEAN
========================= */
document.addEventListener("input", e=>{
  if(e.target.id === "custZip"){
    e.target.value = e.target.value.replace(/\D/g,"");
  }
});

/* =========================
   THEME
========================= */
function toggleTheme(){
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function loadTheme(){
  const saved = localStorage.getItem("theme");

  if(saved === "dark"){
    document.body.classList.add("dark");
  }
}

document.addEventListener("DOMContentLoaded", loadTheme);