const jwt = require("jsonwebtoken");

module.exports = {
    createToken: (payload, exp = "24h") => jwt.sign(payload, "tokensosmed", {
        expiresIn: exp
    }),

    readToken: (req, res, next) => {
        jwt.verify(req.token, "tokensosmed", (error, decript) => {
            if (error) {
                return res.status(401).send({
                    success: false,
                    message: "Authentication Failed"
                })
            }

            req.decript = decript;
            next()
        })
    }
}