import { useEffect, useState, type FormEvent } from "react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { SiteFooter } from "@/components/common/SiteFooter";
import {
  fetchCurrentUser,
  updateCurrentUserProfile,
} from "@/services/userService";
import type { CurrentUserProfile } from "@/types/user";
import { useNavigate } from "react-router-dom";

function isValidEmail(value: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export default function SettingsPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [pseudo, setPseudo] = useState("");
  const [mail, setMail] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => {
        setUser(data);
        setPseudo(data.pseudo ?? "");
        setMail(data.mail ?? "");
      })
      .catch(() => {
        localStorage.setItem("apiToken", "");
        navigate("/");
      })
      .finally(() => setIsLoadingUser(false));
  }, [navigate]);

  async function handleSaveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const trimmedPseudo = pseudo.trim();
    const trimmedMail = mail.trim();

    if (!trimmedPseudo) {
      setProfileError("Le pseudo est obligatoire.");
      return;
    }

    if (!trimmedMail) {
      setProfileError("L'e-mail est obligatoire.");
      return;
    }

    if (!isValidEmail(trimmedMail)) {
      setProfileError("Saisis une adresse e-mail valide.");
      return;
    }

    if (trimmedPseudo === user?.pseudo && trimmedMail === user?.mail) {
      setProfileSuccess("Aucune modification à enregistrer.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const updatedUser = await updateCurrentUserProfile({
        pseudo: trimmedPseudo,
        mail: trimmedMail,
      });

      setUser(updatedUser);
      setPseudo(updatedUser.pseudo);
      setMail(updatedUser.mail);
      setProfileSuccess("Profil mis à jour avec succès.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Impossible de mettre à jour le profil.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSavePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setIsSavingPassword(true);

    try {
      const effectivePseudo = pseudo.trim();
      const effectiveMail = mail.trim();

      if (!effectivePseudo || !effectiveMail) {
        setPasswordError("Pseudo et e-mail sont requis pour mettre à jour le mot de passe.");
        setIsSavingPassword(false);
        return;
      }

      await updateCurrentUserProfile({
        pseudo: effectivePseudo,
        mail: effectiveMail,
        password: newPassword,
        passwordConfirm: newPasswordConfirm,
      });

      setNewPassword("");
      setNewPasswordConfirm("");
      setPasswordSuccess("Mot de passe mis à jour avec succès.");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Impossible de mettre à jour le mot de passe.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        activeItem="parametres"
        userName={isLoadingUser ? "Chargement..." : (user?.pseudo ?? "Utilisateur")}
      />

      <div className="flex min-h-screen flex-1 flex-col pl-[var(--sidebar-width)] transition-[padding] duration-200">
        <TopBar title="Paramètres" greeting={`Bienvenue, ${user?.pseudo ?? "..."} 👋`} />

        <main className="flex-1 px-8 py-6">
          <div className="max-w-3xl space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-semibold tracking-tight">Profil</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Modifie ton pseudo et ton adresse e-mail.
                </p>
              </div>

              {profileError && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="mb-4 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="settings-pseudo" className="mb-1.5 block text-sm font-medium">
                    Pseudo
                  </label>
                  <input
                    id="settings-pseudo"
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
                    placeholder="Ton pseudo"
                  />
                </div>

                <div>
                  <label htmlFor="settings-mail" className="mb-1.5 block text-sm font-medium">
                    E-mail
                  </label>
                  <input
                    id="settings-mail"
                    type="email"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
                    placeholder="utilisateur@exemple.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingProfile ? "Enregistrement..." : "Enregistrer le profil"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-semibold tracking-tight">Mot de passe</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mets à jour ton mot de passe pour sécuriser ton compte.
                </p>
              </div>

              {passwordError && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-4 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="settings-new-password" className="mb-1.5 block text-sm font-medium">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="settings-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="settings-confirm-password" className="mb-1.5 block text-sm font-medium">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="settings-confirm-password"
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingPassword ? "Enregistrement..." : "Enregistrer le mot de passe"}
                </button>
              </form>
            </section>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
