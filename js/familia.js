// Função para obter o caminho base do repositório (funciona no GitHub Pages)
function getBasePath() {
  const path = window.location.pathname;
  const hostname = window.location.hostname;
  
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

async function carregarFamilia() {
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
    // CARREGA FAMÍLIAS
    // ===============================
    // Tenta diferentes caminhos possíveis
    const possiblePaths = [
      `${basePath}data/familias.json`,
      `/data/familias.json`,
      `data/familias.json`,
      `../data/familias.json`
    ];
    
    let familias = null;
    let familiasUrl = null;
    
    for (const url of possiblePaths) {
      try {
        console.log('Tentando carregar:', url);
        const res = await fetch(url);
        if (res.ok) {
          familias = await res.json();
          familiasUrl = url;
          console.log('Sucesso ao carregar de:', url);
          break;
        }
      } catch (e) {
        console.log('Falha ao carregar de:', url, e);
        continue;
      }
    }
    
    if (!familias) {
      throw new Error(`Não foi possível carregar familias.json. Tentou: ${possiblePaths.join(', ')}`);
    }

    const familia = familias[id];

    console.log("FAMILIAS JSON:", familias);
    console.log("FAMILIA SELECIONADA:", familia);

    if (!familia) {
      window.location.href = `${basePath}404.html`;
      return;
    }


    
// ===== ARTIGO (DESCRIÇÃO LONGA) =====
const article = document.getElementById("familia-artigo");
article.innerHTML = "";

if (familia.descricaoLonga && Array.isArray(familia.descricaoLonga)) {
  familia.descricaoLonga.forEach(texto => {
    const p = document.createElement("p");
    p.textContent = texto;
    article.appendChild(p);
  });
}
    // ===============================
    // HEADER DA FAMÍLIA
    // ===============================
    document.getElementById("familia-nome").textContent = familia.name;
    document.getElementById("familia-descricao").textContent =
      familia.descricao || "";

    // ===============================
    // FICHA BOTÂNICA (AUTOMÁTICA)
    // ===============================
    const ulFicha = document.querySelector("#ficha-botanica ul");
    ulFicha.innerHTML = "";

    for (const [label, value] of Object.entries(familia.ficha || {})) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${label}:</strong> ${value}`;
      ulFicha.appendChild(li);
    }

    // ===============================
    // CARREGA GÊNEROS E GERA OS CARDS
    // ===============================
    const sectionGeneros = document.getElementById("generos-section");

    // Tenta diferentes caminhos possíveis para generos.json
    const generosPossiblePaths = [
      `${basePath}data/generos.json`,
      `/data/generos.json`,
      `data/generos.json`,
      `../data/generos.json`
    ];
    
    let generos = null;
    
    for (const url of generosPossiblePaths) {
      try {
        console.log('Tentando carregar:', url);
        const res = await fetch(url);
        if (res.ok) {
          generos = await res.json();
          console.log('Sucesso ao carregar de:', url);
          break;
        }
      } catch (e) {
        console.log('Falha ao carregar de:', url, e);
        continue;
      }
    }
    
    if (!generos) {
      throw new Error(`Não foi possível carregar generos.json. Tentou: ${generosPossiblePaths.join(', ')}`);
    }

    // filtra apenas gêneros da família atual
    const generosDaFamilia = Object.values(generos).filter(
      genero => genero.family === id
    );

    sectionGeneros.innerHTML = "";

    if (generosDaFamilia.length === 0) {
      sectionGeneros.innerHTML =
        "<p>Nenhum gênero cadastrado para esta família.</p>";
      return;
    }

    generosDaFamilia.forEach(genero => {
  const card = document.createElement("a");
  // Gera a URL automaticamente se não existir
  const generoPage = genero.page || `${basePath}html/genero.html?id=${genero.id}`;
  // Corrige caminhos relativos na página do gênero
  card.href = generoPage.startsWith('../') 
    ? generoPage.replace('../', basePath)
    : generoPage.startsWith('/') 
      ? generoPage 
      : `${basePath}${generoPage}`;
  card.className = "card-link";

  // Corrige caminho da imagem
  let imagePath = genero.image;
  if (imagePath.startsWith('../')) {
    imagePath = imagePath.substring(3);
  }
  if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    imagePath = `${basePath}${imagePath}`;
  }

  card.innerHTML = `
    <div class="genero-card">
      <img src="${imagePath}" alt="${genero.name}">
      <h3>${genero.name}</h3>
    </div>
  `;

  sectionGeneros.appendChild(card);
});
  } catch (erro) {
    console.error("Erro ao carregar família:", erro);
    const basePath = getBasePath();
    window.location.href = `${basePath}404.html`;
  }
}

document.addEventListener("DOMContentLoaded", carregarFamilia);
