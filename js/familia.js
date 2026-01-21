async function carregarFamilia() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  console.log("ID DA URL:", id);
  


  if (!id) {
    window.location.href = "../404.html";
    return;
  }

  try {
    const res = await fetch("../data/familias.json");
    const familias = await res.json();

    const familia = familias[id];
  console.log("FAMILIAS JSON:", familias);
  console.log("FAMILIA SELECIONADA:", familias[id]);
    if (!familia) {
      window.location.href = "../404.html";
      return;
    }

    // ===== HEADER =====
    document.getElementById("familia-nome").textContent = familia.name;
    document.getElementById("familia-descricao").textContent =
      familia.descricao || "";

    // ===== FICHA BOTÂNICA (AUTOMÁTICA) =====
    const ul = document.querySelector("#ficha-botanica ul");
    ul.innerHTML = "";

    for (const [label, value] of Object.entries(familia.ficha)) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${label}:</strong> ${value}`;
      ul.appendChild(li);
    }

  } catch (erro) {
    console.error(erro);
    window.location.href = "../404.html";
  }
}

const ul = document.querySelector("#ficha-botanica ul");

document.addEventListener("DOMContentLoaded", carregarFamilia);
