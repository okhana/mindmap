define([
    'jquery',
    'underscore',
    'backbone',
    'models/project/ProjectModel',
    'collections/projects/ProjectsCollection',
    'text!templates/projects/ProjectTemplate.html'
], function($, _, Backbone,ProjectModel,ProjectCollection, ProjectTemplate){

    var ProjectDetailsView = Backbone.View.extend({
        el: "#contents",
        events: {

            'click .delete' : 'deleteProject',
            'click .share' : 'share'
        },
        render: function(){

            var self = this;
            var projectCollection = new ProjectCollection();
            projectCollection.fetch({
                success: function(projects){
                    var compiledTemplate = _.template( ProjectTemplate,{projects: projects.models,_:_} );
                    $(self.el).html( compiledTemplate );
                }
            });
        },
        deleteProject : function(event){
            // to prevent browsers default submission of the form
            event.preventDefault();
            event.stopImmediatePropagation();

            if(confirm("Are you sure you want to delete this project.")) {
                var self = this;
                var projectId = $(event.currentTarget).data('id');
                var projectModel = new ProjectModel({_id: projectId});
                projectModel.destroy({
                    success: function (res) {
                        console.log(res);
                        self.trigger(self.render());
                    }
                });
            }

        },
        share: function(event){
            var projectId = $(event.currentTarget).data('id');
        }
    });

    return ProjectDetailsView;
});
