import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtb3DLnCKrvNyZ9L7T5UJ2OxknebLUJ_8",
  authDomain: "fresh-d0524.firebaseapp.com",
  databaseURL: "https://fresh-d0524-default-rtdb.firebaseio.com",
  projectId: "fresh-d0524"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function updateProduct() {
  const id = document.getElementById("id").value;
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;

  set(ref(db, 'products/' + id), {
    name: name,
    price: price
  });

  alert("Updated in Firebase!");
}

window.updateProduct = updateProduct;
