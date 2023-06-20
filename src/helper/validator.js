const { check, validationResult } = require("express-validator");

module.exports = {
    checkUser: async (req, res, next) => {
        try {
            console.log("ini request path :", req.path);

            if (req.path == "/registrasi") {
                await check("username").notEmpty().isAlphanumeric().run(req)
                await check("email").notEmpty().isAlphanumeric().run(req)
            } else if (req.path == "/auth"){
                await check("email").optional({nullable:true}).isEmail().run(req);
            } 

            await check("password").notEmpty().isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 0
            }).withMessage("your password to short or requirement are not meet").run(req);

            const validation = validationResult(req);
            console.log("validation result", validation);
            
            if(validation.isEmpty()){
                next();
            } else {
                return res.status(400).send({
                    success: false,
                    message: "validation invalid",
                    error: validation.errors
                })
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}