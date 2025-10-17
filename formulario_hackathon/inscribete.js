// Esperamos a que todo el HTML cargue antes de ejecutar el código
document.addEventListener("DOMContentLoaded", function () {
  // Guardamos los elementos del formulario en variables
  const form = document.getElementById("registrationForm");
  const email = document.getElementById("email");
  const nameField = document.getElementById("name");
  const surname = document.getElementById("surname");
  const role = document.getElementById("role");
  const phone = document.getElementById("phone");
  const terms = document.getElementById("terms");
  const coc = document.getElementById("coc");

  // Función para mostrar un mensaje de error debajo del campo
  function showError(field, message) {
    // Si ya existe un mensaje, lo borramos antes
    clearError(field);

    const errorDiv = document.createElement("div");
    errorDiv.className = "simple-error";
    errorDiv.textContent = message;
    field.insertAdjacentElement("afterend", errorDiv);
  }

  // Función para borrar el mensaje de error si existe
  function clearError(field) {
    const next = field.nextElementSibling;
    if (next && next.classList.contains("simple-error")) {
      next.remove();
    }
  }

  // Función que valida un solo campo
  function validateField(field) {
    clearError(field); // limpia errores anteriores
    const value = field.value.trim();

    // Campos obligatorios
    if (field.hasAttribute("required")) {
      if (field.type === "checkbox" && !field.checked) {
        showError(field, "Este campo es obligatorio.");
        return false;
      }
      if (value === "") {
        showError(field, "Este campo es obligatorio.");
        return false;
      }
    }

    // Validar email
    if (field.type === "email" && value !== "" && !field.checkValidity()) {
      showError(field, "Por favor, escribe un correo válido.");
      return false;
    }

    // Validar teléfono con el patrón (solo si hay algo escrito)
    if (field.id === "phone" && value !== "") {
      const phonePattern = /^[0-9+\s\-()]{6,}$/;
      if (!phonePattern.test(value)) {
        showError(field, "Introduce un número válido (ej: +34 600 000 000).");
        return false;
      }
    }

    return true; // todo bien 
  }

  // Validar todos los campos del formulario
  function validateForm() {
    let valid = true;

    // Lista de campos a revisar
    const fields = [email, nameField, surname, role, terms, coc, phone];

    fields.forEach((field) => {
      if (!validateField(field)) {
        valid = false;
      }
    });

    return valid;
  }

  // Mostrar notificación (toast)
  // type puede ser: "success", "error" o "warn"
  function showToast(message, type = "success", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    // Cambiamos el color según el tipo
    if (type === "success") {
      toast.style.backgroundColor = "#17b169"; // verde
    } else if (type === "error") {
      toast.style.backgroundColor = "#d9534f"; // rojo
    } else if (type === "warn") {
      toast.style.backgroundColor = "#f0ad4e"; // naranja
    }

    document.body.appendChild(toast);

    // Después de unos segundos, lo ocultamos con animación
    setTimeout(() => {
      toast.classList.add("hide"); // activa la animación "desaparecer"
      setTimeout(() => toast.remove(), 400); // luego lo quitamos del DOM
    }, duration);
  }

  // Cuando el usuario envía el formulario
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // evita que se recargue la página

    // Borramos todos los errores viejos
    const oldErrors = form.querySelectorAll(".simple-error");
    oldErrors.forEach((e) => e.remove());

    // Validamos todo el formulario
    const isValid = validateForm();

    if (!isValid) {
      showToast("Por favor, revisa los campos obligatorios.", "error");
      return;
    }

    // Si todo está bien, mostramos mensaje de éxito
    showToast("¡Formulario enviado correctamente!", "success");

    // Reiniciamos el formulario
    form.reset();
  });

  // Validación al salir de cada campo (blur)
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((field) => {
    field.addEventListener("blur", function () {
      validateField(field);
    });
  });
});

