document.addEventListener('DOMContentLoaded', function () {
    // Obtén el ID del producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
  
    if (productId) {
      // Si hay un ID en la URL, busca y muestra la información del producto
      buscarProductoPorId(productId);
    } else {
      // Si no hay ID, puedes manejarlo según tus necesidades
      console.error('No se proporcionó un ID de producto en la URL');
    }
  });
  
  function buscarProductoPorId(productId) {
    // Realiza la solicitud al servidor para obtener la información del producto por ID
    fetch(`/producto/${productId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener detalles del producto');
        }
        return response.json();
      })
      .then(producto => {
        // Llena los campos del formulario con los datos del producto
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('costo').value = producto.costo;
        document.getElementById('iva').value = producto.iva;
        document.getElementById('precioLista1').value = producto.precioLista1;
        document.getElementById('precioLista2').value = producto.precioLista2;
        document.getElementById('precioLista3').value = producto.precioLista3;
        document.getElementById('precioLista4').value = producto.precioLista4;
        document.getElementById('stock').value = producto.stock;
        document.getElementById('idProducto').value = producto.id;
  
        // Llama a la función para obtener y llenar el valor del dólar
        obtenerYMostrarValorDolar();
  
        // Asigna el evento onclick al botón de "Guardar Edición" después de cargar los detalles
        document.getElementById('guardarEdicionBtn').onclick = function () {
          guardarEdicion();
        };
      })
      .catch(error => {
        console.error('Error al obtener detalles del producto: ', error);
      });
  }
  
  function obtenerYMostrarValorDolar() {
    // Realiza una solicitud al servidor para obtener el valor del dólar desde configuracion.json
    fetch('/configuracion')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener la configuración');
        }
        return response.json();
      })
      .then(configuracion => {
        // Rellena el campo del formulario con el valor del dólar
        document.getElementById('valorDolar').value = configuracion.valorDolar;
  
        // Actualiza el costo del producto basado en el nuevo valor del dólar
        actualizarCostoProducto(configuracion.valorDolar);
      })
      .catch(error => {
        console.error('Error al obtener el valor del dólar desde configuracion.json: ', error);
      });
  }
  
  function actualizarCostoProducto(valorDolar) {
    // Calcula el nuevo costo del producto utilizando el valor del dólar
    const costoProducto = parseFloat(document.getElementById('costo').value);
    const nuevoCostoProducto = costoProducto * valorDolar;
  
    // Rellena el campo del formulario con el nuevo costo del producto
    document.getElementById('costo').value = nuevoCostoProducto.toFixed(2);
  }
  
  // Resto del código de dolar.js...
  