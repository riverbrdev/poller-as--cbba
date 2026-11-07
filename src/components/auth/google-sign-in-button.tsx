type GoogleSignInButtonProps = {
  action: (formData: FormData) => Promise<void>;
  label: string;
  /** Ruta interna a la que volver después de ingresar (por ejemplo, el formulario de calificar). */
  callbackUrl?: string;
};

// Isotipo oficial de Google (colores de la marca, no del tema).
function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24">
      <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" fill="#4285F4" />
      <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853" />
      <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z" fill="#FBBC05" />
      <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335" />
    </svg>
  );
}

export function GoogleSignInButton({ action, label, callbackUrl }: GoogleSignInButtonProps) {
  return (
    <form action={action}>
      {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
      <button
        type="submit"
        className="flex min-h-[50px] w-full items-center justify-center gap-3 rounded-xl border border-[#DADCE0] bg-white px-4 py-3 text-base font-semibold tracking-tight text-neutral-800 shadow-sm transition-all duration-150 hover:bg-neutral-50 hover:shadow focus-visible:ring-2 focus-visible:ring-auth-brand focus-visible:ring-offset-2 focus-visible:outline-none active:bg-neutral-100"
      >
        <GoogleIcon />
        {label}
      </button>
    </form>
  );
}
