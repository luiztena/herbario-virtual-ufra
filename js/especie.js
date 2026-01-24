// =============================================
// CONSTANTES E CONFIGURAÇÕES
// =============================================

const CONFIG = {
  POSSIBLE_JSON_PATHS: [
    '{basePath}data/especies.json',
    '/data/especies.json',
    'data/especies.json',
    '../data/especies.json'
  ],
  KNOWN_FOLDERS: ['html', 'js', 'css', 'data', 'imagens', 'images']
};

// =============================================
// FUNÇÕES UTILITÁRIAS
// =============================================

function getBasePath() {
  const path = window.location.pathname;
  const cleanPath = path.split('?')[0].split('#')[0];
  
  if (cleanPath.includes('/html/')) {
    return cleanPath.substring(0, cleanPath.indexOf('/html/') + 1);
  }
  
  const parts = cleanPath.split('/').filter(p => p && !p.endsWith('.html'));
  
  if (parts.length === 0) return '/';
  
  const firstPart = parts[0].toLowerCase();
  
  if (!CONFIG.KNOWN_FOLDERS.includes(firstPart)) {
    return `/${parts[0]}/`;
  }
  
  return '/';
}

function createElement(tag, attributes = {}, styles = {}) {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'innerHTML' || key === 'textContent') {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  Object.entries(styles).forEach(([key, value]) => {
    element.style[key] = value;
  });
  
  return element;
}

// =============================================
// FUNÇÕES DE NAVEGAÇÃO
// =============================================

function setupFamilyButton(especieData) {
  const button = document.getElementById("back-to-family-btn");
  if (!button) return;
  
  const basePath = getBasePath();
  
  if (especieData.family) {
    button.href = `${basePath}html/familia.html?id=${especieData.family}`;
  } else {
    button.href = "#";
    button.style.opacity = "0.5";
    button.style.cursor = "not-allowed";
    button.onclick = (e) => e.preventDefault();
  }
}

function setupGenusButton(especieData) {
  const button = document.getElementById("back-to-genero-btn");
  if (!button) return;
  
  const basePath = getBasePath();
  
  if (especieData.genero) {
    button.href = `${basePath}html/genero.html?id=${especieData.genero}`;
  } else {
    button.href = "#";
    button.style.opacity = "0.5";
    button.style.cursor = "not-allowed";
    button.onclick = (e) => e.preventDefault();
  }
}

function setupCatalogButton() {
  const button = document.querySelector(".back-to-index-btn");
  if (!button) return;
  
  const basePath = getBasePath();
  button.href = `${basePath}index.html`;
}

// =============================================
// FUNÇÕES DE GALERIA (ABRIR EM NOVA ABA)
// =============================================

function setupGalleryClick() {
  const galeriaContainer = document.getElementById("galeria-container");
  if (!galeriaContainer) return;
  
  const images = galeriaContainer.querySelectorAll('img');
  
  images.forEach(img => {
    // Adiciona cursor pointer
    img.style.cursor = 'pointer';
    
    // Remove qualquer evento anterior
    img.onclick = null;
    
    // Adiciona evento para abrir em nova aba
    img.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Abre a imagem em uma nova aba
      window.open(this.src, '_blank');
    };
    
    // Adiciona efeitos hover
    img.onmouseover = function() {
      this.style.opacity = '0.85';
      this.style.transform = 'scale(1.02)';
      this.style.transition = 'all 0.2s ease';
    };
    
    img.onmouseout = function() {
      this.style.opacity = '1';
      this.style.transform = 'scale(1)';
    };
    
    // Adiciona título para indicar que abre em nova aba
    if (!img.title) {
      img.title = 'Clique para abrir imagem em uma nova aba';
    }
  });
  
  console.log(`Configuradas ${images.length} imagens para abrir em nova aba`);
}

// =============================================
// FUNÇÕES DE CARREGAMENTO DE DADOS
// =============================================

function loadSpeciesData(especie) {
  const basePath = getBasePath();
  
  // 1. Nome da espécie
  const nomeElement = document.getElementById("especie-nome");
  if (nomeElement) {
    nomeElement.textContent = especie.name || "Nome não disponível";
  }
  
  // 2. Descrição longa
  const descricaoElement = document.getElementById("especie-artigo");
  if (descricaoElement) {
    if (especie.descricaoLonga && Array.isArray(especie.descricaoLonga)) {
      descricaoElement.innerHTML = '';
      especie.descricaoLonga.forEach(paragrafo => {
        const p = createElement('p', {
          textContent: paragrafo
        }, {
          marginBottom: '1rem',
          lineHeight: '1.6',
          textAlign: 'justify'
        });
        descricaoElement.appendChild(p);
      });
    } else {
      descricaoElement.innerHTML = '<p style="color: #666; font-style: italic;">Descrição detalhada não disponível.</p>';
    }
  }
  
  // 3. Ficha botânica
  const fichaLista = document.getElementById("ficha-lista");
  if (fichaLista) {
    if (especie.ficha && typeof especie.ficha === 'object') {
      fichaLista.innerHTML = '';
      Object.entries(especie.ficha).forEach(([chave, valor]) => {
        const valorTexto = Array.isArray(valor) ? valor.join(", ") : valor;
        const li = createElement('li', {
          innerHTML: `<strong style="color: #416939; min-width: 200px; display: inline-block;">${chave}:</strong> <span>${valorTexto}</span>`
        }, {
          marginBottom: "0.5rem",
          padding: "0.5rem",
          borderBottom: "1px solid #eee"
        });
        fichaLista.appendChild(li);
      });
    } else {
      fichaLista.innerHTML = '<li style="color: #666; font-style: italic;">Ficha botânica não disponível.</li>';
    }
  }
  
  // 4. Galeria de imagens
  loadGallery(especie, basePath);
  
  // 5. Título da página
  document.title = `${especie.name || 'Espécie'} - Herbário Virtual`;
}

function loadGallery(especie, basePath) {
  const galeriaContainer = document.getElementById("galeria-container");
  const galeriaSection = document.getElementById("galeria-section");
  
  if (!galeriaContainer) return;
  
  galeriaContainer.innerHTML = '';
  
  if (especie.image) {
    // Processa o caminho da imagem
    let imagePath = especie.image;
    if (imagePath.startsWith('../')) {
      imagePath = imagePath.substring(3);
    }
    
    let finalImagePath;
    if (imagePath.startsWith('/') || imagePath.startsWith('http')) {
      finalImagePath = imagePath;
    } else if (imagePath.startsWith('imagens/')) {
      finalImagePath = `${basePath}${imagePath}`;
    } else {
      finalImagePath = `${basePath}${imagePath}`;
    }
    
    // Cria card da imagem
    const card = createElement('div', {}, {
      cursor: 'pointer',
      width: '250px',
      margin: '10px',
      display: 'inline-block',
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'all 0.3s'
    });
    
    // Adiciona título no card
    card.title = 'Clique para abrir imagem em uma nova aba';
    
    card.onmouseover = () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    };
    
    card.onmouseout = () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    };
    
    // Adiciona clique no card também
    card.onclick = (e) => {
      e.stopPropagation();
      window.open(finalImagePath, '_blank');
    };
    
    const img = createElement('img', {
      src: finalImagePath,
      alt: especie.name,
      loading: 'lazy',
      title: 'Clique para abrir imagem em uma nova aba'
    }, {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      cursor: 'pointer'
    });
    
    const cardBody = createElement('div', {
      innerHTML: `<h3 style="margin: 0; font-size: 1.1rem; color: #416939;">${especie.name}</h3>`
    }, {
      padding: '15px'
    });
    
    card.appendChild(img);
    card.appendChild(cardBody);
    galeriaContainer.appendChild(card);
    
    if (galeriaSection) {
      galeriaSection.style.display = "block";
    }
    
    // Configura os cliques após carregar a imagem
    setTimeout(() => {
      setupGalleryClick();
    }, 100);
  } else {
    if (galeriaSection) {
      galeriaSection.style.display = "none";
    }
  }
}

async function loadSpeciesDataFromJSON(basePath) {
  for (const pathTemplate of CONFIG.POSSIBLE_JSON_PATHS) {
    const url = pathTemplate.replace('{basePath}', basePath);
    
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      continue;
    }
  }
  
  throw new Error('Não foi possível carregar especies.json');
}

// =============================================
// FUNÇÃO PRINCIPAL
// =============================================

async function carregarEspecie() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const basePath = getBasePath();
  
  console.log("ID DA ESPÉCIE:", id);
  console.log("BASE PATH:", basePath);
  
  if (!id) {
    window.location.href = `${basePath}404.html`;
    return;
  }
  
  try {
    // Carrega dados da espécie
    const especies = await loadSpeciesDataFromJSON(basePath);
    const especie = especies[id];
    
    if (!especie) {
      console.log("Espécie não encontrada com ID:", id);
      window.location.href = `${basePath}404.html`;
      return;
    }
    
    console.log("ESPÉCIE SELECIONADA:", especie);
    
    // Configura botões de navegação
    setupFamilyButton(especie);
    setupGenusButton(especie);
    setupCatalogButton();
    
    // Carrega dados da espécie
    loadSpeciesData(especie);
    
    console.log("Espécie carregada com sucesso!");
    console.log("Nome:", especie.name);
    console.log("Família:", especie.family);
    console.log("Gênero:", especie.genero);
    console.log("Tem descrição longa?", especie.descricaoLonga ? "Sim" : "Não");
    console.log("Tem ficha?", especie.ficha ? "Sim" : "Não");
    console.log("Tem imagem?", especie.image ? "Sim" : "Não");
    
  } catch (erro) {
    console.error("Erro ao carregar espécie:", erro);
    window.location.href = `${getBasePath()}404.html`;
  }
}

// =============================================
// INICIALIZAÇÃO
// =============================================

document.addEventListener("DOMContentLoaded", carregarEspecie);