'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class likes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  likes.init({
    likes: DataTypes.INTEGER,
    feedsId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'likes',
  });
  likes.associate=(models)=>{
    likes.belongsTo(models.feeds, {foreignKey: "feedsId"})
  }
  return likes;
};