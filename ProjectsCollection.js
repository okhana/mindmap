define([
    'jquery',
    'underscore',
    'backbone',
    'models/project/ProjectModel'
], function($, _, Backbone, ProjectModel){
    var ProjectCollection = Backbone.Collection.extend({
        model: ProjectModel,
        url : '/projects'
    });

    return ProjectCollection;
});
