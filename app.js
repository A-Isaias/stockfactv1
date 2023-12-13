//app.js 
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); 
const mysql = require('mysql');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:'+port,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
//middleware simple para imprimir las solicitudes y verificar qué ruta y método están llegando al servidor
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'stock',
});

// Conectar a MySQL y crear la base de datos 'stock' si no existe
db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conexión a MySQL establecida con el ID ' + db.threadId);

  db.query('CREATE DATABASE IF NOT EXISTS stock', (err) => {
    if (err) {
      console.error('Error al crear la base de datos: ' + err.message);
    } else {
      console.log('Base de datos "stock" creada o ya existente');
    }
  });

  // Seleccionar la base de datos 'stock'
  db.query('USE stock', (err) => {
    if (err) {
      console.error('Error al seleccionar la base de datos: ' + err.message);
    } else {
      console.log('Base de datos "stock" seleccionada');
    }
  });

  // Creación de la tabla 'productos' si no existe
  db.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      costo DECIMAL(10, 2) NOT NULL,
      iva DECIMAL(5, 2) NOT NULL,
      precioLista1 DECIMAL(10, 2) NOT NULL,
      precioLista2 DECIMAL(10, 2) NOT NULL,
      precioLista3 DECIMAL(10, 2) NOT NULL,
      precioLista4 DECIMAL(10, 2) NOT NULL,
      stock INT NOT NULL,
      costoDolar DECIMAL(10, 2) NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear la tabla productos: ' + err.message);
    } else {
      console.log('Tabla "productos" creada o ya existente');
    }
  });
});


// función  para cargar la configuración
function obtenerConfiguracion() {

  const configuracionPath = path.join(__dirname, 'public', 'config', 'configuracion.json');

  try {
      const configuracion = require(configuracionPath);
      return configuracion;
  } catch (error) {
      console.error('Error al cargar la configuración: ', error);
      return {};
  }
}


// Ruta para obtener el costo actual de todos los productos
app.get('/producto/costo-actual', (req, res) => {
  console.log('Entró a la ruta /producto/costo-actual');  // Agrega esta línea

  db.query('SELECT id, costo FROM productos', (err, results) => {
    if (err) {
      console.error('Error al obtener el costo actual de los productos: ' + err.message);
      res.status(500).json({ error: 'Error al obtener el costo actual de los productos' });
      return;
    }

    // Filtrar resultados para eliminar registros con costo null (IDs borrados)
    const productosConCosto = results.filter(producto => producto.costo !== null);

    if (productosConCosto.length === 0) {
      // Si no hay productos con costo, retornar un mensaje adecuado
      res.status(404).json({ error: 'No hay productos con costo en la base de datos' });
      return;
    }

    const productosCostoActual = {};

    // Construir un objeto con los ID y costo actual de los productos
    productosConCosto.forEach(producto => {
      productosCostoActual[producto.id] = producto.costo;
    });

    res.json(productosCostoActual);
  });
});


// Ruta para agregar un nuevo producto
app.post('/producto', (req, res) => {
  const { nombre, costo, iva, stock } = req.body;

  // Obtén los valores de configuración del JSON
  const configuracion = obtenerConfiguracion(); // Implementa la función según cómo cargas la configuración

  const { valorDolar, gananciaLista1, gananciaLista2, gananciaLista3, gananciaLista4 } = configuracion;

  // Calcula el costo en dólares
  const costoDolar = parseFloat(costo) / valorDolar;

  // Calcula el tipo de cambio del día
  const cotDolarCompra = valorDolar; // O obtén este valor según tu lógica desde configuracion.json

  // Calcula los precios de lista en dólares
  const precioLista1Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista1 / 100);
  const precioLista2Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista2 / 100);
  const precioLista3Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista3 / 100);
  const precioLista4Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista4 / 100);

  // Convierte los precios de dólares a pesos
  const precioLista1 = precioLista1Dolar * valorDolar;
  const precioLista2 = precioLista2Dolar * valorDolar;
  const precioLista3 = precioLista3Dolar * valorDolar;
  const precioLista4 = precioLista4Dolar * valorDolar;

  // Realiza la inserción en la base de datos con los nuevos valores
  const sql = 'INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4, stock, costoDolar, cotDolarCompra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4, stock, costoDolar, cotDolarCompra];

  db.query(sql, values, (err, result) => {
      if (err) {
          console.error('Error al insertar el producto: ' + err.message);
          res.status(500).send('Error al insertar el producto: ' + err.message);
          return;
      }

      console.log('Producto agregado correctamente:', result);
      res.status(201).send('Producto agregado correctamente');
  });
});

// Ruta para obtener todos los productos
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      console.error('Error al obtener productos: ' + err.message);
      res.status(500).send('Error al obtener productos');
      return;
    }

    res.json(results);
  });
});

// Ruta para obtener un producto por ID
app.get('/producto/:id', (req, res) => {
  const productId = req.params.id;

  // Obtener el producto con el ID proporcionado
  db.query('SELECT * FROM productos WHERE id = ?', [productId], (err, results) => {
    if (err) {
      console.error('Error al obtener detalles del producto: ' + err.message);
      res.status(500).json({ error: 'Error al obtener detalles del producto' });
      return;
    }

    if (results.length === 0) {
      // El producto con el ID proporcionado no existe
      res.status(404).json({ error: 'El producto no existe' });
    } else {
      // El producto existe, enviar los detalles del producto
      res.json(results[0]);
    }
  });
});

/// Ruta para editar un producto por ID
app.put('/producto/:id', (req, res) => {
  const productId = req.params.id;

  // Verificar si el producto con el ID proporcionado existe
  db.query('SELECT * FROM productos WHERE id = ?', [productId], (err, results) => {
    if (err) {
      console.error('Error al buscar el producto: ' + err.message);
      res.status(500).json({ error: 'Error al buscar el producto' });
      return;
    }

    if (results.length === 0) {
      // El producto con el ID proporcionado no existe
      res.status(404).json({ error: 'El producto no existe' });
    } else {
      // El producto existe, proceder a actualizarlo
      const { nombre, costo, iva, stock } = req.body;

      // Obtén los valores de configuración del JSON
      const configuracion = obtenerConfiguracion(); // Implementa la función según cómo cargas la configuración

      const { valorDolar, gananciaLista1, gananciaLista2, gananciaLista3, gananciaLista4 } = configuracion;

      // Calcula el costo en dólares
      const costoDolar = parseFloat(costo) / valorDolar;

      // Calcula los precios de lista en dólares
      const precioLista1Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista1 / 100);
      const precioLista2Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista2 / 100);
      const precioLista3Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista3 / 100);
      const precioLista4Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista4 / 100);

      // Convierte los precios de dólares a pesos
      const precioLista1 = precioLista1Dolar * valorDolar;
      const precioLista2 = precioLista2Dolar * valorDolar;
      const precioLista3 = precioLista3Dolar * valorDolar;
      const precioLista4 = precioLista4Dolar * valorDolar;

      // Aquí puedes agregar los console.log
      console.log('costoDolar:', costoDolar);
      console.log('precioLista1:', precioLista1);
      console.log('precioLista2:', precioLista2);
      console.log('precioLista3:', precioLista3);
      console.log('precioLista4:', precioLista4);

      // Realizar la actualización en la base de datos
      db.query(
        'UPDATE productos SET nombre=?, costo=?, iva=?, costoDolar=?, precioLista1=?, precioLista2=?, precioLista3=?, precioLista4=?, stock=? WHERE id=?',
        [nombre, costo, iva, costoDolar, precioLista1, precioLista2, precioLista3, precioLista4, stock, productId],

        (err, result) => {
          if (err) {
            console.error('Error al editar el producto: ' + err.message);
            res.status(500).json({ error: 'Error al editar el producto' });
            return;
          }

          res.status(200).json({ message: 'Producto editado correctamente' });
        }
      );
    }
  });
});

app.put('/actualizar-precios-listas', (req, res) => {
  const { valorDolar } = req.body;

  // Obtén los valores de configuración del JSON
  const configuracion = obtenerConfiguracion();

  if (!configuracion) {
    console.error('Error al obtener la configuración en actualizar-precios-listas');
    res.status(500).json({ error: 'Error al obtener la configuración' });
    return;
  }

  // No necesitamos las ganancias de las listas para este caso

  // Realiza una consulta para obtener todos los productos
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      console.error('Error al obtener productos: ' + err.message);
      res.status(500).json({ error: 'Error al obtener productos' });
      return;
    }

    // Itera sobre los resultados y actualiza los costos de cada producto
    results.forEach(producto => {
      const { id, costo } = producto;

      // Verifica que costo y valorDolar sean números válidos antes de realizar el cálculo
      if (!isNaN(costo) && isFinite(costo) && !isNaN(valorDolar) && isFinite(valorDolar)) {
        // Calcula el costo en dólares
        const costoDolar = parseFloat(costo) / valorDolar;

        // Actualiza el costo y el costoDolar en la base de datos
        db.query(
          'UPDATE productos SET costo=?, costoDolar=? WHERE id=?',
          [costo, costoDolar, id],
          (err, result) => {
            if (err) {
              console.error(`Error al actualizar costos del producto con ID ${id}: ${err.message}`);
            }
          }
        );
      } else {
        console.error(`Error: costo o valorDolar no son números válidos - ID: ${id}, Costo: ${costo}, Valor Dolar: ${valorDolar}`);
      }
    });

    // Log para depurar
    console.log('Operación completada');

    res.status(200).json({ message: 'Costos actualizados correctamente' });
  });
});

// Ruta para borrar un producto por ID
app.delete('/producto/:id', (req, res) => {
  const productId = req.params.id;

  // Verificar si el producto con el ID proporcionado existe
  db.query('SELECT * FROM productos WHERE id = ?', [productId], (err, results) => {
    if (err) {
      console.error('Error al buscar el producto: ' + err.message);
      res.status(500).json({ error: 'Error al buscar el producto' });
      return;
    }

    if (results.length === 0) {
      // El producto con el ID proporcionado no existe
      res.status(404).json({ error: 'El producto no existe' });
    } else {
      // El producto existe, proceder a borrarlo
      db.query('DELETE FROM productos WHERE id = ?', [productId], (err, result) => {
        if (err) {
          console.error('Error al borrar el producto: ' + err.message);
          res.status(500).json({ error: 'Error al borrar el producto' });
          return;
        }

        res.status(200).json({ message: 'Producto borrado correctamente' });
      });
    }
  });
});

// Ruta para buscar productos con criterios
app.get('/search', (req, res) => {
  const searchId = req.query.searchId;
  const searchDescription = req.query.searchDescription;

  // Lógica para buscar productos según los criterios proporcionados
  let sql = 'SELECT * FROM productos WHERE 1';

  const params = [];

  if (searchId) {
    sql += ' AND id = ?';
    params.push(searchId);
  }

  if (searchDescription) {
    sql += ' AND nombre LIKE ?';
    params.push(`%${searchDescription}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error al buscar productos: ' + err.message);
      res.status(500).json({ error: 'Error al buscar productos' });
      return;
    }

    res.json(results);
  });
});


// Añade una nueva ruta para manejar las solicitudes de edición por ID
app.get('/edit', (req, res) => {
  const productId = req.query.id;

  // Obtener el producto con el ID proporcionado
  db.query('SELECT * FROM productos WHERE id = ?', [productId], (err, results) => {
    if (err) {
      console.error('Error al obtener detalles del producto: ' + err.message);
      res.status(500).json({ error: 'Error al obtener detalles del producto' });
      return;
    }

    if (results.length === 0) {
      // El producto con el ID proporcionado no existe
      res.status(404).json({ error: 'El producto no existe' });
    } else {
      // El producto existe, enviar los detalles del producto
      res.json(results[0]);
    }
  });
});

// Ruta para obtener la configuración
app.get('/configuracion', (req, res) => {
  // Utiliza path.join para construir la ruta completa al archivo de configuración
  const configFilePath = path.join(__dirname, 'public', 'config', 'configuracion.json');

  // Leer el archivo de configuración y enviarlo como respuesta
  fs.readFile(configFilePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error al leer el archivo de configuración: ', err.message);
          res.status(500).json({ error: 'Error al obtener la configuración' });
          return;
      }

      const configuracion = JSON.parse(data);
      res.json(configuracion);
  });
});

// Ruta para guardar la configuración
app.put('/configuracion', (req, res) => {
  const nuevaConfiguracion = req.body;

  // Utiliza path.join para construir la ruta completa al archivo de configuración
  const configFilePath = path.join(__dirname, 'public', 'config', 'configuracion.json');

  // Escribir la nueva configuración en el archivo
  fs.writeFile(configFilePath, JSON.stringify(nuevaConfiguracion), (err) => {
      if (err) {
          console.error('Error al guardar el archivo de configuración: ', err.message);
          res.status(500).json({ error: 'Error al guardar la configuración' });
          return;
      }

      console.log('Configuración guardada correctamente');
      res.status(200).json({ message: 'Configuración guardada correctamente' });
  });
});

// Ruta para obtener los datos de la empresa
app.get('/datos-empresa', (req, res) => {
  const datosEmpresaPath = path.join(__dirname, 'public', 'config', 'datos.json');

  fs.readFile(datosEmpresaPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer datos.json: ', err.message);
      res.status(500).json({ error: 'Error al obtener los datos de la empresa' });
      return;
    }

    const datosEmpresa = JSON.parse(data);
    res.json(datosEmpresa);
  });
});

// Ruta para guardar los datos de la empresa
app.put('/datos-empresa', (req, res) => {
  const nuevosDatosEmpresa = req.body;

  const datosEmpresaPath = path.join(__dirname, 'public', 'config', 'datos.json');

  fs.writeFile(datosEmpresaPath, JSON.stringify(nuevosDatosEmpresa), (err) => {
    if (err) {
      console.error('Error al guardar datos.json: ', err.message);
      res.status(500).json({ error: 'Error al guardar los datos de la empresa' });
      return;
    }

    console.log('Datos de la empresa guardados correctamente');
    res.status(200).json({ message: 'Datos de la empresa guardados correctamente' });
  });
});

// Nueva ruta para confirmar la factura y actualizar el stock
app.post('/confirmar-factura', async (req, res) => {
  const productosFactura = req.body.productos;

  try {
      // Iniciar una transacción para asegurar la consistencia de la base de datos
      await db.beginTransaction();

      // Lógica para actualizar el stock aquí
      for (const producto of productosFactura) {
          const { id, cantidad } = producto;

          // Realizar una consulta para restar la cantidad del stock
          await db.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, id]);
      }

      // Confirmar la transacción si todas las actualizaciones son exitosas
      await db.commit();

      res.status(200).json({ message: 'Factura confirmada y stock actualizado correctamente' });
  } catch (error) {
      // Revertir la transacción en caso de error
      await db.rollback();

      console.error('Error al confirmar la factura y actualizar el stock:', error);

      res.status(500).json({ message: 'Error al confirmar la factura y actualizar el stock' });
  }
});

// Nueva ruta para actualizar costos
app.put('/actualizar-costos', (req, res) => {
  console.log('Solicitud PUT recibida en /actualizar-costos');
  console.log('Cuerpo de la solicitud recibida:', req.body);

  // Verificación de existencia del producto
  if (!productoExiste) {
    return res.status(404).json({ error: 'El producto no existe' });
  }

  // Obtén el cuerpo de la solicitud
  const nuevosCostos = req.body.nuevosCostos;

  // Verifica que nuevosCostos sea un objeto no vacío
  if (!nuevosCostos || Object.keys(nuevosCostos).length === 0) {
    console.error('Los nuevos costos no son válidos.');
    return res.status(400).json({ error: 'Los nuevos costos no son válidos.' });
  }

  // Itera sobre los nuevos costos y actualiza la base de datos
  Object.entries(nuevosCostos).forEach(([id, costo]) => {
    // Realiza la actualización en la base de datos
    db.query('UPDATE productos SET costo = ? WHERE id = ?', [costo, id], (err, result) => {
      if (err) {
        console.error(`Error al actualizar el costo del producto con ID ${id}: ${err.message}`);
        // Puedes enviar una respuesta con el error si lo deseas
      } else {
        console.log(`Costo actualizado correctamente para el producto con ID ${id}`);

        // Obtén valores del archivo de configuración (puedes leer esto al inicio de tu aplicación)
        const configuracion = require('./config/configuracion.json');
        const iva = 0.21; // Supongamos que el IVA es del 21%

        // Calcula los nuevos precios de las listas
        const nuevosPreciosListas = calcularPreciosListas(
          costo,
          iva,
          configuracion.gananciaLista1,
          configuracion.gananciaLista2,
          configuracion.gananciaLista3,
          configuracion.gananciaLista4
        );

        // Actualiza los precios de las listas en la base de datos (puedes adaptar esto según tu estructura)
        db.query(
          'UPDATE productos SET precioLista1 = ?, precioLista2 = ?, precioLista3 = ?, precioLista4 = ? WHERE id = ?',
          [
            nuevosPreciosListas.precioLista1,
            nuevosPreciosListas.precioLista2,
            nuevosPreciosListas.precioLista3,
            nuevosPreciosListas.precioLista4,
            id,
          ],
          (precioErr, precioResult) => {
            if (precioErr) {
              console.error(`Error al actualizar los precios de las listas: ${precioErr.message}`);
              // Puedes enviar una respuesta con el error si lo deseas
            } else {
              console.log(`Precios de las listas actualizados correctamente para el producto con ID ${id}`);
            }
          }
        );
      }
    });
  });

  console.log('Después de la actualización');

  // Envía una respuesta
  res.json({ message: 'Costos y precios de listas actualizados correctamente' });
});


// Ruta para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar solicitudes a 'index.html'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

