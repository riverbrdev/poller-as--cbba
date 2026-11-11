/** Lo que depende de quien mira el perfil. Sin "use client": lo usan tanto el servidor como el navegador. */
export type ViewerState = {
  myRatingId: string | null;
  helpfulRatingIds: string[];
  canMarkHelpful: boolean;
  signedIn: boolean;
};

/** Estado de quien no ingresó: no hace falta consultar la base. */
export const ANONYMOUS_VIEWER: ViewerState = { myRatingId: null, helpfulRatingIds: [], canMarkHelpful: false, signedIn: false };
