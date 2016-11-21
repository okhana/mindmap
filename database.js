var mongoose = require('mongoose');


module.exports = function connect (connectionString) {
    mongoose.connect(connectionString);

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', function () {
        console.log('Mongoose connected at: ', connectionString)
    });
};


