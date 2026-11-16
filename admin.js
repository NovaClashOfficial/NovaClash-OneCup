
import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  message.textContent = "Verificando acceso...";

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Verificamos que sea TU cuenta administradora.
    if (result.user.uid !== "LiiN7uuuEifMcyIqesVq7PNpBXk2") {
      await signOut(auth);
      throw new Error("Esta cuenta no tiene permisos de administrador.");
    }

    message.textContent = "¡Acceso de administrador confirmado!";
    message.style.color = "#39d98a";

  } catch (error) {
    message.textContent = "Error: " + error.message;
    message.style.color = "#ff5555";
  }
});
