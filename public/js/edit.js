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

      // Asigna el evento onclick al botón de "Guardar Edición" después de cargar los detalles
      document.getElementById('guardarEdicionBtn').onclick = function() {
        guardarEdicion();
      };
    })
    .catch(error => {
      console.error('Error al obtener detalles del producto: ', error);
    });
}

// Lógica para guardar la edición
function guardarEdicion() {
  // Obtén los datos del formulario de edición
  const editForm = document.getElementById('edit-product-form');

  if (!editForm) {
    console.error('No se encontró el formulario de edición');
    return;
  }

  const formData = new FormData(editForm);

  // Obtén el ID del producto que estás editando (deberías tenerlo disponible en algún lugar)
  const productId = obtenerIdProducto(); // Implementa esta función según tus necesidades

  // Realiza la solicitud para guardar la edición
  fetch(`/producto/${productId}`, {
    method: 'PUT', // Usa el método PUT para actualizar el producto
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre: formData.get('nombre'),
      costo: formData.get('costo'),
      iva: formData.get('iva'),
      precioLista1: formData.get('precioLista1'),
      precioLista2: formData.get('precioLista2'),
      precioLista3: formData.get('precioLista3'),
      precioLista4: formData.get('precioLista4'),
      stock: formData.get('stock'),
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al guardar la edición');
      }
      return response.json();
    })
    .then(data => {
      // Cierra la ventana de edición si todo está correcto
      window.close();
    })
    .catch(error => {
      console.error('Error al guardar la edición: ', error);
    });
}

// Implementa esta función para obtener el ID del producto que estás editando
function obtenerIdProducto() {
  // Obtén el ID del producto de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  // Agrega un console.log para imprimir el valor del ID en la consola
  console.log('ID del producto:', productId);

  return productId;
}

function confirmarEliminacion() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el producto. ¿Estás seguro que deseas continuar?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Si el usuario confirma la eliminación, llama a la función eliminarProducto
      eliminarProducto();
    }
  });
}

function eliminarProducto() {
  const productId = obtenerIdProducto(); // Obtén el ID del producto

  // Realiza la solicitud para eliminar el producto
  fetch(`/producto/${productId}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      return response.json();
    })
    .then(data => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Producto eliminado correctamente'
      }).then(() => {
        // Cierra la ventana de edición después de mostrar el mensaje de éxito
        window.close();
      });
      // Puedes redirigir o realizar otras acciones después de la eliminación
    })
    .catch(error => {
      console.error('Error al eliminar el producto: ', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al eliminar el producto'
      });
    });
}


