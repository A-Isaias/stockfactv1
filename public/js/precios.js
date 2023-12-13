// precios.js

// Función para calcular los precios de las listas
function calcularPreciosListas(costo, iva, gananciaLista1, gananciaLista2, gananciaLista3, gananciaLista4) {
    const precioLista1 = calcularPrecioLista(costo, iva, gananciaLista1);
    const precioLista2 = calcularPrecioLista(costo, iva, gananciaLista2);
    const precioLista3 = calcularPrecioLista(costo, iva, gananciaLista3);
    const precioLista4 = calcularPrecioLista(costo, iva, gananciaLista4);
  
    return {
      precioLista1,
      precioLista2,
      precioLista3,
      precioLista4,
    };
  }
  
  // Función auxiliar para calcular el precio de lista
  function calcularPrecioLista(costo, iva, gananciaPorcentaje) {
    const ganancia = costo * (gananciaPorcentaje / 100);
    const precioSinIva = costo + ganancia;
    const precioConIva = precioSinIva * (1 + iva);
  
    return precioConIva;
  }
  
  module.exports = {
    calcularPreciosListas,
    calcularPrecioLista,
  };