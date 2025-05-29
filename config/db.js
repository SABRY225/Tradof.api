const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://tradofTeam:Xk6OVUC2A5MywYG9@cluster-tradof.s71wq.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Youtube Clone connected .');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;