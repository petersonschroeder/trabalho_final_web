// Pega os parâmetros da URL
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id")
  };
}

// Pega os dados salvos (simulação - pode vir do localStorage ou API)
function getJogoPorId(id) {
  const todosJogos = JSON.parse(localStorage.getItem("todosGiveaways")) || [];
  return todosJogos.find(jogo => String(jogo.id) === String(id));
}

// Preenche os elementos HTML da página
function renderizarJogo(jogo) {
  if (!jogo) {
    document.querySelector(".game-title").textContent = "Jogo não encontrado.";
    return;
  }

  document.querySelector(".game-title").textContent = jogo.title;
  const imagem = document.querySelector(".image-block img");
  imagem.src = jogo.image;
  imagem.alt = `Imagem do jogo ${jogo.title}`;

  const descricao = jogo.description || "Sem descrição disponível.";
  document.querySelector(".extra-content").innerHTML = descricao;

  // Atualiza o link para a loja (assumindo que seja o segundo botão tipo <a>)
  const botoes = document.querySelectorAll("a.btn");
  botoes.forEach(btn => {
    if (btn.textContent.includes("Página da loja")) {
      btn.href = jogo.open_giveaway;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const { id } = getQueryParams();
  const jogo = getJogoPorId(id);
  renderizarJogo(jogo);
});
