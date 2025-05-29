document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const credentials = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value
  };

  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const result = await response.json();

    if (result.token) {
      localStorage.setItem('token', result.token); 
      localStorage.setItem('id', result.id) 
      alert('Inicio de sesión exitoso');
      window.location.href = '../index.html'; // redirige a la gestión
    } else {
      alert('Credenciales incorrectas');
    }
  } catch (error) {
    alert('Error al iniciar sesión');
    console.error(error);
  }
});