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
    // Tenta diferentes caminhos possíveis
    const possiblePaths = [
      `${basePath}data/generos.json`,
      `/data/generos.json`,
      `data/generos.json`,
      `../data/generos.json`
    ];
    
    let generos = null;
    let generosUrl = null;
    
    for (const url of possiblePaths) {
      try {
        console.log('Tentando carregar gêneros de:', url);
        const res = await fetch(url);
        if (res.ok) {
          generos = await res.json();
          generosUrl = url;
          console.log('Sucesso ao carregar gêneros de:', url);
          break;
        }
      } catch (e) {
        console.log('Falha ao carregar gêneros de:', url, e);
        continue;
      }
    }
    
    if (!generos) {
      throw new Error(`Não foi possível carregar generos.json. Tentou: ${possiblePaths.join(', ')}`);
    }

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
    
    // Se não tiver descrição, use a primeira linha da descrição longa
    if (!genero.descricao && genero.descricaoLonga && genero.descricaoLonga.length > 0) {
      const primeiraLinha = genero.descricaoLonga[0];
      document.getElementById("genero-descricao").textContent = 
        primeiraLinha.length > 150 ? primeiraLinha.substring(0, 150) + "..." : primeiraLinha;
    } else {
      document.getElementById("genero-descricao").textContent = genero.descricao || "";
    }

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
    } else {
      // Se não houver descrição longa, exibir uma mensagem padrão
      const p = document.createElement("p");
      p.textContent = `Informações detalhadas sobre o gênero ${genero.name}. Este gênero pertence à família ${genero.family}.`;
      p.style.fontStyle = "italic";
      p.style.color = "#666";
      article.appendChild(p);
    }

    // ===============================
    // FICHA BOTÂNICA (AUTOMÁTICA)
    // ===============================
    // ATENÇÃO: No HTML há dois elementos com id="ficha-botanica"
    // O aside e o ul. Vamos usar querySelector mais específico
    const asideFicha = document.querySelector("aside.ficha-botanica");
    let ulFicha;
    
    if (asideFicha) {
      // Procura o UL dentro do aside
      ulFicha = asideFicha.querySelector("ul");
      if (!ulFicha) {
        // Se não encontrar, cria um
        ulFicha = document.createElement("ul");
        asideFicha.appendChild(ulFicha);
      }
    } else {
      // Fallback: procura qualquer ul com id ficha-botanica
      ulFicha = document.getElementById("ficha-botanica");
    }
    
    if (ulFicha) {
      ulFicha.innerHTML = "";

      if (genero.ficha && Object.keys(genero.ficha).length > 0) {
        console.log("Usando ficha do gênero:", genero.ficha);
        for (const [label, value] of Object.entries(genero.ficha)) {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${label}:</strong> ${value}`;
          ulFicha.appendChild(li);
        }
      } else {
        // Se o gênero não tiver ficha própria, tenta carregar da família
        try {
          const familiasUrl = `${basePath}data/familias.json`;
          console.log('Tentando carregar família de:', familiasUrl);
          const resFamilias = await fetch(familiasUrl);
          
          if (resFamilias.ok) {
            const familias = await resFamilias.json();
            const familia = familias[genero.family];
            
            if (familia && familia.ficha) {
              console.log("Usando ficha da família:", genero.family);
              for (const [label, value] of Object.entries(familia.ficha)) {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${label}:</strong> ${value}`;
                ulFicha.appendChild(li);
              }
            } else {
              // Se não encontrar ficha da família
              const li = document.createElement("li");
              li.innerHTML = `<strong>Informação:</strong> Ficha botânica não disponível.`;
              li.style.color = "#666";
              li.style.fontStyle = "italic";
              ulFicha.appendChild(li);
            }
          }
        } catch (error) {
          console.error("Erro ao carregar ficha da família:", error);
          const li = document.createElement("li");
          li.innerHTML = `<strong>Informação:</strong> Ficha botânica não disponível.`;
          li.style.color = "#666";
          li.style.fontStyle = "italic";
          ulFicha.appendChild(li);
        }
      }
    }

    // ===============================
    // CARREGA ESPÉCIES E GERA OS CARDS
    // ===============================
    const sectionEspecies = document.getElementById("especies-section");
    
    // Limpa a seção primeiro
    if (sectionEspecies) {
      sectionEspecies.innerHTML = "";
      
      // Cria o container para os cards
      const cardsContainer = document.createElement("div");
      cardsContainer.className = "cards-container";
      sectionEspecies.appendChild(cardsContainer);
      
      // Adiciona título se não existir
      if (!sectionEspecies.querySelector("h3")) {
        const titulo = document.createElement("h3");
        titulo.textContent = "Espécies do Gênero";
        sectionEspecies.insertBefore(titulo, cardsContainer);
      }

      // Tenta diferentes caminhos possíveis para especies.json
      const especiesPossiblePaths = [
        `${basePath}data/especies.json`,
        `/data/especies.json`,
        `data/especies.json`,
        `../data/especies.json`
      ];
      
      let especies = null;
      
      for (const url of especiesPossiblePaths) {
        try {
          console.log('Tentando carregar espécies de:', url);
          const res = await fetch(url);
          if (res.ok) {
            especies = await res.json();
            console.log('Sucesso ao carregar espécies de:', url);
            break;
          }
        } catch (e) {
          console.log('Falha ao carregar espécies de:', url, e);
          continue;
        }
      }
      
      if (!especies) {
        const p = document.createElement("p");
        p.textContent = "Não foi possível carregar as espécies.";
        p.style.textAlign = "center";
        p.style.color = "#666";
        p.style.padding = "2rem";
        cardsContainer.appendChild(p);
        return;
      }

      // filtra apenas espécies do gênero atual
      const especiesDoGenero = Object.values(especies).filter(
        especie => especie.genero === id
      );

      cardsContainer.innerHTML = "";

      if (especiesDoGenero.length === 0) {
        const p = document.createElement("p");
        p.textContent = "Nenhuma espécie cadastrada para este gênero.";
        p.style.textAlign = "center";
        p.style.color = "#666";
        p.style.padding = "2rem";
        cardsContainer.appendChild(p);
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
        if (imagePath && imagePath.startsWith('../')) {
          imagePath = imagePath.substring(3);
        }
        
        // Se não tem imagem ou caminho inválido, usa placeholder
        let finalImagePath;
        if (!imagePath || imagePath === "") {
          finalImagePath = `${basePath}imagens/site-imagem/placeholder.png`;
        } else if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
          finalImagePath = `${basePath}${imagePath}`;
        } else {
          finalImagePath = imagePath;
        }

        card.innerHTML = `
          <div class="genero-card">
            <img src="${finalImagePath}" alt="${especie.name}" onerror="this.src='${basePath}imagens/site-imagem/placeholder.png'">
            <h3>${especie.name}</h3>
          </div>
        `;

        cardsContainer.appendChild(card);
      });
    }

  } catch (erro) {
    console.error("Erro ao carregar gênero:", erro);
    const basePath = getBasePath();
    window.location.href = `${basePath}404.html`;
  }
}



document.addEventListener("DOMContentLoaded", carregarGenero);