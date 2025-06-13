import { buscarTodosGiveaways, formatarGiveaway } from "./api.js";

function criarOption(texto, valor) {
  const option = document.createElement("option");
  option.textContent = texto;
  option.value = valor;
  return option;
}

function criarSelectPlataforma(id, plataformas) {
  const select = document.createElement("select");
  select.id = id;
  select.className = "form-select";
  select.appendChild(criarOption("Todas", ""));
  plataformas.forEach((plataforma) => {
    const nomeFormatado =
      plataforma.charAt(0).toUpperCase() + plataforma.slice(1);
    select.appendChild(criarOption(nomeFormatado, plataforma));
  });
  return select;
}

function criarFiltroColuna(id, labelTexto, plataformas) {
  const col = document.createElement("div");
  col.className = "col-md-3 col-sm-6";

  const label = document.createElement("label");
  label.className = "form-label";
  label.htmlFor = id;
  label.textContent = labelTexto;

  const select = criarSelectPlataforma(id, plataformas);
  col.appendChild(label);
  col.appendChild(select);
  return col;
}

function gerarFiltros(containerId, numFiltros, plataformas) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  for (let i = 1; i <= numFiltros; i++) {
    const filtro = criarFiltroColuna(
      `plataforma${i}`,
      "Plataforma",
      plataformas
    );
    container.appendChild(filtro);
  }
}

function criarCard(jogo) {
  const col = document.createElement("div");
  col.className = "col-lg-4 col-md-6";

  col.innerHTML = `
    <div class="card h-100 text-center shadow-sm p-2">
      <img src="${jogo.image}" class="card-img-top" alt="Capa do Jogo ${
    jogo.title
  }" style="object-fit: cover; height: 180px" />
      <div class="card-body">
        <h6 class="card-title">${jogo.title}</h6>
        <p class="card-text" style="font-size: 0.85rem; color: #666;">
          Plataforma: ${jogo.platforms || "—"}
        </p>
        <div class="d-flex justify-content-center gap-2">
          <a class="btn btn-sm btn-outline-danger btn-favoritar" href="#" data-id="${
            jogo.id
          }" aria-label="Favoritar">❤️</a>
          <a class="btn btn-sm btn-outline-primary" href="${
            jogo.open_giveaway
          }" target="_blank" aria-label="Ver na loja">🛒</a>
          <a class="btn btn-sm btn-outline-secondary btn-compartilhar" href="#" aria-label="Compartilhar" data-link="${
            jogo.open_giveaway
          }">🔗</a>
        </div>
      </div>
    </div>
  `;
  return col;
}

function renderizarJogos(lista) {
  const container = document.getElementById("cardsContainer");
  if (!container) return;
  container.innerHTML = "";

  if (!lista || lista.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "Nenhum jogo encontrado.";
    msg.className = "text-muted";
    container.appendChild(msg);
    return;
  }

  lista.forEach((jogo) => {
    container.appendChild(criarCard(jogo));
  });
}

function filtrarJogos(games, textoBusca, plataformasSelecionadas) {
  const termo = textoBusca.trim().toLowerCase();

  return games.filter((jogo) => {
    const titulo = jogo.title.toLowerCase();
    const textoMatch = titulo.includes(termo);

    let plataformaMatch = true;
    if (plataformasSelecionadas.length > 0) {
      const plataformasDoJogo = (jogo.platforms || "").toLowerCase();
      plataformaMatch = plataformasSelecionadas.some((p) =>
        plataformasDoJogo.includes(p)
      );
    }

    return textoMatch && plataformaMatch;
  });
}

function saveFavorite(jogo) {
  const chave = "favoritos";
  const atuais = JSON.parse(localStorage.getItem(chave) || "[]");
  if (!atuais.some((f) => f.id === jogo.id)) {
    atuais.push(jogo);
    localStorage.setItem(chave, JSON.stringify(atuais));
    alert(`"${jogo.title}" adicionado aos favoritos!`);
  } else {
    alert(`"${jogo.title}" já está nos favoritos!`);
  }
}

function configurarEventosGlobais(listaDeJogosFormatados) {
  document.body.addEventListener("click", (event) => {
    const favBtn = event.target.closest(".btn-favoritar");
    if (favBtn) {
      event.preventDefault();
      const id = favBtn.getAttribute("data-id");
      const jogo = listaDeJogosFormatados.find(
        (j) => String(j.id) === String(id)
      );
      if (jogo) saveFavorite(jogo);
      return;
    }

    const shareBtn = event.target.closest(".btn-compartilhar");
    if (shareBtn) {
      event.preventDefault();
      const link =
        shareBtn.getAttribute("data-link") ||
        shareBtn.closest(".card").querySelector('a[aria-label="Ver na loja"]')
          ?.href;
      const titulo =
        shareBtn.closest(".card").querySelector(".card-title")?.textContent ||
        "Jogo";
      if (link) {
        navigator.clipboard.writeText(link).then(() => {
          alert(`Link para "${titulo}" copiado para a área de transferência!`);
        });
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  let rawGiveaways = [];
  try {
    rawGiveaways = await buscarTodosGiveaways();
  } catch (e) {
    console.error("Falha ao carregar giveaways:", e);
  }

  const giveawaysFormatados = rawGiveaways.map((item) =>
    formatarGiveaway(item)
  );

  const plataformasSet = new Set();
  giveawaysFormatados.forEach((jogo) => {
    const plataformas = jogo.platforms?.split(",") || [];
    plataformas.forEach((p) => plataformasSet.add(p.trim().toLowerCase()));
  });
  const plataformasPossiveis = [...plataformasSet];

  const numFiltros = 4;
  gerarFiltros("filtrosContainer", numFiltros, plataformasPossiveis);
  renderizarJogos(giveawaysFormatados);
  configurarEventosGlobais(giveawaysFormatados);

  const btnBuscar = document.getElementById("btnBuscar");
  const inputBusca = document.getElementById("inputBusca");

  if (btnBuscar && inputBusca) {
    btnBuscar.addEventListener("click", () => {
      const texto = inputBusca.value || "";
      const plataformasSelecionadas = [];

      for (let i = 1; i <= numFiltros; i++) {
        const sel = document.getElementById(`plataforma${i}`);
        if (sel && sel.value) {
          plataformasSelecionadas.push(sel.value.toLowerCase());
        }
      }

      const unicas = [...new Set(plataformasSelecionadas)];
      const filtrados = filtrarJogos(giveawaysFormatados, texto, unicas);
      renderizarJogos(filtrados);
    });

    inputBusca.addEventListener("keyup", (e) => {
      if (e.key === "Enter") btnBuscar.click();
    });
  }
});
