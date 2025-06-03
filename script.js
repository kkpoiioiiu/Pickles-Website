// Data storage
let products = JSON.parse(localStorage.getItem('products')) || [
  {
    name: "Mango Pickle",
    category: "Veg",
    price: 100,
    image: "https://www.whiskaffair.com/wp-content/uploads/2020/07/Kerala-Style-Mango-Pickle-2-3.jpg"
  },
  {
    name: "Chicken Pickle",
    category: "Non-Veg",
    price: 150,
    image: "https://tenaliruchulu.com/cdn/shop/files/Screenshot2024-06-15at4.30.44PM.png?v=1718449396"
  },
   {
    name: "prawn Pickle",
    category: "Non-Veg",
    price: 150,
    image: "https://www.shutterstock.com/image-photo/fried-prawn-shrimp-pickle-ingredients-260nw-1208824675.jpg"
  }
];

let clients = JSON.parse(localStorage.getItem('clients')) || [];
let currentClient = null; // will hold logged-in client info
let isAdmin = false;
let editingProductIndex = null;

// Navbar elements
const navHome = document.getElementById('nav-home');
const navVeg = document.getElementById('nav-veg');
const navNonVeg = document.getElementById('nav-nonveg');
const navAdmin = document.getElementById('nav-admin');
const navRegister = document.getElementById('nav-register');

// Sections
const adminSection = document.getElementById('admin-section');
const registerSection = document.getElementById('register-section');
const mainContent = document.getElementById('main-content');
const productSection = document.getElementById('product-section');
const cartSection = document.getElementById('cart-section');
const adminManagement = document.getElementById('admin-management');

// Forms
const adminForm = document.getElementById('admin-form');
const registerForm = document.getElementById('register-form');
const productForm = document.getElementById('product-form');
const productIndexInput = document.getElementById('product-index');

// Buttons
const checkoutBtn = document.getElementById('checkout-btn');

// Event handlers for navigation
navHome.onclick = () => { showHome(); };
navVeg.onclick = () => { renderProducts('Veg'); };
navNonVeg.onclick = () => { renderProducts('Non-Veg'); };
navAdmin.onclick = () => { showAdminLogin(); };
navRegister.onclick = () => { showRegister(); };

// Functions to toggle views
function hideAll() {
  adminSection.style.display = 'none';
  registerSection.style.display = 'none';
  mainContent.style.display = 'none';
  adminManagement.style.display = 'none';
  cartSection.style.display = 'none';
}

// Show home (all products)
function showHome() {
  hideAll();
  mainContent.style.display = 'block';
  renderProducts(); // show all initially
  // Show cart if client logged in
  if (currentClient) {
    document.getElementById('cart-section').style.display = 'block';
    renderCart();
  } else {
    document.getElementById('cart-section').style.display = 'none';
  }
}

// Show admin login form
function showAdminLogin() {
  hideAll();
  adminSection.style.display = 'block';
}

// Show register form
function showRegister() {
  hideAll();
  registerSection.style.display = 'block';
}

// Admin login handler
adminForm.onsubmit = (e) => {
  e.preventDefault();
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value.trim();
  if (username === 'admin' && password === 'admin123') {
    alert('Admin logged in!');
    isAdmin = true;
    showAdminManagement();
  } else {
    alert('Invalid credentials.');
  }
};

// Show admin management
function showAdminManagement() {
  hideAll();
  mainContent.style.display = 'block';
  adminManagement.style.display = 'block';
  renderProducts();
}

// Register new client
registerForm.onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const confirmPassword = document.getElementById('reg-confirm-password').value.trim();
  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }
  // Save client
  currentClient = { name, email, password, cart: [] };
  clients.push(currentClient);
  localStorage.setItem('clients', JSON.stringify(clients));
  alert(`Welcome, ${name}!`);
  showHome();
  renderCart();
};

// Render products based on filter
function renderProducts(filterCategory) {
  productSection.innerHTML = '';

  let filtered = products;
  if (filterCategory) {
    filtered = products.filter(p => p.category === filterCategory);
  }

  filtered.forEach((prod, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${prod.image}" />
      <h3>${prod.name}</h3>
      <p>Category: ${prod.category}</p>
      <p>Price: ₹${prod.price}</p>
      ${currentClient ? `<button onclick="addToCart(${index})">Add to Cart</button>` : ''}
      ${isAdmin ? `
        <button onclick="editProduct(${index})">Edit</button>
        <button onclick="deleteProduct(${index})">Delete</button>
      ` : ''}
    `;
    productSection.appendChild(card);
  });
}

// Add to cart
function addToCart(index) {
  if (!currentClient) {
    alert('Please login as a client to add products.');
    return;
  }
  const product = products[index];
  currentClient.cart = currentClient.cart || [];
  currentClient.cart.push(product);
  saveClient();
  renderCart();
}

// Save client data to local storage
function saveClient() {
  clients = clients.filter(c => c.email !== currentClient.email);
  clients.push(currentClient);
  localStorage.setItem('clients', JSON.stringify(clients));
}

// Render cart items
function renderCart() {
  document.getElementById('cart-items').innerHTML = '';
  if (!currentClient || !currentClient.cart || currentClient.cart.length === 0) {
    document.getElementById('cart-items').innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  currentClient.cart.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <span>${item.name} - ₹${item.price}</span>
      <button class="delete-btn" onclick="removeFromCart(${idx})">Remove</button>
    `;
    document.getElementById('cart-items').appendChild(div);
  });
}

// Remove from cart
function removeFromCart(idx) {
  if (currentClient && currentClient.cart) {
    currentClient.cart.splice(idx, 1);
    saveClient();
    renderCart();
  }
}

// Checkout
document.getElementById('checkout-btn').onclick = () => {
  if (currentClient && currentClient.cart.length > 0) {
    alert(`Thank you, ${currentClient.name}! Your order of ₹${calculateTotal()} is confirmed.`);
    currentClient.cart = [];
    saveClient();
    renderCart();
  } else {
    alert('Your cart is empty.');
  }
};
function calculateTotal() {
  return currentClient.cart.reduce((sum, item) => sum + item.price, 0);
}

// Admin - Add/Edit Products
document.getElementById('product-form').onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('product-name').value.trim();
  const category = document.getElementById('product-category').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const image = document.getElementById('product-image').value.trim();

  if (name && category && !isNaN(price) && image) {
    if (editingProductIndex !== null) {
      products[editingProductIndex] = { name, category, price, image };
      editingProductIndex = null;
    } else {
      products.push({ name, category, price, image });
    }
    localStorage.setItem('products', JSON.stringify(products));
    renderProducts();
    document.getElementById('product-form').reset();
  }
};

window.editProduct = (index) => {
  const prod = products[index];
  document.getElementById('product-name').value = prod.name;
  document.getElementById('product-category').value = prod.category;
  document.getElementById('product-price').value = prod.price;
  document.getElementById('product-image').value = prod.image;
  document.getElementById('product-index').value = index;
  editingProductIndex = index;
};

window.deleteProduct = (index) => {
  if (confirm('Delete this product?')) {
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    renderProducts();
  }
};

// Initialize default view
showHome();