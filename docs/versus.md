# Versus: Lolo Chicken vs. Ricono

Página pública: /versus. Se accede desde el enlace Versus junto a Pollerías.

## Reglas

- Votación independiente de ratings; no modifica calificaciones ni reseñas.
- Un voto por usuario autenticado y con username, sin cambios posteriores.
- Participantes iniciales: lolo-chicken y ricono. Ambos deben estar activos.
- El resultado depende de la cantidad de votos, no del promedio de calificaciones.
- Sin votos: ambos muestran 0 %. Con la misma cantidad: empate.
- Por ahora la votación permanece abierta; se muestra quién va ganando. No hay cierre automático ni ganador definitivo.
- Los resultados se consultan al cargar la página y se actualizan después de votar. Otros visitantes pueden recargar para ver votos nuevos.

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