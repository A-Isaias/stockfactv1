const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Importa el módulo 'path' de Node.js
const mysql = require('mysql');
const cors = require('cors');

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
      precioLista4 DECIMAL(10, 2) NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear la tabla productos: ' + err.message);
    } else {
      console.log('Tabla "productos" creada o ya existente');
    }
  });
});

// Ruta para agregar un nuevo producto
app.post('/producto', (req, res) => {
  const { nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4 } = req.body;

  console.log('Datos recibidos del formulario:', req.body); // Agrega este console.log para imprimir los datos recibidos

  const sql = 'INSERT INTO productos (nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al insertar el producto: ' + err.message);
      res.status(500).send('Error al insertar el producto: ' + err.message); // Agrega el mensaje de error al cliente
      return;
    }

    console.log('Producto agregado correctamente:', result); // Agrega este console.log para imprimir información sobre el éxito
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

// Ruta para editar un producto por ID
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
      const { nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4 } = req.body;

      // Realizar la actualización en la base de datos
      db.query(
        'UPDATE productos SET nombre=?, costo=?, iva=?, precioLista1=?, precioLista2=?, precioLista3=?, precioLista4=? WHERE id=?',
        [nombre, costo, iva, precioLista1, precioLista2, precioLista3, precioLista4, productId],
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


// Ruta para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar solicitudes a 'index.html'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

