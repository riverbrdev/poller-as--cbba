# Feature Specification: Votar desde la tarjeta, formulario de votación y botón de mapa

**Feature Branch**: `feat/calificar-y-votar`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "nuestra siguiente implementación es en el UI poner el botón de votar y cuando se pulse ese botón se vaya al formulario de votación. Antes quiero que leas mi Google Stitch para saber bien el plan de desarrollo que vamos a seguir, y obviamente las votaciones se deben guardar en la BD. Además, al lado del botón de votar, el botón del mapa que lleva a la ubicación que ya está en el código para todos los restaurantes."

**Referencia de diseño**: proyecto de Stitch "Roster Pollos Cochabamba", pantallas *Calificar Pollería - ComiDeli Cochabamba (Desktop)* y *Calificar pollería - ComiDeli Cochabamba (Mobile)*. Son la fuente visual del formulario. Las pantallas de formulario anteriores quedan descartadas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calificar una pollería y que el voto quede guardado (Priority: P1)

Un usuario con sesión iniciada y nombre de usuario elegido ve una pollería en el catálogo y pulsa **"Votar"**. Llega al formulario de votación de esa pollería: arriba ve la foto, el nombre y la zona del local y, al bajar, los cuatro criterios con su escala del 1 al 10. Elige una nota para cada criterio y, si quiere, escribe un comentario. Mientras avanza ve su nota general y cuántos criterios le faltan. Cuando completa los cuatro, envía el voto, que queda guardado, y recibe una confirmación clara.

**Why this priority**: es el corazón del producto. Sin votos guardados no hay ranking. Es lo mínimo que entrega valor por sí solo.

**Independent Test**: con un usuario de prueba con sesión iniciada, pulsar "Votar" en cualquier pollería, completar los cuatro criterios y enviar. Al recargar el formulario de esa misma pollería, el voto aparece guardado con las mismas notas.

**Acceptance Scenarios**:

1. **Given** un usuario con sesión iniciada y nombre de usuario, **When** pulsa "Votar" en la tarjeta de una pollería, **Then** llega al formulario de votación de esa pollería, con su foto, nombre y zona arriba.
2. **Given** el formulario abierto, **When** el usuario elige notas para 3 de los 4 criterios, **Then** ve el avance "3 de 4 criterios · 75%" y el botón "Enviar mi voto" sigue desactivado.
3. **Given** el formulario con los 4 criterios calificados, **When** el usuario pulsa "Enviar mi voto", **Then** el voto se guarda y ve la confirmación con el botón "Volver al catálogo".
4. **Given** el formulario abierto, **When** el usuario elige una nota en cualquier criterio, **Then** ve el número elegido en grande con su palabra (por ejemplo "8 · Muy bueno") y la nota general se actualiza en el momento.
5. **Given** un comentario de más de 280 caracteres, **When** el usuario intenta escribir más, **Then** no puede pasar el límite y el contador muestra "280/280".

---

### User Story 2 - Ir a la ubicación de la pollería desde la tarjeta (Priority: P2)

Cualquier persona, con o sin sesión, ve en cada tarjeta del catálogo un botón de **mapa** al lado de "Votar". Al pulsarlo se abre la ubicación de la pollería en el mapa, usando el enlace que ya tiene cada local cargado.

**Why this priority**: ayuda a llegar al local y ya existe el dato, pero no es imprescindible para votar.

**Independent Test**: en el catálogo, sin iniciar sesión, pulsar el botón de mapa de cualquier pollería y comprobar que se abre su ubicación en una pestaña nueva, sin perder el catálogo.

**Acceptance Scenarios**:

1. **Given** una pollería con enlace de ubicación, **When** se muestra su tarjeta, **Then** aparecen dos botones lado a lado: "Votar" (acción principal) y "Mapa" (acción secundaria).
2. **Given** la tarjeta de una pollería, **When** la persona pulsa "Mapa", **Then** se abre la ubicación del local en una pestaña nueva y el catálogo sigue abierto.
3. **Given** una pollería sin enlace de ubicación, **When** se muestra su tarjeta, **Then** el botón "Mapa" no aparece y "Votar" ocupa todo el ancho.

---

### User Story 3 - Visitante sin sesión que quiere votar (Priority: P2)

Un visitante sin sesión pulsa "Votar". En vez de un error, se le pide entrar o crear una cuenta y, al terminar, vuelve directo al formulario de la pollería que había elegido. Si entró con Google y todavía no tiene nombre de usuario, primero lo elige y después llega al formulario.

**Why this priority**: es el camino de la mayoría de usuarios nuevos. Si se pierden al iniciar sesión, no votan.

**Independent Test**: sin sesión, pulsar "Votar" en una pollería, iniciar sesión y comprobar que se llega al formulario de esa misma pollería.

**Acceptance Scenarios**:

1. **Given** un visitante sin sesión, **When** pulsa "Votar", **Then** se le lleva a ingresar, con un aviso de que necesita una cuenta para votar.
2. **Given** ese visitante, **When** inicia sesión correctamente, **Then** llega al formulario de la pollería que eligió, no a la página de inicio.
3. **Given** un usuario con sesión pero sin nombre de usuario, **When** intenta abrir el formulario, **Then** primero elige su nombre de usuario y después llega al formulario.

---

### User Story 4 - Ya voté esta pollería (Priority: P3)

Un usuario que ya votó por una pollería pulsa de nuevo "Votar" en esa tarjeta (la tarjeta no distingue si ya votó, ver FR-004). En vez del formulario ve el aviso "Ya calificaste esta pollería" con las notas que dio. **No puede editar ni volver a votar** (decisión 2026-11-06: la edición de votos se descarta por complejidad).

**Why this priority**: la base de datos ya impide votos duplicados. Esta historia solo evita que la persona llene el formulario para nada.

**Independent Test**: votar una pollería, volver a pulsar "Votar" y comprobar que aparece el aviso con las notas dadas, sin formulario. En la base sigue habiendo un solo voto.

**Acceptance Scenarios**:

1. **Given** un usuario que ya votó una pollería, **When** abre su formulario, **Then** ve "Ya calificaste esta pollería", sus cuatro notas, su nota general y el botón "Volver al catálogo", sin escalas para editar ni botón de enviar.
2. **Given** un usuario que ya votó, **When** de todos modos envía un voto para esa pollería (otra pestaña, reenvío), **Then** el sistema lo rechaza con el mensaje "Ya calificaste esta pollería" y el voto original no cambia.

---

### Edge Cases

- **Doble envío**: si el usuario pulsa "Enviar" dos veces seguidas o desde dos pestañas a la vez, queda un único voto (el primero que llegó), nunca dos. Los envíos posteriores reciben "Ya calificaste esta pollería".
- **Límite de votos por hora**: si un usuario supera 10 votos en una hora (SPEC §4, regla 7), el envío se rechaza con un mensaje claro que le pide esperar, sin perder lo que llenó en el formulario.
- **Sesión vencida al enviar**: se le pide volver a ingresar y, al regresar, el formulario conserva lo que había llenado o al menos lo devuelve a la misma pollería.
- **Pollería inexistente u oculta**: si se abre el formulario de una pollería que no existe o fue ocultada por un admin, se muestra una página de "no encontrada" con enlace al catálogo, y no se permite guardar votos para ella.
- **Pollería sin foto**: el formulario muestra el mismo marcador visual que usa la tarjeta, sin romper el diseño.
- **Nota fuera de rango o criterio faltante**: cualquier envío con notas fuera de 1–10, criterios sin nota o comentario de más de 280 caracteres se rechaza en el servidor, aunque la pantalla no lo haya permitido.
- **Error de conexión o del servidor al guardar**: se muestra un mensaje de error entendible, el formulario conserva las notas y se puede reintentar.
- **Comentario solo con espacios**: se trata como si no hubiera comentario.

## Requirements *(mandatory)*

### Functional Requirements

**Tarjeta del catálogo**

- **FR-001**: Cada tarjeta de pollería del catálogo MUST mostrar un botón principal "Votar" que lleve al formulario de votación de esa pollería.
- **FR-002**: Cada tarjeta MUST mostrar, al lado de "Votar", un botón secundario "Mapa" que abra en una pestaña nueva el enlace de ubicación ya registrado para esa pollería. Esto reemplaza el botón actual "Ver en Maps".
- **FR-003**: Si una pollería no tiene enlace de ubicación, la tarjeta MUST ocultar el botón "Mapa" y mostrar solo "Votar".
- **FR-004**: El botón principal de la tarjeta dice siempre "Votar", haya votado o no el usuario. *(Decisión 2026-11-06: así el catálogo no depende de la sesión. Quien ya votó lo descubre al abrir el formulario, ver historia 4.)*
- **FR-005**: Los dos botones MUST tener zonas táctiles de al menos 44×44 px y quedar en una sola fila en celulares de 360 px de ancho.

**Acceso al formulario**

- **FR-006**: Cada pollería activa MUST tener su propia dirección de formulario de votación, que se pueda abrir y compartir directamente.
- **FR-007**: El sistema MUST exigir sesión iniciada y nombre de usuario para abrir el formulario y para guardar un voto, comprobándolo en el servidor.
- **FR-008**: Un visitante sin sesión que pulse "Votar" MUST ir a ingresar y, tras ingresar (y elegir nombre de usuario si le falta), MUST volver al formulario de la pollería elegida.

**Formulario de votación (según el diseño de Stitch)**

- **FR-009**: El formulario MUST mostrar arriba la foto, el nombre y la zona/dirección de la pollería.
- **FR-010**: El formulario MUST presentar exactamente cuatro criterios, cada uno con su pregunta guía y una escala de 10 opciones (1 a 10):
  1. **Sabor y crocancia**: "¿Qué tan rico y crocante estaba?" (1: Insípido o aceitoso · 10: Crocante y jugoso)
  2. **Cantidad y porción**: "¿La porción valió lo que pagaste?" (1: Muy poco · 10: Plato rebalsando)
  3. **Atención y rapidez**: "¿Cómo te atendieron y cuánto tardó?" (1: Lento o mal trato · 10: Rápido y amable)
  4. **Local**: "Limpieza, mesas y comodidad" (1: Sucio o incómodo · 10: Impecable)
- **FR-011**: El formulario MUST mostrar una guía para decidir la nota: "1–3 Malo · 4–6 Regular · 7 Bueno · 8 Muy bueno · 9–10 Excelente", con la indicación de que 5 significa "cumple, nada más".
- **FR-012**: Al elegir una nota, la escala MUST quedar visualmente rellena desde el 1 hasta el valor elegido, y el criterio MUST mostrar el número elegido con su palabra (1–3 Malo, 4–6 Regular, 7 Bueno, 8 Muy bueno, 9–10 Excelente).
- **FR-013**: El formulario MUST mostrar en todo momento la nota general (promedio de los criterios ya calificados, con un decimal) y el avance "N de 4 criterios" con su porcentaje y barra de progreso.
- **FR-014**: Los cuatro criterios son obligatorios. El botón de enviar MUST permanecer desactivado hasta que los cuatro tengan nota.
- **FR-015**: El formulario MUST ofrecer un comentario opcional de hasta 280 caracteres con contador visible.
- **FR-016**: En celular, el avance y el botón de enviar MUST quedar fijos en la parte inferior, al alcance del pulgar. En computadora, la información de la pollería, la nota general, el avance y el botón MUST quedar en una columna lateral que acompaña al usuario mientras baja por los criterios.
- **FR-017**: La escala MUST poder usarse con teclado y lectores de pantalla (cada opción anuncia su número y criterio).

**Guardado del voto**

- **FR-018**: Al enviar, el sistema MUST guardar el voto con: usuario, pollería, las cuatro notas, el comentario (si hay) y la fecha de creación.
- **FR-019**: El sistema MUST garantizar un único voto por usuario y pollería. Los votos **no se pueden editar**: si ya existe uno, un nuevo envío se rechaza con "Ya calificaste esta pollería" y el voto original no cambia. Esta garantía MUST estar respaldada por la base de datos, no solo por la pantalla.
- **FR-019a**: Si el usuario ya votó la pollería, al abrir el formulario MUST ver el aviso "Ya calificaste esta pollería" con sus notas, en lugar de las escalas y el botón de enviar.
- **FR-020**: El sistema MUST validar en el servidor que las cuatro notas son enteros entre 1 y 10, que el comentario no supera 280 caracteres y que la pollería existe y está activa. La base de datos MUST rechazar notas fuera de rango.
- **FR-021**: El sistema MUST aplicar el límite de 10 intentos de voto por usuario por hora (SPEC §4, regla 7).
- **FR-022**: La nota general de un voto MUST ser el promedio simple de sus cuatro criterios. Es el valor que usa el ranking bayesiano existente (SPEC §4, regla 6), ahora sobre una escala de 1 a 10.
- **FR-023**: Tras guardar, el usuario MUST ver en la misma pantalla una confirmación ("¡Gracias! Tu voto quedó guardado") con sus notas y un botón principal "Volver al catálogo".
- **FR-024**: Ante cualquier error al guardar, el usuario MUST ver un mensaje entendible en español y conservar lo que llenó.

**Fuera de alcance de esta feature**

- **FR-025**: Esta feature NO incluye mostrar promedios, número de votos ni posiciones de ranking en las tarjetas o en un perfil de pollería, ni comentarios públicos, reportes o moderación. Solo captura y guarda votos. El texto actual "Sin calificaciones aún" de la tarjeta se mantiene.

### Key Entities

- **Voto (calificación)**: la opinión de un usuario sobre una pollería. Tiene cuatro notas del 1 al 10 (sabor y crocancia, cantidad y porción, atención y rapidez, local), un comentario opcional de hasta 280 caracteres, un estado de visibilidad (visible / oculto por moderación) y la fecha de creación. Existe uno solo por usuario y pollería y no se puede editar una vez enviado. Reemplaza al modelo anterior de una sola nota de 1 a 5 estrellas.
- **Pollería**: ya existe. Para esta feature aporta nombre, zona, dirección, foto (opcional) y enlace de ubicación (opcional). Solo las pollerías activas aceptan votos.
- **Usuario**: ya existe. Para votar necesita sesión y nombre de usuario.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario con sesión puede ir del catálogo a un voto guardado (pulsar "Votar", calificar 4 criterios y enviar) en menos de 60 segundos.
- **SC-002**: El 100% de los votos enviados con los cuatro criterios completos quedan guardados, y al reabrir el formulario se ven las mismas notas en el aviso "Ya calificaste".
- **SC-003**: En ninguna situación (doble clic, dos pestañas, reenvíos) existe más de un voto del mismo usuario para la misma pollería.
- **SC-004**: El 100% de los intentos de voto inválidos (notas fuera de 1–10, criterios faltantes, comentario de más de 280 caracteres, pollería oculta, sin sesión o sin nombre de usuario) se rechazan aunque se salten la pantalla.
- **SC-005**: El 100% de las tarjetas de pollerías con enlace de ubicación muestran el botón "Mapa", y abre la ubicación correcta.
- **SC-006**: Un visitante sin sesión que pulsa "Votar" y luego ingresa llega al formulario de la pollería elegida en el 100% de los casos, sin tener que buscarla de nuevo.
- **SC-007**: El formulario se puede completar sin desplazamiento horizontal ni zoom en un celular de 360 px de ancho, y se ve completo en una computadora de 1280 px.
- **SC-008**: Al menos 9 de cada 10 personas de prueba completan su primer voto sin ayuda.

## Assumptions

- **Criterios y escala ya decididos**: los cuatro criterios y la escala del 1 al 10 los eligió el usuario al diseñar en Stitch en esta sesión. Esto **contradice el `docs/SPEC.md` actual** en dos puntos, que hay que corregir antes o como parte de esta feature: el modelo `ratings` dice `stars (1–5)`, y la sección 1 lista "categorías separadas (… precio)" como no objetivo de la v1. La regla 6 (bayesiano) y la regla 5 (mínimo de 10 votos) no cambian; solo cambia la escala.
- **Votos sin edición**: por decisión del usuario (2026-11-06), un voto enviado es definitivo. Esto cambia la regla 1 de `docs/SPEC.md` ("Puede editarla, no duplicarla"), que pasa a "no se puede editar en v1". La columna `updated_at` de la tabla queda sin uso.
- **Precio no es un criterio**: los criterios son los cuatro del diseño de Stitch. "Precio" queda fuera, aunque el texto actual de la tarjeta menciona "sabor, precio, cantidad y atención". Ese texto se ajusta a los criterios reales.
- **Votos existentes**: hoy no hay votos reales guardados (el catálogo muestra "Sin calificaciones aún"), así que cambiar el modelo de votos no requiere convertir datos antiguos.
- **Pantalla propia, no ventana emergente**: el formulario es una página propia por pollería, como en el diseño de Stitch, para que funcione bien en celular y se pueda compartir.
- **Enlaces de ubicación**: las 19 pollerías precargadas ya tienen enlace de ubicación. El botón "Mapa" reutiliza ese dato y no requiere mapas embebidos.
- **Inicio de sesión existente**: se reutilizan el ingreso con Google o con correo y contraseña y el onboarding de nombre de usuario que ya existen. Solo se agrega el regreso a la pollería elegida.
- **Diseño**: se sigue el sistema visual de las pantallas nuevas de Stitch (un solo color de acento, escala segmentada, nota general con anillo, barra de progreso). Los colores y la tipografía se toman del tema ya definido en la app, no se cablean en componentes.
- **Destino tras guardar**: la confirmación se muestra en el mismo formulario y el botón "Volver al catálogo" lleva a la sección de locales de la página de inicio. Así el catálogo no tiene que leer mensajes por petición y sigue sirviéndose rápido.
