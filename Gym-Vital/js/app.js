/* ----------  CARGA MENÚ  ---------- */
// Cargar menú en todas las páginas
const base = location.pathname.includes('/html/') ? '.' : './html';
fetch(`${base}/menu.html`) // ajusta la ruta según la ubicación
  .then(res => {
    if (!res.ok) throw new Error('No se pudo cargar menu.html');
    return res.text();
  })
  .then(html => {
    document.getElementById('menu-container').innerHTML = html;
    activarMenu(); // si tenés funciones para animaciones o comportamiento
  })
  .catch(err => console.error('Error al cargar el menú:', err));


/* ----------  MENÚ FLOTANTE  ---------- */
function activarMenu() {
  const header = document.getElementById('main-header');
  const btn = document.getElementById('menu-button');
  const menu = document.getElementById('floating-menu');
  if (!header || !btn || !menu) {
    console.warn('⚠️ Faltan elementos del menú en el DOM');
    return;
  }
  let last = 0;
  window.addEventListener('scroll', () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > last && st > 100) {
      header.style.top = '-100px';
      btn.style.display = 'block';
    } else {
      header.style.top = '0';
      btn.style.display = 'none';
      menu.classList.add('hidden');
    }
    last = st;
  });
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));
}

/* ----------  VIDEO PROMOCIONAL  ---------- */
function activarVideo() {
  const v = document.getElementById('promoVideo');
  if (!v) {
    console.warn('⚠️ No se encontró #promoVideo');
    return;
  }
  // Fuerza recarga para garantizar el evento canplay
  v.load();
  v.addEventListener('canplay', () => {
    setTimeout(() => {
      v.play().catch(e => console.warn('Autoplay bloqueado:', e));
    }, 1400);
  }, { once: true });
}

/* ----------  FORMULARIO  ---------- */
function activarForm() {
  const f = document.getElementById('formContacto');
  const msg = document.getElementById('formMsg');
  if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.checkValidity()) { msg.textContent = 'Completa todos los campos'; return; }
    msg.style.color = '#0ff'; msg.textContent = '¡Mensaje enviado!';
    f.reset();
  });
}