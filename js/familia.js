// familia.js - Script atualizado com suporte a subfamílias (Fabaceae)

// Obter ID da família da URL
const urlParams = new URLSearchParams(window.location.search);
const familiaId = urlParams.get('id');

// Verificar se é Fabaceae (família com subfamílias)
const FAMILIAS_COM_SUBFAMILIAS = ['fabaceae'];

// Carregar dados da família
async function carregarFamilia() {
    try {
        // Carregar familias.json
        const response = await fetch('../data/familias.json');
        const familias = await response.json();
        
        // Buscar família específica
        const familia = familias[familiaId];
        
        if (!familia) {
            mostrarErro('Família não encontrada');
            return;
        }
        
        // Preencher informações da família
        preencherFamilia(familia);
        
        // Verificar se família tem subfamílias
        if (FAMILIAS_COM_SUBFAMILIAS.includes(familiaId)) {
            // Carregar subfamílias
            await carregarSubfamilias(familiaId);
        } else {
            // Carregar gêneros diretamente
            await carregarGeneros(familiaId);
        }
        
    } catch (error) {
        console.error('Erro ao carregar família:', error);
        mostrarErro('Erro ao carregar dados da família');
    }
}

// Preencher informações da família na página
function preencherFamilia(familia) {
    // Nome
    document.getElementById('familia-nome').textContent = familia.name;
    document.title = `${familia.name} - Herbário Virtual`;
    
    // Descrição
    const descricaoEl = document.getElementById('familia-descricao');
    if (descricaoEl && familia.descricaoLonga && familia.descricaoLonga[0]) {
        descricaoEl.textContent = familia.descricaoLonga[0];
    }
    
    // Artigo (descrição longa)
    const artigoEl = document.getElementById('familia-artigo');
    if (artigoEl && familia.descricaoLonga) {
        familia.descricaoLonga.forEach(paragrafo => {
            const p = document.createElement('p');
            p.textContent = paragrafo;
            artigoEl.appendChild(p);
        });
    }
    
    // Ficha botânica
    const fichaContainer = document.querySelector('.ficha-botanica ul');
    if (fichaContainer && familia.ficha) {
        fichaContainer.innerHTML = '';
        Object.entries(familia.ficha).forEach(([chave, valor]) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${chave}:</strong> ${valor}`;
            fichaContainer.appendChild(li);
        });
    }
}

// Carregar subfamílias (apenas para Fabaceae)
async function carregarSubfamilias(familiaId) {
    try {
        const response = await fetch('../data/subfamilias.json');
        const subfamilias = await response.json();
        
        // Filtrar subfamílias desta família
        const subfamiliasDaFamilia = Object.values(subfamilias).filter(
            sub => sub.family === familiaId
        );
        
        if (subfamiliasDaFamilia.length > 0) {
            exibirSubfamilias(subfamiliasDaFamilia);
        } else {
            // Se não houver subfamílias, carregar gêneros diretamente
            await carregarGeneros(familiaId);
        }
        
    } catch (error) {
        console.error('Erro ao carregar subfamílias:', error);
        // Em caso de erro, tentar carregar gêneros diretamente
        await carregarGeneros(familiaId);
    }
}

// Exibir cards das subfamílias
function exibirSubfamilias(subfamilias) {
    const section = document.getElementById('generos-section');
    
    if (!section) return;
    
    // Atualizar título da seção
    const titulo = section.querySelector('h3');
    if (titulo) {
        titulo.textContent = 'Subfamílias';
    } else {
        const novoTitulo = document.createElement('h3');
        novoTitulo.textContent = 'Subfamílias';
        section.insertBefore(novoTitulo, section.firstChild);
    }
    
    // Criar container se não existir
    let container = section.querySelector('.cards-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'cards-container';
        section.appendChild(container);
    }
    
    container.innerHTML = '';
    
    subfamilias.forEach(subfamilia => {
        const card = document.createElement('a');
        card.href = subfamilia.page;
        card.className = 'card-link';
        
        card.innerHTML = `
            <div class="plant-card">
                <figure>
                    <img src="${subfamilia.image}" alt="${subfamilia.name}" class="plant-img" 
                         onerror="this.src='../imagens/site-imagem/placeholder.png'">
                </figure>
                <div class="plant-info">
                    <h3 class="plant-name">${subfamilia.name}</h3>
                    ${subfamilia.descricaoLonga && subfamilia.descricaoLonga[0] ? 
                        `<p class="plant-description">${subfamilia.descricaoLonga[0]}</p>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Carregar gêneros pertencentes a esta família
async function carregarGeneros(familiaId) {
    try {
        const response = await fetch('../data/generos.json');
        const todosGeneros = await response.json();
        
        // Filtrar gêneros que pertencem a esta família
        const generosDaFamilia = Object.values(todosGeneros).filter(
            genero => genero.family === familiaId
        );
        
        exibirGeneros(generosDaFamilia);
        
    } catch (error) {
        console.error('Erro ao carregar gêneros:', error);
    }
}

// Exibir cards dos gêneros
function exibirGeneros(generos) {
    const section = document.getElementById('generos-section');
    
    if (!section) return;
    
    if (generos.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    // Garantir que o título está correto
    const titulo = section.querySelector('h3');
    if (titulo) {
        titulo.textContent = 'Gêneros desta Família';
    } else {
        const novoTitulo = document.createElement('h3');
        novoTitulo.textContent = 'Gêneros desta Família';
        section.insertBefore(novoTitulo, section.firstChild);
    }
    
    // Criar container se não existir
    let container = section.querySelector('.cards-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'cards-container';
        section.appendChild(container);
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
    if (familiaId) {
        carregarFamilia();
    } else {
        mostrarErro('ID da família não fornecido na URL');
    }
});