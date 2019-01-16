'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING, unique: true, validate: { isEmail: true } 
      },
      type: {
        type: Sequelize.INTEGER
      },
      LabId: {
        type: Sequelize.INTEGER
      },
      OwnerId: {
        type: Sequelize.INTEGER
      },
      password: {
        type: Sequelize.STRING, allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};