const mongoose = require('mongoose');

const factions = [
  {
    id: 0,
    name: '阿普莱斯人类政府'
  },
  {
    id: 1,
    name: '菲尔劳斯军事集团'
  }
]

const UserSchema = new mongoose.Schema({
  name: String,
  qq: Number,
  js: String,
  faction: Number,
  approved: {
      type: Boolean,
      default: false
  }
});

module.exports = {
  UserModel: mongoose.model('User', UserSchema, 'user'),
  factions,
  findFaction: (id)=>factions.find(faction=>faction.id===id),
};