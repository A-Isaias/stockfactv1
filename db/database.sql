-- Creación de la base de datos 'stock'
CREATE DATABASE IF NOT EXISTS stock;

-- Seleccionar la base de datos 'stock'
USE stock;

-- Creación de la tabla 'productos'
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  costo DECIMAL(10, 2) NOT NULL,
  iva DECIMAL(5, 2) NOT NULL,
  precioLista1 DECIMAL(10, 2) NOT NULL,
  precioLista2 DECIMAL(10, 2) NOT NULL,
  precioLista3 DECIMAL(10, 2) NOT NULL,
  precioLista4 DECIMAL(10, 2) NOT NULL
);


-- //agregar productos manualmente
INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4)
VALUES ('FIDEOS MAROLIO 500GRS', 10.0, 21, 15.0, 20.0, 25.0, 30.0);

INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4)
VALUES ('CERVEZA QUILMES 1L', 20.0, 10.5, 50.0, 75.0, 90.0, 100.0);

INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4)
VALUES ('JABON ALA BAJA ESPUMA 400GRS', 8.0, 10.5, 12.0, 18.0, 22.0, 28.0);

INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4)
VALUES ('LECHE NIDO 400GRS', 25.0, 10.5, 50.0, 75.0, 100.0, 120.0);

INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4)
VALUES ('JUGO TANG', 5.0, 21, 7.0, 9.0, 15.0, 25.0);

INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4)
VALUES ('ACEITE GIRASOL DON JOSE x900cc', 20.0, 10.5, 50.0, 75.0, 90.0, 100.0);

INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4)
VALUES ('COCA COLA RETORNABLE 2L', 25.0, 10.5, 60.0, 70.0, 80.0, 90.0);

INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4)
VALUES ('ARROZ GALLO ORO 500Grs', 9.0, 10.5, 10.0, 15.0, 20.0, 25.0);