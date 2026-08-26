// src/js/auth.js
// Manejo de autenticación contra DummyJSON /auth/login
// RF-01, RF-02, RF-03, RF-04

const BASE_URL = "https://dummyjson.com";

/**
 * Realiza el login contra DummyJSON.
 * Guarda el token y los datos del usuario en localStorage.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} datos del usuario
 */
export async function login(username, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, expiresInMins: 60 }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Credenciales incorrectas");
    }

    const data = await response.json();

    // Guardar token y datos de sesión
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify({
      id: data.id,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      image: data.image,
    }));

    return data;
  } catch (error) {
    console.error("[auth.js] Error en login:", error.message);
    throw error;
  }
}

/**
 * Elimina el token y redirige al login.
 * RF-04
 */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}

/**
 * Verifica si hay un token válido en localStorage.
 * RF-03
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

/**
 * Devuelve el token almacenado.
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem("token");
}

/**
 * Devuelve los datos del usuario almacenado.
 * @returns {object|null}
 */
export function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

/**
 * Protege una página: si no hay token, redirige al login.
 * Llamar al inicio de cada página protegida.
 * RF-03
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "/login.html";
  }
}