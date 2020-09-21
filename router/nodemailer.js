const express = require("express");
const router = express.Router();

router.post("/sendmail", (req, res) => {

    const nodemailer = require("nodemailer");


    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: '587',
        auth: {
            client: "projetsidibe1@gmail.com",
            pass: "Projetsidibe@",
        },
        secureConnection: 'false',
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        }
    });

    var mailOptions = {
        from: "projetsidibe1@gmail.com",
        to: req.body.email,
        subject: req.body.obj,
        text: req.body.text
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.json(error);
            console.log(error);
        } else {
            console.log("email sent" + info.response);
            res.json("email sent" + info.response);

        }
    })
});

module.exports = router