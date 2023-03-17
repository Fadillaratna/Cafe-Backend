//import auth
const jsonwebtoken = require('jsonwebtoken');
const SECRET_KEY = 'yarahasiamakanyajangannanya';

const md5 = require('md5');

const model = require('../../models/index');
const user = model.user;

const access = require('../utils/access');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

class User {
  async login(req, res) {
    try {
      const param = {
        username: req.body.username,
        password: md5(req.body.password),
      };

      let findUser = await user.findOne({ where: param });
      if (findUser == null) {
        return res.status(404).json({
          message: "username or password doesn't match",
        });
      }

      // generate jwt token
      let tokenPayload = {
        id_user: findUser.id_user,
        username: findUser.username,
        role: findUser.role,
      };
      tokenPayload = JSON.stringify(tokenPayload);
      let token = await jsonwebtoken.sign(tokenPayload, SECRET_KEY);

      // let result
      return res.status(200).json({
        message: 'success login',
        data: {
          token: token,
          user: findUser,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Internal error',
        err: error,
      });
    }
  }

  async create(req, res) {
    try {
      let granted = await access.admin(req);
      if (!granted.status) {
        return res.status(403).json(granted.message);
      }

      const data = {
        name_user: req.body.name_user,
        role: req.body.role,
        username: req.body.username,
        password: md5(req.body.password),
        gender: req.body.gender,
        telephone: req.body.telephone,
      };

      let result = await user.create(data);
      return res.status(200).json({
        message: 'success adding data user',
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
      let granted = await access.admin(req);
      if (!granted.status) {
        return res.status(403).json(granted.message);
      }

      const param = { id_user: req.params.id };
      const data = {
        name_user: req.body.name_user,
        role: req.body.role,
        username: req.body.username,
        gender: req.body.gender,
        telephone: req.body.telephone,
      };

      let result = await user.update(data, { where: param });
      return res.status(200).json({
        message: 'success update data user',
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

      const param = { id_user: req.params.id };

      let result = await user.destroy({ where: param });
      return res.status(200).json({
        message: 'success delete data user',
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
    const { role, keyword } = req.query;
    try {
      let result = await user.findAll({
        where: {
          [Op.and]: [role === 'all' || role === '' ? null : { role: role }],
          [Op.or]: [
            { name_user: { [Op.substring]: keyword } },
            { username: { [Op.substring]: keyword } },
            { gender: { [Op.substring]: keyword } },
            { telephone: { [Op.substring]: keyword } },
          ],
        },
      });
      return res.status(200).json({
        message: 'success get all data user',
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
    try {
      const param = { id_user: req.params.id };
      let result = await user.findOne({ where: param });
      return res.status(200).json({
        message: 'success get one data user',
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

module.exports = User;
