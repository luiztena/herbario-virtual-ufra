async function carregarFamilia() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    window.location.href = "../404.html";
    return;
  }

  try {
    const res = await fetch("../data/familias.json");
    const familias = await res.json();

    const familia = familias[id];

    if (!familia) {
      window.location.href = "../404.html";
      return;
    }

    document.getElementById("familia-nome").textContent = familia.name;
    document.getElementById("familia-descricao").textContent = familia.descricao;
    
    const img = document.getElementById("familia-imagem");
    img.src = familia.image;
    img.alt = familia.name;

  } catch (e) {
    console.error(e);
    window.location.href = "../404.html";
  }
}

document.addEventListener("DOMContentLoaded", carregarFamilia);
