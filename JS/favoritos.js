function criarItemFavorito(jogo) {
  const li = document.createElement("li");
  li.classList.add("card", "p-3");

  li.innerHTML = `
    <div class="row align-items-center">
      <div class="col-auto">
        <img
          src="${jogo.image}"
          alt="Capa do jogo ${jogo.title}"
          style="width: 120px; height: auto"
          class="img-fluid rounded"
        />
      </div>
      <div class="col">
        <h6 class="mb-0">${jogo.title}</h6>
      </div>
      <div class="col-auto">
        <div class="d-flex gap-2">
          <a class="btn btn-sm btn-outline-danger btn-remover" href="#" aria-label="Remover" data-id="${jogo.id}">🗑️</a>
          <a class="btn btn-sm btn-outline-primary" href="${jogo.open_giveaway}" target="_blank" aria-label="Ver na loja">🛒</a>
          <a class="btn btn-sm btn-outline-secondary btn-compartilhar" href="#" aria-label="Compartilhar" data-title="${jogo.title}" data-link="${jogo.open_giveaway}">🔗</a>
        </div>
      </div>
    </div>
  `;

  return li;
}

function renderizarFavoritos(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Elemento com id "${containerId}" não encontrado`);
    return;
  }

  container.innerHTML = "";

  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  if (favoritos.length === 0) {
    container.innerHTML = `<p class="text-center">Nenhum favorito adicionado ainda.</p>`;
    return;
  }

  favoritos.forEach((jogo) => {
    const item = criarItemFavorito(jogo);
    container.appendChild(item);
  });
}

function removerFavorito(id) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  favoritos = favoritos.filter((jogo) => String(jogo.id) !== id);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarFavoritos("listaFavoritos");
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-remover")) {
    event.preventDefault();
    const jogoId = event.target.getAttribute("data-id");
    removerFavorito(jogoId);
    renderizarFavoritos("listaFavoritos");
  }

  if (event.target.classList.contains("btn-compartilhar")) {
    event.preventDefault();
    const titulo = event.target.getAttribute("data-title");
    const link = event.target.getAttribute("data-link");
    navigator.clipboard.writeText(`${link}`).then(() => {
      alert("Link copiado para a área de transferência!");
    });
  }
});
