const mongoose = require('mongoose');

const connectDB = async () => {
    try {
       

        const res = await mongoose.connect("mongodb+srv://aishubamoriya_db_user:7410@cluster0.ia0w6os.mongodb.net/");

       if(res){ console.log("✅ MongoDB connected successfully");}
    } catch (error) {
        console.log("❌ Error connecting to MongoDB:", error.message);
        process.exit(1); // optional: stop app if DB fails
    }
};

module.exports = connectDB;
