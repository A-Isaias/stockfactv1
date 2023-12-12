//remito.js
let itemsFactura = [];

function volverAlInicio() {
    // Redirecciona al inicio
    window.location.href = '/';
}

// se usa para recargar la pagina
function facturar() {
    // Redirige a remito.html
    window.location.href = '/remito.html';
  }

// Funcion para seleccionar listas segun el select en el encabezado de la factura
function cargarPrecioUnitario() {
    const listaPreciosSelect = document.getElementById('listaPrecios');
    const selectedLista = listaPreciosSelect.value;
  
    const codigo = codigoInput.value;
  
    fetch(`/producto/${codigo}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener detalles del producto');
        }
        return response.json();
      })
      .then(producto => {
        console.log('Datos del producto:', producto);
  
        // Verificar si el producto tiene el precio correspondiente
        if (producto && producto.hasOwnProperty(selectedLista)) {
          productoInput.value = producto.nombre;
          precioUnitarioInput.value = producto[selectedLista];
  
          calcularSubtotal();
        } else {
          console.error(`Precio ${selectedLista} no encontrado en los detalles del producto.`);
        }
      })
      .catch(error => {
        console.error('Error al obtener detalles del producto: ', error);
      });
  }


  function confirmarFactura() {
    console.log('Factura confirmada:', itemsFactura);

    // Obtener solo la información necesaria para actualizar el stock
    const productosParaActualizarStock = itemsFactura.map(item => {
        return { id: item.codigo, cantidad: item.cantidad };
    });

    // Aquí puedes enviar los datos al servidor
    fetch('/confirmar-factura', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productos: productosParaActualizarStock }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al confirmar la factura en el servidor');
        }
        return response.json();
    })
    .then(data => {
        console.log('Factura confirmada en el servidor:', data);
        // Realizar otras acciones si es necesario
    })
    .catch(error => console.error('Error al confirmar la factura:', error));

    // Imprimir la factura
    imprimirFactura();
}

function imprimirFactura() {
    // Abre el cuadro de diálogo de impresión
    window.print();
}

function borrarItem() {
    // Verifica si hay elementos en el arreglo
    if (itemsFactura.length > 0) {
        // Elimina el último elemento del arreglo
        itemsFactura.pop();

        // Elimina la última fila de la tabla
        const facturaTableBody = document.getElementById('remito-table-body');
        facturaTableBody.removeChild(facturaTableBody.lastChild);

        // Vuelve a calcular el total después de borrar el último item
        calcularTotal();

        // Actualiza visualmente el total en el formulario
        actualizarTotalEnFormulario();
    }
}

function calcularTotal() {
    const total = itemsFactura.reduce((acc, item) => acc + item.subtotal, 0);
    document.getElementById('total').innerText = total.toFixed(2);
}

function actualizarTotalEnFormulario() {
    // Esta función ahora simplemente actualiza el total visualmente en el formulario
}

document.addEventListener('DOMContentLoaded', function () {
    // Llamada a la función para cargar la configuración y los datos de la empresa al cargar la página
   cargarDatosEmpresa();
});

function cargarDatosEmpresa() {
    // Realiza una solicitud para cargar datos directamente desde datos.json
    fetch('/config/datos.json')  // Ajusta la ruta según tu estructura de archivos
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos de la empresa');
            }
            return response.json();
        })
        .then(datosEmpresa => {
        console.log(datosEmpresa);
        // Actualiza los elementos del encabezado con los datos cargados
        document.getElementById('nombreEmpresa').innerText = datosEmpresa.estNombre;
        document.getElementById('cuitEmpresa').innerText = 'CUIT: ' + datosEmpresa.estCuit;
        document.getElementById('condicionIvaEmpresa').innerText = 'Condición IVA: ' + datosEmpresa.estCondicionIVA;
        document.getElementById('direccionEmpresa').innerText = 'Dirección: ' + datosEmpresa.estDireccion;
      })
      .catch(error => console.error('Error al cargar datos del archivo datos.json:', error));
  
  };

  document.addEventListener('DOMContentLoaded', function () {
    const agregarFilaBtn = document.getElementById('agregarFila');
    agregarFilaBtn.addEventListener('click', agregarFila);

    const codigoInput = document.getElementById('codigo');
    const cantidadInput = document.getElementById('cantidad');
    const productoInput = document.getElementById('producto');
    const precioUnitarioInput = document.getElementById('precioUnitario');
    const subtotalInput = document.getElementById('subtotal');
    const listaPreciosSelect = document.getElementById('listaPrecios');

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
                console.log('Detalles del producto:', producto);

                // Actualiza los campos del formulario con los detalles del producto
                productoInput.value = producto.nombre;

                // Utiliza el valor seleccionado para cargar el precio correspondiente
                const selectedLista = listaPreciosSelect.value;
                console.log('Lista de precios seleccionada:', selectedLista);

                // Verifica si el precio correspondiente existe en el objeto producto
                if (selectedLista in producto) {
                    precioUnitarioInput.value = producto[selectedLista];
                } else {
                    console.error('Precio no encontrado para la lista seleccionada:', selectedLista);
                    precioUnitarioInput.value = 0;
                }

                // Calcula el subtotal basado en la cantidad ingresada
                calcularSubtotal();
            })
            .catch(error => {
                console.error('Error al obtener detalles del producto: ', error);
            });
    });

    // Definir agregarItem en el ámbito global
    window.agregarItem = agregarItem;

    // Agregar un escuchador de eventos de teclado al documento
    document.addEventListener('keydown', function (event) {
        // Verificar si la tecla presionada es Enter (código 13)
        if (event.key === 'Enter') {
            // Llamar a la función agregarItem al presionar Enter
            agregarItem();
        }
    });

    cantidadInput.addEventListener('input', calcularSubtotal);

    function calcularSubtotal() {
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const precioUnitario = parseFloat(precioUnitarioInput.value) || 0;
        const subtotal = cantidad * precioUnitario;

        subtotalInput.value = subtotal.toFixed(2);
    }

    function abrirBusquedaProductos(event) {
        if (event.key === "Enter") {
            // Se presionó Enter, abrir la ventana de búsqueda por nombre
            const searchWindow = window.open('/buscarProducto.html', 'Buscar Producto', 'width=800,height=600');
            searchWindow.focus();
        }
    }

    function agregarItem() {
        const idProducto = document.getElementById('codigo').value;
        if (!idProducto) {
            abrirBusquedaProductos();
            return;
        }
        const nuevoItem = {
            cantidad: parseFloat(cantidadInput.value) || 0,
            codigo: codigoInput.value,
            producto: productoInput.value,
            precioUnitario: parseFloat(precioUnitarioInput.value) || 0,
            subtotal: parseFloat(subtotalInput.value) || 0
        };

        itemsFactura.push(nuevoItem);
        actualizarTablaItems();
        calcularTotal();
        limpiarCampos();

        // Enfocar el campo de cantidad después de agregar un nuevo item
        document.getElementById('cantidad').focus();
    }

    function abrirBusquedaProductos() {
        // Abre la ventana de búsqueda por nombre
        const searchWindow = window.open('/buscarProducto.html', 'Buscar Producto', 'width=600,height=400');
        searchWindow.focus();
    }

    function cancelarCompra() {
        itemsFactura.length = 0;
        actualizarTablaItems();
        calcularTotal();
    }

    function confirmarCompra() {
        console.log('Factura confirmada:', itemsFactura);
        // Aquí puedes enviar los datos al servidor o realizar otras acciones
    }

    function actualizarTablaItems() {
        const facturaTableBody = document.getElementById('remito-table-body');
        facturaTableBody.innerHTML = '';

        itemsFactura.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.cantidad}</td>
                <td>${item.codigo}</td>
                <td>${item.producto}</td>
                <td>$${item.precioUnitario}</td>
                <td>$${item.subtotal}</td>
            `;

            facturaTableBody.appendChild(row);
        });
    }

    function calcularTotal() {
        const total = itemsFactura.reduce((acc, item) => acc + item.subtotal, 0);
        document.getElementById('total').innerText = total.toFixed(2);
    }

    function limpiarCampos() {
        cantidadInput.value = '';
        codigoInput.value = '';
        productoInput.value = '';
        precioUnitarioInput.value = '';
        subtotalInput.value = '';
    }

    function agregarFila() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        `;

        const facturaTableBody = document.getElementById('remito-table-body');
        facturaTableBody.appendChild(row);
    }
});

// Obtener el elemento del campo de código (ID)
const codigoInput = document.getElementById('codigo');

// Agregar un escuchador de eventos para la tecla Enter en el campo de código
codigoInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        // Verificar si el campo de código está vacío
        if (!codigoInput.value.trim()) {
            // Si está vacío, abrir la ventana de búsqueda
            abrirBusquedaProductos();
            // Detener la propagación del evento para evitar agregar la fila vacía
            event.preventDefault();
        } else {
            // Si no está vacío, ejecutar la lógica normal de agregarItem
            agregarItem();
        }
    }
});

// Lógica para buscar productos por nombre desde la ventana emergente
function buscarProductosPorNombre() {
    const searchProductName = document.getElementById('searchProductName').value;

    // Realizar la búsqueda por nombre y mostrar resultados
    fetch(`/search?searchDescription=${searchProductName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al buscar productos por nombre');
            }
            return response.json();
        })
        .then(data => {
            // Mostrar los resultados de la búsqueda en la ventana emergente
            mostrarResultadosBusqueda(data);
        })
        .catch(error => {
            console.error('Error al buscar productos por nombre: ', error);
        });
}

// Función para mostrar resultados de búsqueda en la ventana emergente
function mostrarResultadosBusqueda(data) {
    const searchResultsContainer = window.opener.document.getElementById('searchResults');
    searchResultsContainer.innerHTML = '';

    data.forEach(producto => {
        const resultItem = document.createElement('div');
        resultItem.innerHTML = `
            <p>ID: ${producto.id} - Nombre: ${producto.nombre}</p>
            <button class="btn btn-success" onclick="seleccionarProducto(${producto.id})">Seleccionar</button>
        `;
        searchResultsContainer.appendChild(resultItem);
    });
}

// Función para seleccionar un producto desde la ventana emergente
function seleccionarProducto(productId, productName) {
    document.getElementById('codigo').value = productId;
    document.getElementById('producto').value = productName;

    const listaPreciosSelect = document.getElementById('listaPrecios');
    const selectedLista = listaPreciosSelect.value;

    fetch(`/producto/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener detalles del producto');
            }
            return response.json();
        })
        .then(producto => {
            console.log('Datos del producto:', producto);

            if (producto && producto.hasOwnProperty(selectedLista)) {
                document.getElementById('precioUnitario').value = producto[selectedLista];

                calcularSubtotal();
                agregarItem();
            } else {
                console.error(`Precio ${selectedLista} no encontrado en los detalles del producto.`);
            }
        })
        .catch(error => {
            console.error('Error al obtener detalles del producto: ', error);
        });
}

window.borrarItem = borrarItem;

function calcularSubtotal() {
    const cantidad = parseFloat(document.getElementById('cantidad').value) || 0;
    const precioUnitario = parseFloat(document.getElementById('precioUnitario').value) || 0;
    const subtotal = cantidad * precioUnitario;

    document.getElementById('subtotal').value = subtotal.toFixed(2);
}

// Agregar un escuchador de eventos para la tecla F2
document.addEventListener('keydown', function (event) {
    if (event.key === 'F2') {
        // Abrir la ventana de búsqueda cuando se presiona la tecla F2
        abrirBusquedaProductos(event);
        // Detener la propagación del evento para evitar agregar la fila vacía
        event.preventDefault();
    }
});