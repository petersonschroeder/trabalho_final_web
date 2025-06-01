import { buscarTodosGiveaways, formatarGiveaway } from "../JS/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const giveaways = await buscarTodosGiveaways();
  const giveawayFormatado = giveaways.map(formatarGiveaway);

  renderizarPorTipo(giveawayFormatado, "destaqueContainer", "Game");
  renderizarPorTipo(giveawayFormatado, "destaqueDLCs", "DLC");

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-favoritar")) {
      e.preventDefault();

      const jogoId = e.target.getAttribute("data-id");

      const jogo = giveawayFormatado.find((j) => j.id === jogoId);
      if (jogo) {
        salvarFavorito(jogo);
      }
    }
  });
});

function criarCard(jogo) {
  const card = document.createElement("div");
  card.classList.add("card-custom");

  const conteudoCard = (() => {
    if (jogo.type !== "Game" && jogo.type !== "DLC") {
      return `
          <a class="btn-card" aria-label="Ver na loja" href="${jogo.open_giveaway}" target="_blank">🛒</a>
      `;
    }
    return `
      <a href="#" class="btn-card btn-favoritar" aria-label="Favoritar" data-id="${jogo.id}">❤️</a>
      <a class="btn-card" aria-label="Ver na loja" href="${jogo.open_giveaway}" target="_blank">🛒</a>
      <a class="btn-card" aria-label="Compartilhar" href="#">🔗</a>
    `;
  })();

  card.innerHTML = `
    <div class="card-img-container">
      <img src="${jogo.image}" class="card-img" alt="Capa do Jogo ${jogo.title}" />
    </div>
    <div class="card-body">
      <h3 class="h3-title">${jogo.title}</h3>
      <div class="container d-flex justify-content-center gap-3 mt-3">
        ${conteudoCard}
      </div>
    </div>
  `;

  return card;
}

function renderizarPorTipo(destaques, containerId, tipo = null, limite = 5) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Elemento com id "${containerId}" não encontrado no HTML.`);
    return;
  }
  container.innerHTML = "";

  let filtrados = tipo
    ? destaques.filter((jogo) => jogo.type === tipo)
    : destaques;

  filtrados.slice(0, limite).forEach((jogo) => {
    const card = criarCard(jogo);
    container.appendChild(card);
  });
}

function salvarFavorito(jogo) {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  if (!favoritos.find((fav) => fav.id === jogo.id)) {
    favoritos.push(jogo);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    alert(`"${jogo.title}" adicionado aos favoritos!`);
  } else {
    alert(`"${jogo.title}" já está nos favoritos!`);
  }
}
