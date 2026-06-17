import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, Mail, Lock, User2, Loader2 } from "lucide-react";
import { buildAuthConnexion, buildAuthInscription } from "../mappers/authMapper";
import { validateLogin, validateRegister, type ValidationErrors } from "../validators/authValidator";
import { login, register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/Logo.png";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;

    // 1. Validation
    const validationErrors =
      mode === "login"
        ? validateLogin(data.mail, data.password)
        : validateRegister(data.username, data.mail, data.password, data.confirmPassword);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    // 2. Construction du payload
    setIsSubmitting(true);
    try {
      const result =
        mode === "login"
          ? await login(buildAuthConnexion(data.mail, data.password))
          : await register(buildAuthInscription(data.username, data.mail, data.password, data.confirmPassword));

      // 3. Traitement de la réponse
      console.log("Un resultat: ", result)
      if (!result.apiToken) {
        setApiError(result.error ?? "Une erreur est survenue, réessaie.");
        return;
      }


      console.log("AuthPage: ",result.apiToken)

      // 4. Redirection vers la page d'accueil
      localStorage.setItem('apiToken', result.apiToken)
      navigate("/home");
    } catch {
      setApiError("Impossible de contacter le serveur. Réessaie plus tard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setApiError(null);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ----- Panneau formulaire ----- */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center text-primary-foreground">
              <img src={logo} alt="Deckhaus" className="h-9 w-9 rounded-full object-cover" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Pafodex</span>
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Content de te revoir" : "Crée ton compte"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Connecte-toi pour retrouver ta collection."
              : "Quelques infos et ta collection t'attend."}
          </p>

          {/* Onglets */}
          <div className="mt-8 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Erreur API globale */}
          {apiError && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {apiError}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {mode === "register" && (
              <Field
                label="Pseudo"
                name="username"
                type="text"
                placeholder="Sacha_du_Bourg"
                icon={<User2 size={16} />}
                error={errors.username}
              />
            )}

            <Field
              label={mode === "login" ? "E-mail" : "E-mail"}
              name="mail"
              type={mode === "login" ? "text" : "email"}
              placeholder={mode === "login" ? "sacha@pokemon.fr" : "sacha@pokemon.fr"}
              icon={<Mail size={16} />}
              error={errors.mail}
            />

            {/* Mot de passe */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                {mode === "login" && (
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Mot de passe oublié ?
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>

            {mode === "register" && (
              <Field
                label="Confirme le mot de passe"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={16} />}
                error={errors.confirmPassword}
              />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Pas encore de compte ?{" "}
                <button type="button" onClick={() => switchMode("register")} className="font-medium text-primary hover:underline">
                  Crée-en un
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <button type="button" onClick={() => switchMode("login")} className="font-medium text-primary hover:underline">
                  Connecte-toi
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ----- Panneau visuel (caché en mobile) ----- */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-primary lg:flex">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(circle, #FAFCFE 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative h-72 w-52">
          <div className="absolute inset-0 -rotate-[10deg] rounded-2xl bg-mtg shadow-xl" />
          <div className="absolute inset-0 rotate-[8deg] rounded-2xl bg-pokemon shadow-xl" />
          <div className="absolute inset-0 flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-card-foreground">Dracaufeu</span>
              <span className="rounded-full bg-pokemon/10 px-2 py-0.5 text-xs font-medium text-pokemon">
                Feu
              </span>
            </div>
            <div className="flex-1 rounded-xl bg-gradient-to-br from-pokemon/15 via-warning/10 to-primary/15" />
            <div className="space-y-1.5">
              <div className="h-2 w-3/4 rounded-full bg-muted" />
              <div className="h-2 w-1/2 rounded-full bg-muted" />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-12 bottom-12 text-primary-foreground">
          <h2 className="text-2xl font-semibold tracking-tight">
            Toute ta collection, classée au même endroit.
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Pokémon, Magic : l'Assemblée, et toutes tes autres cartes — recherche, suivi et
            organisation simplifiés.
          </p>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  icon: ReactNode;
  error?: string;
}

function Field({ label, name, type, placeholder, icon, error }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring ${
            error ? "border-destructive" : "border-border"
          }`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
