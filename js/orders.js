function loadOrders(){
  db.ref("orders").on("value", snap=>{
    orders = snap.val() || {};
    renderOrders();
  });
}

function renderOrders(){
  const box = document.getElementById("orders");
  if(!box) return;

  box.innerHTML="";

  Object.keys(orders).forEach(id=>{
    const o = orders[id];
    if(!o) return;

    const c = o.customer || {};
    const addr = c.address || {};

    box.innerHTML += `
      <div class="order-card">
        <label>
          <input type="checkbox" class="orderCheck" value="${id}">
        </label>

        <h3>${o.id}</h3>

        <b>${c.name || ""}</b><br>
        ${c.email || ""}<br>
        ${c.phone || ""}<br>
        ${addr.line1 || ""}<br>
        ${addr.postal_code || ""} ${addr.city || ""}<br>
        ${addr.country || ""}

        <hr>
        <b>Total: ${o.total} kr</b>
      </div>
    `;
  });
}

/* EXPORT */
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
      generateReceiptPDF(order);   // 🔥 PDF istället
      db.ref("orders/"+id).remove();
    }
  });

  alert("Markerade som skickade + kvitto genererat");
}

/* PDF Generator */

function generateReceiptPDF(order){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

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

  // ================= HEADER =================
  center("EKEM CARDS", 18);
  center("KVITTO / ORDER", 12);
  center("Order ID: " + order.id, 10);

  line();

  // ================= CUSTOMER =================
  const c = order.customer || {};

  center("KUNDINFORMATION", 12);

  center("Namn: " + (c.name || "-"));
  center("Email: " + (c.email || "-"));
  center("Telefon: " + (c.phone || "-"));
  center("Adress: " + (c.address || "-"));
  center("Postnummer: " + (c.zip || "-"));
  center("Ort: " + (c.city || "-"));
  center("Land: " + (c.country || "-"));

  line();

  // ================= ITEMS =================
  center("PRODUKTER", 12);

  let total = 0;

  (order.items || []).forEach(item => {
    const qty = item.qty || 1;
    const price = item.price || 0;

    const lineText = `${item.name} x${qty} = ${price * qty} kr`;

    center(lineText, 10);

    total += price * qty;
  });

  line();

  // ================= TOTAL =================
  center("SUBTOTAL: " + (order.subtotal || order.total) + " kr", 10);
  center("FRAKT: " + (order.shipping || 0) + " kr", 10);
  center("TOTAL: " + order.total + " kr", 14);
  center("Tack för ditt köp!", 11);

  doc.save(`kvitto-${order.id}.pdf`);
}