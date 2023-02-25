const mongoose = require('mongoose');
const {UserModel, findFaction, factions} = require('../utils/model');

module.exports = async (req, res) => {
    mongoose.connect(process.env.DB_ADDR);
    let all = await UserModel.find({"approved": true}).exec();
    res.json({
        roles: all.map(i => {
            return {
                name: i.name,
                qq: i.qq,
                faction: i.faction,
                avatar: 'https://q1.qlogo.cn/g?b=qq&nk='+ i.qq +'&s=100',
                Sentence: i.js,
            }
        }),
        factions
    });
}

