/**
 * List and manipulate projects
 */

var Project = require('../models/project');

exports.newProject = function (req, res) {
    res.render('graph', { projectId: null });
};

exports.list = function(req,res){

    Project
        .find({ owner: req.user._id})
        .exec(function(err,projects){
            if(err){
                res.send({status:'false',msg:'Problem in processing your request, please try again.'})
            }
            else{
                res.json(projects);
            }
    });
};

// TODO check if user has right to view the proj
exports.findById = function(req,res){
    var projId = req.params.id;
    res.format({
        'text/html': function() {
            res.render('graph', { projectId:  projId});
        },
        'application/json': function() {
            // request for graph data
            Project.findOne({ _id: projId }, 'data', function (err, project){
                if (err) {
                    res.send({status:'false',msg:'Problem in processing your request, please try again.'})
                }
                else {
                    res.json(project);
                }
            });
        }
    });
};

exports.save = function(req,res){

    if (req.body.id) {
        // update
        Project.update(
            { _id: req.body.id },
            { name: req.body.name, data: req.body.data },
            function (err) {
                if (err) {
                    res.send({status:'false',msg:'Problem in processing your request, please try again.'})
                } else {
                    res.json({status:'true', msg:'Project updated'});
                }
            }
        )
    } else {
        // save
        var project = new Project();
        project.name = req.body.name;
        project.data = req.body.data;
        project.owner = req.user._id;

        project.save(function(err, project){
            if (err) {
                res.send({status:'false',msg:'Problem in processing your request, please try again.'})
            }
            else {
                res.json({status:'true', msg:'Project saved', id: project._id});
            }
        });
    }



};

exports.update = function(req,res){

    var projectId = req.params.id;
    var body = req.body;
    Project.update({_id:projectId},{$set:{name: body.name, description: body.description}},{upsert:true},function(err, project){

        console.log(project);
        res.json(project);
    });
};

exports.deleteById = function(req,res){

    var params = req.params;
    console.log(params);
    Project.remove({_id:params.id},function(err,project){
        if(err){
            res.send({status:'false',msg:'Problem in processing your request, please try again.'})
        }
        else{
            res.json(project);
        }
    });
};