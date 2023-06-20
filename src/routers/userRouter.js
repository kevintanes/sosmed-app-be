const route = require("express").Router();
const { userController } = require("../controllers");
const { readToken } = require("../helper/jwt");
const { checkUser } = require("../helper/validator");

route.post("/register", checkUser, userController.register);
route.post("/auth", checkUser, userController.login);
route.patch("/verify", readToken, userController.verify);
route.get("/keeplogin", readToken, userController.keepLogin);
route.post("/forgetpassword", userController.forgetPassword);
route.patch("/resetpassword", readToken, userController.resetPassword);
route.get("/whotofollow", userController.whoToFollow);
route.get("/getAllDetailUser/:username", userController.getAllDetailUser);
route.post("/getdetailuser", userController.getDetailUser);

module.exports = route;