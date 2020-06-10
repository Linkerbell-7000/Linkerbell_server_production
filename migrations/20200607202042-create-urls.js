'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('urls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        onDelete: 'cascade',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      favorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isnew: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('urls');
  },
};
