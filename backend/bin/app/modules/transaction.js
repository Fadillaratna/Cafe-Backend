const moment = require('moment');
const model = require('../../models/index');
const transaction = model.transaksi;
const menu = model.menu;
const detail = model.detail_transaksi;
const table = model.meja;

const access = require('../utils/access');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

class Transaction {
  async store(req, res) {
    try {
      let granted = await access.cashier(req);
      if (!granted.status) {
        return res.status(403).json(granted.message);
      }

      let current = new Date();
      let today = moment(current).format('YYYY-MM-DD');

      const dataTransaksi = {
        id_meja: req.body.id_meja,
        id_user: req.body.id_user,
        customer_name: req.body.customer_name,
        status: 'unpaid',
        transaction_date: today,
      };

      const listMenu = req.body.list_menu;

      // custom payload for response
      let result = {};

      // insert transaksi
      let insertTransaksi = await transaction.create(dataTransaksi);
      result = insertTransaksi.dataValues;
      result.detail = [];
      result.total = 0;

      // insert detail transaksi
      for (let i = 0; i < listMenu.length; i++) {
        let param = { id_menu: listMenu[i]['id_menu'] };
        let getMenu = await menu.findOne({ where: param });

        let detailItem = {
          id_transaksi: insertTransaksi.id_transaksi,
          id_menu: listMenu[i]['id_menu'],
          qty: listMenu[i]['qty'],
          price: listMenu[i]['qty'] * getMenu.price,
          notes: listMenu[i]['notes'],
        };

        let insertDetail = await detail.create(detailItem);
        result.detail.push(insertDetail.dataValues);

        result.total += detailItem.price;
      }

      let payloadUpdateStatus = {
        status: 'booked',
      };

      await table.update(payloadUpdateStatus, { where: { id_meja: dataTransaksi.id_meja } });

      return res.status(200).json({
        message: 'success adding data transaksi',
        data: result,
      });
    } catch (error) {
      console.log(error);
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

      const param = { id_transaksi: req.params.id_transaction };

      const data = {
        status: 'paid',
      };

      let result = await transaction.update(data, { where: param });

      let getTransaction = await transaction.findOne({ where: param });

      try {
        let payloadUpdateStatusTable = {
          status: 'available',
        };
        await table.update(payloadUpdateStatusTable, {
          where: { id_meja: getTransaction.id_meja },
        });
      } catch (err) {
        console.log(err);
      }

      return res.status(200).json({
        message: 'success update status payment of transaction',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal error',
        err: error,
      });
    }
  }

  async findAll(req, res) {
    try {
      let { date, user, keyword } = req.query;
      let transaction_date = new Date(date);

      let result = await transaction.findAll({
        where: {
          [Op.and]: [
            date === '' || date === 'all' ? null : { transaction_date: transaction_date },
            user === '' || user === 'all' ? null : { '$user.name_user$': user },
          ],
          [Op.or]: [
            { customer_name : { [Op.substring]: keyword } },
            { '$meja.table_number$': { [Op.substring]: keyword } },
            // { status: { [Op.substring]: keyword } },
          ],
        },
        include: [
          'user',
          'meja',
          {
            model: detail,
            as: 'detail_transaksi',
            include: ['menu'],
          },
        ],
      });
      
      return res.status(200).json({
        message: 'success get all data table',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Internal error',
        err: error,
      });
    }
  }
}

module.exports = Transaction;
