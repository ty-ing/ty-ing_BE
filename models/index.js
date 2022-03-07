const mongoose = require('mongoose');

const connect = () => {
    mongoose.connect('mongodb://admin:VaJhBS5xmgLLch2y@localhost:27107/server',
    //mongoose.connect('mongodb://localhost:27017/Real-project',
     {
    }).catch(err => console.log(err));
};

mongoose.connection.on('error', err => {
    console.log('몽고디비 연결 에러!', err);
});

module.exports = connect;