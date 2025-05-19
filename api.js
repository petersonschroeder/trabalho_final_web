const API_BASE = "https://gamerpower.com/api";

const endpoints = {
  giveaways: `${API_BASE}/giveaways`,
  giveawayById: (giveawayId) => `${API_BASE}/giveaway?id=${giveawayId}`,
  byPlatform: (platform) => `${API_BASE}/giveaways?platform=${platform}`,
  byType: (type) => `${API_BASE}/giveaways?type=${type}`,
  sortBy: (sort) => `${API_BASE}/giveaways?sort-by=${sort}`,
  worth: `${API_BASE}/worth`,
};

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ao acessar ${url}`);
  }
  return response.json();
}

//----------------------------------------//

function formatarGiveaway(dado) {
  return {
    title: dado.title,
    image: dado.image,
    description: dado.description,
    end_date: dado.end_date,
    open_giveaway: dado.open_giveaway,
  };
}

function exibirGiveaways(giveaways) {
  giveaways.forEach((item) => {
    const giveawayFormatado = formatarGiveaway(item);
    console.log(giveawayFormatado.title);
  });
}

async function buscarTodosGiveaways() {
  const giveaways = await fetchJson(endpoints.giveaways.toLowerCase());
  exibirGiveaways(giveaways);
  return giveaways;
}

async function buscarGiveawayPorId(id) {
  return fetchJson(endpoints.giveawayById(id));
}

async function buscarGiveawaysPorPlataforma(plataforma) {
  const resultados = await fetchJson(endpoints.byPlatform(plataforma.toLowerCase()));
  exibirGiveaways(resultados);
  return resultados;
}

async function buscarGiveawaysPorTipo(tipo) {
  try {
    const url = endpoints.byType(tipo.toLowerCase());
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

//-----------------------------------------//

function salvarGiveawayNoLocalStorage(giveaway) {
  const giveawayFormatado = formatarGiveaway(giveaway);
  const chave = `giveaway-${encodeURIComponent(giveawayFormatado.title)}`;
  localStorage.setItem(chave, JSON.stringify(giveawayFormatado));
}


buscarGiveawaysPorPlataforma("pc")