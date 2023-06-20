const model = require("../models");
const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const { createToken } = require("../helper/jwt");
const transporter = require("../helper/nodemailer");
const hbs = require("nodemailer-express-handlebars");


let salt = bcrypt.genSaltSync(10);

module.exports = {
    register: async (req, res, next) => {
        try {
            let cekUser = await model.users.findAll({
                where: sequelize.or(
                    { username: req.body.username },
                    { email: req.body.email }
                )
            });

            if (cekUser.length == 0) {

                if (req.body.password == req.body.confirmationPassword) {
                    delete req.body.confirmationPassword;
                    console.log("check data before crate :", req.body);

                    req.body.password = bcrypt.hashSync(req.body.password, salt)
                    console.log("check data after hash password : ", req.body);

                    let regis = await model.users.create(req.body);

                    let token = createToken({
                        id: regis.dataValues.id,
                        email: regis.dataValues.email
                    }, "1h");

                    // mengirimkan email verifikasi
                    transporter.use("compile", hbs({
                        viewEngine: {
                            extname: ".html",
                            layoutsDir: "./src/helper",
                            defaultLayout: "emailVerify.html",
                            partialsDir: "./src/helper"
                        },
                        viewPath: "./src/helper",
                        extName: ".html"
                    }));

                    await transporter.sendMail({
                        from: "Tracker Admin",
                        to: req.body.email,
                        subject: "Account Verification",
                        template: "emailVerify",
                        context: {
                            link: `http://localhost:3000/verification/${token}`
                        }
                    })

                    return res.status(201).send({
                        success: true,
                        data: regis
                    })

                } else {
                    return res.status(400).send({
                        success: false,
                        message: "Password not match"
                    })
                }

            } else {
                return res.status(400).send({
                    success: false,
                    message: "Email or Username exist"
                })
            }

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    login: async (req, res, next) => {
        try {
            console.log("dari req.body", req.body);

            let get = await model.users.findAll({
                where: sequelize.or(
                    { email: req.body.email }),
                include: [{ model: model.status, attributes: ["status"] }]
            });
            if (get.length > 0) {
                // jika berhasil login
                let check = bcrypt.compareSync(req.body.password, get[0].dataValues.password);

                if (check && get[0].dataValues.statusId != 3) {
                    await model.users.update({ attempt: 0 }, {
                        where: {
                            id: get[0].dataValues.id
                        }
                    })

                    console.log("check result get :", get[0].dataValues);
                    get[0].dataValues.status = get[0].dataValues.status.status;

                    let { id, username, email, role, status } = get[0].dataValues;
                    let token = createToken({ id, role, status });

                    return res.status(200).send({ username, email, token, status })
                } else {
                    // jika tidak berhasil login :
                    // dikasi coba sampe 3x

                    if (get[0].dataValues.statusId == 3) {
                        return res.status(400).send({
                            success: false,
                            message: "your account is suspended, pls forget password"
                        })
                    } else {

                        if (get[0].dataValues.attempt < 3) {
                            await model.users.update({ attempt: get[0].dataValues.attempt + 1 }, {
                                where: {
                                    id: get[0].dataValues.id
                                }
                            });
                            return res.status(400).send({
                                success: false,
                                message: `wrong password ${get[0].dataValues.attempt + 1}`
                            })
                        } else {
                            // jika 3x login gagal, account nya suspend
                            await model.users.update({ statusId: 3 }, {
                                where: {
                                    id: get[0].dataValues.id
                                }
                            });
                            return res.status(400).send({
                                success: false,
                                message: `your account suspended`
                            })
                        }

                    }

                }

            } else {
                res.status(404).send({
                    success: false,
                    message: `Account not Found`
                })
            }

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    verify: async (req, res, next) => {
        console.log("data dari read token", req.decript);
        try {
            await model.users.update({ statusId: 2 }, {
                where: {
                    id: req.decript.id
                }
            })

            res.status(200).send({
                success: true,
                message: "Your Account has been Verified"
            })

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    keepLogin: async (req, res, next) => {
        try {
            console.log("Decript token: ", req.decript);

            let get = await model.users.findAll({
                where: {
                    id: req.decript.id
                },
                include: [{ model: model.status, attributes: ["status"] }]
            });
            get[0].dataValues.status = get[0].dataValues.status.status;

            let { id, username, email, role, status } = get[0].dataValues;
            let token = createToken({ id, role, status });

            return res.status(200).send({ username, email, role, status, token })

        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    forgetPassword: async (req, res, next) => {
        try {
            console.log("ini dari request body :", req.body);
            let getData = await model.users.findAll({
                where: {
                    email: req.body.email
                }
            })

            if (getData.length > 0) {

                let token = createToken({
                    id: getData[0].dataValues.id,
                    email: getData[0].dataValues.email
                }, "24h");

                // kirim link reset password ke email

                transporter.use("compile", hbs({
                    viewEngine: {
                        extname: ".html",
                        layoutsDir: "./src/helper",
                        defaultLayout: "emailResetPass.html",
                        partialsDir: "./src/helper"
                    },
                    viewPath: "./src/helper",
                    extName: ".html"
                }));

                await transporter.sendMail({
                    from: "Tracker Admin",
                    to: req.body.email,
                    subject: "reset password",
                    template: "emailResetPass",
                    context: {
                        link: `http://localhost:3000/resetpassword/${token}`
                    }
                })

                res.status(201).send({
                    success: true,
                    data: getData
                })

            } else {
                return res.status(404).send({
                    success: false,
                    message: "email does not exist"
                })
            }


        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    resetPassword: async (req, res, next) => {
        console.log("data dari read token reset password", req.decript);
        try {
            req.body.password = bcrypt.hashSync(req.body.password, salt)
            await model.users.update({
                password: req.body.password, statusId: 2
            },
                {
                    where: {
                        id: req.decript.id
                    }
                })

            res.status(200).send({
                success: true,
                message: "your password successfully reset"
            })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    whoToFollow: async (req, res, next) => {
        try {
            let getData = await model.users.findAll({
                order: sequelize.literal('rand()'), limit: 4
            });

            res.status(200).send(getData)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },

    getAllDetailUser: async (req, res, next) => {
        try {
            getData = await model.users.findAll({
                where: {
                    username: req.params.username
                }
            });
            res.status(200).send(getData[0]);
        } catch (error) {
            next(error)
        }
    },

    getDetailUser: async (req, res, next) => {
        try {
            getUser = await model.users.findAll({
                where: {
                    username: req.body.username
                }
            });
            res.status(200).send(getUser[0])
        } catch (error) {
            next(error)
        }
    }
}