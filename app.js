/***********************
 * CONFIG – CHANGE THESE
 ***********************/
const CONFIG = {
  SHEET_API_URL: 'https://script.google.com/macros/s/AKfycbzBIoaWSft7Zq_-MRxFviTIBUVQ2J_MwUGxlCUnQrzpBuB-4Mkc4gh8zPDQ_o24Gmw/exec', // e.g., https://api.sheety.co/xxx/myshop/products OR your Apps Script web app URL
  SHEET_API_KEY: 'veryeasy', // keep blank if your endpoint doesn't require it
  WHATSAPP_NUMBER: '971554945080', // e.g., 9715XXXXXXXX (no + or spaces)
  // Expected product fields in the sheet: name, price, image, description, category
  SHEET_ID: '1GI3pVaISRXD4-EPI_Nxlva4QjddtI5JpV9RxUfeUEik',
  SHEET_GID: '0',
};

/***********************
 * UTILITIES
 ***********************/
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

//  WHATSAPP INTEGRATION


async function sendWhatsAppOrder(order) {
  const WHATSAPP_TOKEN = "EAAbzoiZCDJywBPT2r2ZBl5zd05t23ZB11IMHmodAZBZBTbPFxP3IuWPTtUuJMIqwbluo5ysBKpKP2ZCTw1vWa1KOZA3XmFz8iIPBrlEOG3SSyQzxr7tO2XZB03SBja6KZBAIY6eraJzA9KFoB75q07t0Q8CgW3qc6ZCpMjBu2FgZCL7CHcSjpmsiZBqsc1alWTV3sWpGRhQLQdv0fNSxufEIXShaiJ7J4ZAjvgXKlJhnZAoN1c"; 
  const PHONE_NUMBER_ID = "769109669622747"; // from Meta dashboard

  const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

  // Build order message
  const orderText = `🛒 New Order Received!
Name: ${order.name}
Contact: ${order.contact}
Address: ${order.address}

Items:
${order.items.map(i => `- ${i.name} x${i.qty} = $${i.total}`).join("\n")}

Total: $${order.total}`;

  const payload = {
    messaging_product: "whatsapp",
    to: "971554945080", // your test user phone number (full intl format, no +)
    type: "text",
    text: { body: orderText }
  };

  console.log("Sending Order:", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("WhatsApp API Response:", data);

  return data;
}



document.addEventListener("DOMContentLoaded", () => {
  const cart = readCart();
  const form = document.getElementById("checkout-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const order = {
      name: document.getElementById("name").value,
      contact: document.getElementById("contact").value,
      address: document.getElementById("address").value,
      customerPhone: "15551890857", // test number with country code
      items: cart.map(item => ({
        name: item.name,
        qty: item.qty,
        total: item.qty * item.price
      })),
      total: cart.reduce((sum, item) => sum + item.qty * item.price, 0)
    };

    await sendWhatsAppOrder(order);
    alert("Order sent to WhatsApp!");
  });
});




function currency(n){
  const num = Number(n || 0);
  return `AED ${num.toFixed(2)}`;
}

function encode(s){ return encodeURIComponent(s); }

function getPage(){
  return document.body.getAttribute('data-page') || 'home';
}

/***********************
 * SIDEBAR (Right)
 ***********************/
function setupSidebar(){
  const hamburger = $("#hamburger");
  const sidebar = $("#sidebar");
  const overlay = $("#overlay");
  const closeBtn = $("#close-sidebar");
  if(!hamburger || !sidebar || !overlay || !closeBtn) return;

  const open = ()=>{ sidebar.classList.add('active'); overlay.classList.add('active'); };
  const close = ()=>{ sidebar.classList.remove('active'); overlay.classList.remove('active'); };

  hamburger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
}

/***********************
 * CART (localStorage)
 ***********************/
const CART_KEY = 'myshop_cart_v1';

function readCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch{ return []; }
}
function writeCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function cartCount(cart){ return cart.reduce((s,i)=>s+i.qty,0); }
function cartSubtotal(cart){ return cart.reduce((s,i)=>s+(Number(i.price)||0)*i.qty,0); }

function updateCartBadge(){
  const cart = readCart();
  $$("#cart-btn").forEach(btn=>{
    btn.textContent = `Cart (${cartCount(cart)})`;
  });
}

function addToCart(product, qty=1){
  const cart = readCart();
  const idx = cart.findIndex(i => i.name === product.name);
  if(idx > -1){
    cart[idx].qty += qty;
  }else{
    cart.push({...product, qty});
  }
  writeCart(cart);
  updateCartBadge();
}

function setCartQty(name, qty){
  const cart = readCart();
  const idx = cart.findIndex(i => i.name === name);
  if(idx>-1){
    cart[idx].qty = Math.max(1, qty);
    writeCart(cart);
    updateCartBadge();
  }
}
function removeFromCart(name){
  const cart = readCart().filter(i => i.name !== name);
  writeCart(cart);
  updateCartBadge();
}

/***********************
 * SHEET API
 ***********************/
/***********************
 * SHEET (shared link, no API)
 * Uses Google's gviz JSON: 
 * https://docs.google.com/spreadsheets/d/<SHEET_ID>/gviz/tq?gid=<GID>&tqx=out:json
 ***********************/
const SHEET_ID = 'PASTE_YOUR_SHEET_ID';
const SHEET_GID = 'PASTE_YOUR_GID';

function convertDriveLink(url) {
  if (!url) return '';
  const match = url.match(/[-\w]{25,}/); // pulls out the FILE_ID
  return match ? `https://drive.google.com/uc?export=view&id=${match[0]}` : url;
}


async function fetchProducts() {
  const url = `https://docs.google.com/spreadsheets/d/1GI3pVaISRXD4-EPI_Nxlva4QjddtI5JpV9RxUfeUEik/gviz/tq?gid=0&tqx=out:json`;
  const res = await fetch(url);
  const text = await res.text();

  // gviz wraps JSON like: google.visualization.Query.setResponse({...});
  const json = JSON.parse(text.replace(/^[\s\S]*setResponse\(/, '').replace(/\);?[\s\S]*$/, ''));

  // Expect headers in the first row (Google exposes them via cols[].label)
  const cols = (json.table.cols || []).map(c => (c.label || '').trim().toLowerCase());

  // rows -> array of {name, price, image, description, category}
  const products = (json.table.rows || []).map(r => {
    const obj = {};
    (r.c || []).forEach((cell, i) => {
      const key = cols[i] || `col_${i}`;
      // If cell is null, keep empty string; otherwise prefer cell.v
      obj[key] = cell && 'v' in cell ? cell.v : '';
    });
    // normalize types/keys our UI expects
    return {
      name: String(obj.name || ''),
      price: Number(obj.price || 0),
      image: String(obj.image || ''),
      description: String(obj.description || ''),
      category: String(obj.category || 'Uncategorized')
    };
  });

  return products;
}

/***********************
 * RENDER HELPERS
 ***********************/
function productCard(p){
  const div = document.createElement('div');
  div.className = 'product';
  console.log(p.image)
  div.innerHTML = `
    <img src="https://drive.google.com/thumbnail?id=${p.image}&sz=w1000" alt="${p.name || 'Product'}" style="object-fit:contain"/>
    <div class="product-info">  
      <h3>${p.name || ''}</h3>
      <div class="price">${currency(Number(p.price || 0))}</div>
      <p class="desc">${p.description || ''}</p>
      <div class="qty-controls">
        <button class="dec">-</button>
        <span class="qty">1</span>
        <button class="inc">+</button>
      </div>
      <button class="add-cart">Add to Cart</button>
    </div>
  `;

  let qty = 1;
  const qtySpan = $('.qty', div);
  $('.dec', div).addEventListener('click', ()=>{ if(qty>1){ qty--; qtySpan.textContent=qty; }});
  $('.inc', div).addEventListener('click', ()=>{ qty++; qtySpan.textContent=qty; });
  $('.add-cart', div).addEventListener('click', ()=>{
    addToCart({
      name: p.name,
      price: Number(p.price || 0),
      image: p.image || '',
      description: p.description || '',
      category: p.category || 'Uncategorized'
    }, qty);
  });

  return div;
}

function renderProducts(containerId, products){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = '';
  products.forEach(p => container.appendChild(productCard(p)));
}

/***********************
 * HOME PAGE
 ***********************/
async function initHome(){
  const products = await fetchProducts();
  // Pick first 8 as "featured" (or filter by category/flag if you add it in the sheet)
  renderProducts('featured-products', products.slice(0,8));
}

/***********************
 * SHOP PAGE
 ***********************/
function uniqueCategories(products){
  const set = new Set(products.map(p => (p.category || 'Uncategorized')));
  return ['All', ...Array.from(set)];
}
function filterProducts(products, cat, term){
  let list = products;
  if(cat && cat !== 'All'){
    list = list.filter(p => (p.category||'') === cat);
  }
  if(term){
    const t = term.toLowerCase();
    list = list.filter(p =>
      (p.name||'').toLowerCase().includes(t) ||
      (p.description||'').toLowerCase().includes(t)
    );
  }
  return list;
}
async function initShop(){
  const products = await fetchProducts();

  // Category chips
  const chipsWrap = $('#category-chips');
  const urlCat = new URLSearchParams(location.search).get('cat') || 'All';
  const cats = uniqueCategories(products);
  chipsWrap.innerHTML = '';
  cats.forEach(cat=>{
    const chip = document.createElement('button');
    chip.className = 'chip' + (cat===urlCat ? ' active':'');
    chip.textContent = cat;
    chip.addEventListener('click', ()=>{
      // update URL param to keep it simple
      const u = new URL(location.href);
      u.searchParams.set('cat', cat);
      location.href = u.toString();
    });
    chipsWrap.appendChild(chip);
  });

  // Search
  const search = $('#search');
  const apply = ()=>{
    const cat = new URLSearchParams(location.search).get('cat') || 'All';
    $('#shop-title').textContent = cat === 'All' ? 'Shop' : cat;
    const list = filterProducts(products, cat, search.value.trim());
    renderProducts('shop-products', list);
  };
  search.addEventListener('input', apply);

  apply();
}

/***********************
 * CART PAGE + WHATSAPP
 ***********************/
function renderCart(){
  const itemsWrap = $('#cart-items');
  const empty = $('#cart-empty');
  const cart = readCart();

  itemsWrap.innerHTML = '';
  if(cart.length === 0){
    empty.style.display = 'block';
  }else{
    empty.style.display = 'none';
    cart.forEach(item=>{
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="https://drive.google.com/thumbnail?id=${item.image || ''}" alt="${item.name}">
        <div>
          <div class="item-title">${item.name}</div>
          <div class="muted">${currency(item.price)} • ${item.category || ''}</div>
        </div>
        <div class="item-row">
          <button class="small-btn" data-act="dec">-</button>
          <span>${item.qty}</span>
          <button class="small-btn" data-act="inc">+</button>
          <button class="small-btn remove-btn" data-act="remove">Remove</button>
        </div>
      `;
      row.addEventListener('click', (e)=>{
        const btn = e.target.closest('button'); if(!btn) return;
        const act = btn.getAttribute('data-act');
        if(act==='dec'){ setCartQty(item.name, item.qty-1); }
        if(act==='inc'){ setCartQty(item.name, item.qty+1); }
        if(act==='remove'){ removeFromCart(item.name); }
        renderCart(); // re-render
      });
      itemsWrap.appendChild(row);
    });
  }

  // Totals
  const sub = cartSubtotal(cart);
  $('#subtotal').textContent = currency(sub);
  $('#total').textContent = currency(sub); // shipping added later
}

function buildWhatsappMessage(order){
  const { name, contact, address, items } = order;
  const lines = [];
  lines.push(`New Order from MyShop`);
  lines.push(`-----------------------`);
  lines.push(`Name: ${name}`);
  lines.push(`Contact: ${contact}`);
  lines.push(`Address: ${address}`);
  lines.push(``);
  lines.push(`Order:`);
  items.forEach(i=>{
    lines.push(`- ${i.name} x${i.qty} @ ${currency(i.price)} = ${currency(i.price*i.qty)}`);
  });
  const total = items.reduce((s,i)=>s+i.qty*i.price,0);
  lines.push(``);
  lines.push(`Total: ${currency(total)}`);
  return lines.join('\n');
}

function setupCheckout(){
  const form = $('#checkout-form');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const cart = readCart();
    if(cart.length === 0){
      alert('Your cart is empty.');
      return;
    }
    const name = $('#name').value.trim();
    const contact = $('#contact').value.trim();
    const address = $('#address').value.trim();
    const msg = buildWhatsappMessage({ name, contact, address, items: cart });
    const phone = CONFIG.WHATSAPP_NUMBER.replace(/[^\d]/g,''); // sanitize
    const url = `https://wa.me/${phone}?text=${encode(msg)}`;
    // Redirect to WhatsApp
    window.location.href = url;
  });
}

/***********************
 * INIT (all pages)
 ***********************/
function initCommon(){
  setupSidebar();
  updateCartBadge();
}

document.addEventListener('DOMContentLoaded', ()=>{
  initCommon();
  const page = getPage();
  if(page==='home') initHome();
  if(page==='shop') initShop();
  // if(page==='cart'){ renderCart(); setupCheckout(); }
  if(page==='cart'){ renderCart();  }
});
