// api.js
// Módulo genérico de acceso a datos (json-server).
// Pensado para servir a CUALQUIER entidad (empresas, candidatos, ofertas, etc.)
// sin tener que duplicar código por cada una.

const BASE_URL = "http://localhost:3000";

/**
 * Función interna que centraliza el manejo de errores y el parseo de JSON.
 * Todas las demás funciones pasan por acá.
 */
async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // DELETE normalmente no devuelve body
    if (options.method === "DELETE") {
      return true;
    }

    return await response.json();
  } catch (error) {
    console.error(`[api.js] Falló la petición a "${endpoint}":`, error.message);
    throw error; // se re-lanza para que cada módulo decida cómo mostrarlo en pantalla
  }
}

/**
 * Trae todos los registros de una entidad.
 * Uso: await getAll("empresas")
 */
export function getAll(entidad) {
  return request(entidad);
}

/**
 * Trae un solo registro por id.
 * Uso: await getById("empresas", "3")
 */
export function getById(entidad, id) {
  return request(`${entidad}/${id}`);
}

/**
 * Crea un nuevo registro.
 * Uso: await create("empresas", { nombre: "Acme", ... })
 */
export function create(entidad, data) {
  return request(entidad, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/**
 * Actualiza un registro existente (reemplazo completo).
 * Uso: await update("empresas", "3", { nombre: "Acme actualizado", ... })
 */
export function update(entidad, id, data) {
  return request(`${entidad}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/**
 * Actualiza solo algunos campos de un registro (parcial).
 * Uso: await patch("empresas", "3", { estado: "activo" })
 */
export function patch(entidad, id, data) {
  return request(`${entidad}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/**
 * Elimina un registro.
 * Uso: await remove("empresas", "3")
 */
export function remove(entidad, id) {
  return request(`${entidad}/${id}`, {
    method: "DELETE",
  });
}