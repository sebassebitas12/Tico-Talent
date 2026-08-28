// src/js/localTrashStore.js
// Ocultamiento local de registros eliminados y soporte para Deshacer.
// DummyJSON simula DELETE, por lo que esta capa mantiene la UX consistente
// aunque el backend de demostración vuelva a entregar el registro en un GET.

const LS_KEY = "tt_deleted_records";

function readAll() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function getDeletedIds(entity) {
  const all = readAll();
  return Array.isArray(all[entity]) ? all[entity].map((item) => String(item.id)) : [];
}

export function isDeleted(entity, id) {
  return getDeletedIds(entity).includes(String(id));
}

export function saveDeletedRecord(entity, record) {
  const all = readAll();
  const current = Array.isArray(all[entity]) ? all[entity] : [];
  const clean = current.filter((item) => String(item.id) !== String(record.id));
  clean.push({ id: record.id, record, deletedAt: Date.now() });
  all[entity] = clean;
  writeAll(all);
}

export function getDeletedRecord(entity, id) {
  const all = readAll();
  return (all[entity] || []).find((item) => String(item.id) === String(id)) || null;
}

export function restoreDeletedRecord(entity, id) {
  const all = readAll();
  const current = Array.isArray(all[entity]) ? all[entity] : [];
  const found = current.find((item) => String(item.id) === String(id));
  if (!found) return null;

  all[entity] = current.filter((item) => String(item.id) !== String(id));
  writeAll(all);
  return found.record || null;
}

export function forgetDeletedRecord(entity, id) {
  const all = readAll();
  const current = Array.isArray(all[entity]) ? all[entity] : [];
  all[entity] = current.filter((item) => String(item.id) !== String(id));
  writeAll(all);
}
