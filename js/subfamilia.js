// subfamilia.js - Script para exibir informações de subfamílias (Fabaceae)

// Obter ID da subfamília da URL
const urlParams = new URLSearchParams(window.location.search);
const subfamiliaId = urlParams.get('id');

// Carregar dados da subfamília
async function carregarSubfamilia() {
    try {
        // Carregar subfamilias.json
        const response = await fetch('../data/subfamilias.json');
        const subfamilias = await response.json();
        
        // Buscar subfamília específica
        const subfamilia = subfamilias[subfamiliaId];
        
        if (!subfamilia) {
            mostrarErro('Subfamília não encontrada');
            return;
        }
        
        // Preencher informações da subfamília
        preencherSubfamilia(subfamilia);
        
        // Carregar gêneros desta subfamília
        await carregarGeneros(subfamilia.family, subfamiliaId);
        
        // Configurar breadcrumb
        configurarBreadcrumb(subfamilia);
        
    } catch (error) {
        console.error('Erro ao carregar subfamília:', error);
        mostrarErro('Erro ao carregar dados da subfamília');
    }
}

// Preencher informações da subfamília na página
function preencherSubfamilia(subfamilia) {
    // Nome
    document.getElementById('subfamilia-nome').textContent = subfamilia.name;
    document.title = `${subfamilia.name} - Herbário Virtual`;
    
    // Descrição (se necessário)
    const descricaoEl = document.getElementById('subfamilia-descricao');
    if (descricaoEl && subfamilia.descricaoLonga && subfamilia.descricaoLonga[0]) {
        descricaoEl.textContent = subfamilia.descricaoLonga[0];
    }
    
    // Artigo (descrição longa)
    const artigoEl = document.getElementById('subfamilia-artigo');
    if (artigoEl && subfamilia.descricaoLonga) {
        subfamilia.descricaoLonga.forEach(paragrafo => {
            const p = document.createElement('p');
            p.textContent = paragrafo;
            artigoEl.appendChild(p);
        });
    }
    
    // Ficha botânica
    const fichaEl = document.getElementById('ficha-lista');
    if (fichaEl && subfamilia.ficha) {
        fichaEl.innerHTML = '';
        Object.entries(subfamilia.ficha).forEach(([chave, valor]) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${chave}:</strong> ${valor}`;
            fichaEl.appendChild(li);
        });
    }
}

// Carregar gêneros pertencentes a esta subfamília
async function carregarGeneros(familiaId, subfamiliaId) {
    try {
        const response = await fetch('../data/generos.json');
        const todosGeneros = await response.json();
        
        // Filtrar gêneros que pertencem a esta subfamília
        const generosDaSubfamilia = Object.values(todosGeneros).filter(genero => {
            // Verifica se o gênero pertence à família correta E à subfamília
            return genero.family === familiaId && genero.subfamily === subfamiliaId;
        });
        
        if (generosDaSubfamilia.length === 0) {
            // Se não houver campo "subfamily" no JSON, mostrar todos os gêneros da família
            // (temporário até atualizar o JSON)
            const generosDaFamilia = Object.values(todosGeneros).filter(g => g.family === familiaId);
            exibirGeneros(generosDaFamilia);
            console.warn('Aviso: Os gêneros ainda não têm o campo "subfamily" definido no JSON');
        } else {
            exibirGeneros(generosDaSubfamilia);
        }
        
    } catch (error) {
        console.error('Erro ao carregar gêneros:', error);
    }
}

// Exibir cards dos gêneros
function exibirGeneros(generos) {
    const container = document.getElementById('generos-container');
    const section = document.getElementById('generos-section');
    
    if (!container) return;
    
    if (generos.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    container.innerHTML = '';
    
    generos.forEach(genero => {
        const card = document.createElement('a');
        card.href = genero.page;
        card.className = 'card-link';
        
        card.innerHTML = `
            <div class="plant-card">
                <figure>
                    <img src="${genero.image}" alt="${genero.name}" class="plant-img" 
                         onerror="this.src='../imagens/site-imagem/placeholder.png'">
                </figure>
                <div class="plant-info">
                    <h3 class="plant-name">${genero.name}</h3>
                    ${genero.descricaoLonga && genero.descricaoLonga[0] ? 
                        `<p class="plant-description">${genero.descricaoLonga[0]}</p>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Configurar breadcrumb de navegação
function configurarBreadcrumb(subfamilia) {
    const breadcrumbFamilia = document.getElementById('breadcrumb-familia');
    const breadcrumbSubfamilia = document.getElementById('breadcrumb-subfamilia');
    const backToFamilyBtn = document.getElementById('back-to-family-btn');
    
    // Link para a família
    const familiaUrl = `familia.html?id=${subfamilia.family}`;
    
    if (breadcrumbFamilia) {
        breadcrumbFamilia.href = familiaUrl;
        breadcrumbFamilia.textContent = subfamilia.family.charAt(0).toUpperCase() + subfamilia.family.slice(1);
    }
    
    if (breadcrumbSubfamilia) {
        breadcrumbSubfamilia.textContent = subfamilia.name;
    }
    
    if (backToFamilyBtn) {
        backToFamilyBtn.href = familiaUrl;
    }
}

// Mostrar mensagem de erro
function mostrarErro(mensagem) {
    const main = document.querySelector('.mainfamily');
    if (main) {
        main.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 20px;"></i>
                <h2 style="color: #1f2937; margin-bottom: 10px;">Erro</h2>
                <p style="color: #6b7280; font-size: 1.1rem;">${mensagem}</p>
                <a href="../index.html" class="back-to-catalog-btn" style="display: inline-block; margin-top: 30px;">
                    <i class="fas fa-home"></i>
                    Voltar ao catálogo
                </a>
            </div>
        `;
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    if (subfamiliaId) {
        carregarSubfamilia();
    } else {
        mostrarErro('ID da subfamília não fornecido na URL');
    }
});