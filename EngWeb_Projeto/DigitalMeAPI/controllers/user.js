var User = require('../models/user')

module.exports.findAll = () => {
    return User.find({ admin: false }).exec();
};

module.exports.findUserByID = (id) => {
    return User.findById(id).exec();
};

module.exports.updateById = (id, updateData) => {
    return User.findByIdAndUpdate(id, updateData, { new: true }).exec();
};

module.exports.deleteById = (id) => {
    return User.findByIdAndDelete(id).exec();
};

module.exports.countUsers = async () => {
  return await User.countDocuments({ admin: false });
};