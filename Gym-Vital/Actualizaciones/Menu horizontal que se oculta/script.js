const header = document.getElementById('main-header');
const menuBtn = document.getElementById('menu-button');
const floatingMenu = document.getElementById('floating-menu');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScroll && scrollTop > 100) {
    header.style.top = '-100px'; // oculta menú
    menuBtn.style.display = 'block';
  } else {
    header.style.top = '0';
    menuBtn.style.display = 'none';
    floatingMenu.classList.add('hidden'); // cierra menú al subir
  }

  lastScroll = scrollTop;
});

menuBtn.addEventListener('click', () => {
  floatingMenu.classList.toggle('hidden');
});