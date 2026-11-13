# Versus: Lolo Chicken vs. Ricono

Página pública: /versus. Se accede desde tres lugares:

- El botón Versus del header (naranja, con un punto "en vivo").
- La casilla "El duelo" del mosaico del hero, en la home.
- La franja del duelo de la home (#duelo), entre el hero y el catálogo: logos cara a cara, porcentajes, barra partida y quién va ganando.

## Reglas

- Votación independiente de ratings; no modifica calificaciones ni reseñas.
- Un voto por usuario autenticado y con username, sin cambios posteriores.
- Participantes iniciales: lolo-chicken y ricono. Ambos deben estar activos.
- El resultado depende de la cantidad de votos, no del promedio de calificaciones.
- Sin votos: ambos muestran 0 %. Con la misma cantidad: empate.
- Por ahora la votación permanece abierta; se muestra quién va ganando. No hay cierre automático ni ganador definitivo.
- En /versus los resultados se consultan al cargar la página y se actualizan después de votar.
- En la franja de la home el resultado se consulta cada 30 s (solo con la pestaña visible) en GET /api/versus. Si cambió, la barra se mueve, los porcentajes cuentan hasta el valor nuevo y la corona pasa al nuevo líder. La respuesta sale de una caché de 15 s con la etiqueta "versus"; un voto la invalida.

## Movimiento

La franja se anima una sola vez al aparecer en pantalla: los logos chocan, la "VS" golpea y la barra va de 50/50 al resultado. Con "reducir movimiento" se muestra quieta y con los valores finales; la consulta cada 30 s sigue funcionando sin animación.

## Capas

- domain/versus: participantes, identificación del duelo, porcentajes y liderazgo.
- application/versus: lectura del duelo y autorización de la elección.
- infrastructure/db: repositorio y tabla versus_votes; clave primaria (duel_id, user_id), checks del duelo y candidatos, referencias a usuarios y restaurantes.
- composition: conecta repositorios, casos de uso y límite de solicitudes.
- app y components: página, navegación, validación con Zod, acción autenticada y tarjetas.

## Base de datos

Nueva migración: 0005_versus_votes.sql. Ejecutar pnpm db:migrate en cada base que todavía no la tenga aplicada, antes de desplegar esta versión. La base configurada durante la implementación ya fue migrada.

No se alteran ni eliminan datos existentes. Para agregar futuros duelos se debe ampliar explícitamente la configuración y las restricciones actuales.

## Verificación

Pruebas unitarias: usuario inexistente, username faltante, candidato inválido, participantes ausentes, voto repetido, elección simultánea, empate, cero votos y porcentajes.
Verificación manual en Edge: acceso público, imágenes, vista a 360/768/1440 px, envío autenticado, resultado actualizado y persistencia después de recargar. Comprobación en PostgreSQL del rechazo de una segunda elección. Los datos temporales de prueba se eliminaron.