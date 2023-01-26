const model = require('../../models/index');
const menu = model.menu;

const access = require('../utils/access');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const path = require('path');
const fs = require('fs');

class Menu {
  async create(req, res) {
    try {
      let granted = await access.admin(req);
      if (!granted.status) {
        return res.status(403).json(granted.message);
      }

      const data = {
        menu_name: req.body.menu_name,
        type: req.body.type,
        subtype: req.body.subtype,
        description: req.body.description,
        image: req.file.filename,
        price: req.body.price,
      };

      let result = await menu.create(data);
      return res.status(200).json({
        message: 'success adding data menu',
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Internal error',
        err: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      let granted = await access.admin(req);
      if (!granted.status) {
        return res.status(403).json(granted.message);
      }

      const param = { id_menu: req.params.id };
      const data = {
        menu_name: req.body.menu_name,
        type: req.body.type,
        subtype: req.body.subtype,
        description: req.body.description,
        price: req.body.price,
      };

      if (req.file) {
        try {
          const result = await menu.findOne({ where: param });
          const oldFileName = result.image;

          //delete old file
          const dir = path.join(__dirname, '../../../image', oldFileName);
          fs.unlink(dir, (err) => console.log(err));
        } catch (err) {
          console.log(err);
        }

        data.image = req.file.filename;
      }

      let result = await menu.update(data, { where: param });
      return res.status(200).json({
        message: 'success update data menu',
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

      const param = { id_menu: req.params.id };

      try {
        const result = await menu.findOne({ where: param });
        const oldFileName = result.image;

        const dir = path.join(__dirname, '../../../image', oldFileName);
        fs.unlink(dir, (err) => console.log(err));

        console.log(dir);
      } catch (err) {
        console.log(err);
      }

      let result = await menu.destroy({ where: param });
      return res.status(200).json({
        message: 'success delete data menu',
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
    const { type, keyword, subtype } = req.query;
    try {
      let result = await menu.findAll({
        where: {
          [Op.and]: [
            type === '' || type === 'all' ? null : { type: type },
            subtype === '' || subtype === 'all' ? null : { subtype: subtype },
          ],
          [Op.or]: [
            { price: { [Op.substring]: keyword } },
            { menu_name : { [Op.substring]: keyword } },
          ],
        },
      });
      return res.status(200).json({
        message: 'success get all data menu',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal error',
        err: error.message,
      });
    }
  }

  async getOne(req, res) {
    try {
      const param = { id_menu: req.params.id };
      let result = await menu.findOne({ where: param });
      return res.status(200).json({
        message: 'success get one data menu',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal error',
        err: error.message,
      });
    }
  }

  async getByType(req, res) {
    try {
      let param = { type: req.params.type };
      let result = await menu.findAll({ where: param });
      return res.status(200).json({
        message: 'success get all data menu by type',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal error',
        err: error.message,
      });
    }
  }
}

module.exports = Menu;
