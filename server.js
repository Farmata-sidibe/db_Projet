var Express = require("express");
var cors = require("cors");
var BodyParser = require("body-parser");

var hostname = "localhost";
var port = 3000;

var app = Express();

app.use(cors());
app.use(BodyParser.urlencoded({ extented: false }));
app.use(BodyParser.json());

app.use("/client", require("./router/client"));
app.use("/salon", require("./router/salon"));
app.use("/produit", require("./router/produit"));



app.use("/coiffeur", require("./router/coiffeur"));


app.use("/notersalon", require("./router/notersalon"));
app.use("/noterproduit", require("./router/noterproduit"));
app.use("/", require("./router/nodemailer"));











app.listen(port, hostname, function() {
    console.log(
        "mon server fonctionne sur http://" + hostname + ":" + port + "/n"
    );
});