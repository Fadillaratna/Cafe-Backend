'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transaksi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.detail_transaksi,{
        foreignKey: "id_transaksi",
        as: "detail_transaksi"
      })
      this.belongsTo(models.user,{
        foreignKey: "id_user",
        as: "user"
      })
      this.belongsTo(models.meja,{
        foreignKey: "id_meja",
        as: "meja"
      })
    }
  }
  transaksi.init({
    id_transaksi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transaction_date: DataTypes.DATE,
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_meja: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customer_name: DataTypes.STRING,
    status: DataTypes.ENUM('paid','unpaid'),
  }, {
    sequelize,
    modelName: 'transaksi',
    tableName: "transaksi"
  });
  return transaksi;
};