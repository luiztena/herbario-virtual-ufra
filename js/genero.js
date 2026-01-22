// Função para obter o caminho base do repositório (funciona no GitHub Pages)
function getBasePath() {
  const path = window.location.pathname;
  
  // Se estiver em html/genero.html, remove html/genero.html para obter o base
  // Ex: /Herbario/html/genero.html -> /Herbario/
  // Ex: /html/genero.html -> /
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
    const resGeneros = await fetch(`${basePath}data/generos.json`);
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

    const resEspecies = await fetch(`${basePath}data/especies.json`);
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

document.addEventListener("DOMContentLoaded", carregarGenero);