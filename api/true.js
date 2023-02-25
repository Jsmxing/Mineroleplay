const mongoose = require('mongoose');
const {UserModel} = require('../utils/model');
const signature = require('../utils/signature');
const request = require('request');

module.exports = async (req, res) => {
    mongoose.connect(process.env.DB_ADDR);

    if(!req.query.qq || isNaN(req.query.qq = parseInt(req.query.qq))) {
        res.status(400).send('Bad Request');
        return;
    }

    //判断token是否正确
    if(!req.query.t || !req.query.token || signature(`${req.query.qq}|${req.query.t}`) !== req.query.token) {
        res.status(401).send('Unauthorized');
        return;
    }

    //超过24小时访问通过链接删除该介绍
    if((new Date().getTime() - req.query.t) > 24 * 3600 * 1000) {
        request(process.env.HOST_ADDRESS+'/api/del?api='+process.env.API_SECRET+'&qq='+req.query.qq, function (error, response, body) {console.log(body)})
        res.status(402).send('Over 24 hours');
        return;
    }

    UserModel.updateOne(
    {'qq': req.query.qq},
    {'approved': true},
    (err, result) => {
        if (err) throw err
        res.json(result);
    })
}