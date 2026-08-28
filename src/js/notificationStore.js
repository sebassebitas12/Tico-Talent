// src/js/notificationStore.js
// Estado compartido de notificaciones de TicoTalent.
// No depende de la UI para evitar dependencias circulares.

const LS_KEY = "tt_notificaciones";

export const BASE_NOTIFICATIONS = [
  { id: 1, tipo: "vacante", titulo: "Nueva vacante compatible con tu perfil", detalle: "Intel Costa Rica busca un Desarrollador Full Stack Senior con experiencia en React y Node.js. Nivel de compatibilidad: 94%.", tiempo: "Hace 5 min", leida: false },
  { id: 2, tipo: "postulacion", titulo: "Tu postulación fue revisada por el reclutador", detalle: "Amazon CR actualizó el estado de tu postulación al puesto de Cloud Architect a Revisión Técnica.", tiempo: "Hace 23 min", leida: false },
  { id: 3, tipo: "capacitacion", titulo: "Nuevo recurso disponible: IA para RRHH", detalle: "El curso Inteligencia Artificial aplicada al Reclutamiento ya está disponible. 18 horas, totalmente gratuito.", tiempo: "Hace 1 hora", leida: false },
  { id: 4, tipo: "sistema", titulo: "Actualización de la plataforma TicoTalent", detalle: "Hemos mejorado los algoritmos de compatibilidad de vacantes para mostrar resultados más precisos.", tiempo: "Hace 2 horas", leida: false },
  { id: 5, tipo: "vacante", titulo: "5 nuevas vacantes en tu área de interés", detalle: "Se publicaron nuevas posiciones en Tecnología y Datos que coinciden con tu perfil profesional.", tiempo: "Hace 3 horas", leida: false },
  { id: 6, tipo: "postulacion", titulo: "Entrevista programada exitosamente", detalle: "Tienes una entrevista virtual. Revisa la agenda para consultar la fecha, hora y plataforma.", tiempo: "Hace 5 horas", leida: true },
  { id: 7, tipo: "capacitacion", titulo: "Recordatorio de capacitación", detalle: "Tu curso de Python para Ciencia de Datos inicia pronto. Revisa Desarrollo Profesional para más detalles.", tiempo: "Hace 6 horas", leida: true },
  { id: 8, tipo: "sistema", titulo: "Tu perfil está al 72% de completitud", detalle: "Agrega descripción profesional y habilidades técnicas para aumentar tu visibilidad ante reclutadores.", tiempo: "Ayer", leida: true }
];

function cloneBase() {
  return BASE_NOTIFICATIONS.map((item) => ({ ...item }));
}

export function getNotifications() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      const base = cloneBase();
      localStorage.setItem(LS_KEY, JSON.stringify(base));
      return base;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : cloneBase();
  } catch {
    return cloneBase();
  }
}

export function saveNotifications(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(Array.isArray(list) ? list : []));
}

export function addNotification(notification) {
  const list = getNotifications();
  const item = {
    id: notification.id ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tipo: notification.tipo || "sistema",
    titulo: notification.titulo || "Actualización de TicoTalent",
    detalle: notification.detalle || "",
    tiempo: notification.tiempo || "Ahora",
    leida: false,
    ...notification
  };
  saveNotifications([item, ...list]);
  return item;
}

export function markNotificationRead(id) {
  const list = getNotifications().map((item) =>
    String(item.id) === String(id) ? { ...item, leida: true } : item
  );
  saveNotifications(list);
  return list;
}

export function markAllNotificationsRead() {
  const list = getNotifications().map((item) => ({ ...item, leida: true }));
  saveNotifications(list);
  return list;
}

export function clearNotifications() {
  saveNotifications([]);
}

export function unreadNotificationCount() {
  return getNotifications().filter((item) => !item.leida).length;
}

export { LS_KEY as NOTIFICATION_STORAGE_KEY };
