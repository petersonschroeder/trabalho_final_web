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
      <a class="btn-card btn-compartilhar" aria-label="Compartilhar" href="#">🔗</a>
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

function renderizarPorTipo(destaques, containerId, tipo = null, limite = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const row = document.createElement("div");
  row.classList.add("row", "g-3");

  const filtrados = tipo ? destaques.filter((j) => j.type === tipo) : destaques;
  const jogosParaRenderizar = limite != null ? filtrados.slice(0, limite) : filtrados;

  jogosParaRenderizar.forEach((jogo) => {
    const col = document.createElement("div");
    col.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3"); // 4 por linha em desktop
    col.appendChild(criarCard(jogo, destaques));
    row.appendChild(col);
  });

  container.appendChild(row);
}

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

document.addEventListener("DOMContentLoaded", async () => {
  const params = getQueryParams();
  if (Object.keys(params).length) {
    saveLocalStorage(params);
  }

  const giveaways = await buscarTodosGiveaways();
  const giveawayFormatado = giveaways.map(formatarGiveaway);

  renderizarPorTipo(giveawayFormatado, "destaqueContainer", "Game");

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("btn-favoritar")) {
      event.preventDefault();

      const jogoId = target.getAttribute("data-id");
      const jogo = giveawayFormatado.find((j) => String(j.id) === jogoId);

      if (jogo) {
        saveFavorite(jogo);
      }
    }

    if (target.classList.contains("btn-compartilhar")) {
      event.preventDefault();

      const card = target.closest(".card-custom");
      const titulo = card.querySelector(".h3-title")?.textContent || "Jogo";
      const link = card.querySelector('a[aria-label="Ver na loja"]')?.href;

      if (link) {
        navigator.clipboard.writeText(link).then(() => {
          alert(`Link para "${titulo}" copiado para a área de transferência!`);
        });
      }
    }
  });
});
