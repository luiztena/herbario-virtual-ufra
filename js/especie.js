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

// Estado do zoom
const ZOOM_STATE = {
  level: 1,
  levels: [1, 1.5, 3, 5, 7],
  currentIndex: 0,
  posX: 0,
  posY: 0,
  panInterval: null
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
// FUNÇÕES DO MODAL
// =============================================

function createModal() {
  // Verifica se já existe
  if (document.getElementById('image-modal')) return;
  
  const modal = createElement('div', {
    id: 'image-modal'
  }, {
    display: 'none',
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: '10000',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'zoom-in'
  });
  
  const modalContent = createElement('div', {
    id: 'modal-content'
  }, {
    position: 'relative',
    maxWidth: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  });
  
  const modalImage = createElement('img', {
    id: 'modal-image',
    alt: 'Imagem ampliada'
  }, {
    maxWidth: '100%',
    maxHeight: '90vh',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
    cursor: 'zoom-in',
    transform: 'scale(1)'
  });
  
  const closeBtn = createElement('button', {
    id: 'modal-close',
    innerHTML: '&times;'
  }, {
    position: 'absolute',
    top: '20px',
    right: '40px',
    fontSize: '50px',
    color: 'white',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    zIndex: '10001',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
  });
  
  const zoomInfo = createElement('div', {
    id: 'zoom-info',
    textContent: 'Zoom: 1x'
  }, {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '10px 20px',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    zIndex: '10001'
  });
  
  // Container dos botões de navegação
  const navContainer = createElement('div', {
    id: 'nav-arrows'
  }, {
    position: 'absolute',
    bottom: '80px',
    right: '40px',
    width: '120px',
    height: '120px',
    pointerEvents: 'none',
    zIndex: '10002',
    display: 'none' // Oculto inicialmente
  });
  
  // Criar as 4 setas
  const arrows = [
    { id: 'arrow-up', direction: 'up', icon: '↑', style: { top: '0', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'arrow-down', direction: 'down', icon: '↓', style: { bottom: '0', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'arrow-left', direction: 'left', icon: '←', style: { left: '0', top: '50%', transform: 'translateY(-50%)' } },
    { id: 'arrow-right', direction: 'right', icon: '→', style: { right: '0', top: '50%', transform: 'translateY(-50%)' } }
  ];
  
  arrows.forEach(arrow => {
    const btn = createElement('button', {
      id: arrow.id,
      innerHTML: arrow.icon,
      'data-direction': arrow.direction
    }, {
      position: 'absolute',
      ...arrow.style,
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: 'rgba(65, 105, 57, 0.8)',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
      border: '2px solid white',
      cursor: 'pointer',
      pointerEvents: 'auto',
      transition: 'all 0.2s ease',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      zIndex: '10003'
    });
    
    // Efeitos hover
    btn.onmouseenter = function() {
      this.style.backgroundColor = 'rgba(65, 105, 57, 1)';
      this.style.transform = this.style.transform + ' scale(1.1)';
      startPanning(arrow.direction);
    };
    
    btn.onmouseleave = function() {
      this.style.backgroundColor = 'rgba(65, 105, 57, 0.8)';
      const baseTransform = arrow.style.transform || '';
      this.style.transform = baseTransform;
      stopPanning();
    };
    
    navContainer.appendChild(btn);
  });
  
  modalContent.appendChild(modalImage);
  modal.appendChild(modalContent);
  modal.appendChild(closeBtn);
  modal.appendChild(zoomInfo);
  modal.appendChild(navContainer);
  document.body.appendChild(modal);
  
  // Eventos
  closeBtn.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };
  
  // Previne scroll do body quando modal está aberto
  modal.addEventListener('wheel', (e) => {
    e.preventDefault();
  }, { passive: false });
  
  console.log('Modal criado com sucesso!');
}

function openModal(imageSrc, imageAlt) {
  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  
  if (!modal || !modalImage) {
    createModal();
    return openModal(imageSrc, imageAlt);
  }
  
  // Reset zoom state
  ZOOM_STATE.currentIndex = 0;
  ZOOM_STATE.level = ZOOM_STATE.levels[0];
  ZOOM_STATE.posX = 0;
  ZOOM_STATE.posY = 0;
  
  modalImage.src = imageSrc;
  modalImage.alt = imageAlt;
  modalImage.style.transform = 'scale(1)';
  modalImage.style.transformOrigin = 'center center';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  updateZoomInfo();
  updateArrowsVisibility();
  setupImageZoom();
  
  console.log('Modal aberto com imagem:', imageSrc);
}

function closeModal() {
  const modal = document.getElementById('image-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Para qualquer panning em andamento
    stopPanning();
    
    // Reset zoom
    ZOOM_STATE.currentIndex = 0;
    ZOOM_STATE.level = 1;
    ZOOM_STATE.posX = 0;
    ZOOM_STATE.posY = 0;
    
    updateArrowsVisibility();
    
    console.log('Modal fechado');
  }
}

function updateZoomInfo() {
  const zoomInfo = document.getElementById('zoom-info');
  if (zoomInfo) {
    zoomInfo.textContent = `Zoom: ${ZOOM_STATE.level}x`;
  }
}

function updateArrowsVisibility() {
  const navContainer = document.getElementById('nav-arrows');
  if (navContainer) {
    // Detecta se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth <= 768;
    
    // Mostra as setas apenas quando há zoom ativo E não é mobile
    navContainer.style.display = (ZOOM_STATE.level > 1 && !isMobile) ? 'block' : 'none';
  }
}

// =============================================
// FUNÇÕES DE ZOOM
// =============================================

function setupImageZoom() {
  const modalImage = document.getElementById('modal-image');
  const modal = document.getElementById('image-modal');
  
  if (!modalImage) return;
  
  // Remove event listeners anteriores
  const newImage = modalImage.cloneNode(true);
  modalImage.parentNode.replaceChild(newImage, modalImage);
  
  newImage.onclick = (e) => {
    e.stopPropagation();
    
    // Avança para próximo nível de zoom
    ZOOM_STATE.currentIndex = (ZOOM_STATE.currentIndex + 1) % ZOOM_STATE.levels.length;
    ZOOM_STATE.level = ZOOM_STATE.levels[ZOOM_STATE.currentIndex];
    
    // Atualiza cursor
    if (ZOOM_STATE.level === 1) {
      newImage.style.cursor = 'zoom-in';
      modal.style.cursor = 'zoom-in';
    } else if (ZOOM_STATE.level === 7) {
      newImage.style.cursor = 'zoom-out';
      modal.style.cursor = 'zoom-out';
    } else {
      newImage.style.cursor = 'zoom-in';
      modal.style.cursor = 'zoom-in';
    }
    
    // Reset posição ao voltar para zoom 1x
    if (ZOOM_STATE.level === 1) {
      ZOOM_STATE.posX = 0;
      ZOOM_STATE.posY = 0;
      newImage.style.transform = 'scale(1)';
      stopPanning(); // Para qualquer panning ao resetar zoom
    } else {
      newImage.style.transform = `scale(${ZOOM_STATE.level}) translate(${ZOOM_STATE.posX}px, ${ZOOM_STATE.posY}px)`;
    }
    
    updateZoomInfo();
    updateArrowsVisibility();
    
    console.log(`Zoom alterado para: ${ZOOM_STATE.level}x`);
  };
}

// =============================================
// FUNÇÕES DE PAN COM SETAS
// =============================================

function startPanning(direction) {
  // Para qualquer panning anterior
  stopPanning();
  
  // Só permite pan quando há zoom
  if (ZOOM_STATE.level === 1) return;
  
  const modalImage = document.getElementById('modal-image');
  if (!modalImage) return;
  
  const moveSpeed = 2; // Velocidade do scroll (pixels por frame)
  
  ZOOM_STATE.panInterval = setInterval(() => {
    const maxMove = 200 * ZOOM_STATE.level;
    
    switch(direction) {
      case 'up':
        ZOOM_STATE.posY += moveSpeed;
        break;
      case 'down':
        ZOOM_STATE.posY -= moveSpeed;
        break;
      case 'left':
        ZOOM_STATE.posX += moveSpeed;
        break;
      case 'right':
        ZOOM_STATE.posX -= moveSpeed;
        break;
    }
    
    // Limita o movimento
    ZOOM_STATE.posX = Math.max(-maxMove, Math.min(maxMove, ZOOM_STATE.posX));
    ZOOM_STATE.posY = Math.max(-maxMove, Math.min(maxMove, ZOOM_STATE.posY));
    
    // Aplica transformação
    modalImage.style.transform = `scale(${ZOOM_STATE.level}) translate(${ZOOM_STATE.posX}px, ${ZOOM_STATE.posY}px)`;
  }, 16); // ~60 FPS
  
  console.log(`Panning iniciado na direção: ${direction}`);
}

function stopPanning() {
  if (ZOOM_STATE.panInterval) {
    clearInterval(ZOOM_STATE.panInterval);
    ZOOM_STATE.panInterval = null;
    console.log('Panning parado');
  }
}

// =============================================
// FUNÇÕES DE GALERIA
// =============================================

function setupGalleryClick() {
  const galeriaContainer = document.getElementById("galeria-container");
  if (!galeriaContainer) return;
  
  const images = galeriaContainer.querySelectorAll('img');
  
  images.forEach(img => {
    img.style.cursor = 'pointer';
    
    img.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Abre no modal
      openModal(img.src, img.alt);
    };
    
    img.onmouseover = function() {
      this.style.opacity = '0.85';
      this.style.transform = 'scale(1.02)';
      this.style.transition = 'all 0.2s ease';
    };
    
    img.onmouseout = function() {
      this.style.opacity = '1';
      this.style.transform = 'scale(1)';
    };
    
    if (!img.title) {
      img.title = 'Clique para ampliar a imagem';
    }
  });
  
  console.log(`Configuradas ${images.length} imagens para abrir no modal`);
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
    
    card.title = 'Clique para ampliar a imagem';
    
    card.onmouseover = () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    };
    
    card.onmouseout = () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    };
    
    card.onclick = (e) => {
      e.stopPropagation();
      openModal(finalImagePath, especie.name);
    };
    
    const img = createElement('img', {
      src: finalImagePath,
      alt: especie.name,
      loading: 'lazy',
      title: 'Clique para ampliar a imagem'
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
    const especies = await loadSpeciesDataFromJSON(basePath);
    const especie = especies[id];
    
    if (!especie) {
      console.log("Espécie não encontrada com ID:", id);
      window.location.href = `${basePath}404.html`;
      return;
    }
    
    console.log("ESPÉCIE SELECIONADA:", especie);
    
    setupFamilyButton(especie);
    setupGenusButton(especie);
    setupCatalogButton();
    
    loadSpeciesData(especie);
    
    // Cria o modal
    createModal();
    
    // Adiciona evento ESC para fechar modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
    
    console.log("Espécie carregada com sucesso!");
    
  } catch (erro) {
    console.error("Erro ao carregar espécie:", erro);
    window.location.href = `${getBasePath()}404.html`;
  }
}

// =============================================
// INICIALIZAÇÃO
// =============================================

document.addEventListener("DOMContentLoaded", carregarEspecie);