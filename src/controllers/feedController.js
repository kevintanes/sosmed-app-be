const model = require("../models");
const sequelize = require("sequelize");


module.exports = {
    tweet: async (req, res, next) => {
        console.log("ini dari request decrypt", req.decript);
        try {
            await model.feeds.create({
                userId: req.decript.id,
                feed: req.body.feed
            })

            return res.status(200).send({
                success: true,
                message: "postingan berhasil ditambahkan"
            })

        } catch (error) {
            next(error);
        }
    },

    getAllTweet: async (req, res, next) => {
        try {
            let cekFeed = await model.feeds.findAll({
                order: [
                    ["id", "DESC"]
                ],
                include: [{ model: model.users, attributes: ["username"] }]
            })

            return res.status(200).send(cekFeed);
        } catch (error) {
            next(error)
        }
    },

    getOtherUserTweet: async (req, res, next) => {
        try {
            console.log(`ini dari req.params.username`, req.params.username);
            let feed = await model.users.findAll({
                where: {
                    username: req.params.username
                },
                include: [{ model: model.feeds, attributes: ["feed", "createdAt"] }]
            })
            console.log("ini get dari feed", feed);

            return res.status(200).send(feed)

        } catch (error) {
            next(error)
        }
    },

    getMyTweet: async (req, res, next) => {
        console.log(`ini request body myprofile:`, req.body);
        try {
            let cekFeed = await model.users.findAll({
                where: {
                    username: req.body.username
                },
                include: [{ model: model.feeds, attributes: ["feed", "createdAt"] }]
            })

            return res.status(200).send(cekFeed)
        } catch (error) {
            next(error)
        }
    }
}