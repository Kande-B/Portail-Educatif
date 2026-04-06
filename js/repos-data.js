// ============================================
// CONFIGURATION DU PORTAIL (AUTOMATISÉ)
// ============================================

const CONFIG = {
  githubUser: "Kande-B",
  githubAvatar: "https://avatars.githubusercontent.com/u/228385633?v=4",
  teacherName: "M. Kandé",
  schoolInfo: "Lycée Gustave Eiffel — Varennes-sur-Seine",
  mainSiteUrl: "https://kande-b.github.io/Lycee-pro-Maths-Sciences/"
};

// Mapping des topics GitHub vers les noms de catégories et icônes
const SUBJECTS_CONFIG = {
  'maths': { name: 'Mathématiques', icon: '📐', color: '#6366f1' },
  'sciences': { name: 'Sciences Physiques', icon: '⚗️', color: '#10b981' },
  'informatique': { name: 'Informatique', icon: '💻', color: '#3b82f6' },
  'astronomie': { name: 'Astronomie', icon: '🔭', color: '#06b6d4' },
  'sport': { name: 'Sport & Culture', icon: '🏅', color: '#f43f5e' },
  'orientation': { name: 'Orientation', icon: '🧭', color: '#a855f7' },
  'culture': { name: 'Culture', icon: '🌍', color: '#ec4899' },
  'autres': { name: 'Autres Ressources', icon: '📁', color: '#94a3b8' }
};

// Mapping des préfixes de noms de dépôts vers les niveaux (Fallback)
const LEVEL_FALLBACKS = {
  'bacpro-': 'Bac Pro',
  '1ere_': '1ère S',
  '3eme-': '3ème PM',
  'cap-': 'CAP',
  '2nde-': '2nde Bac Pro',
  'terminale-': 'Terminale / Bac Pro'
};

const PROGRAMS_LINKS = [
  { label: "Mathématiques (Sénégal/France)", url: "https://eduscol.education.fr/1710/programmes-en-vigueur-au-lycee-general-et-technologique", subject: "Mathématiques" },
  { label: "Physique-Chimie", url: "https://eduscol.education.fr/1715/programmes-de-physique-chimie", subject: "Sciences Physiques" }
];
