document.addEventListener("DOMContentLoaded", () => {
  // Pega o id da URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("ID do jogo não fornecido na URL.");
    return;
  }

  // Busca todos os jogos no localStorage
  const todos = JSON.parse(localStorage.getItem("todosGiveaways") || "[]");
  const jogo = todos.find((j) => String(j.id) === String(id));

  if (!jogo) {
    alert("Jogo não encontrado.");
    return;
  }

  // Atualiza a interface com os dados do jogo
  document.querySelector(".game-title").textContent = jogo.title;
  const imgElem = document.querySelector(".image-block img");
  imgElem.src = jogo.image || "";
  imgElem.alt = `Imagem do jogo ${jogo.title}`;

  document.getElementById("btn-loja").href = jogo.open_giveaway || "#";

  document.getElementById("descricao-jogo").textContent =
    jogo.description || "Descrição não disponível para este jogo.";

  // Botão Favoritar
  document.getElementById("btn-favoritar").addEventListener("click", () => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");

    // Verifica se já está favoritado
    const existe = favoritos.some((f) => String(f.id) === String(jogo.id));

    if (existe) {
      alert(`"${jogo.title}" já está nos favoritos.`);
    } else {
      favoritos.push(jogo);
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
      alert(`"${jogo.title}" adicionado aos favoritos!`);
    }
  });

  // Botão Compartilhar (copia URL da página atual)
  document
    .getElementById("btn-compartilhar")
    .addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(jogo.open_giveaway);
        alert("Link copiado para a área de transferência!");
      } catch (err) {
        alert("Erro ao copiar o link. Tente copiar manualmente.");
        console.error(err);
      }
    });
});
