// js/configuracion.js

function volverAlInicio() {
    // Redirecciona al inicio
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', function () {
    // Llamada a la función para cargar la configuración y los datos de la empresa al cargar la página
    cargarConfiguracion();
    cargarDatosEmpresa();
});

// Nueva función para cargar la configuración de la empresa
function cargarDatosEmpresa() {
    // Realiza una solicitud para cargar datos directamente desde datos.json
    fetch('/config/datos.json')  // Ajusta la ruta según tu estructura de archivos
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos de la empresa');
            }
            return response.json();
        })
        .then(datos => {
            // Actualiza los campos del formulario con los datos de la empresa obtenidos
            const datosEmpresa = datos.datosEmpresa;
            console.log('Datos de la empresa obtenidos:', datosEmpresa);
            document.getElementById('nombreEmpresa').value = datosEmpresa.estNombre;
            document.getElementById('cuitEmpresa').value = datosEmpresa.estCuit;
            document.getElementById('condicionIvaEmpresa').value = datosEmpresa.estCondicionIVA;
            document.getElementById('direccionEmpresa').value = datosEmpresa.estDireccion;
        })
        .catch(error => {
            console.error('Error al obtener los datos de la empresa: ', error);
        });
}

// Nueva función para guardar los datos de la empresa
function guardarDatosEmpresa() {
    // Obtén los nuevos valores del formulario
    const nombreEmpresa = document.getElementById('nombreEmpresa').value;
    const cuitEmpresa = document.getElementById('cuitEmpresa').value;
    const condicionIvaEmpresa = document.getElementById('condicionIvaEmpresa').value;
    const direccionEmpresa = document.getElementById('direccionEmpresa').value;

    // Crea un objeto con los nuevos datos de la empresa
    const nuevosDatosEmpresa = {
        estNombre: nombreEmpresa,
        estCuit: cuitEmpresa,
        estCondicionIVA: condicionIvaEmpresa,
        estDireccion: direccionEmpresa
    };

    // Realiza una solicitud al servidor para guardar los nuevos datos de la empresa
    fetch('/config/datos.json', {  // Ajusta la ruta según tu estructura de archivos
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datosEmpresa: nuevosDatosEmpresa }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar los datos de la empresa');
            }
            console.log('Datos de la empresa guardados correctamente');
        })
        .catch(error => {
            console.error('Error al guardar los datos de la empresa: ', error);
        });
}

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
            console.log('Configuración guardada correctamente');

            // Después de guardar la configuración, actualiza los precios de las listas
            actualizarPreciosListas(valorDolar); // Pasa el valorDolar a la función
        })
        .catch(error => {
            console.error('Error al guardar la configuración: ', error);
        });
}

function actualizarPreciosListas(nuevoValorDolar) {
    // Realiza una solicitud al servidor para actualizar los precios de las listas
    fetch('/actualizar-precios-listas', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ valorDolar: nuevoValorDolar }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al actualizar precios de las listas');
            }
            console.log('Precios actualizados correctamente');
        })
        .catch(error => {
            console.error('Error al actualizar precios de las listas: ', error);
        });
}