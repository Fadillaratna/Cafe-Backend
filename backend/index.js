//import
const express = require('express');
const cors = require('cors');

//implementasi
const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(express.static(__dirname))

const api = require("./bin/app/api")
api.routes(app)

app.get("/", (req, res) => {
    return res.status(200).json({
      message: "Hello world!",
      data: null
    });
  });


app.use(express.static(__dirname))

//run server
app.listen(7000, () => {
    console.log('server run on port 7000')
})