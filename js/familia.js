// Função para obter o caminho base do repositório (funciona no GitHub Pages)
function getBasePath() {
  const path = window.location.pathname;
  
  // Se estiver em html/familia.html, remove html/familia.html para obter o base
  // Ex: /Herbario/html/familia.html -> /Herbario/
  // Ex: /html/familia.html -> /
  if (path.includes('/html/')) {
    const base = path.substring(0, path.indexOf('/html/') + 1);
    return base;
  }
  
  // Se estiver na raiz ou em outro lugar, tenta detectar o nome do repositório
  // Ex: /Herbario/ -> /Herbario/
  // Ex: / -> /
  const parts = path.split('/').filter(p => p);
  if (parts.length > 0 && parts[0] !== 'html') {
    return `/${parts[0]}/`;
  }
  
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
    const resFamilias = await fetch(`${basePath}data/familias.json`);
    const familias = await resFamilias.json();

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

    const resGeneros = await fetch(`${basePath}data/generos.json`);
    const generos = await resGeneros.json();

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
