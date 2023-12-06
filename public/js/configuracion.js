// js/configuracion.js

function volverAlInicio() {
    // Redirecciona al inicio
    window.location.href = '/';
}
document.addEventListener('DOMContentLoaded', function () {
    // Llamada a la función para cargar la configuración al cargar la página
    cargarConfiguracion();
});

function cargarConfiguracion() {
    // Realiza una solicitud al servidor para obtener la configuración
    fetch('/configuracion')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener la configuración');
            }
            return response.json();
        })
        .then(configuracion => {
            // Actualiza los campos del formulario con la configuración obtenida
            document.getElementById('valorDolar').value = configuracion.valorDolar;
            document.getElementById('gananciaLista1').value = configuracion.gananciaLista1;
            document.getElementById('gananciaLista2').value = configuracion.gananciaLista2;
            document.getElementById('gananciaLista3').value = configuracion.gananciaLista3;
            document.getElementById('gananciaLista4').value = configuracion.gananciaLista4;
        })
        .catch(error => {
            console.error('Error al obtener la configuración: ', error);
        });
}

function guardarConfiguracion() {
    // Obtén los valores del formulario
    const valorDolar = parseFloat(document.getElementById('valorDolar').value) || 0.0;
    const gananciaLista1 = parseFloat(document.getElementById('gananciaLista1').value) || 0.0;
    const gananciaLista2 = parseFloat(document.getElementById('gananciaLista2').value) || 0.0;
    const gananciaLista3 = parseFloat(document.getElementById('gananciaLista3').value) || 0.0;
    const gananciaLista4 = parseFloat(document.getElementById('gananciaLista4').value) || 0.0;

    // Crea un objeto con la nueva configuración
    const nuevaConfiguracion = {
        valorDolar,
        gananciaLista1,
        gananciaLista2,
        gananciaLista3,
        gananciaLista4
    };

    // Realiza una solicitud al servidor para guardar la nueva configuración
    fetch('/configuracion', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaConfiguracion),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar la configuración');
            }

            // Muestra un mensaje de éxito con SweetAlert
            Swal.fire({
                icon: 'success',
                title: '¡Configuración guardada!',
                text: 'La configuración se ha guardado exitosamente.',
            });

            console.log('Configuración guardada correctamente');
        })
        .catch(error => {
            console.error('Error al guardar la configuración: ', error);

            // Muestra un mensaje de error con SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al guardar la configuración.',
            });
        });
}
