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

    // ===============================
    // HEADER DA FAMÍLIA
    // ===============================
    document.getElementById("familia-nome").textContent = familia.name;
    document.getElementById("familia-descricao").textContent =
      familia.descricao || "";

    // ===============================
    // ARTIGO (DESCRIÇÃO LONGA)
    // ===============================
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
    // FICHA BOTÂNICA (AUTOMÁTICA)
    // ===============================
    const asideFicha = document.querySelector("aside.ficha-botanica");
    let ulFicha;
    
    if (asideFicha) {
      ulFicha = asideFicha.querySelector("ul");
      if (!ulFicha) {
        ulFicha = document.createElement("ul");
        asideFicha.appendChild(ulFicha);
      }
    } else {
      ulFicha = document.getElementById("ficha-botanica");
    }
    
    if (ulFicha) {
      ulFicha.innerHTML = "";

      for (const [label, value] of Object.entries(familia.ficha || {})) {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${label}:</strong> ${value}`;
        ulFicha.appendChild(li);
      }
    }

    // ===============================
    // CARREGA GÊNEROS E GERA OS CARDS (FORMATO IGUAL AOS DE ESPÉCIES)
    // ===============================
    const sectionGeneros = document.getElementById("generos-section");
    
    // Limpa a seção primeiro e cria estrutura igual
    if (sectionGeneros) {
      sectionGeneros.innerHTML = "";
      
      // Cria o container para os cards
      const cardsContainer = document.createElement("div");
      cardsContainer.className = "cards-container";
      sectionGeneros.appendChild(cardsContainer);
      
      // Adiciona título
      const titulo = document.createElement("h3");
      titulo.textContent = "Gêneros da Família";
      sectionGeneros.insertBefore(titulo, cardsContainer);

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
        const p = document.createElement("p");
        p.textContent = "Não foi possível carregar os gêneros.";
        p.style.textAlign = "center";
        p.style.color = "#666";
        p.style.padding = "2rem";
        cardsContainer.appendChild(p);
        return;
      }

      // filtra apenas gêneros da família atual
      const generosDaFamilia = Object.values(generos).filter(
        genero => genero.family === id
      );

      cardsContainer.innerHTML = "";

      if (generosDaFamilia.length === 0) {
        const p = document.createElement("p");
        p.textContent = "Nenhum gênero cadastrado para esta família.";
        p.style.textAlign = "center";
        p.style.color = "#666";
        p.style.padding = "2rem";
        cardsContainer.appendChild(p);
        return;
      }

      // Cria os cards no MESMO formato dos cards de espécies
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
        
        // Remove "../" se existir
        if (imagePath && imagePath.startsWith('../')) {
          imagePath = imagePath.substring(3);
        }
        
        // Se não tem imagem ou caminho inválido
        let finalImagePath;
        if (!imagePath || imagePath === "") {
          // Não mostra imagem, só o nome
          finalImagePath = null;
        } else if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
          finalImagePath = `${basePath}${imagePath}`;
        } else {
          finalImagePath = imagePath;
        }

        // Usa o MESMO formato dos cards de espécies
        if (!finalImagePath) {
          card.innerHTML = `
            <div class="genero-card">
              <div class="no-image">Sem imagem</div>
              <h3>${genero.name}</h3>
            </div>
          `;
        } else {
          card.innerHTML = `
            <div class="genero-card">
              <img src="${finalImagePath}" alt="${genero.name}" 
                   onerror="this.onerror=null; this.parentElement.innerHTML = '<div class=\\'no-image\\'>Imagem não disponível</div><h3>${genero.name}</h3>'">
              <h3>${genero.name}</h3>
            </div>
          `;
        }

        cardsContainer.appendChild(card);
      });
    }

  } catch (erro) {
    console.error("Erro ao carregar família:", erro);
    const basePath = getBasePath();
    window.location.href = `${basePath}404.html`;
  }
}

document.addEventListener("DOMContentLoaded", carregarFamilia);