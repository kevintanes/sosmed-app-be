// libraly yang pasti di install
// express, cors, dotenv

const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 2000;
const express = require("express");
const app = express();
const cors = require("cors");
const bearerToken = require("express-bearer-token")

app.use(cors());
app.use(express.json());
app.use(bearerToken());
app.use(express.static("src/public")); 

app.get("/", (req, res) => {
    res.status(200).send("<h1>WELCOME TO API</h1>")
});

// ROUTING
const userRouter = require("./src/routers/userRouter");
const feedRouter = require("./src/routers/feedRouter");

app.use("/user", userRouter);
app.use("/feed", feedRouter);

// ERROR-HANDLING
app.use((err, req, res, next) => {
    if(err){
        return res.status(500).send(err)
    }
})

app.listen(PORT, () => console.log(`Running API ${PORT}`));