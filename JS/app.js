import { buscarTodosGiveaways, formatarGiveaway } from "../JS/api.js";

function renderizarGiveaways(giveaways) {
  const container = document.getElementById("gamesContainer");
  container.innerHTML = "";

  giveaways.slice(0, 5).forEach((giveaway) => {
    const card = document.createElement("article");
    card.classList.add("col");

    card.innerHTML = `
      <div class="card h-100 shadow-lg p-3">
        <img src="${giveaway.image}" class="card-img-top rounded" alt="${
      giveaway.title
    }">
        <div class="card-body">
          <h5 class="card-title">${giveaway.title}</h5>
          <p class="card-text">${giveaway.description}</p>
          <p class="card-text"><small class="text-muted">Termina em: ${
            giveaway.end_date || "Indeterminado"
          }</small></p>
        </div>
        <div class="card-footer bg-transparent border-0">
          <a href="${
            giveaway.open_giveaway
          }" target="_blank" class="btn btn-primary w-100">Participar</a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const giveaways = await buscarTodosGiveaways();
  const giveawaysFormatados = giveaways.map(formatarGiveaway);
  renderizarGiveaways(giveawaysFormatados);
});
