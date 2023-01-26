'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        this.hasMany(models.detail_transaksi,{
        foreignKey: "id_menu",
        as: "detail menu"
      })
    }
  }
  menu.init({
    id_menu: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    menu_name: DataTypes.STRING,
    type: DataTypes.ENUM('food','drink'),
    subtype: DataTypes.ENUM('appetizer','main course','dessert','mocktail','coffee','milk based'),
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    price: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'menu',
    tableName: "menu"
  });
  return menu;
};