const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "pokemonlager-64d21.firebaseapp.com",
  databaseURL: "https://pokemonlager-64d21-default-rtdb.europe-west1.firebasedatabase.app",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let cards = {};
let orders = {};