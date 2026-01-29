// COLOCAR NO INÍCIO DO ARQUIVO
(function() {
  // Sobrescrever addEventListener temporariamente para debug
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    // Verificar se é um listener que pode causar problemas
    if (type === 'keydown' || type === 'click' || type === 'input') {
      const wrappedListener = function(event) {
        try {
          // Se o listener retornar uma Promise, tratar corretamente
          const result = listener.call(this, event);
          
          // Se for uma Promise, garantir que não cause erro
          if (result && typeof result.then === 'function') {
            result.catch(error => {
              console.warn(`Promise rejeitada em listener ${type}:`, error);
            });
            return false; // Não retornar a Promise diretamente
          }
          
          return result;
        } catch (error) {
          console.error(`Erro em listener ${type}:`, error);
          return true; // Prevenir propagação do erro
        }
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
})();


let familias = null;
let subfamilias = null;  // ← NOVO: subfamílias
let generos = null;
let especies = null;
let bancoBusca = [];

// Função para obter o caminho base do repositório (funciona no GitHub Pages)
function getBasePath() {
  const path = window.location.pathname;
  
  // Remove query string e hash se existirem
  let cleanPath = path.split('?')[0].split('#')[0];
  
  console.log('Path completo:', path);
  console.log('Path limpo:', cleanPath);
  
  // Se estiver em html/familia.html ou html/genero.html
  if (cleanPath.includes('/html/')) {
    // Pega tudo antes de /html/
    const base = cleanPath.substring(0, cleanPath.indexOf('/html/') + 1);
    console.log('Detectado caminho com /html/, basePath:', base);
    return base;
  }
  
  // Se estiver na raiz ou em outro arquivo
  // Para repositórios username.github.io (sem subpasta), retorna '/'
  // Para repositórios com nome (ex: /herbario-virtual-ufra/), detecta o nome
  const parts = cleanPath.split('/').filter(p => p && !p.endsWith('.html'));
  
  console.log('Parts após split:', parts);
  
  // Se não há partes ou só tem arquivos HTML, está na raiz do domínio
  if (parts.length === 0) {
    console.log('Nenhuma parte detectada, usando raiz: /');
    return '/';
  }
  
  // Se a primeira parte não é uma pasta conhecida do projeto, assume que é o nome do repositório
  const knownFolders = ['html', 'js', 'css', 'data', 'imagens', 'images'];
  const firstPart = parts[0].toLowerCase();
  
  console.log('Primeira parte:', firstPart, 'Está em knownFolders?', knownFolders.includes(firstPart));
  
  if (!knownFolders.includes(firstPart)) {
    const repoBase = `/${parts[0]}/`;
    console.log('Repositório detectado:', repoBase);
    return repoBase;
  }
  
  console.log('Usando raiz padrão: /');
  return '/';
}

// ===============================
// CARREGAR DADOS
// ===============================
async function carregarFamilias() {
  try {
    const resposta = await fetch("data/familias.json");
    if (!resposta.ok) throw new Error("Erro ao carregar familias.json");
    
    familias = await resposta.json();
    Object.freeze(familias);
    console.log("Famílias carregadas:", familias);
  } catch (erro) {
    console.error("Erro:", erro);
  }
}

// ← NOVO: Função para carregar subfamílias
async function carregarSubfamilias() {
  try {
    const resposta = await fetch("data/subfamilias.json");
    if (!resposta.ok) {
      console.warn("subfamilias.json não encontrado (normal se não usar Fabaceae)");
      subfamilias = {};
      return;
    }
    
    subfamilias = await resposta.json();
    Object.freeze(subfamilias);
    console.log("Subfamílias carregadas:", subfamilias);
  } catch (erro) {
    console.warn("Erro ao carregar subfamilias.json:", erro);
    subfamilias = {};
  }
}

async function carregarGeneros() {
  try {
    const resposta = await fetch("data/generos.json");
    if (!resposta.ok) throw new Error("Erro ao carregar generos.json");
    
    generos = await resposta.json();
    Object.freeze(generos);
    console.log("Gêneros carregados:", generos);
  } catch (erro) {
    console.error("Erro:", erro);
  }
}

async function carregarEspecies() {
  try {
    const basePath = getBasePath();
    const possiblePaths = [
      `${basePath}data/especies.json`,
      `data/especies.json`,
      `/data/especies.json`,
      `../data/especies.json`
    ];
    
    let especiesData = null;
    for (const url of possiblePaths) {
      try {
        console.log('Tentando carregar espécies de:', url);
        const res = await fetch(url);
        if (res.ok) {
          especiesData = await res.json();
          console.log('Espécies carregadas de:', url);
          break;
        }
      } catch (e) {
        console.log('Falha ao carregar espécies de:', url, e);
        continue;
      }
    }
    
    if (!especiesData) {
      console.warn("Não foi possível carregar especies.json");
      especies = {};
      return;
    }
    
    especies = especiesData;
    Object.freeze(especies);
    console.log("Espécies carregadas:", Object.keys(especies).length);
  } catch (erro) {
    console.error("Erro ao carregar espécies:", erro);
    especies = {};
  }
}

async function carregarCards() {
  try {
    const basePath = getBasePath();
    console.log('Carregando cards com basePath:', basePath);
    
    // Tenta diferentes caminhos possíveis para cards.html
    const possiblePaths = [
      `${basePath}data/cards.html`,
      `data/cards.html`,
      `/data/cards.html`,
      `../data/cards.html`
    ];
    
    let html = null;
    for (const url of possiblePaths) {
      try {
        console.log('Tentando carregar cards de:', url);
        const res = await fetch(url);
        if (res.ok) {
          html = await res.text();
          console.log('Sucesso ao carregar cards de:', url);
          break;
        }
      } catch (e) {
        console.log('Falha ao carregar cards de:', url, e);
        continue;
      }
    }
    
    if (!html) {
      throw new Error("Erro ao carregar cards");
    }
    
    // Substitui todos os caminhos relativos pelos caminhos corretos
    html = html.replace(/href="\.\.\/html\//g, `href="${basePath}html/`);
    html = html.replace(/src="\s*imagens\//g, `src="${basePath}imagens/`);
    html = html.replace(/src="\s*\.\.\/imagens\//g, `src="${basePath}imagens/`);
    
    console.log('HTML processado, basePath:', basePath);
    
    const container = document.getElementById("cards-container");
    if (container) {
      container.innerHTML = html;
      
      const links = container.querySelectorAll('a.card-link[href*="familia.html"], a.card-link[href*="genero.html"]');
      console.log(`Encontrados ${links.length} links para processar`);
      
      links.forEach(link => {
        const originalHref = link.getAttribute('href');
        console.log('Link original:', originalHref);
        
        if (originalHref.startsWith('../html/')) {
          const newHref = `${basePath}html/${originalHref.substring(8)}`;
          link.setAttribute('href', newHref);
          console.log('Link corrigido para:', newHref);
        }
        else if (originalHref.startsWith('/html/') && !originalHref.startsWith(basePath)) {
          const newHref = `${basePath}html/${originalHref.substring(6)}`;
          link.setAttribute('href', newHref);
          console.log('Link corrigido para:', newHref);
        }
        else if (originalHref.startsWith('html/') && !originalHref.startsWith(basePath)) {
          const newHref = `${basePath}${originalHref}`;
          link.setAttribute('href', newHref);
          console.log('Link corrigido para:', newHref);
        }
      });
      
      aplicarFiltros();
    }
  } catch (e) {
    console.error("Erro ao carregar cards:", e);
  }
}

// ===============================
// MONTAR BANCO DE BUSCA
// ===============================
function montarBancoBusca() {
  bancoBusca = [];

  // Famílias
  if (familias) {
    const basePath = getBasePath();
    console.log('BasePath detectado para montar banco de busca:', basePath);
    Object.values(familias).forEach(f => {
      let familiaPage = f.page || `${basePath}html/familia.html?id=${f.id}`;
      if (familiaPage.startsWith('../')) {
        familiaPage = familiaPage.replace('../', basePath);
        console.log(`Corrigido caminho de "${f.page}" para "${familiaPage}"`);
      } else if (!familiaPage.startsWith('/') && !familiaPage.startsWith('http')) {
        familiaPage = `${basePath}${familiaPage}`;
      }
      
      bancoBusca.push({
        id: f.id,
        name: f.name,
        key: normalize(f.id),
        tipo: "Família",
        page: familiaPage,
        searchTerms: [normalize(f.name), normalize(f.id)]
      });
    });
  }

  // ← NOVO: Subfamílias
  if (subfamilias && Object.keys(subfamilias).length > 0) {
    const basePath = getBasePath();
    Object.values(subfamilias).forEach(s => {
      let subfamiliaPage = s.page || `${basePath}html/subfamilia.html?id=${s.id}`;
      if (subfamiliaPage.startsWith('../')) {
        subfamiliaPage = subfamiliaPage.replace('../', basePath);
      } else if (!subfamiliaPage.startsWith('/') && !subfamiliaPage.startsWith('http')) {
        subfamiliaPage = `${basePath}${subfamiliaPage}`;
      }
      
      bancoBusca.push({
        id: s.id,
        name: s.name,
        key: normalize(s.id),
        tipo: "Subfamília",
        page: subfamiliaPage,
        searchTerms: [normalize(s.name), normalize(s.id)]
      });
    });
    console.log(`${Object.keys(subfamilias).length} subfamílias adicionadas ao banco de busca`);
  }

  // Gêneros
  if (generos) {
    const basePath = getBasePath();
    Object.values(generos).forEach(g => {
      bancoBusca.push({
        id: g.id,
        name: g.name,
        key: normalize(g.id),
        tipo: "Gênero",
        page: `${basePath}html/genero.html?id=${g.id}`,
        searchTerms: [normalize(g.name), normalize(g.id)]
      });
    });
  }

  // Espécies (COM NOMES POPULARES)
  if (especies) {
    const basePath = getBasePath();
    Object.values(especies).forEach(e => {
      let especiePage = e.page || `${basePath}html/especie.html?id=${e.id}`;
      if (especiePage.startsWith('../')) {
        especiePage = especiePage.replace('../', basePath);
      } else if (!especiePage.startsWith('/') && !especiePage.startsWith('http')) {
        especiePage = `${basePath}${especiePage}`;
      }
      
      // Extrair nome popular da ficha
      let nomePopular = '';
      if (e.ficha && e.ficha['Nome popular']) {
        nomePopular = e.ficha['Nome popular'];
      }
      
      // Criar termos de busca incluindo nome científico, ID e todos os nomes populares
      const searchTerms = [
        normalize(e.name),
        normalize(e.id)
      ];
      
      // Adicionar todos os nomes populares separados
      if (nomePopular && nomePopular !== 'Desconhecido') {
        // Separa por vírgula e adiciona cada nome popular
        const nomesPopulares = nomePopular.split(',').map(n => n.trim());
        nomesPopulares.forEach(nome => {
          if (nome) {
            searchTerms.push(normalize(nome));
          }
        });
      }
      
      bancoBusca.push({
        id: e.id,
        name: e.name,
        nomePopular: nomePopular,
        key: normalize(e.id),
        tipo: "Espécie",
        page: especiePage,
        searchTerms: searchTerms
      });
    });
  }

  console.log("Banco de busca pronto com", bancoBusca.length, "itens (Famílias:", familias ? Object.keys(familias).length : 0, 
              "Gêneros:", generos ? Object.keys(generos).length : 0, 
              "Espécies:", especies ? Object.keys(especies).length : 0, ")");
}

// ===============================
// UTILITÁRIOS
// ===============================
function normalize(text) {
  if (!text) return '';
  return text.toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '');
}

function scientificCapitalize(name) {
  return name
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function darkenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  
  return "#" + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}

// ===============================
// LEVENSHTEIN
// ===============================
function levenshteinDistance(a, b) {
  const m = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) m[i][0] = i;
  for (let j = 0; j <= b.length; j++) m[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] =
        a[i - 1] === b[j - 1]
          ? m[i - 1][j - 1]
          : Math.min(
              m[i - 1][j - 1] + 1,
              m[i][j - 1] + 1,
              m[i - 1][j] + 1
            );
    }
  }
  return m[a.length][b.length];
}

// ===============================
// BUSCA APROXIMADA (MODIFICADA PARA NOMES POPULARES)
// ===============================
function fuzzySearch(query) {
  let best = null;
  let score = Infinity;

  bancoBusca.forEach(item => {
    // Verifica todos os termos de busca do item
    if (item.searchTerms) {
      item.searchTerms.forEach(term => {
        const d = levenshteinDistance(query, term);
        if (d < score) {
          score = d;
          best = item;
        }
      });
    } else {
      // Fallback para busca antiga
      const d = levenshteinDistance(query, item.key);
      if (d < score) {
        score = d;
        best = item;
      }
    }
  });

  return score <= 3 ? best : null; // Aumentei a tolerância para 3
}

// ===============================
// BUSCA PRINCIPAL (MODIFICADA)
// ===============================
function searchPlant() {
  const input = document.getElementById("search-bar");
  const didYouMean = document.getElementById("did-you-mean");
  const autocomplete = document.getElementById("autocomplete-list");

  if (!input || !didYouMean || !autocomplete) return;

  didYouMean.innerHTML = "";
  autocomplete.innerHTML = "";

  const query = normalize(input.value);
  if (!query) return;

  // 🔹 Busca exata em todos os termos de busca
  const exato = bancoBusca.find(item => {
    if (item.searchTerms) {
      return item.searchTerms.some(term => term === query);
    }
    return item.key === query;
  });

  if (exato) {
    window.location.href = exato.page;
    return;
  }

  // 🔹 Busca aproximada (Levenshtein)
  const melhor = fuzzySearch(query);

  if (melhor) {
    let badgeColor;
    switch(melhor.tipo) {
      case 'Família':
        badgeColor = '#416939';
        break;
      case 'Subfamília':  // ← NOVO: cor para subfamília
        badgeColor = '#5a7c4a';
        break;
      case 'Gênero':
        badgeColor = '#52796f';
        break;
      case 'Espécie':
        badgeColor = '#8a5a44';
        break;
      default:
        badgeColor = '#666';
    }
    
    const badgeStyle = `
      background-color: ${badgeColor};
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: 10px;
    `;
    
    // Mostrar nome popular se for espécie e tiver nome popular
    let displayName = melhor.name;
    if (melhor.tipo === 'Espécie' && melhor.nomePopular && melhor.nomePopular !== 'Desconhecido') {
      displayName = `${melhor.name} (${melhor.nomePopular})`;
    }
    
    didYouMean.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>Você quis dizer</span>
        <div style="display: flex; align-items: center; gap: 6px; background: #f5f7f2; padding: 8px 12px; border-radius: 8px; border: 1px solid #ddd;">
          <span id="vqd" class="suggestion-text">
            ${displayName}
          </span>
          <span style="${badgeStyle}">${melhor.tipo}</span>
        </div>
        <span>?</span>
      </div>
      <div style="text-align: center; margin-top: 10px; font-size: 0.9rem; color: #666;">
        Clique no nome para acessar
      </div>
    `;

    document.getElementById("vqd").onclick = () => {
      window.location.href = melhor.page;
    };
    
    const vqdElement = document.getElementById("vqd");
    vqdElement.style.cursor = "pointer";
    vqdElement.style.color = badgeColor;
    vqdElement.style.fontWeight = "600";
    vqdElement.style.transition = "color 0.2s ease";
    
    vqdElement.addEventListener("mouseover", () => {
      vqdElement.style.color = darkenColor(badgeColor, 20);
      vqdElement.style.textDecoration = "underline";
    });
    
    vqdElement.addEventListener("mouseout", () => {
      vqdElement.style.color = badgeColor;
      vqdElement.style.textDecoration = "none";
    });
    
    return;
  }

  // 🔹 Não encontrado
  didYouMean.innerHTML = `
    <div style="text-align: center; padding: 15px;">
      <div style="color: #666; margin-bottom: 10px;">
        Não foi possível encontrar o que você procura.
      </div>
      <span id="again" style="
        cursor: pointer;
        color: #416939;
        font-weight: 600;
        text-decoration: underline;
        padding: 8px 16px;
        border: 1px solid #416939;
        border-radius: 20px;
        display: inline-block;
        transition: all 0.3s ease;
      ">
        Tentar novamente
      </span>
    </div>
  `;

  document.getElementById("again").onclick = () => {
    input.value = "";
    input.focus();
    didYouMean.innerHTML = "";
  };
  
  const againElement = document.getElementById("again");
  againElement.addEventListener("mouseover", () => {
    againElement.style.backgroundColor = "#416939";
    againElement.style.color = "white";
  });
  
  againElement.addEventListener("mouseout", () => {
    againElement.style.backgroundColor = "transparent";
    againElement.style.color = "#416939";
  });
}

// ===============================
// AUTOCOMPLETE (MODIFICADO PARA NOMES POPULARES)
// ===============================
function atualizarAutocomplete() {
  const searchInput = document.getElementById("search-bar");
  const autocomplete = document.getElementById("autocomplete-list");
  
  if (!searchInput || !autocomplete) return;
  
  const value = normalize(searchInput.value);
  autocomplete.innerHTML = "";
  
  if (!value) return;

  // Busca em todos os termos de busca
  const resultados = bancoBusca
    .filter(item => {
      if (item.searchTerms) {
        return item.searchTerms.some(term => term.includes(value));
      }
      return item.key.includes(value);
    })
    .slice(0, 8);

  if (resultados.length === 0) return;

  resultados.forEach(item => {
    const li = document.createElement("li");
    
    let badgeColor;
    switch(item.tipo) {
      case 'Família':
        badgeColor = '#416939';
        break;
      case 'Subfamília':  // ← NOVO: cor para subfamília
        badgeColor = '#5a7c4a';
        break;
      case 'Gênero':
        badgeColor = '#52796f';
        break;
      case 'Espécie':
        badgeColor = '#8a5a44';
        break;
      default:
        badgeColor = '#666';
    }
    
    // Mostrar nome popular no autocomplete
    let displayName = item.name;
    let subtitle = '';
    if (item.tipo === 'Espécie' && item.nomePopular && item.nomePopular !== 'Desconhecido') {
      subtitle = `<div style="font-size: 0.85rem; color: #666; font-style: italic; margin-top: 2px;">${item.nomePopular}</div>`;
    }
    
    li.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div style="flex: 1;">
          <div style="font-weight: 500; color: #333;">${displayName}</div>
          ${subtitle}
        </div>
        <span style="
          background-color: ${badgeColor};
          color: white;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          min-width: 70px;
          text-align: center;
        ">${item.tipo}</span>
      </div>
    `;
    
    li.style.cursor = "pointer";
    li.style.padding = "10px 12px";
    li.style.borderBottom = "1px solid #e0e0e0";
    li.style.transition = "all 0.2s ease";
    
    li.addEventListener("mouseover", () => {
      li.style.backgroundColor = "#f5f7f2";
      li.style.transform = "translateX(5px)";
    });
    
    li.addEventListener("mouseout", () => {
      li.style.backgroundColor = "";
      li.style.transform = "";
    });
    
    li.onclick = () => {
      window.location.href = item.page;
    };
    
    autocomplete.appendChild(li);
  });
}

// ===============================
// FILTROS
// ===============================
function aplicarFiltros() {
  const botoesFiltro = document.querySelectorAll(".filter-btn");
  
  botoesFiltro.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      
      botoesFiltro.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const cards = document.querySelectorAll(".card-link");
      cards.forEach(link => {
        const card = link.querySelector(".plant-card");
        if (!card) return;
        
        if (filter === "all") {
          link.style.display = "block";
        } else {
          link.style.display = card.classList.contains(filter) ? "block" : "none";
        }
      });
    });
  });
}

// ===============================
// CAPTURAR ERROS GLOBAIS
// ===============================
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Promise não tratada:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.warn('Erro global:', event.error);
  return true;
});

// ===============================
// EVENTOS
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM carregado, inicializando...");
  
  try {
    await Promise.all([
      carregarFamilias(),
      carregarSubfamilias(),  // ← NOVO: carrega subfamílias
      carregarGeneros(),
      carregarEspecies()
    ]);
    
    montarBancoBusca();
    
    await carregarCards();
    
    configurarEventos();
    
  } catch (erro) {
    console.error("Erro na inicialização:", erro);
  }
});

function configurarEventos() {
  const searchInput = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-btn");
  
  if (searchBtn) {
    searchBtn.addEventListener("click", (event) => {
      event.preventDefault();
      searchPlant();
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchPlant();
      }
      
      if (event.key === "Escape") {
        const autocomplete = document.getElementById("autocomplete-list");
        const didYouMean = document.getElementById("did-you-mean");
        if (autocomplete) autocomplete.innerHTML = "";
        if (didYouMean) didYouMean.innerHTML = "";
        searchInput.blur();
      }
    });
    
    let timeoutId;
    searchInput.addEventListener("input", () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        atualizarAutocomplete();
      }, 150);
    });
    
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) {
        atualizarAutocomplete();
      }
    });
  }
  
  document.addEventListener("click", (event) => {
    const searchInput = document.getElementById("search-bar");
    const autocomplete = document.getElementById("autocomplete-list");
    
    if (!searchInput || !autocomplete) return;
    
    if (!searchInput.contains(event.target) && !autocomplete.contains(event.target)) {
      autocomplete.innerHTML = "";
    }
  }, true);
}