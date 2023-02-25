const mongoose = require('mongoose');
const {UserModel} = require('../utils/model');

module.exports = async (req, res) => {
    if(req.query.api === process.env.API_SECRET){
    mongoose.connect(process.env.DB_ADDR);
	
		if(req.query.opened === "true"){
			await UserModel.deleteMany({"name": "openornot"}).exec();
			res.send('已允许提交申请');
		}else if(req.query.opened === "false"){
			let addUser = UserModel({
				qq: 88888888,
				name: "openornot",
				js: "config",
				faction: 1
			})
			addUser.save().then((doc) => {console.log(doc)})
			res.send('已禁止提交申请');
		}else{
			res.send('提交参数出错！');
		}
		
    }else{
        res.send('不是管理员你改你妈呢?');
    }
}

