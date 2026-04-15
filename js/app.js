/* =========================
   INIT (safety)
========================= */

// kör när sidan laddas
window.addEventListener("load", () => {
  if(typeof updateCart === "function"){
    updateCart();
  }
});