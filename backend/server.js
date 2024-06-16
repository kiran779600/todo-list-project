const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3005;


app.use(cors());
app.use(bodyParser.json());


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Pass@123',
  database: 'todo_db'
};


const db = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password
});


db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
  db.query('CREATE DATABASE IF NOT EXISTS todo_db', (err) => {
    if (err) {
      throw err;
    }
    console.log('Database todo_db created or exists.');

 
    db.changeUser({ database: dbConfig.database }, (err) => {
      if (err) {
        throw err;
      }
      console.log('Switched to todo_db database.');

  
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT,
          name VARCHAR(255),
          description VARCHAR(255),
          date DATE,
          timestamp VARCHAR(255),
          PRIMARY KEY (id)
        )
      `;
      db.query(createTableQuery, (err, result) => {
        if (err) {
          throw err;
        }
        console.log('Tasks table created or exists.');
      });
    });
  });
});


app.post('/addTask', (req, res) => {
  const { name, description, date, timestamp } = req.body;
  let sql = 'INSERT INTO tasks (name, description, date, timestamp) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, description, date, timestamp], (err, result) => {
    if (err) throw err;
    res.send({ id: result.insertId, ...req.body });
  });
});


app.get('/tasks', (req, res) => {
  let sql = 'SELECT * FROM tasks';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


app.put('/updateTask/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, date } = req.body;
  let sql = 'UPDATE tasks SET name = ?, description = ?, date = ? WHERE id = ?';
  db.query(sql, [name, description, date, id], (err, result) => {
    if (err) throw err;
    res.send(req.body);
  });
});


app.delete('/deleteTask/:id', (req, res) => {
  const { id } = req.params;
  let sql = 'DELETE FROM tasks WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send(`Task with ID ${id} deleted.`);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
