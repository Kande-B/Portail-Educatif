/**
 * PORTAIL ÉDUCATIF M. KANDÉ
 * Version Automatisée avec Heuristiques de Détection
 */

document.addEventListener('DOMContentLoaded', () => {
  const app = new PortailEducatif();
  app.init();
});

class PortailEducatif {
  constructor() {
    this.repos = [];
    this.categories = [];
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.isLoading = true;
  }

  async init() {
    this.renderLoading();
    await this.fetchUserRepos();
    this.processData();
    this.renderStats();
    this.renderFilters();
    this.renderSections();
    this.bindEvents();
    this.initScrollEffects();
  }

  async fetchUserRepos() {
    try {
      const response = await fetch(`https://api.github.com/users/${CONFIG.githubUser}/repos?sort=updated&per_page=100`);
      if (!response.ok) throw new Error('API Rate Limit or Error');
      const data = await response.json();

      this.repos = data.filter(repo =>
        repo.name.toLowerCase() !== 'm.kande' &&
        repo.name.toLowerCase() !== 'portail-educatif' &&
        repo.name.toLowerCase() !== 'kande-b.github.io' &&
        repo.has_pages === true
      );
    } catch (error) {
      console.error('Erreur API:', error);
      this.repos = [];
    } finally {
      this.isLoading = false;
    }
  }

  // ============================================
  // HEURISTIQUES DE DÉTECTION
  // ============================================
  processData() {
    const categoriesMap = new Map();

    this.repos.forEach(repo => {
      const topics = repo.topics || [];
      const name = repo.name.toLowerCase();
      const desc = (repo.description || "").toLowerCase();
      const fullText = `${name} ${desc}`;

      // 1. DÉTECTION DE LA MATIÈRE (Sujet)
      let subjectId = 'autres';

      // Priorité 1 : Topics explicites
      for (const [id, cfg] of Object.entries(SUBJECTS_CONFIG)) {
        if (topics.includes(id)) {
          subjectId = id;
          break;
        }
      }

      // Priorité 2 : Mots-clés dans le nom ou la description (Heuristiques)
      if (subjectId === 'autres') {
        const keywordsMaths = ['maths', 'fonctions', 'polynome', 'suite', 'stats', 'statistique', 'geometrie', 'algebre', 'ln', 'expo', 'derivee'];
        const keywordsSciences = ['science', 'chimie', 'physique', 'electro', 'signal', 'sonore', 'moteur', 'optique', 'atome', 'oxydo'];
        const keywordsInformatique = ['informatique', 'cloud', 'digital', 'py', 'js', 'html', 'code'];
        const keywordsAstronomie = ['planete', 'kepler', 'etoile', 'astronomie', 'soleil'];
        const keywordsSport = ['joj', 'dakar', 'sport', 'olympique'];

        if (keywordsMaths.some(k => fullText.includes(k))) subjectId = 'maths';
        else if (keywordsSciences.some(k => fullText.includes(k))) subjectId = 'sciences';
        else if (keywordsInformatique.some(k => fullText.includes(k))) subjectId = 'informatique';
        else if (keywordsAstronomie.some(k => fullText.includes(k))) subjectId = 'astronomie';
        else if (keywordsSport.some(k => fullText.includes(k))) subjectId = 'sport';
      }

      // 2. DÉTECTION DU NIVEAU
      let level = 'Tous niveaux';

      // Priorité 1 : Topics
      const levelTopics = ['3eme', 'cap', '2nde', '1ere', 'terminale', 'bacpro'];
      const foundLevelTopic = topics.find(t => levelTopics.includes(t));

      if (foundLevelTopic) {
        const labels = { '3eme': '3ème PM', 'cap': 'CAP', '2nde': '2nde Bac Pro', '1ere': '1ère S', 'terminale': 'Terminale', 'bacpro': 'Bac Pro' };
        level = labels[foundLevelTopic] || foundLevelTopic;
      } else {
        // Priorité 2 : Préfixes ou mots-clés
        for (const [prefix, label] of Object.entries(LEVEL_FALLBACKS)) {
          if (name.includes(prefix)) {
            level = label;
            break;
          }
        }
        // Heuristique supplémentaire
        if (level === 'Tous niveaux') {
          if (fullText.includes('bac pro')) level = 'Bac Pro';
          else if (fullText.includes('lycee pro')) level = 'Lycée Pro';
          else if (fullText.includes('premiere s')) level = '1ère S';
        }
      }

      // 3. FORMATAGE
      const repoObj = {
        name: repo.name,
        title: this.formatTitle(repo.name, repo.description),
        description: repo.description || "Exploration et ressources éducatives.",
        level: level,
        subject: SUBJECTS_CONFIG[subjectId].name,
        color: SUBJECTS_CONFIG[subjectId].color,
        icon: SUBJECTS_CONFIG[subjectId].icon,
        tags: topics.length > 0 ? topics : [subjectId, level.toLowerCase().replace(' ', '')],
        updatedAt: new Date(repo.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      };

      if (!categoriesMap.has(subjectId)) {
        categoriesMap.set(subjectId, { ...SUBJECTS_CONFIG[subjectId], repos: [] });
      }
      categoriesMap.get(subjectId).repos.push(repoObj);
    });

    const priority = ['maths', 'sciences', 'informatique', 'astronomie', 'sport', 'culture', 'autres'];
    this.categories = Array.from(categoriesMap.values()).sort((a, b) => {
      const idxA = priority.indexOf(Object.keys(SUBJECTS_CONFIG).find(k => SUBJECTS_CONFIG[k].name === a.name));
      const idxB = priority.indexOf(Object.keys(SUBJECTS_CONFIG).find(k => SUBJECTS_CONFIG[k].name === b.name));
      return idxA - idxB;
    });
  }

  formatTitle(name, description) {
    if (description && description.length > 5 && description.length < 50 && !description.includes('http')) return description;
    return name
      .replace(/bacpro/gi, '')
      .replace(/bac-pro/gi, '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .trim()
      .replace(/\b[a-z]/g, l => l.toUpperCase());
  }

  // ============================================
  // RENDER UI
  // ============================================
  renderLoading() {
    document.getElementById('sections-container').innerHTML = `
      <div class="no-results">
        <div class="no-results__icon">⏳</div>
        <h3 class="no-results__title">Synchronisation...</h3>
        <p class="no-results__text">Connexion à GitHub pour récupérer vos 38 dépôts.</p>
      </div>
    `;
  }

  renderStats() {
    const total = this.repos.length;
    document.getElementById('stat-repos').textContent = total;
    document.getElementById('stat-categories').textContent = this.categories.length;
    document.getElementById('stat-subjects').textContent = new Set(this.repos.map(r => r.language)).size || 5;
  }

  renderFilters() {
    const container = document.getElementById('filters-row');
    let html = `<button class="filter-chip active" data-filter="all">
      <span>📚</span> Tout <span class="filter-chip__count">${this.repos.length}</span>
    </button>`;

    this.categories.forEach(cat => {
      html += `<button class="filter-chip" data-filter="${cat.name}">
        <span>${cat.icon}</span> ${cat.name} <span class="filter-chip__count">${cat.repos.length}</span>
      </button>`;
    });

    container.innerHTML = html;
  }

  renderSections() {
    const container = document.getElementById('sections-container');
    let html = '';
    let foundAny = false;

    this.categories.forEach((cat, idx) => {
      const filtered = cat.repos.filter(repo => {
        const matchesFilter = this.currentFilter === 'all' || repo.subject === this.currentFilter;
        const search = this.searchQuery.toLowerCase();
        return matchesFilter && (search === '' || repo.title.toLowerCase().includes(search) || repo.description.toLowerCase().includes(search));
      });

      if (filtered.length === 0) return;
      foundAny = true;

      html += `
        <section class="section fade-in" style="animation-delay: ${idx * 0.1}s">
          <div class="section__header">
            <div class="section__icon" style="background: ${cat.color}15; color: ${cat.color};">${cat.icon}</div>
            <div>
              <h2 class="section__title">${cat.name}</h2>
              <span class="section__count">${filtered.length} ressource${filtered.length > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div class="cards-grid">
            ${filtered.map((r, i) => this.renderCard(r, i)).join('')}
          </div>
        </section>
      `;
    });

    container.innerHTML = foundAny ? html : this.renderNoResults();
  }

  renderCard(repo, index) {
    const pagesUrl = `https://${CONFIG.githubUser}.github.io/${repo.name}/`;
    const repoUrl = `https://github.com/${CONFIG.githubUser}/${repo.name}`;

    return `
      <article class="repo-card fade-in stagger-${(index % 5) + 1}" onclick="window.open('${pagesUrl}', '_blank')">
        <div class="repo-card__accent" style="background: ${repo.color};"></div>
        <div class="repo-card__header">
          <div class="repo-card__icon" style="background: ${repo.color}18; color: ${repo.color};">${repo.icon || '📄'}</div>
          <h3 class="repo-card__title">${repo.title}</h3>
          <span class="repo-card__level">${repo.level}</span>
        </div>
        <p class="repo-card__description">${repo.description}</p>
        <div class="repo-card__tags">
          ${repo.tags.slice(0, 3).map(t => `<span class="repo-card__tag">${t}</span>`).join('')}
        </div>
        <div class="repo-card__footer">
          <div class="repo-card__links">
            <a href="${pagesUrl}" target="_blank" class="repo-card__link repo-card__link--site" onclick="event.stopPropagation()">🌐 Visiter</a>
            <a href="${repoUrl}" target="_blank" class="repo-card__link repo-card__link--github" onclick="event.stopPropagation()">⌨ Code</a>
          </div>
          <span class="repo-card__updated">MàJ: ${repo.updatedAt}</span>
        </div>
      </article>
    `;
  }

  renderNoResults() {
    return `<div class="no-results">🔍 Aucun dépôt trouvé.</div>`;
  }

  bindEvents() {
    document.getElementById('filters-row').addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      this.currentFilter = chip.dataset.filter;
      this.renderSections();
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderSections();
      });
    }
  }

  initScrollEffects() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }
}
