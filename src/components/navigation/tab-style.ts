/**
 * Estilo de cada pestaña de la barra de abajo. El <li> que la envuelve lleva data-active="true"
 * cuando es la página actual: así se marca igual un enlace que el menú de la cuenta.
 * Alto mínimo de 56px (zona táctil > 44px) con ícono y texto, nunca solo ícono.
 */
export const TAB_ITEM_CLASS =
  "relative flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold text-ink-muted outline-none transition-colors " +
  "focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-[0.97] motion-reduce:active:scale-100 " +
  "before:absolute before:top-0 before:h-1 before:w-8 before:rounded-b-full before:bg-brand before:opacity-0 before:transition-opacity " +
  "in-data-[active=true]:text-brand-ink in-data-[active=true]:before:opacity-100";

export const TAB_ICON_CLASS = "size-6";
