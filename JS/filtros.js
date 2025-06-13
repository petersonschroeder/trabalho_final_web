import { buscarTodosGiveaways, formatarGiveaway } from "./api.js";

function criarOption(texto, valor) {
  const option = document.createElement("option");
  option.textContent = texto;
  option.value = valor;
  return option;
}

function criarFiltroColuna(id, label, opcoes) {
  const col = document.createElement("div");
  col.className = "col-md-3 col-sm-6 mb-3";

  const labelElem = document.createElement("label");
  labelElem.setAttribute("for", id);
  labelElem.className = "form-label";
  labelElem.textContent = label;

  const select = document.createElement("select");
  select.className = "form-select";
  select.id = id;

  opcoes.forEach((op) => {
    const option = document.createElement("option");
    option.value = op.value;
    option.textContent = op.label;
    select.appendChild(option);
  });

  col.appendChild(labelElem);
  col.appendChild(select);

  return col;
}

function gerarFiltros(containerId, plataformas) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  // Filtro Plataforma
  const plataformaFiltro = criarFiltroColuna("filtroPlataforma", "Plataforma", [
    { value: "", label: "Todas" },
    ...plataformas.map((p) => ({
      value: p.toLowerCase(),
      label: p.charAt(0).toUpperCase() + p.slice(1),
    })),
  ]);
  container.appendChild(plataformaFiltro);

  // Filtro Tipo
  const tipoFiltro = criarFiltroColuna("filtroTipo", "Tipo", [
    { value: "", label: "Todos" },
    { value: "Game", label: "Game" },
    { value: "Loot", label: "Loot" },
    { value: "Beta", label: "Beta" },
  ]);
  container.appendChild(tipoFiltro);

  // Filtro Validade (expiração)
  const validadeFiltro = criarFiltroColuna("filtroValidade", "Disponibilidade", [
    { value: "", label: "Todas" },
    { value: "hoje", label: "Expiram hoje" },
    { value: "3dias", label: "Expiram em até 3 dias" },
    { value: "7dias", label: "Expiram em até 7 dias" },
    { value: "ativos", label: "Ativos (sem data ou com data futura)" },
  ]);
  container.appendChild(validadeFiltro);

  // Filtro Popularidade (users)
  const popFiltro = criarFiltroColuna("filtroPopularidade", "Popularidade", [
    { value: "", label: "Todas" },
    { value: "baixa", label: "Menos de 1.000" },
    { value: "media", label: "1.000 a 10.000" },
    { value: "alta", label: "Mais de 10.000" },
  ]);
  container.appendChild(popFiltro);
}

function criarCard(jogo) {
  const col = document.createElement("div");
  col.className = "col-lg-4 col-md-6";

  col.innerHTML = `
    <div class="card h-100 text-center shadow-sm p-2">
      <img src="${jogo.image}" class="card-img-top" alt="Capa do Jogo ${jogo.title}" style="object-fit: cover; height: 180px" />
      <div class="card-body">
        <h6 class="card-title">${jogo.title}</h6>
        <p class="card-text" style="font-size: 0.85rem; color: #666;">
          Plataforma: ${jogo.platforms || "—"}
        </p>
        <p class="card-text" style="font-size: 0.85rem; color: #666;">
          Tipo: ${jogo.type || "—"}
        </p>
        <p class="card-text" style="font-size: 0.85rem; color: #666;">
          Expira em: ${jogo.end_date || "N/A"}
        </p>
        <p class="card-text" style="font-size: 0.85rem; color: #666;">
          Usuários: ${jogo.users || 0}
        </p>
        <div class="d-flex justify-content-center gap-2">
          <a class="btn btn-sm btn-outline-danger btn-favoritar" href="#" data-id="${jogo.id}" aria-label="Favoritar">❤️</a>
          <a class="btn btn-sm btn-outline-primary" href="${jogo.open_giveaway}" target="_blank" aria-label="Ver na loja">🛒</a>
          <a class="btn btn-sm btn-outline-secondary btn-compartilhar" href="#" aria-label="Compartilhar" data-link="${jogo.open_giveaway}">🔗</a>
        </div>
      </div>
    </div>
  `;

    col.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-card")) return;

    const todos = JSON.parse(localStorage.getItem("todosGiveaways") || "[]");
    if (!todos.length) {
      localStorage.setItem("todosGiveaways", JSON.stringify(todosJogos));
    }

    window.location.href = `Pages/gamepage.html?id=${jogo.id}`;
  });
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

function isMesmoDia(data1, data2) {
  return (
    data1.getFullYear() === data2.getFullYear() &&
    data1.getMonth() === data2.getMonth() &&
    data1.getDate() === data2.getDate()
  );
}

function diasEntre(dataInicial, dataFinal) {
  const msPorDia = 1000 * 60 * 60 * 24;
  const diffMs = dataFinal - dataInicial;
  return Math.ceil(diffMs / msPorDia);
}

function filtrarJogos(games, textoBusca, plataformaSelecionada, tipoSelecionado, validadeSelecionada, popularidadeSelecionada) {
  const termo = textoBusca.trim().toLowerCase();
  const hoje = new Date();

  return games.filter((jogo) => {
    // Filtro por texto
    const titulo = jogo.title.toLowerCase();
    const textoMatch = titulo.includes(termo);

    // Filtro por plataforma
    let plataformaMatch = true;
    if (plataformaSelecionada && plataformaSelecionada !== "") {
      const plataformasDoJogo = (jogo.platforms || "").toLowerCase();
      plataformaMatch = plataformasDoJogo.includes(plataformaSelecionada.toLowerCase());
    }

    // Filtro por tipo
    let tipoMatch = true;
    if (tipoSelecionado && tipoSelecionado !== "") {
      tipoMatch = (jogo.type || "").toLowerCase() === tipoSelecionado.toLowerCase();
    }

    // Filtro por validade
    let validadeMatch = true;
    if (validadeSelecionada && validadeSelecionada !== "") {
      const dataFinal = jogo.end_date && jogo.end_date !== "N/A" ? new Date(jogo.end_date) : null;

      if (validadeSelecionada === "hoje") {
        validadeMatch = dataFinal ? isMesmoDia(dataFinal, hoje) : false;
      } else if (validadeSelecionada === "3dias") {
        validadeMatch = dataFinal ? diasEntre(hoje, dataFinal) <= 3 && dataFinal >= hoje : false;
      } else if (validadeSelecionada === "7dias") {
        validadeMatch = dataFinal ? diasEntre(hoje, dataFinal) <= 7 && dataFinal >= hoje : false;
      } else if (validadeSelecionada === "ativos") {
        validadeMatch = !dataFinal || dataFinal >= hoje;
      }
    }

    // Filtro por popularidade
    let popMatch = true;
    const users = parseInt(jogo.users || 0, 10);
    if (popularidadeSelecionada && popularidadeSelecionada !== "") {
      if (popularidadeSelecionada === "baixa") {
        popMatch = users < 1000;
      } else if (popularidadeSelecionada === "media") {
        popMatch = users >= 1000 && users <= 10000;
      } else if (popularidadeSelecionada === "alta") {
        popMatch = users > 10000;
      }
    }

    return textoMatch && plataformaMatch && tipoMatch && validadeMatch && popMatch;
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

  // Montar lista de plataformas únicas
  const plataformasSet = new Set();
  giveawaysFormatados.forEach((jogo) => {
    const plataformas = jogo.platforms?.split(",") || [];
    plataformas.forEach((p) => plataformasSet.add(p.trim().toLowerCase()));
  });
  const plataformasPossiveis = [...plataformasSet];

  // Gerar os filtros na UI
  gerarFiltros("filtrosContainer", plataformasPossiveis);

  // Renderizar lista completa inicialmente
  renderizarJogos(giveawaysFormatados);

  // Configurar eventos globais para favoritos e compartilhamento
  configurarEventosGlobais(giveawaysFormatados);

  // Botão e input da busca
  const btnBuscar = document.getElementById("btnBuscar");
  const inputBusca = document.getElementById("inputBusca");

  if (btnBuscar && inputBusca) {
    btnBuscar.addEventListener("click", () => {
      const texto = inputBusca.value || "";
      const plataformaSelecionada =
        document.getElementById("filtroPlataforma")?.value || "";
      const tipoSelecionado =
        document.getElementById("filtroTipo")?.value || "";
      const validadeSelecionada =
        document.getElementById("filtroValidade")?.value || "";
      const popularidadeSelecionada =
        document.getElementById("filtroPopularidade")?.value || "";

      const filtrados = filtrarJogos(
        giveawaysFormatados,
        texto,
        plataformaSelecionada,
        tipoSelecionado,
        validadeSelecionada,
        popularidadeSelecionada
      );
      renderizarJogos(filtrados);
    });

    inputBusca.addEventListener("keyup", (e) => {
      if (e.key === "Enter") btnBuscar.click();
    });
  }
});
