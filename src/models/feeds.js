'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class feeds extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  feeds.init({
    userId: DataTypes.INTEGER,
    feed: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'feeds',
  });

  feeds.associate=(models)=>{
    feeds.belongsTo(models.users, {foreignKey: "userId"}),
    feeds.hasMany(models.likes, {foreignKey: "feedsId"})
  }

  return feeds;
};