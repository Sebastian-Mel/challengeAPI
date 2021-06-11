require('dotenv').config();
const express= require("express");
const port= process.env.PORT;
const usersRoutes=require('./src/routes/users');
const app= express();
app.listen(port);
app.use(usersRoutes);




