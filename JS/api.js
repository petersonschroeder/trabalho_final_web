// ------------------------- CONFIGURAÇÕES -------------------------

const API_BASE = "https://gamerpower.com/api";
const proxy = "https://corsproxy.io/?url=";

const endpoints = {
  giveaways: `${API_BASE}/giveaways`,
  giveawayById: (giveawayId) => `${API_BASE}/giveaway?id=${giveawayId}`,
  byPlatform: (platform) => `${API_BASE}/giveaways?platform=${platform}`,
  byType: (type) => `${API_BASE}/giveaways?type=${type}`,
  sortBy: (sort) => `${API_BASE}/giveaways?sort-by=${sort}`,
  worth: `${API_BASE}/worth`,
};

// ------------------------- UTILITÁRIOS -------------------------

function normalizarTexto(texto) {
  return texto.trim().toLowerCase();
}

async function fetchJson(url) {
  const response = await fetch(proxy + encodeURIComponent(url));
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ao acessar ${url}`);
  }
  return response.json();
}

function formatarGiveaway(dado) {
  return {
    title: dado.title,
    image: dado.image,
    description: dado.description,
    end_date: dado.end_date,
    open_giveaway: dado.open_giveaway,
    type: dado.type,
  };
}

function exibirGiveaways(giveaways) {
  giveaways.forEach((item) => {
    const giveawayFormatado = formatarGiveaway(item);
    console.log(giveawayFormatado.title);
  });
}

// ------------------------- BUSCAS BÁSICAS -------------------------

async function buscarTodosGiveaways() {
  try {
    const giveaways = await fetchJson(endpoints.giveaways);
    exibirGiveaways(giveaways);
    return giveaways;
  } catch (erro) {
    console.error("Erro ao buscar todos os giveaways:", erro);
    return [];
  }
}

async function buscarGiveawayPorId(id) {
  try {
    return await fetchJson(endpoints.giveawayById(id));
  } catch (erro) {
    console.error(`Erro ao buscar giveaway com ID "${id}":`, erro);
    return null;
  }
}

async function buscarGiveawaysPorPlataforma(plataforma) {
  try {
    const resultados = await fetchJson(
      endpoints.byPlatform(normalizarTexto(plataforma))
    );
    exibirGiveaways(resultados);
    return resultados;
  } catch (erro) {
    console.error(`Erro ao buscar por plataforma "${plataforma}":`, erro);
    return [];
  }
}

async function buscarGiveawaysPorTipo(tipo) {
  try {
    const url = endpoints.byType(normalizarTexto(tipo));
    const resultados = await fetchJson(url);

    if (!Array.isArray(resultados) || resultados.length === 0) {
      console.log(`Nenhum resultado encontrado para o tipo: "${tipo}"`);
      return [];
    }

    exibirGiveaways(resultados);
    return resultados;
  } catch (erro) {
    console.error(`Erro ao buscar por tipo "${tipo}":`, erro);
    return [];
  }
}

// ------------------------- FILTRO POR PALAVRAS -------------------------

function filtrarGiveawaysPorPalavras(giveaways, termoBusca) {
  const termos = normalizarTexto(termoBusca).split(/\s+/);

  return giveaways.filter((giveaway) => {
    const texto = normalizarTexto(`${giveaway.title} ${giveaway.description}`);
    return termos.every((termo) => texto.includes(termo));
  });
}

async function buscarGiveawaysPorPalavras(termoBusca) {
  if (!termoBusca) {
    console.warn("Termo de busca vazio.");
    return [];
  }

  console.log(`Buscando giveaways por termo: "${termoBusca}"`);

  try {
    const todosGiveaways = await buscarTodosGiveaways();
    const filtrados = filtrarGiveawaysPorPalavras(todosGiveaways, termoBusca);

    if (filtrados.length === 0) {
      console.log(`Nenhum giveaway encontrado para o termo: "${termoBusca}"`);
      return [];
    }

    exibirGiveaways(filtrados);
    return filtrados;
  } catch (erro) {
    console.error("Erro ao buscar giveaways por palavras:", erro);
    return [];
  }
}

// ------------------------- FILTRO POR CATEGORIAS -------------------------

function filtrarGiveawaysPorCategoria(giveaways, filtros) {
  return giveaways.filter((giveaway) => {
    // Filtro de plataforma
    if (
      filtros.plataforma &&
      !giveaway.platforms
        .toLowerCase()
        .includes(normalizarTexto(filtros.plataforma))
    ) {
      return false;
    }

    // Filtro de tipo
    if (
      filtros.tipo &&
      giveaway.type.toLowerCase() !== normalizarTexto(filtros.tipo)
    ) {
      return false;
    }

    // Filtro de status
    if (
      filtros.status &&
      giveaway.status &&
      giveaway.status.toLowerCase() !== normalizarTexto(filtros.status)
    ) {
      return false;
    }

    return true;
  });
}

// ------------------------- BUSCA COMPLETA COM FILTROS -------------------------

async function buscarGiveawaysComFiltros(filtros = {}, termoBusca = "") {
  try {
    const todosGiveaways = await buscarTodosGiveaways();
    let resultados = todosGiveaways;

    if (termoBusca) {
      resultados = filtrarGiveawaysPorPalavras(resultados, termoBusca);
    }

    resultados = filtrarGiveawaysPorCategoria(resultados, filtros);

    if (resultados.length === 0) {
      console.log(
        "Nenhum giveaway encontrado com os filtros e termos especificados."
      );
      return [];
    }

    exibirGiveaways(resultados);
    return resultados;
  } catch (erro) {
    console.error("Erro ao buscar giveaways com filtros:", erro);
    return [];
  }
}

// ------------------------- SALVAR NO LOCAL STORAGE -------------------------

function salvarGiveawayNoLocalStorage(giveaway) {
  const giveawayFormatado = formatarGiveaway(giveaway);
  const chave = `giveaway-${encodeURIComponent(giveawayFormatado.title)}`;
  localStorage.setItem(chave, JSON.stringify(giveawayFormatado));
}

export {
  buscarTodosGiveaways,
  buscarGiveawayPorId,
  buscarGiveawaysPorPlataforma,
  buscarGiveawaysPorTipo,
  buscarGiveawaysComFiltros,
  buscarGiveawaysPorPalavras,
  formatarGiveaway,
  salvarGiveawayNoLocalStorage,
};
