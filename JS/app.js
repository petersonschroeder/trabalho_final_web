import { buscarTodosGiveaways, formatarGiveaway } from "../JS/api.js";

function limitarTexto(texto, maxChars) {
  if (!texto) return "";
  return texto.length > maxChars ? texto.slice(0, maxChars) + "..." : texto;
}

function renderizarGiveaways(giveaways) {
  const container = document.getElementById("gamesContainer");
  container.innerHTML = "";

  giveaways.slice(0, 5).forEach((giveaway) => {
    const card = document.createElement("article");
    card.classList.add("col", "p-2", "article");

    card.innerHTML = `
  <a>
  <div class="card-custom shadow-lg rounded">
    <div class="card-img-container">
      <img src="${giveaway.image}" alt="${giveaway.title}" class="card-img" />
    </div>
    <div class="card-footer-custom p-3 d-flex flex-column justify-content-between">
      <h5 class="card-title text-center fw-bold mb-2">${giveaway.title}</h5>
      <p class="card-date text-muted small text-center mb-3">
        Termina em: ${giveaway.end_date || "Indeterminado"}
      </p>
      <a href="${
        giveaway.open_giveaway
      }" target="_blank" class="btn-card">Acessar</a>
    </div>
  </div></a>
`;

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const giveaways = await buscarTodosGiveaways();
  const giveawaysFormatados = giveaways.map(formatarGiveaway);
  renderizarGiveaways(giveawaysFormatados);
});

function renderizarDlcs(giveaway) {}



