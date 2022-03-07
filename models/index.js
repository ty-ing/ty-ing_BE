const mongoose = require('mongoose');

const connect = () => {
    mongoose.connect('mongodb://dbadmin:z!+Qz8K?#9;rSwHK@localhost:27017/Real-project', {
        useNEWURLParser: true,
        ignoreUndefined: true
    }).catch(err => console.log(err));
};

mongoose.connection.on('error', err => {
    console.log('몽고디비 연결 에러!', err);
});

module.exports = connect;