import { buscarTodosGiveaways, formatarGiveaway } from "../JS/api.js";

function getQueryParams() {
  const params = {};
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

function saveLocalStorage(obj) {
  Object.entries(obj).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}

function criarCard(jogo, todosJogos) {
  const card = document.createElement("div");
  card.classList.add("card-custom");

  const conteudoCard = (() => {
    if (jogo.type !== "Game" && jogo.type !== "DLC") {
      return `<a class="btn-card" aria-label="Ver na loja" href="${jogo.open_giveaway}" target="_blank">🛒</a>`;
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

  card.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-card")) return;

    const todos = JSON.parse(localStorage.getItem("todosGiveaways") || "[]");
    if (!todos.length) {
      localStorage.setItem("todosGiveaways", JSON.stringify(todosJogos));
    }

    window.location.href = `Pages/gamepage.html?id=${jogo.id}`;
  });

  return card;
}

function renderizarPorTipo(destaques, containerId, tipo = null, limite = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const filtrados = tipo ? destaques.filter((j) => j.type === tipo) : destaques;
  filtrados.slice(0, limite).forEach((jogo) => {
    container.appendChild(criarCard(jogo, destaques));
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = getQueryParams();
  if (Object.keys(params).length) {
    saveLocalStorage(params);
  }
  const giveaways = await buscarTodosGiveaways();
  const giveawayFormatado = giveaways.map(formatarGiveaway);

  renderizarPorTipo(giveawayFormatado, "destaqueContainer", "Game");
  renderizarPorTipo(giveawayFormatado, "destaqueDLCs", "DLC");

  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn-favoritar")) return;
    e.preventDefault();

    console.log("Clicou no coração!");

    const jogoId = e.target.getAttribute("data-id");
    console.log("ID do jogo clicado:", jogoId);

    const jogo = giveawayFormatado.find((j) => String(j.id) === jogoId);
    if (jogo) {
      console.log("Jogo encontrado para favoritar:", jogo);
      saveFavorite(jogo);
    } else {
      console.log("Jogo NÃO encontrado para esse ID");
    }
  });
});

function saveFavorite(jogo) {
  console.log("Tentando salvar favorito:", jogo);
  const chave = "favoritos";
  const atuais = JSON.parse(localStorage.getItem(chave) || "[]");
  console.log("Favoritos atuais no localStorage:", atuais);

  if (!atuais.some((f) => f.id === jogo.id)) {
    atuais.push(jogo);
    localStorage.setItem(chave, JSON.stringify(atuais));
    console.log(`"${jogo.title}" adicionado aos favoritos!`);
    alert(`"${jogo.title}" adicionado aos favoritos!`);
  } else {
    console.log(`"${jogo.title}" já está nos favoritos!`);
    alert(`"${jogo.title}" já está nos favoritos!`);
  }
}
