async function carregarGenero() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  console.log("ID DA URL:", id);

  if (!id) {
    window.location.href = "../404.html";
    return;
  }

  try {
    // ===============================
    // CARREGA GÊNEROS
    // ===============================
    const resGeneros = await fetch("../data/generos.json");
    const generos = await resGeneros.json();

    const genero = generos[id];

    console.log("GENEROS JSON:", generos);
    console.log("GENERO SELECIONADO:", genero);

    if (!genero) {
      window.location.href = "../404.html";
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

    const resEspecies = await fetch("../data/especies.json");
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
      card.href = especie.page || `../html/especie.html?id=${especie.id}`;
      card.className = "card-link";

      // Remove o ../ do caminho da imagem se existir
      const imagePath = especie.image.startsWith('../') 
        ? especie.image.substring(3) 
        : especie.image;

      card.innerHTML = `
        <div class="genero-card">
          <img src="${especie.image}" alt="${especie.name}">
          <h3>${especie.name}</h3>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro ao carregar gênero:", erro);
    window.location.href = "../404.html";
  }
}

document.addEventListener("DOMContentLoaded", carregarGenero);