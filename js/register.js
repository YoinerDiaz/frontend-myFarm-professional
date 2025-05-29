document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    usuario: document.getElementById('username').value,
    password: document.getElementById('password').value,
    nombre: document.getElementById('name').value,
    contacto: document.getElementById('contact').value,
    rol: 1
  };

  try {
    const response = await fetch('http://localhost:8080/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert('Usuario registrado correctamente');
    window.location.href = 'login.html'; // Redirige al login
  } catch (error) {
    alert('Error al registrar usuario');
    console.error(error);
  }
});