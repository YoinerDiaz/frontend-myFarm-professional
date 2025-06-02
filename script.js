// script.js

const loadedScripts = new Set(); // Mantiene seguimiento de scripts ya cargados

document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll('#sidebar a[data-page]');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      loadSection(page);
    });
  });
});

function loadSection(page) {
  fetch(page)
    .then(res => res.text())
    .then(html => {
      document.getElementById("contenido-principal").innerHTML = html;
      loadScriptForPage(page);
    });
}

function loadScriptForPage(page) {
  const scriptMap = {
    'pages/cultivos.html': 'js/cultivos.js',
    'pages/trabajos.html': 'js/trabajos.js',
    'pages/insumos.html': 'js/insumos.js',
    'pages/usuarios.html': 'js/usuarios.js',
    'pages/inicio.html': 'js/inicio.js' // opcional
  };

  const scriptUrl = scriptMap[page];
  if (scriptUrl) {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.onload = () => {
      if (typeof initPage === 'function') {
        initPage();
      }
    };
    document.body.appendChild(script);
  }

}


function cerrarSesion(){
    localStorage.removeItem('token')
    localStorage.removeItem('id')
    window.location.href = 'pages/login.html'
}
