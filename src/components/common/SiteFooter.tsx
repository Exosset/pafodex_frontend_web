import { Link } from "react-router-dom";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/80 px-6 py-6 text-xs text-muted-foreground backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <section>
          <p className="text-sm font-semibold text-foreground">PAF'O'Dex</p>
          <p className="mt-2 leading-relaxed">
            Plateforme de gestion de collections TCG. Tous droits de propriete intellectuelle
            reserves.
          </p>
          <p className="mt-2">© {year} PAF'O'Dex</p>
        </section>

        <section>
          <p className="text-sm font-semibold text-foreground">Informations legales</p>
          <ul className="mt-2 space-y-1 leading-relaxed">
            <li>Aucun usage d'information personnel</li>
            <li>Aucun traitement statistique</li>
            <li>Hebergement sur Render.com</li>
            <li>Equipe francaise localisee a Nantes</li>
          </ul>
        </section>

        <section>
          <p className="text-sm font-semibold text-foreground">Liens utiles</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link to="/privacy-policy" className="font-medium text-primary hover:underline">
              Politique de confidentialite
            </Link>
            <Link to="/" className="font-medium text-primary hover:underline">
              Connexion
            </Link>
          </div>
        </section>
      </div>
    </footer>
  );
}
