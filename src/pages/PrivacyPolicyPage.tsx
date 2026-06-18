import { Link } from "react-router-dom";
import logo from "@/assets/Logo.png";
import { SiteFooter } from "@/components/common/SiteFooter";

export default function PrivacyPolicyPage() {
  const lastUpdated = "18/06/2026";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <img src={logo} alt="PAF'O'Dex" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Politique de confidentialite</h1>
            <p className="text-sm text-muted-foreground">Version du {lastUpdated}</p>
          </div>
        </div>

        <section className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">1. Engagement general</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La protection de la vie privee est une priorite de PAF&apos;O&apos;Dex. Cette politique
              explique de maniere transparente comment les informations liees au service sont
              gerees.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">2. Principes appliques</h2>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>Aucun usage d&apos;information personnel.</li>
              <li>Aucun traitement statistique.</li>
              <li>Stockage et hebergement chez Render.com.</li>
              <li>Equipe francaise localisee a Nantes.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">3. Hebergement et securite</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              L&apos;application est hebergee sur l&apos;infrastructure Render.com. Des mesures techniques
              raisonnables sont mises en place pour proteger les acces et limiter les risques
              d&apos;utilisation non autorisee.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">4. Absence d&apos;usage commercial et analytique</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Les informations ne sont pas exploitees a des fins publicitaires, marketing ou de
              profilage. Aucun traitement statistique n&apos;est realise sur les donnees utilisateurs.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">5. Contact</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Pour toute question relative a la confidentialite, vous pouvez contacter l&apos;equipe
              francaise basee a Nantes via les canaux de support du projet.
            </p>
          </div>
        </section>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Retour a la connexion
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
