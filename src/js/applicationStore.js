// src/js/applicationStore.js
// Persistencia local de postulaciones creadas desde Buscar empleo.
// Necesaria porque DummyJSON no persiste de forma estable los POST /add.

const LS_KEY = "tt_postulaciones_local";

function readAll() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function getLocalApplications() {
  return readAll();
}

export function saveLocalApplication(application) {
  const list = readAll();
  const clean = list.filter((item) => String(item.id) !== String(application.id));
  clean.unshift({
    ...application,
    _local: true,
    createdAt: application.createdAt || Date.now()
  });
  writeAll(clean);
  return clean[0];
}

export function removeLocalApplication(id) {
  const next = readAll().filter((item) => String(item.id) !== String(id));
  writeAll(next);
}

export function getApplicationsForUser(userId) {
  return readAll().filter((item) => Number(item.userId) === Number(userId));
}
