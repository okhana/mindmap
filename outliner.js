MM.outliner = (function(){

    'use strict';
    
    var that = {};

    // jstree instance
    var tree;

    // becomes true if changes were made from on graph
    // (and changes in the tree should node execute event callbacks)
    var suppressEvent = false;

    /**
     * initializes outliner
     * @param {Array} [treeData] - nodes to build the tree from (if omitted - empty tree is created)
     */
    that.init = function(treeData) {
        $(function () {
            $.jstree.defaults.core.themes.icons = false;
            $('#outliner')
                .on('rename_node.jstree', function(e, data) {
                    MM.outliner.renameNode(getProperNodeId(data.node), data.text);
                })
                .on('move_node.jstree copy_node.jstree', function(e, data) {
                    if (suppressEvent) {
                        suppressEvent = false;
                        return;
                    }
                    // TODO if moved/copied to root
                    console.log(e);
                    switch (e.type) {
                        case "copy_node":
                            console.log("copy_node");
                            console.log(data);
                            nodeCopied(data);
                            break;
                        case "move_node":
                            console.log("move_node");
                            console.log(data);
                            nodeMoved(data);
                            break;
                    }
                    // copy to all of the new parent's duplicates (except the one moved/copied to)
                    MM.outliner.findNodesById(getProperNodeId(data.parent))
                        .filter(function(p) {
                            return p.id != data.parent
                        })
                        .forEach(function(pd) {
                            suppressEvent = true;
                            tree.copy_node(data.node, pd, data.position);
                        });
                })
                .jstree({
                    'core': {
                        'data': treeData,
                        'check_callback' : checkCallback
                    },
                    "plugins" : ["dnd"]
                });
            tree = $("#outliner").jstree(true);
        });

        // to take the SVG input out of editing mode
        $('#outliner').delegate("li[role='treeitem'] > a.jstree-anchor", "mousedown", MM.graph.deactivateTextFields);

    };

    function checkCallback(operation, node, node_parent, node_position, more) {
        // operation can be 'create_node', 'rename_node', 'delete_node', 'move_node' or 'copy_node'
        // in case of 'rename_node' node_position is filled with the new node name
        if (operation === "move_node" || operation === "copy_node") {

            // if truthy, means the changes were made from graph. Hence, allow all
            if (suppressEvent) return true;

            // disallow dragging to one of own duplicates
            var newParentId = getProperNodeId(node_parent);
            if (getProperNodeId(node) === newParentId) {
                console.log("dragging to self");
                return false;
            }

            // disallow dragging to one of parent's duplicates
            var nodeParentsIds = getGraphNode(node).parents.map(function(parent) {
                return parent.id;
            });
            if (nodeParentsIds.indexOf(newParentId) != -1) {
                console.log("dragging to already parent");
                return false;
            }

            // hightlight the target node
            $("#outliner")
                .find("li.jstree-node[id='" + node_parent.id + "']")
                .children("a.jstree-anchor")
                .addClass("dragged-to");
        }
        return true;
    }

    function nodeMoved(data) {
        var graphOldParent = getGraphNode(data.old_parent);
        var graphParent = getGraphNode(data.parent);
        var graphChild = getGraphNode(data.node);
        MM.graph.unlinkNodes(graphOldParent, graphChild);
        MM.graph.linkNodes(graphParent, graphChild);
        tree.open_node(tree.get_node(data.parent));

        // remove duplicate of the node from all of the old parent's duplicates
        var nodeDuplicates = MM.outliner.findNodesById(graphChild.id).filter(function(d) {
            return getProperNodeId(d.parent) === getProperNodeId(data.old_parent);
        });
        tree.delete_node(nodeDuplicates);

        MM.restart();
    }

    function nodeCopied(data) {
        // assign proper node-id attribute
        data.node.li_attr["node-id"] = getProperNodeId(data.original);
        // create link with new parent
        var graphParent = getGraphNode(data.parent);
        var graphChild = getGraphNode(data.node);
        MM.graph.linkNodes(graphParent, graphChild);
        tree.open_node(tree.get_node(data.parent));
        MM.restart();
        // TODO if copying from root - remove old instance
    }

    // constructs the tree from the deserialized graph data
    that.build = function(nodes) {
        // if no parents - the node is root
        var rootNodes = nodes.filter(function (node) {
            return node.parents.length === 0;
        });
        if (rootNodes.length === 0) {
            rootNodes = [nodes[0]];
        }

        var treeData = rootNodes.map(function(node) {
            return format(node, [])
        });

        function format(node, nodesInBranch) {
            var treeNode = {
                text: node.text,
                state: { opened: true },
                li_attr: { 'node-id': node.id}
            };
            // continue recursion only if node is not yet present in this branch (to prevent infinite recursion)
            if (nodesInBranch.indexOf(node.id) === -1) {
                nodesInBranch.push(node.id);
                treeNode.children = node.children.map(function(node) {
                    return format(node, nodesInBranch);
                });
            }
            return treeNode;
        }

        MM.outliner.init(treeData);
    };

    // creates new node in the tree
    that.newNode = function(node) {
        var treeNode = formatNodeData(node);
        tree.create_node(treeNode.parent, treeNode, "last", function nodeCreated() {
            // open parent node
            tree.open_node(treeNode.parent);
        });
    };

    // puts node into edit mode
    that.editNode = function(node) {
        tree.edit(node);
    };

    // change node text (when renamed via either outliner or graph)
    that.renameNode = function(nodeId, text) {
        if (MM.graph.textBeingEdited) {
            // renamed via graph
            tree.set_text(MM.outliner.findNodesById(nodeId), text);
        } else {
            // renamed via outliner
            MM.graph.findNodeById(nodeId).text = text;
            MM.node.updateTextField(MM.graph.findNodeGById(nodeId));
            // TODO rename duplicates
        }
    };

    that.removeNode = function(node) {
        node.children.forEach(function(child) {
            if (child.parents.length === 0) {
                suppressEvent = true;
                // if no more parents, then there will be only one node in the tree
                tree.move_node(MM.outliner.findNodesById(child.id)[0], "#", "last")
            }
        });
        tree.delete_node(MM.outliner.findNodesById(node.id));
    };

    // reflects linking two graph nodes
    that.moveNodeUnderParent = function(node, parent) {
        suppressEvent = true;
        var treeNode = MM.outliner.findNodesById(node.id)[0];
        // if parent is duplicated - need to append to all of the duplicates
        var treeParents = MM.outliner.findNodesById(parent.id);

        // copy/move to the first of the parents
        if (tree.get_parent(treeNode) === "#") {
            // if node is root - move it
            tree.move_node(treeNode, treeParents[0], "last");
        } else {
            // if node already has parent - copy it
            // and set real node id into 'node-id' html attribute
            tree.copy_node(treeNode, treeParents[0], "last", function(node, par, pos) {
                node.li_attr['node-id'] = treeNode.li_attr["node-id"];
            });
        }
        tree.open_node(treeParents[0]);

        // copy to all the other duplicates of the parent, if any
        // note that we omit the first parent here, because we dealt with it above
        if (treeParents.length > 1) {
            for (var i = 1; i < treeParents.length; i++) {
                suppressEvent = true;
                var treeParent = treeParents[i];
                tree.copy_node(treeNode, treeParent, "last", function(node, par, pos) {
                    node.li_attr['node-id'] = treeNode.li_attr['node-id'];
                });
                tree.open_node(treeParent);
            }
        }
    };

    // returns an array of all the nodes, which represent the node with given id
    that.findNodesById = function(nodeId) {
        return $.map(tree._model.data, function(value) {
            return [value];
        }).filter(function(e){return e.li_attr && e.li_attr['node-id'] === nodeId})
    };

    that.selectNode = function(nodeId) {
        tree.select_node(MM.outliner.findNodesById(nodeId), false, true);
    };

    that.deselectAllNodes = function() {
        tree.deselect_all();
    };

    /**
     * returns proper node id (stored in html attribute 'node-id')
     * @param {Object|String|Number} treeNode - jstree node object, or its id (string or number)
     * @returns {Number} id - node id, which corresponds to its id in graph
     */
    function getProperNodeId(treeNode) {
        var treeObject;
        if (typeof treeNode === "object") {
            treeObject = treeNode;
        } else if (typeof treeNode === "string" || typeof treeNode === "number") {
            treeObject = tree.get_node(treeNode)
        }
        return treeObject.li_attr && +treeObject.li_attr["node-id"];
    }

    // receives tree node or its id (string or number)
    // returns data object for graph node
    function getGraphNode(treeNode) {
        var id = getProperNodeId(treeNode);
        return MM.graph.findNodeById(id);
    }

    function formatNodeData(nodeData) {
        var parent = nodeData.parents.length > 0 ? tree.get_node(nodeData.parents[0].id) : "#";
        return {
            id          : nodeData.id, // will be autogenerated if omitted
            parent      : parent,
            text        : nodeData.text, // node text
//            icon        : "string", // string for custom
//            state       : {
//                opened    : boolean,  // is the node open
//                disabled  : boolean,  // is the node disabled
//                selected  : boolean,  // is the node selected
//            },
//            children    : []  // array of strings or objects
            li_attr     : { 'node-id': nodeData.id}  // attributes for the generated LI node
//            a_attr      : {},  // attributes for the generated A node
        }
    }
    
    return that;
    
}());