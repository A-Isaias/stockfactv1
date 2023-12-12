document.addEventListener('DOMContentLoaded', function () {
  obtenerYMostrarValorDolar();
});

function obtenerYMostrarValorDolar() {
  fetch('/configuracion')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener la configuración');
      }
      return response.json();
    })
    .then(configuracion => {
      const valorDolar = configuracion.valorDolar;
      const valorDolarActual = document.getElementById('valorDolarActual');
      if (valorDolarActual) {
        valorDolarActual.value = valorDolar;
        // No es necesario llamar actualizarCostoProducto aquí
      }
    })
    .catch(error => {
      console.error('Error al obtener el valor del dólar desde configuracion.json: ', error);
    });
}

function calcularDiferenciaYConfirmar() {
  const nuevoValorDolar = parseFloat(document.getElementById('nuevoValorDolar').value);
  const valorDolarActual = parseFloat(document.getElementById('valorDolarActual').value);

  if (isNaN(nuevoValorDolar)) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, ingrese un número válido.'
    });
    return;
  }

  const diferenciaPorcentaje = ((nuevoValorDolar - valorDolarActual) / valorDolarActual) * 100;

  Swal.fire({
    title: '¿Está seguro?',
    text: `Esta acción aumentará todos los costos en un ${diferenciaPorcentaje.toFixed(2)}%. ¿Está seguro de continuar?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Obtener el costo actual antes de llamar a la función
      obtenerYActualizarCostoTodosProductos(diferenciaPorcentaje);
    }
  });
}

// Función para obtener el costo actual antes del aumento y luego actualizar todos los productos
function obtenerYActualizarCostoTodosProductos() {
  fetch('/producto/costo-actual')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener el costo actual de los productos');
      }
      return response.json();
    })
    .then(data => {
      // Aquí puedes manejar la respuesta, que incluirá los id y costos actuales de todos los productos
      console.log('Costos actuales de los productos:', data);
    })
    .catch(error => {
      console.error('Error al obtener el costo actual de los productos: ', error);
    });
}

function actualizarCostoTodosProductos(costoActual, incrementoPorcentaje) {
  const nuevoCosto = costoActual + (costoActual * incrementoPorcentaje / 100);

  fetch('/producto/actualizar-costo', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      costo: nuevoCosto,
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al actualizar el costo de los productos: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Costo actualizado en todos los productos correctamente.'
      });
    })
    .catch(error => {
      console.error('Error al actualizar el costo de los productos: ', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar el costo de los productos.'
      });
    });
}
