# Secuencia de Flujos Clave — Tico Talent

Documentación de los puntos importantes del sistema organizados como secuencias de pasos, para facilitar la comprensión del flujo completo entre módulos.

---

## 1. Autenticación y selección de rol

```
Usuario → login.html
  ↓
  Elige rol en la UI (Candidato / Empleador) o llega con ?rol= desde la Landing
  ↓
  login() en auth.js
    ├─ Intenta POST /auth/login contra DummyJSON (usuario emilys)
    │     Si OK → guarda token JWT, user, rol en localStorage
    │
    └─ Fallback: busca en DEMO_USERS (carlos / maria)
          Si OK → genera token local (btoa), guarda igual
  ↓
  requireAuth() verifica token en cada página protegida
  ↓
  getRole() determina qué módulos son visibles en el sidebar
  ↓
  initUserNav() renderiza el sidebar con los enlaces correctos por rol
```

**Datos clave en localStorage:**
- `token` — JWT o token local
- `user` — objeto JSON con id, username, firstName, lastName, email, rol
- `rol` — "solicitante" | "empleador" | "reclutador"
- `perfilExtendido` — datos adicionales del perfil (skills, experiencia, empresa)

---

## 2. Landing Page → Búsqueda → Vacantes

```
index.html (Landing)
  ↓
  Usuario escribe en el Hero Search (#heroSearchJob, #heroSearchLocation)
  ↓
  landing.js detecta Enter o clic en "Buscar empleos"
  ↓
  Redirige a: src/html/vacantes.html?q=<cargo>&location=<lugar>
  ↓
  vacantes.js lee params de URL en cargarVacantes()
  ↓
  GET https://dummyjson.com/products → adaptarVacante() en adapters.js
    Transforma: product.title → cargo, product.price → salario USD, product.brand → empresa, etc.
  ↓
  renderCards() muestra las tarjetas de vacantes
  ↓
  aplicarFiltros() filtra por modalidad / nivel / jornada en tiempo real
```

---

## 3. Postularse a una vacante (Candidato)

```
vacantes.html — usuario logueado como candidato (ej: maria, id=3)
  ↓
  Clic en botón "Postularme" de una tarjeta
  ↓
  postularseVacante(id, titulo) en vacantes.js
    ↓
    Verifica en getLocalApplications() si ya hay postulación con ese vacanteId + userId
    Si ya existe → mostrarToast("Ya te postulaste...") y detiene
    ↓
    POST https://dummyjson.com/posts/add   ← simula registro remoto
    ↓
    saveLocalApplication({ ...payload, vacanteId, userId, _local: true })
      → guarda en localStorage["tt_postulaciones_local"]
    ↓
    mostrarToast("¡Te postulaste a X! Revísalo en Mis Postulaciones.")
  ↓
postulaciones.html — usuario navega a "Mis Postulaciones"
  ↓
  cargarPostulaciones() en postulaciones.js
    ↓
    getLocalApplications() → obtiene postulaciones guardadas localmente
    GET https://dummyjson.com/posts → obtiene posts remotos
    Merge de ambas listas (local tiene prioridad por id único)
    Filtra por userId === usuario logueado (solo las del candidato actual)
    ↓
    adaptarPostulacion() → estado, paso (1-4), colores, empresa, match %
    ↓
    renderCards() → tarjetas con barra de progreso en 4 etapas
```

---

## 4. Pipeline del empleador (cambio de etapa)

```
postulaciones.html — usuario logueado como empleador (carlos)
  ↓
  cargarPostulaciones() carga TODAS las postulaciones (sin filtro por userId)
  ↓
  renderCards() — muestra botones "Cambiar Estado", "Editar", "Eliminar"
  ↓
  Clic en "Cambiar Estado" → abrirModalCambioEstado(id)
    ↓
    Modal con radio buttons de ESTADOS_PIPELINE:
      1. CV Recibido (paso 1)
      2. En Revisión Técnica (paso 2)
      3. Entrevista Agendada (paso 3)
      4. Oferta Final (paso 4)
    ↓
    PATCH https://dummyjson.com/posts/{id}   ← actualiza estado
    ↓
    Actualiza postulacionesAdaptadas[] en memoria (estado, paso, color)
    ↓
    renderCards() re-dibuja la barra de progreso con el nuevo paso
```

---

## 5. Eliminación con soporte Undo (papelera)

```
Cualquier módulo — usuario hace clic en "Eliminar" / "Retirar"
  ↓
  confirmar("¿Estás seguro?", callback) — muestra overlay de confirmación
  ↓
  Usuario confirma → eliminarXConfirmada(id)
    ↓
    DELETE https://dummyjson.com/posts/{id}   ← simula borrado remoto
    ↓
    saveDeletedRecord("posts", original) en localTrashStore.js
      → guarda copia en localStorage["tt_trash"]
    ↓
    Filtra el registro de postulacionesAdaptadas[]
    renderCards() actualiza la vista
    ↓
    addNotification({ tipo: "eliminacion", accion: { tipo: "deshacer-eliminacion" } })
      → crea notificación en notificationStore
    ↓
    mostrarToast("Eliminada. Puedes deshacerla desde Notificaciones.", "success", 5000)

  notificaciones.html — usuario hace clic en "Deshacer eliminación"
    ↓
    restoreDeletedRecord("posts", recordId) en localTrashStore.js
      → recupera el registro de localStorage["tt_trash"]
      → lo guarda de vuelta en localStorage["tt_postulaciones_local"]
    ↓
    Elimina la notificación de la lista
    renderLista() actualiza el centro de notificaciones
    mostrarToast("La eliminación fue deshecha correctamente.", "success")
```

---

## 6. Adaptadores — Cómo DummyJSON se convierte en datos de CR

```
DummyJSON responde en inglés con datos genéricos:
  product = { id, title, price, brand, category, description, stock, tags }

adapters.js → adaptarVacante(product, index):
  titulo     = pool de nombres de cargos tech CR ["Desarrollador Full Stack", ...]
  empresa    = empresas reales de CR ["Intel", "Amazon", "SoftServe", ...]
  salario    = "$X,XXX – $X,XXX USD" basado en product.price
  ubicacion  = zonas francas de CR ["Zona Franca América", "Lindora", ...]
  modalidad  = ciclo ["Remoto 100%", "Híbrido 3/2", "Presencial"]
  nivel      = basado en product.stock ["Junior", "Semi Senior", "Senior", "Lead"]
  match      = 88 + (index % 11) → porcentaje de afinidad visual
  skills     = arrays de tecnologías por categoría

adaptarCandidato(user, index):
  titulo     = ["Desarrollador React", "Data Engineer", "QA Automation", ...]
  pretension = "$X,XXX – $X,XXX USD"
  skills     = stacks técnicos por categoría
  ciudad     = ciudades de CR

adaptarEmpresa(cart, index):
  nombre     = ["Intel CR", "AWS Costa Rica", "BAC Digital Labs", ...]
  sector     = sectores industriales tech

adaptarPostulacion(post, index):
  titulo     = post.title o nombre generado
  estado     = ciclo de 4 etapas basado en post.id
  paso       = 1 | 2 | 3 | 4
  match      = porcentaje de afinidad

adaptarEntrevista(comment, index):
  fechaHora  = fecha generada según id (próximos 14 días)
  plataforma = ciclo ["Google Meet", "Microsoft Teams", "Presencial"]
  candidatoUsuario = nombre simulado de usuario
```

---

## 7. Centro de notificaciones

```
Cualquier módulo genera notificaciones vía addNotification() en notificationStore.js:
  → postulaciones eliminadas con opción undo
  → vacantes aplicadas (badge en sidebar)
  → cambios de estado del proceso

notificaciones.html + notificaciones.js:
  ↓
  getNotifications() lee localStorage["tt_notificaciones"]
  ↓
  Filtros estáticos en el HTML (#notifFiltros) conectados por event delegation
    → todas | vacante | postulacion | sistema | capacitacion
  ↓
  renderLista() dibuja las tarjetas con:
    - Punto de "no leído" (punto azul)
    - Botón "Marcar leída"
    - Botón "Deshacer eliminación" (solo si tiene accion.tipo === "deshacer-eliminacion")
    - Botón "Eliminar"
  ↓
  Botones globales:
    "Marcar todas como leídas" → markAllNotificationsRead()
    "Limpiar todas" → clearNotifications() (con confirm overlay)
  ↓
  actualizarBadge() mantiene el número en el sidebar sincronizado
```

---

## 8. TicoBot AI — Flujo del chatbot

```
Cualquier página interna (requiere auth)
  ↓
  chatbot.js inicializado vía initChatbot() desde ui.js
  ↓
  Botón flotante (bottom-right) abre/cierra el widget
  ↓
  Usuario escribe mensaje → handleSend()
    ↓
    Agrega mensaje del usuario al historial de conversación (array en memoria)
    Muestra indicador "Escribiendo..."
    ↓
    POST https://api.groq.com/openai/v1/chat/completions
      model: "llama-3.3-70b-versatile"
      messages: [systemPrompt, ...conversationHistory, userMessage]
      systemPrompt incluye: nombre del usuario, rol actual, contexto de CR
    ↓
    Respuesta del modelo → parseMarkdown() → HTML limpio
    Agrega respuesta al historial
    renderMessages() actualiza el chat
  ↓
  Sugerencias rápidas pre-cargadas:
    "Vacantes disponibles" | "Salarios en CR" | "Tips de entrevista" | "Guía de la web"
```

---

## 9. Perfil y generador de CV

```
perfil.html + perfil.js
  ↓
  getPerfilExtendido() desde auth.js:
    → Lee localStorage["perfilExtendido"]
    → Merge con getDefaultPerfil() según rol y username
    → maria tiene perfil de candidata Full Stack precargado
    → carlos tiene perfil de reclutador Intel precargado
  ↓
  Candidato ve: nombre, titular, skills (chips), pretensión salarial, LinkedIn, GitHub, experiencia laboral
  Empleador ve: empresa, razón social, cédula jurídica, sector, beneficios, experiencia del reclutador
  ↓
  "Crear CV Gratis" (landing) → modal con 3 plantillas:
    - Moderno (sidebar violeta)
    - Ejecutivo (navy formal)
    - Minimalista (limpio)
  ↓
  Sin token → redirige a login con ?action=crearcv&template=X
  Con token → redirige a perfil.html?template=X
```

---

## Puntos de persistencia en localStorage

| Clave | Contenido | Módulo responsable |
|---|---|---|
| `token` | JWT o token local de sesión | auth.js |
| `user` | Objeto usuario con id, nombre, rol | auth.js |
| `rol` | String del rol activo | auth.js |
| `perfilExtendido` | Datos de perfil candidato o empresa | perfil.js / auth.js |
| `tt_postulaciones_local` | Array de postulaciones creadas localmente | applicationStore.js |
| `tt_notificaciones` | Array de notificaciones con estado de lectura | notificationStore.js |
| `tt_trash` | Array de registros eliminados (para undo) | localTrashStore.js |
| `tt_users` | Usuarios registrados vía formulario | auth.js |

---

*Tico Talent — FWD Costa Rica · Agosto 2026*
