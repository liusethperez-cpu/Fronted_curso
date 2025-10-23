// Menú móvil: abre/cierra la lista y scroll suave
(function(){
const menuBtn = document.getElementById('menuBtn');
const navWrap = document.querySelector('header .nav');


if(menuBtn){
menuBtn.addEventListener('click', ()=> navWrap.classList.toggle('open'));
}


// Scroll suave para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(a=>{
a.addEventListener('click', (e)=>{
const href = a.getAttribute('href');
if(href.length>1){
e.preventDefault();
const target = document.querySelector(href);
if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
// cerrar menú móvil después de click (si estaba abierto)
navWrap.classList.remove('open');
}
})
});


// Año dinámico en el footer
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();
})();