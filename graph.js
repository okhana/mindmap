// general state and behavior
MM.graph = (function() {

    "use strict";
    
    var that = {};

    that.nodes = [];
    that.links = [];

    // mouse event vars
    that.selected_node = null;
    that.selected_link = null;
    that.mousedown_link = null;
    that.mousedown_node = null;
    that.mouseup_node = null;

    that.lastNodeId = 0;

    // is truthy when the textfield is active
    // takes the value of the text being edited during typing
    that.textBeingEdited = null;

    that.lastClickedNode = null;

    // function for zooming
    that.zoom = null;

    // is truthy after the vis is dragged
    that.panned = false;

    // is truthy when the node resizing handle is being dragged
    that.nodeBeingResized = null;

    that.textSubmitted = function() {
        // update the text for node
        MM.graph.updateLastNodeText(MM.graph.textBeingEdited);

        // remove marker from textfield (make it inactive)
        $172(window).trigger(jQuery.Event("mousedown"));

        // the next 'change' event on nodeInput will set the text to null
        MM.graph.textBeingEdited = -1;

//        restart();
    };

    that.selectNode = function(node) {
        MM.graph.selected_node = node;
        MM.outliner.deselectAllNodes();
        MM.outliner.selectNode(node.id);
    };

    that.deselectNodes = function() {
        MM.graph.selected_node = null;
        MM.outliner.deselectAllNodes();
    };

    that.updateLastNodeText = function(newText) {
        MM.graph.lastClickedNode.text = newText;
        MM.outliner.renameNode(MM.graph.lastClickedNode.id, MM.graph.lastClickedNode.text);
    };

    /**
     * finds node data object by id
     * @param {String|Number} id - the id of the node to find
     * @param {Array} [nodes] - array of nodes to look in (defaults to all nodes of the graph)
     * @returns {Object} - node with the specified id, if found
     */
    that.findNodeById = function(id, nodes) {
        return (nodes || MM.graph.nodes).filter(function(node) {
            return node.id == id; // type coercion(==) is needed
        })[0];
    };

    // returns d3 selection of <g.node>
    that.findNodeGById = function(id) {
        return d3.select("g.node[node-id='" + id + "']");
    };

    that.disableZooming = function() {
        d3.select("svg").select("g.zoom").call(d3.behavior.zoom().on("zoom", null));
    };

    that.enableZooming = function() {
        d3.select("svg").select("g.zoom").call(MM.graph.zoom);
    };

    // populates nodes[] and links[] arrays with fetched data and redraws
    that.buildGraph = function(data) {
        data.nodes.forEach(function(node) {
            MM.graph.nodes.push(node);
        });
        data.links.forEach(function(link) {
            MM.graph.links.push(link);
        });
        MM.graph.lastNodeId = d3.max(MM.graph.nodes, function(node) { return node.id; });
        MM.restart();
    };

    /**
     * adds new node to the graph
     * @param {(String|Number)} id - unique identifier to assign to node
     * @param parent - node to link newly created node to (if null - floating node will be created)
     * @param {Number[]} coords - positioning of new node
     */
    that.newNode = function(id, parent, coords) {
        // update text of last edited node
        if (MM.graph.lastClickedNode) {
            MM.node.updateTextField(MM.graph.findNodeGById(MM.graph.lastClickedNode.id));
        }

        var node = MM.node.create({
            id: id,
            x: coords[0],
            y: coords[1]
        });

        // add new node to nodes array
        MM.graph.nodes.push(node);
        MM.graph.lastClickedNode = node;
        // if has parent, add new node to parent's children
        if (parent) {
            MM.graph.linkNodes(parent, node);
        }
        MM.outliner.newNode(node);
        MM.graph.selectNode(node);
    };

    /**
     * deletes the node from the graph, along with its relationships
     * @param {Object} node - node to be removed
     */
    that.removeNode = function(node) {
        // from array of nodes
        MM.graph.nodes.splice(MM.graph.nodes.indexOf(node), 1);

        // remove links of this node
        MM.graph.links.filter(function(l) {
            return (l.source === node || l.target === node);
        }).map(function(l) {
            MM.graph.links.splice(MM.graph.links.indexOf(l), 1);
        });

        // remove node from parents[] array of its children
        node.children.forEach(function(child) {
            child.parents.splice(child.parents.indexOf(node), 1);
        });

        MM.graph.deselectNodes();
        MM.graph.lastClickedNode = null;

        MM.outliner.removeNode(node);
    };

    /**
     * creates new relationship between source and target
     * @param {Object} source - node object to become parent for target
     * @param {Object} target - node object to become child for source
     * @returns {Object} link - object of new relationship
     */
    that.linkNodes = function (source, target) {
        if (source.children.indexOf(target) != -1 || source === target) {
            return false;
        } else {
            var link = {
                source: source,
                target: target
            };
            MM.graph.links.push(link);
            source.children.push(target);
            target.parents.push(source);
            return link;
        }
    };

    /**
     * removes the relationship source -> target
     * @param {Object} source
     * @param {Object} target
     * @returns {boolean} - true if the relationship was found and removed, and false if not found
     */
    that.unlinkNodes = function(source, target) {
        var linkToRemove = MM.graph.links.filter(function(link) {
            return link.source === source && link.target == target;
        })[0];

        if (linkToRemove) {
            // remove the child from parent's children[]
            source.children.splice(source.children.indexOf(target), 1);

            // remove the parent from child's parents[]
            target.parents.splice(target.parents.indexOf(source), 1);

            // remove link from array of links
            MM.graph.links.splice(MM.graph.links.indexOf(linkToRemove), 1);

            return true;
        } else {
            return false;
        }
    };

    that.deactivateTextFields = function() {
        $172(window).trigger($172.Event("mousedown."));
        MM.graph.textBeingEdited = null;
    };

    return that;

}());