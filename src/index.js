const http = require("http");
const fs = require("fs")
const mysql = require("mysql");

const hostname = "localhost";
const port = 3000;

const server = http.createServer((req, res) => {
  if (req.url == '/') {
    const con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
    });

    con.connect((err) => {
      if (err)
        console.log(err);
      console.log("DB Connected");
      let sql = "CREATE DATABASE IF NOT EXISTS my_projects"

      con.query(sql, (err, result) => {
        if (err)
          console.log(err);
        console.log("Database created");
      });

      con.query("USE my_projects", (err, result) => {
        if (err)
          console.log(err);
        console.log("Database selected");
      });

      sql = "CREATE TABLE IF NOT EXISTS person(PersonId int NOT NULL AUTO_INCREMENT PRIMARY KEY, Name VARCHAR(255),Age VARCHAR(255))"
      con.query(sql, (err, result) => {
        if (err)
          console.log(err);
        console.log("Table created");
      });
    });

    const home = fs.readFileSync('./src/index.html')
    res.statusCode = 200
    res.setHeader('content-Type', 'text/html')
    // res.write(home);
    res.end(home);
  }
  else {
    con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "my_projects",
    });

    switch (req.url) {
      case '/show':
        const show = fs.readFileSync('./src/show.html')
        res.setHeader('content-Type', 'text/html')
        res.statusCode = 200;
        res.end(show);
        break;

      case '/create':
        con.connect((err) => {
          if (err)
            console.log(err);
          console.log("Connected Create Data");
          let body = '';
          req.on('data', async chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            const sql = `INSERT INTO person (Name, Age) VALUES ('${JSON.parse(body).name}', ${JSON.parse(body).age})`;
            con.query(sql, (err, result) => {
              if (err)
                console.log(err);
              console.log("Data Inserted");
            });
          });
          res.statusCode = 200
          res.end("Data Inserted");
        });
        break;

      case '/read':
        con.connect((err) => {
          if (err)
            console.log(err);
          console.log("Connected Read Data");
          const sql = "SELECT * FROM person";
          con.query(sql, (err, result) => {
            if (err)
              console.log(err);
            console.log("Data selected");
            res.statusCode = 200
            res.setHeader('content-Type', 'application/json; charset=utf-8')
            // res.write(read);
            console.log(JSON.stringify(result))
            res.statusCode = 200
            res.end(JSON.stringify(result));
          });
        });
        break;

      case '/update':
        con.connect((err) => {
          if (err)
            console.log(err);
          console.log("Connected Update Data");
          let body = '';
          req.on('data', async chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            const sql = `UPDATE person SET Name = '${JSON.parse(body).name}', Age = '${JSON.parse(body).age}' WHERE PersonId = '${JSON.parse(body).Id}'`;
            con.query(sql, (err, result) => {
              if (err)
                console.log(err);
              console.log("Data Updated");
            });
          });
          res.statusCode = 200
          res.end("Data Updated");
        });
        break;

      case '/delete':
        con.connect((err) => {
          if (err)
            console.log(err);
          console.log("Connected Delete Data");
          let body = '';
          req.on('data', async chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            const sql = `DELETE FROM person WHERE PersonId = '${JSON.parse(body).Id}'`;
            con.query(sql, (err, result) => {
              if (err)
                console.log(err);
              console.log("Data Deleted");
            });
          });
          res.statusCode = 200
          res.end("Data Deleted");
        });
        break;

      default:
        const def = fs.readFileSync('./src/404.html')
        res.statusCode = 404
        res.setHeader('content-Type', 'text/html')
        // res.write(def);
        res.end(def);
        break;
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running on http://${hostname}:${port}`)
});
