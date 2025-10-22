const botonSelector = document.getElementById("selector-tema");
const elementoBody = document.body;
function actualizarTexto(){
    const estaEnModoOscuro = elementoBody.classList.contains("dark-mode");
    botonSelector.textContent= estaEnModoOscuro ? "Cambiar a modo claro ☀️" : "Cambiar a modo oscuro 🌙";
    //&#9728; &#65039
}
// if (estaEnModoOscuro) {
//     // Si la condición es TRUE (está en modo oscuro)
//     botonSelector.textContent = 'Cambiar a Modo Claro ☀️';
// } else {
//     // Si la condición es FALSE (está en modo claro)
//     botonSelector.textContent = 'Cambiar a Modo Oscuro 🌙';
// }
function alterarModo(){
    elementoBody.classList.toggle("dark-mode");
    actualizarTexto();
}
botonSelector.addEventListener("click", alterarModo);
actualizarTexto();