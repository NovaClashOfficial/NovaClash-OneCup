
import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const form = document.getElementById("registrationForm");
const message = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nickname = document.getElementById("nickname").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const pais = document.getElementById("pais").value.trim();
  const acceptRules = document.getElementById("acceptRules").checked;

  if (!acceptRules) {
    message.textContent = "Tenés que aceptar las reglas del torneo.";
    return;
  }

  if (nickname.length < 2 || nickname.length > 30) {
    message.textContent = "El nickname debe tener entre 2 y 30 caracteres.";
    return;
  }

  if (pais.length < 2 || pais.length > 50) {
    message.textContent = "Revisá el nombre del país.";
    return;
  }

  const cleanPhone = whatsapp.replace(/[^\d+]/g, "");

  if (cleanPhone.length < 8 || cleanPhone.length > 20) {
    message.textContent = "Ingresá un número de WhatsApp válido con código de país.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "ENVIANDO...";
  message.textContent = "";

  try {
    await addDoc(collection(db, "inscripciones"), {
      nickname,
      whatsapp: cleanPhone,
      pais,
      estado: "pendiente",
      createdAt: serverTimestamp()
    });

    message.textContent =
      "¡Inscripción enviada! Tu solicitud quedó pendiente de revisión.";
    message.className = "form-message success";

    form.reset();

  } catch (error) {
    console.error("Error al enviar inscripción:", error);

    message.textContent =
      "No se pudo enviar la inscripción. Intentá nuevamente más tarde.";
    message.className = "form-message error";

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "ENVIAR INSCRIPCIÓN";
  }
});
