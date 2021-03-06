const mongoose = require('mongoose');

const connect = () => {
   mongoose.connect(process.env.MONGO_URL,
    // mongoose.connect(`${process.env.MONGO_LOCAL_URL}`,
    {
        dbName:`${process.env.DBNAME}`,
    }
     ).catch((err) => console.log(err));
};

mongoose.connection.on('error', err => {
    console.log('몽고디비 연결 에러!', err);
});

module.exports = connect;