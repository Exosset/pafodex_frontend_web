import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Sidebar } from "@/components/home/Sidebar";
import { TopBar } from "@/components/home/TopBar";
import { Modal } from "@/components/common/Modal";

const RULES_CARDS = [
  {
    key: "magic",
    label: "Magic: The Gathering",
    accent: "from-[#496DC3] to-[#6F8FE8]",
    summary: "Les règles officielles de Magic décrivent le déroulement du tour, la résolution des sorts, le combat, la pile et les interactions entre capacités et effets.",
    officialUrl: "https://magic.wizards.com/en/rules",
    sections: [
      {
        title: "Objectif du jeu",
        content: [
          "Le but est de réduire les points de vie de l'adversaire à 0 grâce à des créatures, sorts, artefacts, enchantements et autres effets.",
          "Un joueur qui n'a plus de points de vie à la fin d'un tour perd immédiatement la partie.",
        ],
      },
      {
        title: "Déroulement d'un tour",
        content: [
          "Chaque tour suit l'ordre suivant : début, étape principale, phase de combat, seconde étape principale, fin.",
          "Pendant l'étape de début, les cartes qui se déclenchent au début du tour sont résolues et les dégâts liés aux effets sont appliqués.",
          "Pendant l'étape principale, les joueurs peuvent lancer des sorts, jouer des terrains et activer certaines capacités.",
        ],
      },
      {
        title: "Combat et pile",
        content: [
          "Le combat commence lorsque vous déclarez une attaque avec une créature qui peut attaquer.",
          "Les blocs, l'ordre de blocage et les dégâts sont déterminés selon les règles de combat et la puissance/ténacité des créatures.",
          "Toutes les actions non instantanées sont placées sur la pile, puis résolues dans l'ordre inverse de leur mise sur la pile.",
        ],
      },
      {
        title: "Capacités et effets",
        content: [
          "Les capacités peuvent être activées, déclenchées ou statiques selon leur texte.",
          "Les effets de remplacement modifient la façon dont un événement se produit, tandis que les effets d'intervention changent l'ordre de résolution.",
          "Les cartes et effets sont toujours résolus conformément aux règles de priorités et de cumul.",
        ],
      },
    ],
  },
  {
    key: "pokemon",
    label: "Pokémon",
    accent: "from-[#E85A48] to-[#FF8B74]",
    summary: "Les règles officielles du Pokémon TCG expliquent comment gagner la partie, préparer son équipe, jouer ses cartes et résoudre les combats.",
    officialUrl: "https://www.pokemon.com/us/play-pokemon/about-pokemon-tcg",
    sections: [
      {
        title: "Objectif du jeu",
        content: [
          "Un joueur gagne quand l'adversaire n'a plus de Pokémon en jeu et ne peut plus continuer le combat.",
          "Le jeu repose sur la gestion d'une équipe de Pokémon, d'énergie et d'outils de soutien.",
        ],
      },
      {
        title: "Déroulement du tour",
        content: [
          "Le tour commence par le début du tour, puis la pioche, puis les actions du joueur.",
          "Le joueur peut jouer des cartes Énergie, évoluer ses Pokémon, utiliser des objets ou attaquer.",
          "La fin du tour marque la fermeture des actions et la préparation du tour suivant.",
        ],
      },
      {
        title: "Attaques et dégâts",
        content: [
          "Une attaque ne peut être utilisée que si le Pokémon dispose des Énergies requises et est prêt à attaquer.",
          "Les dégâts sont infligés au Pokémon adverse, puis les effets d'attaque sont résolus.",
          "Certaines cartes modifient la puissance des attaques, les dégâts ou les conditions de combat.",
        ],
      },
      {
        title: "Règles de base",
        content: [
          "Les Pokémon de base, les évolutions et les cartes de soutien doivent être placés dans les zones appropriées.",
          "Les effets de statut, les cartes de jeu et les accessoires sont résolus selon les textes de la carte.",
          "Les règles de remplacement et les exceptions sont toujours prioritaires sur les effets généraux.",
        ],
      },
    ],
  },
  {
    key: "yugioh",
    label: "Yu-Gi-Oh!",
    accent: "from-[#7A3DFF] to-[#B58BFF]",
    summary: "Les règles officielles de Yu-Gi-Oh! décrivent les phases du tour, l'activation des effets, les zones du terrain et la résolution des combats.",
    officialUrl: "https://www.yugioh-card.com/en/rulebook/",
    sections: [
      {
        title: "Objectif du jeu",
        content: [
          "Le joueur qui parvient à réduire les points de vie adverses à 0 remporte la partie.",
          "Le jeu repose sur la gestion des monstres, sorts, pièges et zones de terrain.",
        ],
      },
      {
        title: "Phases du tour",
        content: [
          "Le tour comprend la pioche, la phase de maintenance, la phase principale, la phase de bataille puis la phase finale.",
          "Chaque phase a un rôle précis dans le déroulé du jeu et dans l'activation des effets.",
        ],
      },
      {
        title: "Monstres et combat",
        content: [
          "Les monstres peuvent être invoqués en position d'attaque ou de défense selon les règles de zone.",
          "Les attaques se résolvent à travers les points d'attaque et les effets qui peuvent modifier les combats.",
          "Les cartes face cachée, les pièges et les cartes de terrain influencent fortement le déroulé.",
        ],
      },
      {
        title: "Effets et pile",
        content: [
          "Les effets de cartes peuvent être activés selon leur timing et leur condition d'activation.",
          "Les interactions entre cartes se résolvent selon les règles de priorité et d'ordre de résolution.",
          "Les cartes spéciales et les effets continus peuvent modifier durablement le plateau.",
        ],
      },
    ],
  },
  {
    key: "riftbound",
    label: "Riftbound",
    accent: "from-[#F5A524] to-[#FFD166]",
    summary: "Les règles officielles de Riftbound expliquent les zones de jeu, le coût des cartes, les effets et la manière de gagner la partie.",
    officialUrl: "https://riftbound.com/",
    sections: [
      {
        title: "Objectif du jeu",
        content: [
          "Le but est de réduire les points de vie de l'adversaire à 0 ou d'atteindre la condition de victoire prévue par la règle du jeu.",
          "La stratégie repose sur la gestion du deck, du terrain et des ressources disponibles.",
        ],
      },
      {
        title: "Mise en place",
        content: [
          "Chaque joueur prépare son deck, sa zone de jeu et ses ressources avant le début de la partie.",
          "Les cartes sont tirées, les zones sont remplies et les joueurs choisissent leurs premières actions.",
        ],
      },
      {
        title: "Déroulement du tour",
        content: [
          "Le tour se déroule en plusieurs moments distincts où les joueurs jouent des cartes, activent des effets et lancent des actions.",
          "Les cartes sont jouées dans les zones attendues selon leur type et leur coût.",
        ],
      },
      {
        title: "Effets et résolution",
        content: [
          "Les capacités et les effets se résolvent selon leur ordre, leur timing et la logique du jeu.",
          "Les cartes qui modifient les stats, les ressources ou les conditions de victoire peuvent faire basculer la partie.",
          "Les exceptions et les règles spécifiques à certaines cartes prennent toujours priorité sur les règles générales.",
        ],
      },
    ],
  },
] as const;

export default function RulesPage() {
  const [selectedRule, setSelectedRule] = useState<(typeof RULES_CARDS)[number] | null>(null);

  const selectedGame = selectedRule;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar activeItem="regles" userName="Utilisateur" />

      <div className="flex-1 pl-64">
        <TopBar title="Règles des TCG" greeting="Consulte les règles officielles des jeux disponibles" />

        <main className="px-8 py-8">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Guide officiel</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Choisis un jeu</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {RULES_CARDS.map((rule) => (
              <button
                key={rule.key}
                type="button"
                onClick={() => setSelectedRule(rule)}
                className={`group rounded-2xl border border-border bg-gradient-to-br ${rule.accent} p-[1px] text-left shadow-sm transition-transform hover:-translate-y-0.5`}
              >
                <div className="h-full rounded-[15px] bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">{rule.label}</h2>
                    <ExternalLink size={16} className="text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{rule.summary}</p>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>

      {selectedGame && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRule(null)}
          title={selectedGame.label}
        >
          <div className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">{selectedGame.summary}</p>
            <div className="space-y-4">
              {selectedGame.sections.map((section) => (
                <section key={section.title} className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {section.content.map((item) => (
                      <li key={item} className="text-sm leading-6 text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <a
              href={selectedGame.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Voir les règles officielles
              <ExternalLink size={14} />
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}
