// Dados das famílias botânicas
const familiasData = {
    amaranthaceae: {
        nome: "Amaranthaceae",
        descricao: "A família Amaranthaceae é uma grande família de plantas com flores, com cerca de 165 gêneros e 2.040 espécies conhecidas.",
        artigo: "As plantas desta família são encontradas em todo o mundo, desde regiões tropicais até temperadas. Muitas espécies são importantes como fontes de alimento, como o amaranto, ou como plantas ornamentais.",
        ficha: [
            "Ordem: Caryophyllales",
            "Classe: Magnoliopsida",
            "Divisão: Magnoliophyta",
            "Hábito: Herbáceas, arbustivas ou raramente arbóreas",
            "Folhas: Geralmente simples, alternas ou opostas",
            "Flores: Pequenas, geralmente hermafroditas"
        ],
        generos: ["Amaranthus", "Celosia", "Gomphrena", "Alternanthera", "Chenopodium"]
    },
    apocynaceae: {
        nome: "Apocynaceae",
        descricao: "Família de plantas com flores que inclui muitas espécies ornamentais e medicinais.",
        artigo: "A família Apocynaceae é conhecida por suas flores vistosas e látex leitoso. Inclui plantas importantes como a pervinca e muitas espécies ornamentais.",
        ficha: [
            "Ordem: Gentianales",
            "Classe: Magnoliopsida",
            "Divisão: Magnoliophyta",
            "Hábito: Arbustos, árvores, trepadeiras ou ervas",
            "Folhas: Simples, geralmente opostas",
            "Flores: Vistosas, muitas vezes com cinco pétalas"
        ],
        generos: ["Plumeria", "Nerium", "Catharanthus", "Tabernaemontana", "Asclepias"]
    }
};

// Função para carregar os dados da família
function carregarFamilia() {
    console.log("Carregando dados da família...");
    
    // Obter o ID da família da URL
    const urlParams = new URLSearchParams(window.location.search);
    const familiaId = urlParams.get('id') || 'apocynaceae';
    
    console.log("Família ID:", familiaId);
    
    // Obter os dados da família
    const familia = familiasData[familiaId.toLowerCase()] || familiasData.apocynaceae;
    
    console.log("Dados da família:", familia);
    
    // Atualizar o título da página
    document.title = `Família ${familia.nome} - Herbário Virtual UFRA`;
    
    // Preencher os elementos HTML
    document.getElementById('familia-nome').textContent = `Família ${familia.nome}`;
    document.getElementById('familia-descricao').textContent = familia.descricao;
    document.getElementById('familia-artigo').innerHTML = `<p>${familia.artigo}</p>`;
    
    // Preencher a ficha botânica
    const fichaLista = document.getElementById('ficha-botanica-lista');
    if (fichaLista) {
        fichaLista.innerHTML = '';
        familia.ficha.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            fichaLista.appendChild(li);
        });
    }
    
    // Preencher os gêneros
    const generosSection = document.getElementById('generos-section');
    if (generosSection) {
        generosSection.innerHTML = `
            <h2>Gêneros da Família ${familia.nome}</h2>
            <div class="generos-container">
                ${familia.generos.map(genero => `
                    <div class="genero-card">
                        <h3>${genero}</h3>
                        <p>Clique para ver as espécies deste gênero</p>
                        <button class="btn-ver-especies" data-genero="${genero.toLowerCase()}">
                            Ver Espécies
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Adicionar event listeners aos botões
        document.querySelectorAll('.btn-ver-especies').forEach(btn => {
            btn.addEventListener('click', function() {
                const genero = this.getAttribute('data-genero');
                alert(`Você clicou no gênero ${genero}. Esta funcionalidade pode ser implementada para carregar espécies.`);
            });
        });
    }
    
    // Atualizar o atributo data-family no body
    document.body.setAttribute('data-family', familiaId.toLowerCase());
}

// Carregar os dados quando a página carregar
document.addEventListener('DOMContentLoaded', carregarFamilia);

// Também carregar quando a página já estiver carregada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregarFamilia);
} else {
    carregarFamilia();
}