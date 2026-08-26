// src/js/dummyapi.js
// Módulo de consumo de DummyJSON con autenticación.
// Reemplaza/complementa api.js para las peticiones a DummyJSON.
// RF-05, RF-06, RF-07, RF-08

import { getToken, logout } from "./auth.js";

const BASE_URL = "https://dummyjson.com";

/**
 * Función central de fetch con token en el header Authorization.
 */
async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      ...options,
      headers,
    });

    // Si el token expiró, cerrar sesión automáticamente
    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    if (options.method === "DELETE") return true;

    return await response.json();
  } catch (error) {
    console.error(`[dummyapi.js] Falló "${endpoint}":`, error.message);
    throw error;
  }
}

// ── CRUD genérico ──────────────────────────────────────────────

/** GET /entidad — lista todos */
export const getAll = (entidad) => request(entidad);

/** GET /entidad/:id */
export const getById = (entidad, id) => request(`${entidad}/${id}`);

/** POST /entidad/add */
export const create = (entidad, data) =>
  request(`${entidad}/add`, {
    method: "POST",
    body: JSON.stringify(data),
  });

/** PUT /entidad/:id */
export const update = (entidad, id, data) =>
  request(`${entidad}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

/** PATCH /entidad/:id */
export const patch = (entidad, id, data) =>
  request(`${entidad}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

/** DELETE /entidad/:id */
export const remove = (entidad, id) =>
  request(`${entidad}/${id}`, { method: "DELETE" });