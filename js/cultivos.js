// cultivos.js
function initPage() {
    const token = localStorage.getItem('token');
    const urlBase = 'http://localhost:8080/api/cultivos';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const tabla = document.getElementById('tabla-cultivos'); // Tu tbody de la tabla
    const form = document.getElementById('form-cultivo');
    const buscar = document.getElementById('buscar');
    const limpiarBusquedaBtn = document.getElementById('limpiar-busqueda');
    const alertaDiv = document.getElementById('alerta'); // Para mostrar mensajes
    const formTitle = document.getElementById('form-title'); // Título del formulario
    const btnCancelar = document.getElementById('btn-cancelar'); // Botón Cancelar en el formulario
    const btnGuardar = document.getElementById('btn-guardar'); // Botón Guardar en el formulario

    // Configuración del modal de eliminación
    const modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));
    const btnConfirmarEliminar = document.getElementById('btn-confirmar-eliminar');
    let cultivoIdToDelete = null; // Variable para guardar el ID a eliminar

    let cultivos = []; // Almacena todos los cultivos cargados

    // --- Funciones Principales ---

    async function cargarCultivos() {
        try {
            const res = await fetch(urlBase, { headers });
            if (!res.ok) {
                if (res.status === 401) {
                    mostrarAlerta('Sesión expirada o no autorizada. Por favor, inicie sesión de nuevo.', 'danger');
                    // Considera redirigir a la página de login después de un breve retardo
                    setTimeout(() => window.location.href = 'login.html', 2000);
                }
                throw new Error(`¡Error HTTP! Estado: ${res.status}`);
            }
            cultivos = await res.json();
            mostrarCultivos(cultivos); // Muestra todos los cultivos
        } catch (error) {
            console.error('Error al cargar cultivos:', error);
            mostrarAlerta('Error al cargar cultivos. Por favor, intente de nuevo.', 'danger');
        }
    }

    function mostrarCultivos(data) {
        tabla.innerHTML = ''; // Limpia el cuerpo de la tabla
        data.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.nombre}</td>
                <td>${c.tipo}</td>
                <td>${c.variedad}</td>
                <td>${c.fecha_siembra}</td>
                <td>${c.hectareas}</td>
                <td>${c.ubicacion}</td>
                <td>${c.administrador}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-2 editar-btn" data-cultivo-id="${c.id}"><i class="bi bi-pencil-fill"></i> Editar</button>
                    <button class="btn btn-danger btn-sm eliminar-btn" data-cultivo-id="${c.id}"><i class="bi bi-trash-fill"></i> Eliminar</button>
                </td>
            `;
            tabla.appendChild(tr);
        });

        // IMPORTANTE: Atar eventos después de que los elementos estén en el DOM
        attachEventListeners();
    }

    // Función para atar los event listeners a los botones de editar y eliminar
    function attachEventListeners() {
        // Botones de Editar
        document.querySelectorAll('.editar-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.dataset.cultivoId);
                const cultivoAEditar = cultivos.find(c => c.id === id);
                if (cultivoAEditar) {
                    editarCultivo(cultivoAEditar);
                }
            });
        });

        // Botones de Eliminar
        document.querySelectorAll('.eliminar-btn').forEach(button => {
            button.addEventListener('click', function() {
                cultivoIdToDelete = parseInt(this.dataset.cultivoId); // Almacena el ID del cultivo
                modalEliminar.show(); // Muestra el modal de confirmación
            });
        });
    }

    // --- Manejo del Formulario (Crear/Editar) ---

    // Rellenar formulario para edición
    function editarCultivo(c) {
        document.getElementById('cultivo-id').value = c.id;
        document.getElementById('nombre').value = c.nombre;
        document.getElementById('tipo').value = c.tipo;
        document.getElementById('variedad').value = c.variedad;
        document.getElementById('fecha_siembra').value = c.fecha_siembra;
        document.getElementById('hectareas').value = c.hectareas;
        document.getElementById('ubicacion').value = c.ubicacion;
        document.getElementById('administrador').value = c.administrador;

        formTitle.textContent = 'Editar Cultivo'; // Cambia el título del formulario
        btnGuardar.innerHTML = '<i class="bi bi-save me-2"></i>Actualizar Cultivo'; // Cambia texto del botón
        btnCancelar.classList.remove('d-none'); // Muestra el botón Cancelar
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplaza al inicio de la página para ver el formulario
    }

    // Limpiar formulario y volver al modo "Crear"
    btnCancelar.addEventListener('click', () => {
        form.reset();
        document.getElementById('cultivo-id').value = '';
        formTitle.textContent = 'Crear Nuevo Cultivo';
        btnGuardar.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Cultivo';
        btnCancelar.classList.add('d-none');
    });

    // Manejo del envío del formulario (Crear o Actualizar)
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const cultivo = {
            nombre: document.getElementById('nombre').value,
            tipo: document.getElementById('tipo').value,
            variedad: document.getElementById('variedad').value,
            fecha_siembra: document.getElementById('fecha_siembra').value,
            hectareas: parseFloat(document.getElementById('hectareas').value),
            ubicacion: document.getElementById('ubicacion').value,
            administrador: parseInt(document.getElementById('administrador').value)
        };

        const id = document.getElementById('cultivo-id').value;

        const opciones = {
            method: id ? 'PUT' : 'POST', // PUT para actualizar, POST para crear
            headers,
            body: JSON.stringify(cultivo)
        };

        const url = id ? `${urlBase}/${id}` : urlBase;

        try {
            const res = await fetch(url, opciones);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `¡Error HTTP! Estado: ${res.status}`);
            }
            form.reset(); // Limpia el formulario
            document.getElementById('cultivo-id').value = ''; // Limpia el ID oculto
            formTitle.textContent = 'Crear Nuevo Cultivo'; // Restablece el título del formulario
            btnGuardar.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Cultivo'; // Restablece el texto del botón
            btnCancelar.classList.add('d-none'); // Oculta el botón Cancelar

            mostrarAlerta(`Cultivo ${id ? 'actualizado' : 'creado'} con éxito!`, 'success');
            cargarCultivos(); // Recarga los cultivos para actualizar la tabla
        } catch (error) {
            console.error('Error al guardar cultivo:', error);
            mostrarAlerta(`Error al guardar cultivo: ${error.message}`, 'danger');
        }
    });

    // --- Funcionalidad de Búsqueda ---

    buscar.addEventListener('input', () => {
        const filtro = buscar.value.toLowerCase();
        const filtrados = cultivos.filter(c =>
            c.nombre.toLowerCase().includes(filtro) ||
            c.tipo.toLowerCase().includes(filtro) ||
            c.variedad.toLowerCase().includes(filtro) ||
            c.ubicacion.toLowerCase().includes(filtro)
            // Puedes añadir más campos a filtrar si lo deseas
        );
        mostrarCultivos(filtrados);
    });

    limpiarBusquedaBtn.addEventListener('click', () => {
        buscar.value = ''; // Limpia el campo de búsqueda
        mostrarCultivos(cultivos); // Muestra todos los cultivos nuevamente
    });

    // --- Manejo de Eliminación (con Modal de Confirmación) ---

    // Event listener para el botón de confirmar eliminación en el modal
    btnConfirmarEliminar.addEventListener('click', async () => {
        if (cultivoIdToDelete) {
            try {
                const res = await fetch(`${urlBase}/${cultivoIdToDelete}`, {
                    method: 'DELETE',
                    headers
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || `¡Error HTTP! Estado: ${res.status}`);
                }
                mostrarAlerta('Cultivo eliminado con éxito!', 'success');
                cargarCultivos(); // Recarga los cultivos para actualizar la tabla
            } catch (error) {
                console.error('Error al eliminar cultivo:', error);
                mostrarAlerta(`Error al eliminar cultivo: ${error.message}`, 'danger');
            } finally {
                modalEliminar.hide(); // Oculta el modal después de la operación
                cultivoIdToDelete = null; // Reinicia el ID almacenado
            }
        }
    });

    // --- Utilidades ---

    // Función para mostrar alertas al usuario
    function mostrarAlerta(mensaje, tipo) {
        alertaDiv.textContent = mensaje;
        alertaDiv.className = `alert alert-${tipo} d-block`; // Usa d-block para mostrarla
        setTimeout(() => {
            alertaDiv.className = 'alert d-none'; // Oculta después de 3 segundos
        }, 3000);
    }

    // --- Inicialización ---

    // Llama a initPage cuando el DOM esté completamente cargado.
    // Esto asegura que todos los elementos HTML estén disponibles cuando el script intente acceder a ellos.
    cargarCultivos();
}