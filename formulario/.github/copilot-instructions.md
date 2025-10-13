# Copilot Instructions for This Project

## Project Overview
This is a simple frontend login form project consisting of three main files:
- `formulario.html`: The main HTML file for the login form UI.
- `estilo-formulario.css`: The CSS file for styling the form (currently empty).
- `formulario.js`: The JavaScript file for form logic (currently empty).

## Key Patterns & Structure
- The login form uses standard HTML `<form>` submission with `POST` to `/login`.
- The form includes username and password fields, both required.
- The CSS and JS files are linked in the HTML, but currently contain no logic or styles.
- Class names in the HTML (e.g., `login-contenedor`, `imput-group`, `buton-login`) are in Spanish and may contain typos (e.g., `imput-group` instead of `input-group`, `buton-login` instead of `button-login`).

## Development Guidelines
- **HTML**: Update or extend the form in `formulario.html`. Maintain semantic structure and required fields.
- **CSS**: Add or modify styles in `estilo-formulario.css`. Use the class names as defined in the HTML, but consider correcting typos for consistency.
- **JavaScript**: Place all client-side logic (e.g., form validation, interactivity) in `formulario.js`. The file is currently empty, so you can define new functions as needed.
- **No build tools or frameworks**: This project is pure HTML/CSS/JS with no external dependencies or build steps.

## Example: Adding Client-Side Validation
- Add event listeners in `formulario.js` to validate form fields before submission.
- Example pattern:
  ```js
  document.querySelector('form').addEventListener('submit', function(e) {
    // validation logic
  });
  ```

## Conventions
- Use Spanish for UI labels and comments, following the existing style.
- Keep code simple and readable for educational purposes.
- If you introduce new class names or IDs, update both HTML and CSS for consistency.

## Integration Points
- The form's `action` points to `/login`, which is not implemented in this frontend. If backend integration is needed, document the expected API.

## File Reference
- `formulario.html`: Main UI
- `estilo-formulario.css`: Styles (add as needed)
- `formulario.js`: JS logic (add as needed)

---
For questions or unclear conventions, ask for clarification or propose improvements in this file.
