const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); 
const mysql = require('mysql');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

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

// Agrega esta función en tu código para cargar la configuración
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

// Ruta para agregar un nuevo producto
app.post('/producto', (req, res) => {
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

// Ahora puedes usar costoDolar y los precios en pesos para guardar en la base de datos

  // Realiza la inserción en la base de datos con los nuevos valores
  const sql = 'INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4, stock, costoDolar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4, stock, costoDolar];

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

// Ruta para actualizar precios de listas al modificar el precio del dólar
app.put('/actualizar-precios-listas', (req, res) => {
  // Obtén el nuevo valor del dólar desde la solicitud
  const nuevoValorDolar = req.body.valorDolar;

  // Obtén los productos de la base de datos
  db.query('SELECT * FROM productos', (err, productos) => {
    if (err) {
      console.error('Error al obtener productos: ' + err.message);
      res.status(500).json({ error: 'Error al obtener productos' });
      return;
    }

    // Itera sobre los productos y actualiza los precios de lista
    productos.forEach(producto => {
      const { costo, iva, gananciaLista1, gananciaLista2, gananciaLista3, gananciaLista4 } = producto;

      // Calcula el costo en dólares
      const costoDolar = parseFloat(costo) / nuevoValorDolar;

      // Calcula los precios de lista en dólares
      const precioLista1Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista1 / 100);
      const precioLista2Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista2 / 100);
      const precioLista3Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista3 / 100);
      const precioLista4Dolar = costoDolar * (1 + parseFloat(iva) / 100) * (1 + gananciaLista4 / 100);

      // Convierte los precios de dólares a pesos
      const precioLista1 = precioLista1Dolar * nuevoValorDolar;
      const precioLista2 = precioLista2Dolar * nuevoValorDolar;
      const precioLista3 = precioLista3Dolar * nuevoValorDolar;
      const precioLista4 = precioLista4Dolar * nuevoValorDolar;

      // Actualiza los precios en la base de datos
      db.query(
        'UPDATE productos SET costoDolar=?, precioLista1=?, precioLista2=?, precioLista3=?, precioLista4=? WHERE id=?',
        [costoDolar, precioLista1, precioLista2, precioLista3, precioLista4, producto.id],
        (err, result) => {
          if (err) {
            console.error('Error al actualizar precios del producto ' + producto.id + ': ' + err.message);
          }
        }
      );
    });

    res.status(200).json({ message: 'Precios actualizados correctamente' });
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

// Ruta para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar solicitudes a 'index.html'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

