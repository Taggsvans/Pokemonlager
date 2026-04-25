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

  Object.keys(orders).forEach(id=>{
    const o = orders[id];
    if(!o) return;

    const c = o.customer || {};

    let itemsHTML = "";
    (o.items || []).forEach(item=>{
      itemsHTML += `
        <div class="order-item">
          <span>${item.name}</span>
          <span>x${item.qty}</span>
        </div>
      `;
    });

    box.innerHTML += `
      <div class="order-card">

        <div class="order-top">
          <input type="checkbox" class="orderCheck" value="${id}">
          <div class="order-id">${o.id}</div>
        </div>

        <div class="order-section">
          <h4>Kund</h4>
          <p><b>${c.name || "-"}</b></p>
          <p>${c.email || "-"}</p>
          <p>${c.phone || "-"}</p>
        </div>

        <div class="order-section">
          <h4>Adress</h4>
          <p>${c.address || "-"}</p>
          <p>${c.zip || ""} ${c.city || ""}</p>
          <p>${c.country || ""}</p>
        </div>

        <div class="order-section">
          <h4>Produkter</h4>
          ${itemsHTML || "<p>Inga produkter</p>"}
        </div>

        <div class="order-total">
          <div>Subtotal: ${o.subtotal || o.total} kr</div>
          <div>Frakt: ${o.shipping || 0} kr</div>
          <b>Total: ${o.total} kr</b>
        </div>

      </div>
    `;
  });
}

/* =========================
   MARK AS SHIPPED
========================= */
function markAsShipped(){
  const checks = document.querySelectorAll(".orderCheck:checked");

  if(checks.length === 0){
    alert("Välj minst en order");
    return;
  }

  checks.forEach(c=>{
    const id = c.value;
    const order = orders[id];

    if(order){
      generateReceiptPDF(order);
      db.ref("orders/"+id).remove();
    }
  });

  alert("Order skickad + kvitto sparat");
}

/* =========================
   PDF (FIXAD VERSION)
========================= */
function generateReceiptPDF(order){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 8;

  const center = (text, size = 11) => {
    doc.setFontSize(size);
    doc.text(text, pageWidth / 2, y, { align: "center" });
    y += 6;
  };

  const line = () => {
    y += 2;
    doc.line(20, y, pageWidth - 20, y);
    y += 6;
  };

  const c = order.customer || {};

  /* =========================
     LOGGA (FIXAD)
  ========================= */

  const img = new Image();
  img.src = "EkemCards.png"; // ⚠️ måste matcha exakt filnamn

  img.onload = () => {

    const imgWidth = 80;
    const imgHeight = 22;

    doc.addImage(
      img,
      "PNG",
      pageWidth/2 - imgWidth/2,
      y,
      imgWidth,
      imgHeight
    );

    y += imgHeight + 10;

    /* =========================
       HEADER
    ========================= */

    center("KVITTO", 12);
    center("Order ID: " + order.id, 10);

    const now = new Date();
    const formatted =
      now.toLocaleDateString("sv-SE") + " " +
      now.toLocaleTimeString("sv-SE", {hour:'2-digit', minute:'2-digit'});

    center(formatted, 10);

    line();

    /* =========================
       CUSTOMER
    ========================= */

    center("KUNDINFORMATION", 12);

    center("Namn: " + (c.name || "-"));
    center("Email: " + (c.email || "-"));
    center("Telefon: " + (c.phone || "-"));
    center("Adress: " + (c.address || "-"));
    center("Postnummer: " + (c.zip || "-"));
    center("Ort: " + (c.city || "-"));
    center("Land: " + (c.country || "-"));

    line();

    /* =========================
       ITEMS
    ========================= */

    center("PRODUKTER", 12);

    let total = 0;

    (order.items || []).forEach(item => {
      const qty = item.qty || 1;
      const price = item.price || 0;

      center(`${item.name} x${qty} = ${price * qty} kr`, 10);
      total += price * qty;
    });

    line();

    /* =========================
       TOTAL
    ========================= */

    center("SUBTOTAL: " + (order.subtotal || total) + " kr", 10);
    center("FRAKT: " + (order.shipping || 0) + " kr", 10);
    center("TOTAL: " + order.total + " kr", 14);

    y += 4;
    center("Tack för ditt köp!", 11);

    doc.save(`kvitto-${order.id}.pdf`);
  };

  /* ⚠️ OM bilden inte laddas */
  img.onerror = () => {
    console.error("Logga kunde inte laddas – PDF skapas utan bild");

    center("KVITTO", 12);
    center("Order ID: " + order.id, 10);
    doc.save(`kvitto-${order.id}.pdf`);
  };
}