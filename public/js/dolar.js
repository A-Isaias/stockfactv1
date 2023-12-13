document.addEventListener('DOMContentLoaded', function () {
  obtenerYMostrarValorDolar();
});
function actualizarCostoTodosProductos(costosActuales, incrementoPorcentaje) {
  const nuevosCostos = {};

  // Calcular los nuevos costos según el porcentaje de incremento
  Object.keys(costosActuales).forEach(id => {
    const costoActual = costosActuales[id];
    const nuevoCosto = costoActual * (1 + incrementoPorcentaje / 100);
    nuevosCostos[id] = nuevoCosto;
  });

  // Enviar los nuevos costos al servidor para actualizar la base de datos
  console.log('URL de la solicitud:', window.location.origin + '/producto/actualizar-costo');
  fetch('/producto/actualizar-costo', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nuevosCostos: nuevosCostos,
    }),
  })
    .then(response => {
      if (!response.ok) {
        console.log (nuevosCostos)
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
function obtenerYActualizarCostoTodosProductos(incrementoPorcentaje) {
  // Obtener el costo actual antes de llamar a la función
  fetch('/producto/costo-actual')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener el costo actual de los productos');
      }
      return response.json();
    })
    .then(data => {
      // Verificar si se obtuvo la respuesta esperada
      if (data && typeof data === 'object') {
        // Llamar a la función para actualizar los costos
        actualizarCostoTodosProductos(data, incrementoPorcentaje);
      } else {
        throw new Error('Respuesta inesperada al obtener el costo actual de los productos');
      }
    })
    .catch(error => {
      console.error('Error al obtener el costo actual de los productos: ', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al obtener el costo actual de los productos.'
      });
    });
}
