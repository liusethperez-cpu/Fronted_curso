// /SELECTORES para obtener los elementos del DOM
const tareaInput = document.getElementById("tarea_input");
const botonAgregar = document.getElementById("agregarTarea");
const listaTarea = document.getElementById("tareaLista");
//EVENTOS PRINCIPALES
document.addEventListener("DOMContentLoaded", cargarTareas);
botonAgregar.addEventListener("click", agregarNuevaTarea);
//La lógica de la app
//Creamos las funciones
function agregarNuevaTarea(){
    const tareaText= tareaInput.value.trim();
    if(tareaText){
        crearElementoTarea(tareaText);
        guardarTarea(tareaText);
        tareaInput.value ="";
    }
}
//La función central para crear los elementos <li> y sus botones
//isCompleted tiene como valor por defecto false, de lo contrario todas las tareas se crearan como completadas
function crearElementoTarea(tareaText, isCompleted = false){
    const li = document.createElement("li");
    li.className="task-item";
    li.setAttribute("data-text", tareaText);//creamos el atributo data-text para identificarlo como dato
    if(isCompleted) li.classList.add("completed");
    li.innerHTML = `
        <span>${tareaText}</span>
        <button class="completed-btn">✓</button>
        <button class="delete-btn">X</button>`;
    li.querySelector(".completed-btn").addEventListener("click", completarTarea);
    li.querySelector(".delete-btn").addEventListener("click", eliminarTarea);
    listaTarea.appendChild(li);//creamos el hijo li y lo agregamos a la lista
}
function completarTarea(event){
    const li = event.target.parentElement; //El <li> es el padre del boton
    li.classList.toggle("completed");
    actualizarEstadoTarea(li.getAttribute("data-text"));
}
function eliminarTarea(event){
    const li = event.target.parentElement; //El <li> es el padre del boton
    const tareaText = li.getAttribute("data-text");
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
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function borrarTarea(tareaText){
    // Usamos 'filter' para crear un nuevo array sin la tarea eliminada.
    const tasks = obtenerTareas().filter(task => task.text !== tareaText);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
 
