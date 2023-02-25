const mongoose = require('mongoose');
const {UserModel} = require('../utils/model');
const email = require('../utils/email');

module.exports = async (req, res) => {
    if(req.query.api === process.env.API_SECRET){
    mongoose.connect(process.env.DB_ADDR);
	
	let all = await UserModel.deleteMany({"qq": req.query.qq}).exec();
	res.json(all);
	
    }else{
        res.send('不是管理员你删你妈呢?');
    }
}

