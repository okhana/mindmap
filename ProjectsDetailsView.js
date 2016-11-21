define([
    'jquery',
    'underscore',
    'backbone',
    'models/project/ProjectModel',
    'collections/projects/ProjectsCollection',
    'text!templates/projects/ProjectDetailsTemplate.html'
], function($, _, Backbone,ProjectModel,ProjectCollection, ProjectDetailsTemplate){

    var ProjectView = Backbone.View.extend({
        el: "#contents",
        events: {
            'click #saveProject' : 'save'
        },
        render: function(){

            var self = this;

            if(self.model.has('_id')) {
                this.model.fetch({success: function (project) {
                    var compiledTemplate = _.template(ProjectDetailsTemplate, {project: project, _: _});
                    $(self.el).html( compiledTemplate );
                }});
            }
            else{
                var compiledTemplate = _.template(ProjectDetailsTemplate, {project: self.model, _: _});
                $(self.el).html( compiledTemplate );
            }

        },
        save : function(event){

            // to prevent browsers default submission of the form
            event.preventDefault();
            event.stopImmediatePropagation();

            var projectModel = new ProjectModel();

            var id = $(event.currentTarget).data('id');
            if(id !== undefined && id != '')
                projectModel.set({_id:id});

            var details = {name:$('#name').val(),description:$('#description').val()};
            projectModel.save(details, {
                success: function (project) {
                    $('#saved').append('Project saved successfully...').removeClass('hide');
                }
            });
        }
    });

    return ProjectView;
});
