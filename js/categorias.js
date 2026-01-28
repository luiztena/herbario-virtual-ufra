// Carregamento das espécies
let especiesData = {};
let filtroAtual = 'all';

// Função para normalizar texto (remover acentos)
function normalizeText(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Função para mapear tipos de planta para classes CSS
function getTipoCssClass(tipo) {
    const mapa = {
        'Medicinal': 'medicinal',
        'Ornamental': 'ornamental',
        'Frutífera': 'frutifera',
        'Madeireira': 'madeireira',
        'Oportunista': 'oportunista',
        'Industrial': 'industrial'
    };
    // Adiciona fallback para diferentes formas de escrever
    const tipoLower = tipo.toLowerCase();
    
    // Mapeamento adicional para formas alternativas
    const alternativas = {
        'madeireira': 'madeireira',
        'madeireiro': 'madeireira',
        'árvore madeireira': 'madeireira',
        'madeira': 'madeireira'
    };
    
    return mapa[tipo] || alternativas[tipoLower] || tipoLower;
}

// Função para criar badge de tipo de planta
function criarBadge(tipo) {
    const cssClass = getTipoCssClass(tipo);
    const badgeColors = {
        'medicinal': '#10b981',
        'ornamental': '#ec4899',
        'frutifera': '#fff',
        'madeireira': '#b1b400',
        'oportunista': '#44e6ef',
    };
    // Determinar a cor do texto baseado no tipo
    const textoCor = cssClass === 'frutifera' ? '#000000' : 'white';
    const color = badgeColors[cssClass] || '#6b7280';
    
    return `<span class="badge" style="background-color: ${color}; color: ${textoCor}; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; margin: 2px; display: inline-block;">${tipo}</span>`;
}

// Função para criar card de espécie
function criarCardEspecie(especie) {
    const tipos = especie.ficha['Tipo de planta'] || [];
    const tiposClasses = tipos.map(t => getTipoCssClass(t)).join(' ');
    const badgesHTML = tipos.map(t => criarBadge(t)).join('');
    const nomePopular = especie.ficha['Nome popular'] || '';
    const familia = especie.ficha['Família'] || especie.family;
    
    return `
        <a href="${especie.page}" class="card-link">
            <div class="plant-card ${tiposClasses}" data-tipos="${tiposClasses}">
                <figure>
                    <img src="${especie.image}" alt="${especie.name}" class="plant-img" onerror="this.src='imagens/site-imagem/placeholder.png'">
                </figure>
                <div class="plant-info">
                    <h3 class="plant-name" style="font-style: italic; font-size: 1.1rem;">${especie.name}</h3>
                    <div style="margin: 8px 0;">
                        ${badgesHTML}
                    </div>
                    ${nomePopular ? `<p style="color: #666; font-size: 0.9rem; margin: 4px 0;"><strong>Nome popular:</strong> ${nomePopular}</p>` : ''}
                    <p style="color: #888; font-size: 0.85rem; margin: 4px 0;"><strong>Família:</strong> ${familia}</p>
                    ${especie.descricaoLonga && especie.descricaoLonga[0] ? 
                        `<p class="plant-description">${especie.descricaoLonga[0]}</p>` : ''}
                </div>
            </div>
        </a>
    `;
}

// Função para renderizar espécies
function renderizarEspecies(filtro = 'all', termoBusca = '') {
    const container = document.getElementById('especies-container');
    if (!container) {
        console.error('Container não encontrado!');
        return;
    }
    
    let especiesFiltradas = Object.values(especiesData);
    
    console.log('Total de espécies carregadas:', especiesFiltradas.length);
    console.log('Filtro atual:', filtro);
    
    // Aplicar filtro de categoria
    if (filtro !== 'all') {
        especiesFiltradas = especiesFiltradas.filter(especie => {
            const tipos = especie.ficha['Tipo de planta'] || [];
            return tipos.some(tipo => getTipoCssClass(tipo) === filtro);
        });
        console.log('Espécies após filtro:', especiesFiltradas.length);
    }
    
    // Aplicar busca
    if (termoBusca) {
        const termoNormalizado = normalizeText(termoBusca);
        especiesFiltradas = especiesFiltradas.filter(especie => {
            const nomeCientifico = normalizeText(especie.name);
            const nomePopular = normalizeText(especie.ficha['Nome popular'] || '');
            const familia = normalizeText(especie.ficha['Família'] || especie.family);
            
            return nomeCientifico.includes(termoNormalizado) || 
                   nomePopular.includes(termoNormalizado) ||
                   familia.includes(termoNormalizado);
        });
    }
    
    // Renderizar cards
    if (especiesFiltradas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; width: 100%; color: #666;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p style="font-size: 1.2rem;">Nenhuma espécie encontrada.</p>
                <p>Tente ajustar os filtros ou o termo de busca.</p>
            </div>
        `;
    } else {
        container.innerHTML = especiesFiltradas.map(especie => criarCardEspecie(especie)).join('');
    }
    
    // Atualizar contador
    const titulo = document.querySelector('.section-title');
    if (titulo) {
        const total = especiesFiltradas.length;
        const filtroTexto = filtro === 'all' ? '' : ` - ${filtro.charAt(0).toUpperCase() + filtro.slice(1)}`;
        titulo.textContent = `Catálogo de Espécies Botânicas${filtroTexto} (${total} ${total === 1 ? 'espécie' : 'espécies'})`;
    }
}

// Função para configurar filtros
function configurarFiltros() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchBar = document.getElementById('search-bar');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover active de todos
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Adicionar active ao clicado
            button.classList.add('active');
            
            // Obter filtro
            const filtroClicado = button.getAttribute('data-filter');
            filtroAtual = filtroClicado;
            
            // Se for "Todas", limpar também a busca
            if (filtroClicado === 'all') {
                // Limpar a barra de busca se existir
                if (searchBar) {
                    searchBar.value = '';
                }
                // Limpar lista de autocomplete
                const autocompleteList = document.getElementById('autocomplete-list');
                if (autocompleteList) {
                    autocompleteList.innerHTML = '';
                }
                
                // Restaurar título original sem filtro
                const titulo = document.querySelector('.section-title');
                if (titulo) {
                    const totalEspecies = Object.values(especiesData).length;
                    titulo.textContent = `Catálogo de Espécies Botânicas (${totalEspecies} ${totalEspecies === 1 ? 'espécie' : 'espécies'})`;
                }
            }
            
            // Renderizar com o filtro (e sem termo de busca se for "Todas")
            const termoBusca = filtroClicado === 'all' ? '' : (searchBar?.value || '');
            renderizarEspecies(filtroClicado, termoBusca);
        });
    });
}

// Função para configurar busca
function configurarBusca() {
    const searchBar = document.getElementById('search-bar');
    const searchBtn = document.getElementById('search-btn');
    const autocompleteList = document.getElementById('autocomplete-list');
    
    if (!searchBar || !searchBtn) return;
    
    // Busca ao clicar no botão
    searchBtn.addEventListener('click', () => {
        const termo = searchBar.value.trim();
        renderizarEspecies(filtroAtual, termo);
        if (autocompleteList) autocompleteList.innerHTML = '';
    });
    
    // Busca ao pressionar Enter
    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const termo = searchBar.value.trim();
            renderizarEspecies(filtroAtual, termo);
            if (autocompleteList) autocompleteList.innerHTML = '';
        }
    });
    
    // Autocomplete
    searchBar.addEventListener('input', () => {
        const termo = searchBar.value.trim().toLowerCase();
        
        if (!termo || !autocompleteList) {
            if (autocompleteList) autocompleteList.innerHTML = '';
            return;
        }
        
        // Buscar sugestões
        const sugestoes = [];
        Object.values(especiesData).forEach(especie => {
            const nomeCientifico = especie.name.toLowerCase();
            const nomePopular = (especie.ficha['Nome popular'] || '').toLowerCase();
            
            if (nomeCientifico.includes(termo) && sugestoes.length < 5) {
                sugestoes.push({
                    texto: especie.name,
                    tipo: 'Nome Científico',
                    id: especie.id
                });
            } else if (nomePopular.includes(termo) && sugestoes.length < 5) {
                sugestoes.push({
                    texto: especie.ficha['Nome popular'],
                    tipo: 'Nome Popular',
                    id: especie.id
                });
            }
        });
        
        // Renderizar sugestões
        if (sugestoes.length > 0) {
            autocompleteList.innerHTML = sugestoes.map(s => 
                `<li class="autocomplete-item" data-id="${s.id}">
                    <strong>${s.texto}</strong>
                    <span style="color: #666; font-size: 0.85rem;"> (${s.tipo})</span>
                </li>`
            ).join('');
            
            // Adicionar event listeners
            document.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', () => {
                    const especieId = item.getAttribute('data-id');
                    const especie = especiesData[especieId];
                    if (especie) {
                        searchBar.value = especie.name;
                        renderizarEspecies(filtroAtual, especie.name);
                    }
                    autocompleteList.innerHTML = '';
                });
            });
        } else {
            autocompleteList.innerHTML = '';
        }
    });
}

// Função para configurar links do footer
function configurarFooterLinks() {
    const footerLinks = document.querySelectorAll('.footer-links a[href*="categorias.html"]');
    
    footerLinks.forEach(link => {
        // Remover event listener anterior se houver
        link.addEventListener('click', function(e) {
            // Verificar se já estamos na página de categorias
            if (window.location.pathname.includes('categorias.html')) {
                e.preventDefault();
                
                // Extrair filtro da URL do link
                const url = new URL(link.href);
                const filtro = url.searchParams.get('filter');
                
                if (filtro) {
                    // Ativar filtro correspondente
                    const filterBtn = document.querySelector(`.filter-btn[data-filter="${filtro}"]`);
                    if (filterBtn) {
                        // Remover active de todos
                        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                        // Adicionar active ao clicado
                        filterBtn.classList.add('active');
                        
                        // Aplicar filtro
                        filtroAtual = filtro;
                        const termoBusca = document.getElementById('search-bar')?.value || '';
                        renderizarEspecies(filtro, termoBusca);
                        
                        // Scroll para o topo da seção de espécies
                        document.getElementById('especies')?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            }
            // Se não estiver na página de categorias, o link funcionará normalmente
        });
    });
}

// Função para configurar o botão de limpar tudo
function configurarBotaoLimpar() {
    const limparBtn = document.getElementById('limpar-filtros');
    const searchBar = document.getElementById('search-bar');
    
    if (!limparBtn) return;
    
    limparBtn.addEventListener('click', () => {
        // Limpar busca
        if (searchBar) {
            searchBar.value = '';
        }
        
        // Limpar autocomplete
        const autocompleteList = document.getElementById('autocomplete-list');
        if (autocompleteList) {
            autocompleteList.innerHTML = '';
        }
        
        // Ativar botão "Todas"
        const todasBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (todasBtn) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            todasBtn.classList.add('active');
            filtroAtual = 'all';
        }
        
        // Renderizar todas as espécies
        renderizarEspecies('all', '');
        
        // Scroll para topo
        document.getElementById('especies')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });
}

// Função para obter parâmetros da URL
function obterParametroURL(nome) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nome);
}

// Carregar dados e inicializar
async function inicializar() {
    const container = document.getElementById('especies-container');
    
    // Mostrar loading
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; width: 100%; color: white;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p style="font-size: 1.2rem;">Carregando espécies...</p>
            </div>
        `;
    }
    
    try {
        console.log('Tentando carregar especies.json...');
        
        // Tentar carregar o JSON (ajuste o caminho conforme sua estrutura)
        const response = await fetch('../data/especies.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        especiesData = await response.json();
        
        console.log('Espécies carregadas com sucesso!');
        console.log('Total de espécies:', Object.keys(especiesData).length);
        
        // Verificar se há dados
        if (Object.keys(especiesData).length === 0) {
            throw new Error('O arquivo especies.json está vazio');
        }
        
        // Obter filtro da URL se existir
        const filtroURL = obterParametroURL('filter');
        let filtroInicial = 'all';
        let termoBuscaInicial = '';
        
        // Se houver filtro na URL, validar e aplicar
        if (filtroURL) {
            const filtrosValidos = ['all', 'medicinal', 'ornamental', 'frutifera', 'madeireira', 'oportunista', 'industrial'];
            if (filtrosValidos.includes(filtroURL)) {
                filtroInicial = filtroURL;
            }
        }
        
        // Renderizar inicial com filtro da URL se houver
        renderizarEspecies(filtroInicial, termoBuscaInicial);
        
        // Configurar funcionalidades
        configurarFiltros();
        configurarBusca();
        configurarFooterLinks();
        configurarBotaoLimpar();
        
        // Se houver filtro da URL, ativar o botão correspondente
        if (filtroURL) {
            const botaoFiltro = document.querySelector(`.filter-btn[data-filter="${filtroURL}"]`);
            if (botaoFiltro) {
                // Remover active de todos
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                // Adicionar active ao filtro da URL
                botaoFiltro.classList.add('active');
                filtroAtual = filtroURL;
            }
        }
        
    } catch (error) {
        console.error('Erro ao carregar espécies:', error);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; width: 100%; color: white; background: rgba(239, 68, 68, 0.2); border-radius: 12px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <p style="font-size: 1.2rem; margin-bottom: 10px;">Erro ao carregar as espécies</p>
                    <p style="font-size: 0.95rem; margin-bottom: 20px;">Detalhes: ${error.message}</p>
                    
                    <div style="text-align: left; max-width: 600px; margin: 20px auto; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px;">
                        <p style="font-weight: bold; margin-bottom: 10px;">📋 Checklist de verificação:</p>
                        <p>✓ O arquivo <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">especies.json</code> está na mesma pasta que o HTML?</p>
                        <p>✓ O nome do arquivo está correto (sem espaços, acentos)?</p>
                        <p>✓ O arquivo JSON tem a estrutura correta?</p>
                        <p>✓ Você está abrindo via servidor local (não file://)?</p>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <button onclick="window.location.reload()" style="padding: 12px 30px; background: white; color: #333; border: none; border-radius: 25px; font-weight: bold; cursor: pointer;">
                            🔄 Tentar Novamente
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}