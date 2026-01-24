// Função para obter o caminho base do repositório (funciona no GitHub Pages)
function getBasePath() {
  const path = window.location.pathname;
  const hostname = window.location.hostname;
  
  // Remove query string e hash se existirem
  let cleanPath = path.split('?')[0].split('#')[0];
  
  // Se estiver em html/familia.html ou html/genero.html
  if (cleanPath.includes('/html/')) {
    // Pega tudo antes de /html/
    const base = cleanPath.substring(0, cleanPath.indexOf('/html/') + 1);
    console.log('Detectado caminho com /html/, basePath:', base);
    return base;
  }
  
  // Se estiver na raiz ou em outro arquivo
  // Para repositórios username.github.io (sem subpasta), retorna '/'
  // Para repositórios com nome (ex: /Herbario/), detecta o nome
  const parts = cleanPath.split('/').filter(p => p && !p.endsWith('.html'));
  
  // Se não há partes ou só tem arquivos HTML, está na raiz do domínio
  if (parts.length === 0) {
    console.log('Nenhuma parte detectada, usando raiz: /');
    return '/';
  }
  
  // Se a primeira parte não é uma pasta conhecida do projeto, assume que é o nome do repositório
  const knownFolders = ['html', 'js', 'css', 'data', 'imagens', 'images'];
  const firstPart = parts[0].toLowerCase();
  
  if (!knownFolders.includes(firstPart)) {
    const repoBase = `/${parts[0]}/`;
    console.log('Repositório detectado:', repoBase);
    return repoBase;
  }
  
  console.log('Usando raiz padrão: /');
  return '/';
}

async function carregarGenero() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const basePath = getBasePath();

  console.log("ID DA URL:", id);
  console.log("BASE PATH:", basePath);

  if (!id) {
    window.location.href = `${basePath}404.html`;
    return;
  }

  try {
    // ===============================
    // CARREGA GÊNEROS
    // ===============================
    const generosUrl = `${basePath}data/generos.json`;
    console.log('Tentando carregar:', generosUrl);
    const resGeneros = await fetch(generosUrl);
    
    if (!resGeneros.ok) {
      throw new Error(`Erro ao carregar generos.json: ${resGeneros.status} ${resGeneros.statusText}. URL tentada: ${generosUrl}`);
    }
    
    const generos = await resGeneros.json();

    const genero = generos[id];

    console.log("GENEROS JSON:", generos);
    console.log("GENERO SELECIONADO:", genero);

    if (!genero) {
      window.location.href = `${basePath}404.html`;
      return;
    }

    // ===============================
    // HEADER DO GÊNERO
    // ===============================
    document.getElementById("genero-nome").textContent = genero.name;
    document.getElementById("genero-descricao").textContent =
      genero.descricao || "";

    // ===============================
    // ARTIGO (DESCRIÇÃO LONGA)
    // ===============================
    const article = document.getElementById("genero-artigo");
    article.innerHTML = "";

    if (genero.descricaoLonga && Array.isArray(genero.descricaoLonga)) {
      genero.descricaoLonga.forEach(texto => {
        const p = document.createElement("p");
        p.textContent = texto;
        article.appendChild(p);
      });
    }

    // ===============================
    // FICHA BOTÂNICA (AUTOMÁTICA)
    // ===============================
    const ulFicha = document.getElementById("ficha-lista");
    ulFicha.innerHTML = "";

    for (const [label, value] of Object.entries(genero.ficha || {})) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${label}:</strong> ${value}`;
      ulFicha.appendChild(li);
    }

    // ===============================
    // CARREGA ESPÉCIES E GERA OS CARDS
    // ===============================
    const sectionEspecies = document.getElementById("especies-section");
    const cardsContainer = sectionEspecies.querySelector(".cards-container");

    const especiesUrl = `${basePath}data/especies.json`;
    console.log('Tentando carregar:', especiesUrl);
    const resEspecies = await fetch(especiesUrl);
    
    if (!resEspecies.ok) {
      throw new Error(`Erro ao carregar especies.json: ${resEspecies.status} ${resEspecies.statusText}. URL tentada: ${especiesUrl}`);
    }
    
    const especies = await resEspecies.json();

    // filtra apenas espécies do gênero atual
    const especiesDoGenero = Object.values(especies).filter(
      especie => especie.genero === id
    );

    cardsContainer.innerHTML = "";

    if (especiesDoGenero.length === 0) {
      cardsContainer.innerHTML =
        "<p>Nenhuma espécie cadastrada para este gênero.</p>";
      return;
    }

    especiesDoGenero.forEach(especie => {
      const card = document.createElement("a");
      // Gera a URL automaticamente se não existir
      const especiePage = especie.page || `${basePath}html/especie.html?id=${especie.id}`;
      // Corrige caminhos relativos na página da espécie
      card.href = especiePage.startsWith('../') 
        ? especiePage.replace('../', basePath)
        : especiePage.startsWith('/') 
          ? especiePage 
          : `${basePath}${especiePage}`;
      card.className = "card-link";

      // Corrige caminho da imagem
      let imagePath = especie.image;
      if (imagePath.startsWith('../')) {
        imagePath = imagePath.substring(3);
      }
      if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
        imagePath = `${basePath}${imagePath}`;
      }

      card.innerHTML = `
        <div class="genero-card">
          <img src="${imagePath}" alt="${especie.name}">
          <h3>${especie.name}</h3>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro ao carregar gênero:", erro);
    const basePath = getBasePath();
    window.location.href = `${basePath}404.html`;
  }
}

// ... código anterior permanece igual ...

async function carregarGenero() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const basePath = getBasePath();

  console.log("ID DA URL:", id);
  console.log("BASE PATH:", basePath);

  if (!id) {
    window.location.href = `${basePath}404.html`;
    return;
  }

  try {
    // ===============================
    // CARREGA GÊNEROS
    // ===============================
    const generosUrl = `${basePath}data/generos.json`;
    console.log('Tentando carregar:', generosUrl);
    const resGeneros = await fetch(generosUrl);
    
    if (!resGeneros.ok) {
      throw new Error(`Erro ao carregar generos.json: ${resGeneros.status} ${resGeneros.statusText}. URL tentada: ${generosUrl}`);
    }
    
    const generos = await resGeneros.json();

    const genero = generos[id];

    console.log("GENEROS JSON:", generos);
    console.log("GENERO SELECIONADO:", genero);

    if (!genero) {
      window.location.href = `${basePath}404.html`;
      return;
    }

    // ===============================
    // ATUALIZAR BOTÃO "VOLTAR À FAMÍLIA"
    // ===============================
    const backButton = document.getElementById("back-to-family-btn");
    if (backButton && genero.family) {
      // Construir URL para a página da família
      const familyUrl = `${basePath}html/familia.html?id=${genero.family}`;
      backButton.href = familyUrl;
      console.log('Botão de voltar configurado para:', familyUrl);
    }

    // ===============================
    // HEADER DO GÊNERO
    // ===============================
    document.getElementById("genero-nome").textContent = genero.name;
    document.getElementById("genero-descricao").textContent =
      genero.descricao || "";

    // ... resto do código permanece igual ...

  } catch (erro) {
    console.error("Erro ao carregar gênero:", erro);
    const basePath = getBasePath();
    window.location.href = `${basePath}404.html`;
  }
}

// ... resto do código permanece igual ...


document.addEventListener("DOMContentLoaded", carregarGenero);