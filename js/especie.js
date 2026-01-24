
  
function getBasePath() {
  const path = window.location.pathname;
  const hostname = window.location.hostname;
  
  // Remove query string e hash se existirem
  let cleanPath = path.split('?')[0].split('#')[0];
  
  console.log('Path completo:', path);
  console.log('Path limpo:', cleanPath);
  
  // Se estiver em html/familia.html ou html/genero.html ou html/especie.html
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

async function carregarEspecie() {
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
    // CARREGA ESPÉCIES
    // ===============================
    // Tenta diferentes caminhos possíveis
    const possiblePaths = [
      `${basePath}data/especies.json`,
      `/data/especies.json`,
      `data/especies.json`,
      `../data/especies.json`
    ];
    
    let especies = null;
    let especiesUrl = null;
    
    for (const url of possiblePaths) {
      try {
        console.log('Tentando carregar espécies de:', url);
        const res = await fetch(url);
        if (res.ok) {
          especies = await res.json();
          especiesUrl = url;
          console.log('Sucesso ao carregar espécies de:', url);
          break;
        }
      } catch (e) {
        console.log('Falha ao carregar espécies de:', url, e);
        continue;
      }
    }
    
    if (!especies) {
      throw new Error(`Não foi possível carregar especies.json. Tentou: ${possiblePaths.join(', ')}`);
    }

    const especie = especies[id];

    console.log("ESPÉCIES JSON:", especies);
    console.log("ESPÉCIE SELECIONADA:", especie);

    if (!especie) {
      window.location.href = `${basePath}404.html`;
      return;
    }

    // ===============================
    // ATUALIZAR BOTÃO "VOLTAR AO GÊNERO"
    // ===============================
    const backButton = document.getElementById("back-to-genero-btn");
    if (backButton && especie.genero) {
      // Construir URL para a página do gênero
      const generoUrl = `${basePath}html/genero.html?id=${especie.genero}`;
      backButton.href = generoUrl;
      backButton.innerHTML = `<i class="fas fa-arrow-left"></i>Voltar ao Gênero`;
      console.log('Botão de voltar configurado para:', generoUrl);
    }

    // ===============================
    // HEADER DA ESPÉCIE
    // ===============================
    document.getElementById("especie-nome").textContent = especie.name;
    
    // Se não tiver descrição, use a primeira linha da descrição longa ou nome científico
    if (!especie.descricao && especie.descricaoLonga && especie.descricaoLonga.length > 0) {
      const primeiraLinha = especie.descricaoLonga[0];
      document.getElementById("especie-descricao").textContent = 
        primeiraLinha.length > 150 ? primeiraLinha.substring(0, 150) + "..." : primeiraLinha;
    } else if (especie.nomeCientifico) {
      document.getElementById("especie-descricao").textContent = `Nome científico: ${especie.nomeCientifico}`;
    } else {
      document.getElementById("especie-descricao").textContent = especie.descricao || "";
    }

    // ===============================
    // ARTIGO (DESCRIÇÃO LONGA)
    // ===============================
    const article = document.getElementById("especie-artigo");
    article.innerHTML = "";

    if (especie.descricaoLonga && Array.isArray(especie.descricaoLonga)) {
      especie.descricaoLonga.forEach(texto => {
        const p = document.createElement("p");
        p.textContent = texto;
        article.appendChild(p);
      });
    } else {
      // Se não houver descrição longa, exibir informações básicas
      const p = document.createElement("p");
      p.innerHTML = `Espécie <strong>${especie.name}</strong>`;
      if (especie.genero) {
        p.innerHTML += ` do gênero <em>${especie.genero}</em>.`;
      }
      p.style.fontStyle = "italic";
      p.style.color = "#666";
      article.appendChild(p);
    }

    // ===============================
    // FICHA BOTÂNICA (AUTOMÁTICA)
    // ===============================
    const ulFicha = document.getElementById("ficha-lista");
    ulFicha.innerHTML = "";

    if (especie.ficha && Object.keys(especie.ficha).length > 0) {
      console.log("Usando ficha da espécie:", especie.ficha);
      for (const [label, value] of Object.entries(especie.ficha)) {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${label}:</strong> ${value}`;
        ulFicha.appendChild(li);
      }
    } else {
      // Se a espécie não tiver ficha própria, tenta carregar do gênero
      try {
        const generosUrl = `${basePath}data/generos.json`;
        console.log('Tentando carregar gênero de:', generosUrl);
        const resGeneros = await fetch(generosUrl);
        
        if (resGeneros.ok) {
          const generos = await resGeneros.json();
          const genero = generos[especie.genero];
          
          if (genero && genero.ficha) {
            console.log("Usando ficha do gênero:", especie.genero);
            for (const [label, value] of Object.entries(genero.ficha)) {
              const li = document.createElement("li");
              li.innerHTML = `<strong>${label}:</strong> ${value}`;
              ulFicha.appendChild(li);
            }
          } else {
            // Se não encontrar ficha do gênero, mostra informações básicas
            const infoBasica = [
              ["Nome científico", especie.nomeCientifico || "Não informado"],
              ["Gênero", especie.genero || "Não informado"],
              ["Família", especie.familia || "Não informada"]
            ];
            
            infoBasica.forEach(([label, value]) => {
              const li = document.createElement("li");
              li.innerHTML = `<strong>${label}:</strong> ${value}`;
              ulFicha.appendChild(li);
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar ficha do gênero:", error);
        // Informações mínimas
        const li = document.createElement("li");
        li.innerHTML = `<strong>Espécie:</strong> ${especie.name}`;
        ulFicha.appendChild(li);
        
        if (especie.genero) {
          const li2 = document.createElement("li");
          li2.innerHTML = `<strong>Gênero:</strong> ${especie.genero}`;
          ulFicha.appendChild(li2);
        }
      }
    }

    // ===============================
    // GALERIA DE IMAGENS
    // ===============================
    const galeriaContainer = document.getElementById("galeria-container");
    if (galeriaContainer) {
      galeriaContainer.innerHTML = "";
      
      // Lista de imagens (pode ser um array ou uma única imagem)
      const imagens = especie.imagens || [especie.image].filter(img => img);
      
      if (imagens.length > 0) {
        imagens.forEach((imagem, index) => {
          let imagePath = imagem;
          if (imagePath && imagePath.startsWith('../')) {
            imagePath = imagePath.substring(3);
          }
          
          // Se não tem caminho completo, adiciona basePath
          let finalImagePath;
          if (!imagePath || imagePath === "") {
            finalImagePath = `${basePath}imagens/site-imagem/placeholder.png`;
          } else if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
            finalImagePath = `${basePath}${imagePath}`;
          } else {
            finalImagePath = imagePath;
          }
          
          const imgDiv = document.createElement("div");
          imgDiv.className = "galeria-item";
          imgDiv.innerHTML = `
            <img src="${finalImagePath}" 
                 alt="${especie.name} - Imagem ${index + 1}"
                 onerror="this.src='${basePath}imagens/site-imagem/placeholder.png'">
          `;
          galeriaContainer.appendChild(imgDiv);
        });
      } else {
        const p = document.createElement("p");
        p.textContent = "Nenhuma imagem disponível para esta espécie.";
        p.style.textAlign = "center";
        p.style.color = "#666";
        p.style.padding = "2rem";
        galeriaContainer.appendChild(p);
      }
    }

  } catch (erro) {
    console.error("Erro ao carregar espécie:", erro);
    const basePath = getBasePath();
    window.location.href = `${basePath}404.html`;
  }
}

document.addEventListener("DOMContentLoaded", carregarEspecie);