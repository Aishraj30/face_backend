const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors')
const path = require('path')
const express = require('express');
const connectDB = require('./src/db/db');
const userroutes = require('./src/routes/user.router')


const app = express();
connectDB();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "http://localhost:5174",
    "https://facerecognisation.vercel.app/",
  
    
  ],
  credentials: true,
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 


app.get('/' , (req,res)=>{
    res.send('<h1>hellllo</h1>'

    )

})


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/api/user' , userroutes )

const PORT = process.env.PORT 

app.listen( 3000 , ()=>{
    console.log(`server is runnning on port on http://localhost:3000 `)
})
