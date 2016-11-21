/**
 *
 * Define routes of MindMap client side application in backbone.js
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'models/project/ProjectModel',
    'views/projects/ProjectsView',
    'views/projects/ProjectsDetailsView'
], function($,_,Backbone,ProjectModel,ProjectsView,ProjectsDetailsView) {

    var AppRouter = Backbone.Router.extend({
        routes: {

            '':'projects',
            'projects':'projects',
            'project/add':'projectDetails',
            'project/edit/:id':'projectDetails'
        }
    });

    var initialize = function(){

        window.app_router = new AppRouter;

        app_router.on('route:projects', function() {
            var projectView = new ProjectsView();
            projectView.render();
        });

        app_router.on('route:projectDetails', function(id) {

            var projectModel = new ProjectModel();
            if(id)
                 projectModel.set({_id:id});

            var projectDetailView = new ProjectsDetailsView({model:projectModel});
            projectDetailView.render();
        });

        Backbone.history.start();
    };
    return {
        initialize: initialize
    };
});
