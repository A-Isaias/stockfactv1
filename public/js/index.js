// Lógica para borrar un producto
function borrarProducto() {
  const productId = prompt('Ingrese el ID del producto a borrar:');

  if (!productId) {
    Swal.fire({
      icon: 'info',
      title: 'Operación cancelada',
      text: 'No se proporcionó un ID para borrar el producto',
    });
    return;
  }

  // Solicitar los detalles del producto antes de confirmar el borrado
  fetch(`/producto/${productId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener detalles del producto');
      }
      return response.json();
    })
    .then(producto => {
      // Mostrar un mensaje de confirmación con los detalles del producto
      Swal.fire({
        title: '¿Estás seguro?',
        text: `ID: ${producto.id}\nNombre: ${producto.nombre}\nCosto: ${producto.costo}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrarlo',
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Si se confirma, realizar la solicitud DELETE
          fetch(`/producto/${productId}`, {
            method: 'DELETE',
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error al borrar el producto');
            }
            return response.json();
          })
          .then(data => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: data.message || 'Producto borrado correctamente',
            });
            verStock(); // Actualizar la tabla después de borrar el producto
          })
          .catch(error => {
            console.error('Error al borrar el producto: ', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al borrar el producto',
            });
          });
        }
      });
    })
    .catch(error => {
      // Manejar el caso en el que el ID no existe
      console.error('Error al obtener detalles del producto: ', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontraron detalles para el producto con ID: ' + productId,
      });
    });
}

// Lógica para ver el stock
function verStock() {
  buscarProductos();  // Invoca la búsqueda al cargar la página para mostrar todos los productos
}

// Lógica para buscar productos
function buscarProductos() {
  const idBuscar = document.getElementById('idBuscar').value;
  const descripcionBuscar = document.getElementById('descripcionBuscar').value;

  // Realiza la solicitud GET para obtener productos con los criterios de búsqueda
  fetch(`/productos?${idBuscar ? `id=${idBuscar}` : ''}${descripcionBuscar ? `&descripcion=${descripcionBuscar}` : ''}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      return response.json();
    })
    .then(data => {
      // Actualiza la tabla con los datos proporcionados
      const stockTableBody = document.getElementById('stock-table-body');
      stockTableBody.innerHTML = '';

      data.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${producto.id}</td>
          <td>${producto.nombre}</td>
          <td>${producto.costo}</td>
          <td>${producto.iva}</td>
          <td>${producto.precioLista1}</td>
          <td>${producto.precioLista2}</td>
          <td>${producto.precioLista3}</td>
          <td>${producto.precioLista4}</td>
          <td>${producto.stock}</td>
        `;
        stockTableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error al obtener productos: ', error);
    });
}

// Lógica para cargar productos
function cargarProductos() {
  const altaWindow = window.open('/alta.html', 'Alta/Modificar Producto', 'width=1024,height=600');
  altaWindow.focus();
}

function guardarProducto() {
  const productoForm = document.getElementById('producto-form');
  const formData = new FormData(productoForm);

  fetch('/producto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Cambiado a 'application/json'
    },
    body: JSON.stringify({
      nombre: formData.get('nombre'), // Obtén el valor del campo 'nombre'
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
        console.log(response); // Agrega esta línea para depurar
        throw new Error('Error al cargar/modificar productos');
      }
      return response.json();
    })
    .then(data => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Producto agregado/modificado correctamente',
      });
      verStock();
      productoForm.reset();
    })
    .catch(error => {
      console.error('Error al cargar/modificar productos: ', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al cargar/modificar el producto',
      });
    });
}

function cargarEdicion() {
  const editWindow = window.open('/edit.html', 'Editar Producto', 'width=600,height=400');
  editWindow.focus();

  // Pasa la función de recarga directamente a la ventana de edición
  editWindow.recargarPaginaPrincipal = verStock;
}

function guardarEdicion() {
  // Obtén los datos del formulario de edición
  const editForm = document.getElementById('edit-product-form');
  const formData = new FormData(editForm);

  // Obtén el ID del producto que estás editando (deberías tenerlo disponible en algún lugar)
  const productId = obtenerIdProducto(); // Implementa esta función según tus necesidades

  // Realiza la solicitud para obtener los detalles del producto antes de la edición
  fetch(`/producto/${productId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener detalles del producto');
      }
      return response.json();
    })
    .then(producto => {
      // Muestra los detalles del producto en el formulario de edición
      document.getElementById('nombre').value = producto.nombre;
      document.getElementById('costo').value = producto.costo;
      document.getElementById('iva').value = producto.iva;
      document.getElementById('precioLista1').value = producto.precioLista1;
      document.getElementById('precioLista2').value = producto.precioLista2;
      document.getElementById('precioLista3').value = producto.precioLista3;
      document.getElementById('precioLista4').value = producto.precioLista4;
      document.getElementById('stock').value = producto.stock;
      

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
          // Puedes mostrar un mensaje de error al usuario si lo prefieres
        });
    })
    .catch(error => {
      console.error('Error al obtener detalles del producto: ', error);
      // Puedes mostrar un mensaje de error al usuario si lo prefieres
    });
}

// Implementa esta función para obtener el ID del producto que estás editando
function obtenerIdProducto() {
  // Lógica para obtener el ID del producto, puede depender de tu implementación
  // Puedes obtener el ID desde la URL, almacenarlo en una variable global, etc.
  // En este ejemplo, se asume que hay un campo oculto con el ID en el formulario de edición
  return document.getElementById('idProducto').value;
}

function volverArriba() {
  document.body.scrollTop = 0; // Para navegadores antiguos
  document.documentElement.scrollTop = 0; // Para navegadores modernos
}

// Muestra u oculta el botón de volver arriba según la posición del scroll
window.onscroll = function() {
  mostrarOcultarBoton();
};

function mostrarOcultarBoton() {
  var botonVolverArriba = document.getElementById("btnVolverArriba");

  // Muestra el botón cuando el scroll está más abajo de 300 píxeles
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      botonVolverArriba.style.display = "block";
  } else {
      botonVolverArriba.style.display = "none";
  }
}

// Lógica para redirigir a remito.html al hacer clic en el botón "Facturar"
function facturar() {
  // Redirige a remito.html
  window.location.href = '/remito.html';
}

// Este script se ejecutará cuando la página se cargue completamente
document.addEventListener('DOMContentLoaded', function () {
  verStock(); // Llama a la función para mostrar todos los productos al cargar la página
});