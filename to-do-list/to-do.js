// Selectores para obtener elementos del DOM

const { createElement } = require("react");

const tareaInput = document.getElementById("tarea_input");
const botonAgregar = document.getElementById("agregarTarea");
const listaTareas = document.getElementById("tareaLista");

// Eventos principales

document.addEventListener("DOMContentLoaded", cargarTareas); //DOMContentLoaded significa que el HTML ha sido completamente cargado y parseado
botonAgregar.addEventListener("click", agregarTarea);
listaTareas.addEventListener("click", eliminarTarea);

// la logica de la app
//creamos las funciones
function agregarTarea(e) {
    const tareaText = tareaInput.valuea.trim();
    if (tareaText) {
        crearElementTarea(tareaText)
        guardarTarea(tareaText);
        tareaInput.value = "";
    }

}
//la funcion para crear los elementos li 

function crearElementTarea(tareaText, isCompleted = false) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.setAttribute("data-text", tareaText);
    if (isCompleted) li.classList.add("completed");
    li.innerHTML = `
        <span>${tareaText}</span>
        <button class="completed-btn"></button>
        <button class="delete-btn"></button>`;
        li.querySelector(".completed-btn").addEventListener ("click", completarTarea)
        li.querySelector (".delete-btn").addEventListener ("click", eliminarTarea);
    listaTareas.appendChild(li); //para crear el hijo li
    }

function completarTarea(event){
    const li = event.target.parentElement; //El <li> es el padre del boton
    li.classList.toggle("completed");
    actualizarEstadoTarea(li.getAtribute("data-text"));
}
function eliminarTarea(event){
    const li = event.target.parentElement; //El <li> es el padre del boton
    const tareaText = li.getAtribute("data-text");
    listaTarea.removeChild(li);
    borrarTarea(tareaText);
}
const obtenerTareas = () => JSON.parse(localStorage.getItem('tasks')) || [];

function cargarTareas(){
    obtenerTareas().forEach(task => crearElementoTarea(task.text, task.completed));
}
function guardarTarea(tareaText){
    const tasks = obtenerTareas();
    tasks.push({text:tareaText, completed:false});
    localStorage.getItem("tasks", JSON.stringify(tasks));
}
function actualizarEstadoTarea(tareaText){
    let tasks = obtenerTareas();
    // Usamos 'map' para crear un nuevo array con el estado actualizado.
    tasks = tasks.map(task => 
        task.text === tareaText 
            ? { ...task, completed: !task.completed } // Cambia el estado
            : task // Mantiene las demás tareas igual
    );
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function borrarTarea(tareaText){
    // Usamos 'filter' para crear un nuevo array sin la tarea eliminada.
    const tasks = obtenerTareas().filter(task => task.text !== tareaText);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
 
