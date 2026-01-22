async function carregarFamilia() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  console.log("ID DA URL:", id);

  if (!id) {
    window.location.href = "../404.html";
    return;
  }

  try {
    // ===============================
    // CARREGA FAMÍLIAS
    // ===============================
    const resFamilias = await fetch("../data/familias.json");
    const familias = await resFamilias.json();

    const familia = familias[id];

    console.log("FAMILIAS JSON:", familias);
    console.log("FAMILIA SELECIONADA:", familia);

    if (!familia) {
      window.location.href = "../404.html";
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

    const resGeneros = await fetch("../data/generos.json");
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
  card.href = genero.page || `../html/genero.html?id=${genero.id}`;
  card.className = "card-link";

  card.innerHTML = `
    <div class="genero-card">
      <img src="../${genero.image}" alt="${genero.name}">
      <h3>${genero.name}</h3>
    </div>
  `;

  sectionGeneros.appendChild(card);
});
  } catch (erro) {
    console.error("Erro ao carregar família:", erro);
    window.location.href = "../404.html";
  }
}

document.addEventListener("DOMContentLoaded", carregarFamilia);
