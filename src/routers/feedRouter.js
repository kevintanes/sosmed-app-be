const route = require("express").Router();
const { feedController } = require("../controllers");
const { readToken } = require("../helper/jwt");

route.post("/tweet", readToken, feedController.tweet);
route.get("/getalltweet", feedController.getAllTweet);
route.get("/getothertweet/:username", feedController.getOtherUserTweet);
route.post("/getmytweet", feedController.getMyTweet);

module.exports = route;