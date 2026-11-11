"use client";

import { useSyncExternalStore } from "react";

// Hora de Bolivia fija: así el servidor y el navegador muestran la misma fecha y no hay desajuste al hidratar.
const TIME_ZONE = "America/La_Paz";
const MINUTE = 60_000;

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * MINUTE },
  { unit: "month", ms: 30 * 24 * 60 * MINUTE },
  { unit: "week", ms: 7 * 24 * 60 * MINUTE },
  { unit: "day", ms: 24 * 60 * MINUTE },
  { unit: "hour", ms: 60 * MINUTE },
  { unit: "minute", ms: MINUTE },
];

const relativeFormat = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const absoluteFormat = new Intl.DateTimeFormat("es-BO", { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE });

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase("es") + text.slice(1);

function relativeLabel(iso: string, nowMinute: number): string {
  const elapsed = nowMinute * MINUTE - new Date(iso).getTime();
  if (elapsed < MINUTE) {
    return "Hace un momento";
  }
  const match = UNITS.find(({ ms }) => elapsed >= ms) ?? { unit: "minute" as const, ms: MINUTE };
  return capitalize(relativeFormat.format(-Math.floor(elapsed / match.ms), match.unit));
}

// "Ahora" redondeado al minuto: el valor es estable dentro del mismo minuto, como pide useSyncExternalStore.
const subscribe = () => () => {};
const currentMinute = () => Math.floor(Date.now() / MINUTE);
const noMinuteOnServer = () => null;

/**
 * "Hace 2 días". Se calcula en el navegador: si se calculara en el servidor, la caché congelaría la fecha.
 * El HTML del servidor muestra la fecha absoluta y el navegador la cambia por la relativa.
 */
export function RelativeTime({ iso }: { iso: string }) {
  const nowMinute = useSyncExternalStore(subscribe, currentMinute, noMinuteOnServer);
  const absolute = absoluteFormat.format(new Date(iso));
  return (
    <time dateTime={iso} title={absolute}>
      {nowMinute === null ? absolute : relativeLabel(iso, nowMinute)}
    </time>
  );
}
