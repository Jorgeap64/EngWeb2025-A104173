var Aip = require('../models/aip')
var User = require('../models/user')

module.exports.findAll = async (pageNum = 1, category = '') => {
  const pageSize = 3;
  const skip = (pageNum - 1) * pageSize;

  const query = {};
  if (category && category.trim() !== '') {
    query.category = category;
  }

  const [results, totalCount] = await Promise.all([
    Aip.find(query)
      .sort({ submission_date: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec(),
    Aip.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  return { results, totalPages };
};

module.exports.countAips = async () => {
  return await Aip.countDocuments();
};

module.exports.save = async ( aip ) => {
	try {
		const aipDB = new Aip( aip );
		return await aipDB.save();
	} catch ( err ) {
		console.error( 'Error saving AIP:', err );
		throw err;
	}
};

module.exports.findAllPublic = async (pageNum = 1, category = '') => {
  const pageSize = 3;
  const skip = (pageNum - 1) * pageSize;

  const query = { public: true };

  if (category && category.trim() !== '') {
    query.category = category;
  }

  const [results, totalCount] = await Promise.all([
    Aip.find(query)
      .sort({ submission_date: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec(),
    Aip.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return { results, totalPages };
};

module.exports.findAllPrivateUser = async (pageNum = 1, userID, category = '') => {
  const user = await User.findById(userID).exec();
  if (!user) throw new Error('User not found');

  const pageSize = 3;
  const skip = (pageNum - 1) * pageSize;

  const query = { sender_id: user.username };
  if (category && category.trim() !== '') {
    query.category = category;
  }

  const [results, totalCount] = await Promise.all([
    Aip.find(query)
      .sort({ submission_date: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec(),
    Aip.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return { results, totalPages };
};

module.exports.deleteById = (id) => {
    return Aip.findByIdAndDelete(id).exec();
};

module.exports.putById = async (id) => {
  const aip = await Aip.findById(id).exec();
  if (!aip) throw new Error('Aip not found');

  const updated = await Aip.findByIdAndUpdate(
    id,
    { public: !aip.public },
    { new: true }
  ).exec();

  return updated;
};

module.exports.deleteByIdOwnedByUser = async (id, userID) => {
  const user = await User.findById(userID).exec();
  if (!user) throw new Error('User not found');

  return Aip.findOneAndDelete({ _id: id, sender_id: user.username }).exec();
};

module.exports.putByIdOwnedByUser = async (id, userID) => {
  const user = await User.findById(userID).exec();
  if (!user) throw new Error('User not found');

  const aip = await Aip.findOne({ _id: id, sender_id: user.username }).exec();
  if (!aip) throw new Error('AIP not found or not owned by user');

  const updated = await Aip.findByIdAndUpdate(
    id,
    { public: !aip.public },
    { new: true }
  ).exec();

  return updated;
};

module.exports.findById = (id) => {
    return Aip.findById(id).exec();
}

module.exports.findAllCategories = async () => {
  try {
    const categories = await Aip.distinct('category');
    return categories;
  } catch (err) {
    console.error('Error fetching distinct categories:', err);
    throw err;
  }
};