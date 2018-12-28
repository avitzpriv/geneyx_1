'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Owners', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      email: { type: Sequelize.STRING, unique: true, validate: { isEmail: true } },
      password: { type: Sequelize.STRING, allowNull: false },
      active: { type: Sequelize.BOOLEAN, defaultValue: true },
      deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      type: { type: Sequelize.INTEGER },
      birth_date: { type: Sequelize.DATE },
      gender: { type: Sequelize.BOOLEAN },
      blood_type: { type: Sequelize.INTEGER },
      property1: { type: Sequelize.STRING },
      property2: { type: Sequelize.STRING },
  
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
    return queryInterface.dropTable('Owners');
  }
};