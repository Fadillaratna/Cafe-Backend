const model = require('../../models/index');
const table = model.meja;

const access = require('../utils/access');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

class Table {
  async create(req, res) {
    try {
      let granted = await access.admin(req);
      if (!granted.status) {
        return res.status(403).json(granted.message);
      }

      const data = {
        table_number: req.body.table_number,
        status: 'available',
        capacity: req.body.capacity,
      };

      let result = await table.create(data);
      return res.status(200).json({
        message: 'success adding data table',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal error',
        err: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      let granted = await access.adminCashier(req);
      if (!granted.status) {
        return res.status(403).json(granted.message);
      }

      const param = { id_meja: req.params.id };
      const data = {
        table_number: req.body.table_number,
        status: 'available',
        capacity: req.body.capacity,
      };

      let result = await table.update(data, { where: param });
      return res.status(200).json({
        message: 'success update data table',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal error',
        err: error,
      });
    }
  }

  async delete(req, res) {
    try {
      let granted = await access.admin(req);
      if (!granted.status) {
        return res.status(403).json(granted.message);
      }

      const param = { id_meja: req.params.id };

      let result = await table.destroy({ where: param });
      return res.status(200).json({
        message: 'success delete data table',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal error',
        err: error,
      });
    }
  }

  async getAll(req, res) {
    const { status, keyword } = req.query;
    try {
      let granted = await access.adminCashier(req);
      if (!granted.status) {
        return res.status(403).json(granted.message);
      }

      let result = await table.findAll({
        where: {
          [Op.and]: [status === 'all' || status === '' ? null : { status: status }],
          [Op.or]: [
            { capacity: { [Op.substring]: keyword } },
            { table_number: { [Op.substring]: keyword } },
          ],
        },
      });
      return res.status(200).json({
        message: 'success get all data table',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal error',
        err: error,
      });
    }
  }

  async getOne(req, res) {
    let granted = await access.adminCashier(req);
    if (!granted.status) {
      return res.status(403).json(granted.message);
    }

    try {
      const param = { id_meja: req.params.id };
      let result = await table.findOne({ where: param });
      return res.status(200).json({
        message: 'success get one data table',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal error',
        err: error,
      });
    }
  }

  async updateStatus(req, res) {
    try {
      let granted = await access.cashier(req);
      if (!granted.status) {
        return res.status(403).json(granted.message);
      }

      const param = { id_meja: req.params.id };
      const data = {
        status: req.body.status,
      };

      let result = await table.update(data, { where: param });
      return res.status(200).json({
        message: 'success update status of table',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal error',
        err: error,
      });
    }
  }
}

module.exports = Table;
