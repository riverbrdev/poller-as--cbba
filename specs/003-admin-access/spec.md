# Feature Specification: Acceso de administradores

**Feature Branch**: `003-admin-access`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "agregar una funcionalidad de registro de administrador que sería para los tres desarrolladores; lo que no tengo definido aún es si deben registrarse y otorgar [el rol] una vez que se registren o ya tener 3 cuentas registradas, ¿qué me recomiendas?"

## Decisión de enfoque

Se descartan las **cuentas de admin precreadas** (tres usuarios cargados de antemano con contraseña): obligan a generar, guardar y compartir contraseñas fuera de la app, quedan como cuentas "especiales" distintas a las del público y, si una contraseña se filtra, el atacante entra con todos los permisos.

Se adopta **"registrarse como cualquiera y recibir el rol por lista autorizada"**:

- Cada desarrollador se registra (o ya está registrado) igual que cualquier persona.
- La configuración del servidor guarda una **lista de correos autorizados** (los tres desarrolladores). No existe ningún formulario público de "registro de administrador".
- Al iniciar sesión, si el correo está en la lista **y fue verificado por Google**, la cuenta pasa a ser admin. Si el correo deja de estar en la lista, pierde el acceso de inmediato: el área de administración vuelve a comparar el correo con la lista en cada pedido.
- Las cuentas de correo y contraseña **nunca** reciben el rol por la lista, porque hoy la app no verifica que el correo sea de quien se registra: cualquiera podría registrarse con el correo de un desarrollador antes que él.

## Clarifications

### Session 2026-11-20

- Q: ¿Cómo llega un admin al área de administración? → A: **Sin botón** (revisado: ahora hay una entrada "Panel de administración" en el menú de la cuenta, visible solo para admins; ver FR-009). No hay un acceso en el menú ni en ninguna otra parte de la interfaz. Al iniciar sesión, el servidor comprueba si la cuenta es admin; si lo es, la app abre directamente la pantalla de administración. Un usuario normal sigue el flujo de siempre.
- Q: ¿Qué debe incluir la pantalla de administración en esta funcionalidad? → A: Solo el acceso: un saludo y un aviso de "próximamente". Las analíticas de votos van en una spec aparte (004). La moderación de comentarios va en otra (005) y combina una lista de palabras prohibidas con detección por IA.
- Q: ¿Las cuentas admin pueden votar y comentar en las pollerías como cualquier usuario? → A: Sí. El admin vota y comenta como cualquiera. La redirección a la pantalla de administración pasa solo al iniciar sesión; después puede navegar el sitio público con normalidad.
- Q: Cuando se quita un correo de la lista de admins, ¿pierde el acceso de inmediato o en su próximo inicio de sesión? → A: De inmediato. En cada pedido al área de administración, el servidor vuelve a comprobar el correo contra la lista. Si ya no está, rechaza el pedido y deja la cuenta como usuario normal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un desarrollador obtiene el rol de admin al ingresar con Google (Priority: P1)

Uno de los tres desarrolladores ingresa con su cuenta de Google. Su correo está en la lista autorizada, así que su cuenta queda como administrador sin pasos extra, sin contraseñas compartidas y sin tocar la base de datos a mano.

**Why this priority**: Sin esto no hay ningún admin, y todo lo que viene después (aprobar sugerencias, moderar comentarios) no se puede usar.

**Independent Test**: Poner un correo de Google de prueba en la lista, ingresar con esa cuenta y comprobar que la cuenta tiene rol admin y puede abrir el área de administración.

**Acceptance Scenarios**:

1. **Given** un correo de Google verificado que está en la lista autorizada y que nunca ingresó, **When** ingresa por primera vez, **Then** su cuenta se crea con rol admin (y sigue el flujo normal de elegir `@usuario`).
2. **Given** una cuenta de Google ya existente con rol usuario cuyo correo se agregó después a la lista, **When** vuelve a ingresar, **Then** su cuenta pasa a ser admin y conserva sus votos, comentarios y `@usuario`.
3. **Given** un correo de Google que no está en la lista, **When** ingresa, **Then** su cuenta es de usuario normal.
4. **Given** el correo de la lista escrito con otras mayúsculas o espacios alrededor, **When** ingresa esa cuenta, **Then** se reconoce igual como autorizada.

---

### User Story 2 - Al iniciar sesión, un admin entra directo a la pantalla de administración (Priority: P1)

El único acceso visible es la entrada "Panel de administración" del menú de la cuenta, y solo la ven los admins. Cuando alguien inicia sesión, el servidor comprueba su rol: si es admin, la app lo lleva directo a la pantalla de administración. Si no lo es, sigue el flujo normal. Además, cualquier persona que no sea admin es rechazada en el servidor aunque conozca la dirección.

**Why this priority**: Dar el rol no sirve si no hay un lugar protegido donde usarlo, y la constitución exige que la autorización se compruebe en el servidor, no solo ocultando botones.

**Independent Test**: Iniciar sesión con una cuenta admin y comprobar que la app abre sola la pantalla de administración. Iniciar sesión con una cuenta normal y comprobar que sigue el flujo de siempre. Abrir la dirección de administración a mano como visitante y como usuario normal, y comprobar que ambos son rechazados.

**Acceptance Scenarios**:

1. **Given** un admin que ya eligió su `@usuario`, **When** inicia sesión con Google, **Then** la app lo lleva directo a la pantalla de administración sin que tenga que tocar ningún botón.
2. **Given** un admin que ingresa por primera vez, **When** termina de elegir su `@usuario`, **Then** la app lo lleva directo a la pantalla de administración.
3. **Given** un usuario normal, **When** inicia sesión, **Then** sigue el flujo normal y nunca pasa por la pantalla de administración.
4. **Given** una persona que no es admin, **When** navega la app o abre el menú de su cuenta, **Then** no ve ningún botón ni enlace hacia el área de administración; un admin, en cambio, ve "Panel de administración" en el menú de su cuenta y con eso vuelve al panel.
5. **Given** un visitante sin sesión, **When** abre a mano la dirección de administración, **Then** se le pide iniciar sesión y no ve contenido de administración.
6. **Given** un usuario con sesión pero sin rol admin, **When** abre a mano la dirección de administración, **Then** ve "página no encontrada" y ningún dato de administración.
7. **Given** un admin en la pantalla de administración, **When** la ve, **Then** aparece un saludo con su `@usuario` y un aviso de que las herramientas (sugerencias, reportes, moderación) llegarán en próximas entregas.

---

### User Story 3 - Quitar el rol a un desarrollador que deja el proyecto (Priority: P2)

Si un desarrollador deja el proyecto, se saca su correo de la lista y pierde el rol de admin sin borrar su cuenta ni sus votos.

**Why this priority**: Es la forma de cerrar el acceso sin intervenciones manuales en la base; es menos urgente que dar el rol, pero tiene que existir desde el inicio para no dejar admins "huérfanos".

**Independent Test**: Con una cuenta admin, quitar su correo de la lista sin cerrar su sesión y comprobar que ya no abre el área de administración y que sus votos siguen ahí.

**Acceptance Scenarios**:

1. **Given** una cuenta admin con la sesión abierta cuyo correo se quitó de la lista, **When** hace su siguiente pedido al área de administración, sin cerrar sesión, **Then** el pedido es rechazado y su cuenta queda como usuario normal.
2. **Given** esa misma cuenta, **When** se revisan sus votos y comentarios, **Then** siguen igual que antes.

---

### Edge Cases

- **Cuenta de correo y contraseña con un correo de la lista**: nunca recibe el rol, aunque el correo coincida. Además, hoy no puede ingresar con Google usando ese correo, porque la app no une cuentas (SPEC §4, regla 2b). Ese desarrollador usa otra cuenta de Google que esté en la lista, o se borra a mano su cuenta de contraseña antes de ingresar con Google.
- **Lista vacía o sin configurar**: nadie es admin; la app funciona igual para el resto y el área de administración rechaza a todos.
- **Un correo de la lista que no está bien escrito** (sin `@`, vacío): se ignora ese elemento; los demás siguen valiendo.
- **Admin con la sesión ya abierta cuando se lo quita de la lista**: pierde el acceso en su siguiente pedido al área de administración, sin necesidad de cerrar su sesión. Las acciones de administración que se agreguen después deben usar la misma comprobación.
- **Corte urgente sin esperar el redeploy**: se cambia a mano `role` a `user` en la base. El área de administración exige el rol **y** el correo en la lista, así que lo rechaza en el siguiente pedido. La lista se corrige después; si no, ese correo vuelve a ser admin en su próximo ingreso con Google.
- **Admin navegando el sitio público**: puede abrir el ranking, calificar y comentar sin que la app lo devuelva a la pantalla de administración (FR-012).
- **Más de tres correos en la lista**: se permite; el número tres es del equipo actual, no un límite del sistema.
- **Admin que todavía no eligió `@usuario`**: debe elegirlo como cualquier cuenta nueva; al terminar, la app lo lleva a la pantalla de administración.
- **Admin que quiere volver a la pantalla de administración sin cerrar sesión**: abre el menú de su cuenta y toca "Panel de administración".
- **Admin que ingresó desde un enlace a otra página** (por ejemplo, una pollería): igual lo lleva a la pantalla de administración, porque ser admin tiene prioridad sobre la página de origen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La app NO DEBE ofrecer ninguna pantalla, formulario ni dirección pública para registrarse o pedir ser administrador.
- **FR-002**: La lista de correos autorizados DEBE vivir en la configuración del servidor (no en el código versionado) y documentarse como variable en el archivo de ejemplo de configuración.
- **FR-003**: Al iniciar sesión con Google, el sistema DEBE asignar rol admin si el correo, comparado sin distinguir mayúsculas ni espacios alrededor, está en la lista autorizada y Google lo informa como verificado.
- **FR-004**: Al iniciar sesión con Google, el sistema DEBE asignar rol usuario si el correo no está en la lista, aunque antes fuera admin.
- **FR-005**: Las cuentas que ingresan con correo y contraseña NO DEBEN recibir el rol admin por la lista, en ningún caso.
- **FR-006**: Cambiar el rol NO DEBE alterar el `@usuario`, los votos, los comentarios ni las marcas "Útil" de la cuenta.
- **FR-007**: El área de administración DEBE comprobar en el servidor, en cada pedido, que la sesión pertenece a una cuenta con rol admin **y** que su correo sigue en la lista autorizada en ese momento. Si el correo ya no está, DEBE rechazar el pedido y dejar la cuenta como usuario normal. Si no hay sesión, DEBE pedir iniciar sesión, y si la cuenta no es admin DEBE rechazar sin mostrar datos de administración.
- **FR-008**: El área de administración DEBE mostrar, en esta entrega, un saludo con el `@usuario` del admin y un aviso de que las herramientas llegan después. No incluye analíticas de votos, aprobar sugerencias, reportes ni moderación de comentarios.
- **FR-009**: La app DEBE mostrar una entrada "Panel de administración" en el menú de la cuenta **solo** cuando el servidor comprueba, en ese pedido, que la cuenta es admin (misma comprobación que FR-007). A nadie más le DEBE mostrar ningún botón, enlace ni entrada de menú hacia el área de administración. Al terminar el inicio de sesión (y, en una cuenta nueva, después de elegir el `@usuario`), el servidor DEBE comprobar el rol: si la cuenta es admin, DEBE llevarla a la pantalla de administración; si no, DEBE seguir el flujo normal. Esta redirección es comodidad; la protección es la de FR-007.
- **FR-010**: El área de administración NO DEBE indexarse en buscadores ni generar vista previa al compartirse.
- **FR-011**: El correo de un admin NO DEBE mostrarse públicamente en ningún lugar; públicamente solo se ve su `@usuario`, igual que cualquier persona.
- **FR-012**: Una cuenta admin DEBE poder votar, comentar y marcar "Útil" igual que un usuario normal, con las mismas reglas y límites. Sus votos cuentan en la nota pública como cualquier otro. La redirección de FR-009 ocurre solo al terminar el inicio de sesión, no al navegar el sitio público.
- **FR-013**: Para un usuario normal, la dirección de administración DEBE responder igual que una página que no existe (código HTTP 404 y la misma página "no encontrada"), para no revelar que hay un área oculta.

### Key Entities

- **Cuenta de usuario** (ya existe): se usa su rol (`user` | `admin`), que ya está en el modelo de datos. No se agregan campos nuevos.
- **Lista de correos autorizados**: dato de configuración del servidor, no una tabla. Es la única fuente de quién debe ser admin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los tres desarrolladores quedan como admin con solo ingresar con Google, sin compartir ninguna contraseña ni editar la base de datos a mano.
- **SC-002**: El 100 % de los intentos de abrir el área de administración desde un visitante o un usuario normal son rechazados sin mostrar datos de administración.
- **SC-003**: Agregar un administrador se resuelve cambiando la lista y con un nuevo inicio de sesión de esa persona, en menos de 5 minutos. Quitarlo tiene efecto en su siguiente pedido al área de administración, sin cerrar su sesión, una vez que el servidor usa la lista nueva (en Vercel, después del redeploy, normalmente menos de 5 minutos).
- **SC-004**: Ninguna cuenta de correo y contraseña puede convertirse en admin, aunque use un correo de la lista.
- **SC-005**: Un usuario que pierde el rol conserva el 100 % de sus votos y comentarios.
- **SC-006**: El 100 % de los inicios de sesión de un admin terminan en la pantalla de administración sin ningún clic extra, y solo los admins ven un acceso a ella (en el menú de su cuenta).

## Assumptions

- El SPEC decía "Admin (solo el dueño del proyecto)"; esta funcionalidad lo amplía a los tres desarrolladores. `docs/SPEC.md` ya está actualizado.
- Los tres desarrolladores tienen cuenta de Google y aceptan ingresar con ella para tener el rol.
- El rol se asigna al iniciar sesión. Además, el área de administración vuelve a comparar el correo con la lista en cada pedido, así que quitar a alguien de la lista corta su acceso de inmediato. Cambiar la lista puede requerir volver a desplegar el servidor, según dónde se aloje la configuración.
- Ya existe el rol `admin` en las cuentas, así que no hace falta cambiar el modelo de datos.
- Las herramientas de administración quedan fuera de esta entrega y serán funcionalidades separadas que se apoyen en este acceso:
  - **004 – Analíticas**: votos por pollería y otros datos del ranking.
  - **005 – Moderación de comentarios**: borrar u ocultar comentarios ofensivos, despectivos o racistas, con detección automática por lista de palabras prohibidas más un servicio de moderación con IA, que se elegirá en esa spec.
  - La cola de sugerencias, los reportes y ocultar pollerías también irán en specs propias. Esto también responde en parte a la pregunta abierta del SPEC §9: habrá un área de administración protegida dentro de la app.
- No se agrega verificación de correo para cuentas de contraseña; si algún día existe, se podría permitir que esas cuentas también reciban el rol.
