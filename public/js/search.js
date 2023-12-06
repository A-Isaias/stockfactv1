// search.js

function buscarProductos() {
    const searchId = document.getElementById('searchId').value;
    const searchDescription = document.getElementById('searchDescription').value;
  
    // Realiza la solicitud para buscar productos con los criterios dados
    fetch(`/search?searchId=${searchId}&searchDescription=${searchDescription}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al buscar productos');
        }
        return response.json();
      })
      .then(data => {
        // Maneja la respuesta y actualiza la tabla o realiza otras acciones necesarias
        actualizarTabla(data);
      })
      .catch(error => {
        console.error('Error al buscar productos: ', error);
      });
  }
  
  function actualizarTabla(data) {
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
        <td><button class="btn btn-info" onclick="editarProducto(${producto.id})">Editar</button></td>
      `;
      stockTableBody.appendChild(row);
    });
  }
  
  function editarProducto(productId) {
    // Abre la ventana de edición y pasa el ID del producto
    const editWindow = window.open(`/edit.html?id=${productId}`, 'Editar Producto', 'width=600,height=400');
    editWindow.focus();
  }
  