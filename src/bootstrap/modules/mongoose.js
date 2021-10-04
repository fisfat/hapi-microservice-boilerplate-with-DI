const awilix = require('awilix');
const mongoose = require('mongoose');

module.exports = async (container) => {
  const { mongodb: mongodbConfig } = container.resolve('config');
  const { url } = mongodbConfig;

  const logger = container.resolve('logger');

  let mongooseConnection;

  const start = async () => {
    mongooseConnection = await mongoose.createConnection(url, {
      useNewUrlParser: true,
    });

    const addUpdateOptionNew = (schema) => {
      schema.pre('findOneAndUpdate', function addUpdateOptionNewPreFindOneAndUpdate(next) {
        if (this.options.new === undefined) {
          this.findOneAndUpdate({}, {}, { new: true });
        }

        next();
      });
    };

    const addUpdatedAt = (schema) => {
      schema.pre('findOneAndUpdate', function addUpdatedAtPreFindOneAndUpdate(next) {
        this.findOneAndUpdate({}, { $set: { updatedAt: new Date() } });
        next();
      });

      schema.pre('update', function addUpdatedAtPreUpdate(next) {
        this.update({}, { $set: { updatedAt: new Date() } });
        next();
      });
    };

    mongoose.plugin(addUpdateOptionNew);
    mongoose.plugin(addUpdatedAt);

    logger.info('mongoose connected.');

    return mongooseConnection;
  };

  const stop = async () => (
    mongooseConnection.close()
  );

  const register = async () => (
    container.register('mongooseConnection', awilix.asValue(mongooseConnection))
  );

  return {
    start,
    stop,
    register,
  };
};
