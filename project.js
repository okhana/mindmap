var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var options = {
    autoIndex: process.env.NODE_ENV !== 'production'
};
var projectSchema = Schema({
    name : String,
    data : Object,
    owner: { type: Schema.Types.ObjectId, ref: 'User' }
}, options);

var ProjectModel = mongoose.model('Project', projectSchema);
module.exports = ProjectModel;