const card = document.createElement('div');
card.className = 'card';

card.innerHTML = `
  <img src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=500&q=60" alt="Cachorro">
  <h3>PetShop Delivery</h3>
  <p>Compre ração, brinquedos e mais sem sair de casa — entregamos rapidinho!</p>
`;

document.getElementById('card-area').appendChild(card);