// remito.js

document.addEventListener('DOMContentLoaded', function () {
    // Variable para almacenar los ítems del remito
    const itemsRemito = [];
   // Botón para agregar una fila al formulario
   const agregarFilaBtn = document.getElementById('agregarFila');
   agregarFilaBtn.addEventListener('click', agregarFila);
   
    // Lógica para cargar detalles del producto al ingresar el código
    const codigoInput = document.getElementById('codigo');
    const cantidadInput = document.getElementById('cantidad');
    const productoInput = document.getElementById('producto');
    const precioUnitarioInput = document.getElementById('precioUnitario');
    const precioTotalInput = document.getElementById('precioTotal');
  
    codigoInput.addEventListener('blur', function () {
      const codigo = codigoInput.value;
  
      // Realiza una solicitud al servidor para obtener detalles del producto por código
      fetch(`/producto/${codigo}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al obtener detalles del producto');
          }
          return response.json();
        })
        .then(producto => {
          // Actualiza los campos del formulario con los detalles del producto
          productoInput.value = producto.nombre;
          precioUnitarioInput.value = producto.precioLista1;
  
          // Calcula el precio total basado en la cantidad ingresada
          calcularPrecioTotal();
        })
        .catch(error => {
          console.error('Error al obtener detalles del producto: ', error);
        });
    });
  
    // Lógica para calcular el precio total en función de la cantidad ingresada
    cantidadInput.addEventListener('input', calcularPrecioTotal);
  
    function calcularPrecioTotal() {
      const cantidad = parseFloat(cantidadInput.value) || 0;
      const precioUnitario = parseFloat(precioUnitarioInput.value) || 0;
      const precioTotal = cantidad * precioUnitario;
  
      // Actualiza el campo de precio total en el formulario
      precioTotalInput.value = precioTotal.toFixed(2);
    }
  
    // Función para abrir la ventana de búsqueda de productos
    function abrirBusquedaProductos() {
      // Aquí puedes implementar la lógica para mostrar la ventana modal de búsqueda de productos
      // Puedes cargar la ventana de búsqueda en el modal "busquedaProductosModal"
    }
  
    // Función para agregar un ítem al remito
    function agregarItem() {
      // Aquí puedes implementar la lógica para agregar un ítem al remito
      // Por ahora, utilizo un ejemplo estático, pero deberás adaptarlo según tu lógica real
      const productoEjemplo = {
        id: 1,
        nombre: 'Producto de ejemplo',
        precioUnitario: parseFloat(precioUnitarioInput.value) || 0,
        cantidad: parseFloat(cantidadInput.value) || 0
      };
  
      // Agrega el producto a la lista de ítems del remito
      itemsRemito.push(productoEjemplo);
  
      // Actualiza la tabla de ítems en el remito
      actualizarTablaItems();
    }
  
    // Función para borrar un ítem del remito
    function borrarItem() {
      // Aquí puedes implementar la lógica para borrar un ítem del remito
      // Por ahora, elimino el último ítem como ejemplo, deberás adaptarlo según tu lógica real
      itemsRemito.pop();
  
      // Actualiza la tabla de ítems en el remito
      actualizarTablaItems();
    }
  
    // Función para cancelar la compra
    function cancelarCompra() {
      // Aquí puedes implementar la lógica para cancelar la compra
      // Por ahora, limpio la lista de ítems del remito como ejemplo
      itemsRemito.length = 0;
  
      // Actualiza la tabla de ítems en el remito
      actualizarTablaItems();
    }
  
    // Función para confirmar la compra
    function confirmarCompra() {
      // Aquí puedes implementar la lógica para confirmar la compra
      // Puedes realizar acciones adicionales, como guardar en una base de datos, generar factura, etc.
      console.log('Compra confirmada:', itemsRemito);
    }
  
    // Función para actualizar la tabla de ítems en el remito
    function actualizarTablaItems() {
      const remitoTableBody = document.getElementById('remito-table-body');
      remitoTableBody.innerHTML = '';
  
      let totalCompra = 0;
  
      itemsRemito.forEach(producto => {
        const totalItem = producto.precioUnitario * producto.cantidad;
        totalCompra += totalItem;
  
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${producto.id}</td>
          <td>${producto.nombre}</td>
          <td>${producto.cantidad}</td>
          <td>${producto.precioUnitario}</td>
          <td>${totalItem}</td>
        `;
  
        remitoTableBody.appendChild(row);
      });
  
      // Actualiza el total de la compra en el formulario
      document.getElementById('total').innerText = totalCompra.toFixed(2);
    }
  
    // Puedes agregar más funciones según sea necesario para interactuar con la ventana de búsqueda, etc.
  });
  