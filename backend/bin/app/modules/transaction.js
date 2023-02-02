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
      let ran = Math.floor(Math.random() * (99999999999 -  10000000000)) + 10000000000

      const dataTransaksi = {
        id_meja: req.body.id_meja,
        id_user: req.body.id_user,
        customer_name: req.body.customer_name,
        status: 'unpaid',
        transaction_date: today,
        invoice_code: ran
      };

      console.log("Random " + ran)

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
          subtotal: listMenu[i]['qty'] * getMenu.price,
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
        total_bayar: req.body.total_bayar,
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
            { customer_name: { [Op.substring]: keyword } },
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

  async updateOrder(req, res) {
    let granted = await access.cashier(req);
    if (!granted.status) {
      return res.status(403).json(granted.message);
    }
    try {
      const param = { id_transaksi: req.params.id_transaction };

      const listOrder = req.body.list_order;

      let detailTransaksi = await detail.findAll({
        where: param,
        include: ['menu'],
      });

      let dataRecent = [];
      let payloadUpdate = [];
      let addDetail = [];

      // for (let i = 0; i < detailTransaksi.length; i++) {
      //   for (let j = 0; j < listOrder.length; j++) {
      //     if (detailTransaksi[i].dataValues.id_menu === listOrder[j].id_menu) {
      //       dataRecent[i] = detailTransaksi[i].dataValues;
      //       payloadUpdate[i] = listOrder[j];
      //     } else {
      //       addDetail[i] = listOrder[j];
      //     }
      //   }
      // }

      for (let i = 0; i < listOrder.length; i++) {
        const find = detailTransaksi.find((x) => x.dataValues.id_menu === listOrder[i].id_menu);
        if (find) {
          dataRecent.push(find.dataValues);
          payloadUpdate.push(listOrder[i]);
        } else {
          addDetail.push(listOrder[i]);
        }
      }

      console.log('=========== RECENT');
      console.log(dataRecent);

      console.log('=========== PAYLOAD UPDATE');
      console.log(payloadUpdate);

      console.log('=========== ADD DETAIL');
      console.log(addDetail);

      // LOOPING UPDATE QTY
      for (let i = 0; i < dataRecent.length; i++) {
        console.log(dataRecent[i]);
        let getMenu = await menu.findOne({ where: { id_menu: payloadUpdate[i].id_menu } });
        let payloadQty = {
          qty: payloadUpdate[i].qty,
          // price: dataRecent[i].price + payloadUpdate[i].qty * getMenu.price,
          subtotal: payloadUpdate[i].qty * getMenu.price,
        };

        await detail.update(payloadQty, {
          where: { id_detail_transaksi: dataRecent[i].id_detail_transaksi },
        });
      }

      // INSERT NEW DETAIL
      for (let i = 0; i < addDetail.length; i++) {
        let getMenu = await menu.findOne({ where: { id_menu: addDetail[i].id_menu } });

        let detailItem = {
          id_transaksi: req.params.id_transaction,
          id_menu: addDetail[i].id_menu,
          qty: addDetail[i].qty,
          subtotal: addDetail[i].qty * getMenu.price,
        };

        await detail.create(detailItem);
      }

      return res.status(200).json({
        message: 'success update order',
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Transaction;
