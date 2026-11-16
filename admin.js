
import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const ADMIN_UID = "LiiN7uuuEifMcyIqesVq7PNpBXk2";
const MAX_PLAYERS = 32;

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const dashboardMessage = document.getElementById("dashboardMessage");
const registrationsList = document.getElementById("registrationsList");

const approvedCount = document.getElementById("approvedCount");
const pendingCount = document.getElementById("pendingCount");
const rejectedCount = document.getElementById("rejectedCount");

let unsubscribeRegistrations = null;
let currentRegistrations = [];

function showMessage(element, text, type = "") {
  element.textContent = text;
  element.className = `form-message ${type}`;
}

function showLogin() {
  if (unsubscribeRegistrations) {
    unsubscribeRegistrations();
    unsubscribeRegistrations = null;
  }

  loginSection.hidden = false;
  dashboardSection.hidden = true;
}

function showDashboard() {
  loginSection.hidden = true;
  dashboardSection.hidden = false;
  startListeningToRegistrations();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const loginButton = document.getElementById("loginButton");

  loginButton.disabled = true;
  showMessage(loginMessage, "Verificando acceso...");

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);
      showMessage(loginMessage, "Esta cuenta no tiene permisos de administrador.", "error");
    }
  } catch (error) {
    console.error(error);
    showMessage(loginMessage, "No se pudo iniciar sesión. Revisá tus datos.", "error");
  } finally {
    loginButton.disabled = false;
  }
});

onAuthStateChanged(auth, (user) => {
  if (user && user.uid === ADMIN_UID) {
    showDashboard();
  } else {
    if (user) signOut(auth);
    showLogin();
  }
});

document.getElementById("logoutButton").addEventListener("click", async () => {
  await signOut(auth);
});

function startListeningToRegistrations() {
  if (unsubscribeRegistrations) return;

  const registrationsQuery = query(
    collection(db, "inscripciones"),
    orderBy("createdAt", "desc")
  );

  unsubscribeRegistrations = onSnapshot(
    registrationsQuery,
    (snapshot) => {
      currentRegistrations = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      renderDashboard();
    },
    (error) => {
      console.error("Error leyendo inscripciones:", error);
      showMessage(
        dashboardMessage,
        "No se pudieron cargar las solicitudes. Revisá las reglas de Firestore.",
        "error"
      );
    }
  );
}

function renderDashboard() {
  const approved = currentRegistrations.filter((item) => item.estado === "aprobada").length;
  const pending = currentRegistrations.filter((item) => item.estado === "pendiente").length;
  const rejected = currentRegistrations.filter((item) => item.estado === "rechazada").length;

  approvedCount.textContent = `${approved} / ${MAX_PLAYERS}`;
  pendingCount.textContent = pending;
  rejectedCount.textContent = rejected;

  registrationsList.replaceChildren();

  if (currentRegistrations.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Todavía no hay inscripciones.";
    registrationsList.appendChild(empty);
    return;
  }

  currentRegistrations.forEach((player) => {
    const card = document.createElement("article");
    card.className = "registration-item";

    const info = document.createElement("div");
    info.className = "registration-info";

    const nickname = document.createElement("h3");
    nickname.textContent = player.nickname || "Sin nickname";

    const country = document.createElement("p");
    country.textContent = `País: ${player.pais || "No indicado"}`;

    const phone = document.createElement("p");
    phone.textContent = `WhatsApp: ${player.whatsapp || "No indicado"}`;

    const status = document.createElement("span");
    status.className = `player-status status-${player.estado}`;
    status.textContent = player.estado || "Sin estado";

    info.append(nickname, country, phone, status);
    card.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "registration-actions";

    if (player.estado === "pendiente") {
      const approveButton = document.createElement("button");
      approveButton.type = "button";
      approveButton.textContent = "APROBAR";
      approveButton.className = "approve-button";
      approveButton.addEventListener("click", () => changeStatus(player.id, "aprobada"));

      const rejectButton = document.createElement("button");
      rejectButton.type = "button";
      rejectButton.textContent = "RECHAZAR";
      rejectButton.className = "reject-button";
      rejectButton.addEventListener("click", () => changeStatus(player.id, "rechazada"));

      actions.append(approveButton, rejectButton);
    } else {
      const restoreButton = document.createElement("button");
      restoreButton.type = "button";
      restoreButton.textContent = "VOLVER A PENDIENTE";
      restoreButton.className = "secondary-button";
      restoreButton.addEventListener("click", () => changeStatus(player.id, "pendiente"));

      actions.appendChild(restoreButton);
    }

    card.appendChild(actions);
    registrationsList.appendChild(card);
  });
}

async function changeStatus(playerId, newStatus) {
  if (!["aprobada", "rechazada", "pendiente"].includes(newStatus)) return;

  const player = currentRegistrations.find((item) => item.id === playerId);
  if (!player) return;

  if (player.estado === newStatus) return;

  if (newStatus === "aprobada") {
    const approved = currentRegistrations.filter(
      (item) => item.estado === "aprobada"
    ).length;

    if (approved >= MAX_PLAYERS) {
      showMessage(
        dashboardMessage,
        "Ya se alcanzó el límite de 32 participantes aprobados.",
        "error"
      );
      return;
    }
  }

  try {
    await updateDoc(doc(db, "inscripciones", playerId), {
      estado: newStatus
    });

    showMessage(
      dashboardMessage,
      `Estado actualizado: ${newStatus}.`,
      "success"
    );
  } catch (error) {
    console.error(error);
    showMessage(
      dashboardMessage,
      "No se pudo actualizar la inscripción.",
      "error"
    );
  }
}
