define([
    'underscore',
    'backbone'
], function(_, Backbone) {

    var ProjectModel = Backbone.Model.extend({
        urlRoot : '/projects',
        idAttribute: '_id',
        defaults : {
            name : '',
            description : ''
        },
        initialize: function(){
            // listens the change event on model
            this.on("change", function(model){
            });
        }
    });

    return ProjectModel;

});
