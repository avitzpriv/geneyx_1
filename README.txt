To run the server:
  node server.js

To run server with the seed files info:
  node server.js -initdb

Run with nodemon:
  nodemon -e js, handlebars server.js
  
Path to file upload:
  http://localhost:5000/lab/4/test

To run sequelize:
  sequelize --config ./db_config.js db:migrate
  sequelize --config ./db_config.js db:migrate:undo

To run the seeds files:
  sequelize --config ./db_config.js db:seed:all
To undo seeds:
  sequelize --config ./db_config.js db:seed:undo:all
  
  
  