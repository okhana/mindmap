$(document).ready(function() {
    MM.init();
});

var MM = (function() {

    'use strict';

    var that = {};

    var svgG,
        zoomG,
        visG,
        paths,
        nodes,
        dragLine,
        forceDrag;

//*** INITIALIZATION ***//

    that.init = function() {

        svgG = d3.select("#graph")
            .select("svg")
//                .attr("pointer-events", "all")
            .attr('version', "1.1")
            .attr('xmlns', "http://www.w3.org/2000/svg")
            .attr('xlink', "http://www.w3.org/1999/xlink")
            .attr('unselectable', "on")
            .attr('style', "-webkit-user-select: none;");

        // enable panning and zooming
        zoomG = svgG
            .append('svg:g')
            .attr("class", "zoom")
            .call(function() {
                MM.graph.zoom = d3.behavior.zoom().on("zoom", eventHandler.rescale);
                return MM.graph.zoom;
            }())
            .on("dblclick.zoom", null);

        visG = zoomG.append('svg:g')
            .attr("class", "vis");

        visG.append('svg:rect')
            .attr('width', 20000)
            .attr('height', 10000)
            .attr("class", "mouseevents")
            .on("dblclick.zoom", null);

        // init D3 force layout (size is set in handler.window.resize() on window load)
        MM.graph.force = d3.layout.force()
            .nodes(MM.graph.nodes)
            .links(MM.graph.links)
            .linkDistance(function(d) {
                return (d.source.size + d.target.size)/300 + 125;
            })
            .charge(function(d) {
                return -d.size / 10;
            })
            .on('tick', tick);

        forceDrag = MM.graph.force.drag().on("dragend", MM.node.dragged);

        var defs = visG.append('svg:defs');

        // define arrow markers for links
        defs.append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 6)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#000');

        // shadow filter
        var shadowFilter = defs.append('svg:filter')
            .attr('id', 'dropshadow')
            .attr('height', '140%');
        shadowFilter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 2)
            .attr("result", "blur");
        shadowFilter.append('feOffset')
            .attr('dx', 2)
            .attr('dy', 2)
            .attr('result', 'offsetBlur');
        var feMerge = shadowFilter.append('feMerge');
        feMerge.append('feMergeNode')
            .attr("in", "offsetBlur");
        feMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');


        // arrow displayed when creating new links
        dragLine = visG.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0');

        // handles to link and node element groups
        paths = visG.append('svg:g')
            .attr("class", "links-container")
            .selectAll('path');
        visG.append('svg:g').attr("class", "node-widget"); // to place it beneath nodes
        nodes = visG.append('svg:g')
            .attr("class", "nodes-container")
            .selectAll('g.node');

        eventHandler.bindEvents();

        // if it's not new project, the 'projectId' field is assigned in graph.ejs
        if (MM.graph.projectId) {
            // fetch project graph data
            $.ajax({
                url: '/projects/' + MM.graph.projectId,
                dataType: 'json',
                success: function(graph) {
//                MM.graph.projectId = graph._id;
                    var data = deserializeGraph(graph.data);
                    MM.graph.buildGraph(data);
                    MM.outliner.build(data.nodes);
                }
            });
        } else {
            MM.outliner.init();
        }

        MM.widget.init(visG);
    };



//*** EVENTS HANDLING ***//

    var eventHandler = (function() {

        var that = {};
        var handler = {};

        // only respond once per keydown
        var lastKeyDown = -1;

        handler.vis = {

            mousedown: function() {
                svgG.classed('active', true);
            },

            mousemove: function() {
                if (MM.graph.nodeBeingResized) {
                    MM.node.resize();
                } else if (MM.graph.mousedown_node) {
                    // update drag line
                    dragLine.attr('d', 'M' + MM.graph.mousedown_node.x + ',' + MM.graph.mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
                }
            },

            mouseup: function() {
                if (MM.graph.mousedown_node) {
                    // hide drag line
                    dragLine
                        .classed('hidden', true)
                        .style('marker-end', '');
                    MM.graph.enableZooming();
                }

                svgG.classed('active', false);

                if(!d3.event.ctrlKey && !MM.graph.mousedown_node && !MM.graph.panned && !MM.graph.nodeBeingResized) {
                    // insert new node at point
                    MM.graph.newNode(++MM.graph.lastNodeId, null, d3.mouse(this));
                    MM.restart();
                }

                // clear mouse event vars
                resetMouseVars();
                // recalculate node repulsion and links distance
                MM.graph.force.start();
            }

        };

        handler.window = {

            keydown: function() {
//        d3.event.preventDefault();

                if (lastKeyDown !== -1) return;
                lastKeyDown = d3.event.keyCode;

                // ctrl
                if (d3.event.keyCode === 17) {
                    nodes.call(forceDrag);
                    svgG.classed('ctrl', true);
                }

                if(!MM.graph.selected_node && !MM.graph.selected_link) return;
                switch(d3.event.keyCode) {
//            case 8: // backspace
                    case 46: // delete
                        if (MM.graph.selected_node && !MM.graph.textBeingEdited && MM.graph.textBeingEdited != "") {
                            MM.graph.removeNode(MM.graph.selected_node);
                        } //else if(MM.graph.selected_link) {
                        //  MM.graph.links.splice(MM.graph.links.indexOf(MM.graph.selected_link), 1);
                        //}
                        // MM.graph.selected_link = null;
                        MM.restart();
                        break;
                    case 9: // TAB
                        // add new sibling for selected node
                        d3.event.preventDefault();
                        if (MM.graph.selected_node && !MM.graph.textBeingEdited) {
                            var selected = MM.graph.selected_node;
                            if (selected.parents.length === 0) return;
                            MM.graph.newNode(++MM.graph.lastNodeId, selected.parents[0], [selected.x + 5, selected.y]);
                            MM.restart();
                        }
                        break;
                    case 13: // Enter
                        if (!MM.graph.textBeingEdited) {
                            // add new child to selected node
                            var parent = MM.graph.selected_node;
                            if (!parent) return;
                            MM.graph.newNode(++MM.graph.lastNodeId, parent, [parent.x + 5, parent.y]);
                            MM.restart();
                        }
                        break;

                }
            },

            keyup: function() {
                lastKeyDown = -1;

                // ctrl
                if(d3.event.keyCode === 17) {
                    nodes
                        .on('mousedown.drag', null)
                        .on('touchstart.drag', null);
                    svgG.classed('ctrl', false);
                }
            },

            // when clicked anywhere outside text
            mousedown: function() {
                MM.graph.textBeingEdited = null
            },

            // this is jQuery callback
            resize: function() {
                var width = $(window).width()-5,
                    height = $(window).height()-5 - 30;
                svgG.attr("width", width).attr("height", height);
                MM.graph.force.size([width, height]).start();
            }
        };

        handler.postGraphData = function() {
            var data = {
                id: MM.graph.projectId,
                name: MM.graph.findNodeById(1).text,
                data: serializeGraph()
            };
            $.ajax({
                type: "POST",
                url: '/projects',
                data: data,
                success: function(data) {
                    console.log(data);
                    data.id && (MM.graph.projectId = data.id);
                    // TODO notify user
                },
                error: function(req, msg, err) {
                    console.log(err);
                },
                dataType: 'json'
            });
        };

        that.link = {
            mousedown: function(d) {
                if (d3.event.ctrlKey) return;

                // select link
                MM.graph.selected_link = (d === MM.graph.selected_link) ? null : d;

                MM.graph.mousedown_link = d;
                MM.graph.selected_node = null;
                MM.restart();
            }
        };

        that.rescale = function() {
            if (MM.graph.mousedown_node || MM.graph.nodeBeingResized) {return;}

            var trans = d3.event.translate;
            var scale = d3.event.scale;

            // zoom out: wheelDelta < 0, zoom in: wheelDelta > 0
            if ((scale < 0.1 && d3.event.sourceEvent.wheelDelta < 0) || (scale > 10 && d3.event.sourceEvent.wheelDelta > 0)) {
                MM.graph.disableZooming();
                setTimeout(MM.graph.enableZooming, 500);
                return;
            }

            visG.attr("transform",
                    "translate(" + trans + ")"
                    + " scale(" + scale + ")");
            visG.select("rect.mouseevents")
                .attr("x", -trans[0]/scale)
                .attr("y", -trans[1]/scale);

            MM.graph.panned = true;
        };

        that.bindEvents = function() {

            d3.select("div#graph").select("g.vis")
                .on("mousedown", handler.vis.mousedown)
                .on("mousemove", handler.vis.mousemove)
                .on("mouseup",   handler.vis.mouseup);

            $("#controls").find(".save-project").click(handler.postGraphData);

            d3.select(window)
                .on('keydown',   handler.window.keydown)
                .on('keyup',     handler.window.keyup)
                .on('mousedown', handler.window.mousedown);

            $(window).on("load resize", handler.window.resize);
        };

        return that;

    }());

    function resetMouseVars() {
        MM.graph.mousedown_node = null;
        MM.graph.mouseup_node = null;
        MM.graph.mousedown_link = null;
        MM.graph.panned = false;

        MM.graph.nodeBeingResized = null;
        if (MM.graph.force.alpha() === 0) { MM.graph.force.resume();}
    }

    var nodeGeo = {
        linkCoords: function(d) {
            var s = d.source,
                t = d.target,
                start,
                end;

            var line = {
                a1: new Point2D(s.x, s.y),
                a2: new Point2D(t.x, t.y)
            };

            var sourceIntersection = nodeGeo.intersectionCoords(line, d.source);
            var targetIntersection = nodeGeo.intersectionCoords(line, d.target);
            if (sourceIntersection.status === "Intersection") {
                start = sourceIntersection.points[0];
            } else {
                start = nodeGeo.endCoords(d.source);
            }
            if (targetIntersection.status === "Intersection") {
                end = targetIntersection.points[0];
            } else {
                end = nodeGeo.endCoords(d.target);
            }

            return {
                x1: start.x, y1: start.y,
                x2: end.x, y2: end.y
            }
        },
        intersectionCoords: function(line, node, shape) {
            switch(shape || node.settings.shape) {
                case 'rounded':
                case 'straight':
                    var r1 = new Point2D(node.x - node.width/2, node.y - node.height/2);
                    var r2 = new Point2D(node.x + node.width/2, node.y + node.height/2);
                    return Intersection.intersectLineRectangle(line.a1, line.a2, r1, r2);
                    break;
                case 'circle':
                    var c = new Point2D(node.x, node.y),
                        rx = node.width/2,
                        ry = node.height/2;
                    return Intersection.intersectEllipseLine(c, rx, ry, line.a1, line.a2);
                    break;
                case 'diamond':
                    var width = node.width,
                        height = node.height;
                    var points = [[width/2, 0], [width, height/2], [width/2, height], [0, height/2]] // pointsForDiamond
                        .map(function(p) {return new Point2D(p[0] + node.x - width/2, p[1] + node.y - height/2); });
                    return Intersection.intersectLinePolygon(line.a1, line.a2, points );
                    break;
                case 'transparent':
                    return nodeGeo.intersectionCoords(line, node, node.settings.prevShape || node.settings.shape);
                    break;
                default:
                    return {status: 'No Intersection'}

            }
        },
        endCoords: function(d) {
            return {
                x: d.x,
                y: d.y
            }
        }
    };

    // update force layout (called automatically each iteration)
    function tick() {
        nodes.attr('transform', function(d) {
            return 'translate(' + (d.x - d.width/2) + ',' + (d.y - d.height/2) + ')';
        });

        // draw directed edges with proper padding from node centers
        paths.attr('d', function(d) {

            var link = nodeGeo.linkCoords(d);
            return 'M' + link.x1 + ',' + link.y1 + 'L' + link.x2 + ',' + link.y2;
        });
    }


//*** RESTART **//
    that.restart = function() {

        paths = paths.data(MM.graph.links);
        nodes = nodes.data(MM.graph.nodes, function(d) { return d.id; });

        // add new links
        paths.enter().append('svg:path')
            .attr('class', 'link')
//        .classed('selected', function(d) { return d === MM.graph.selected_link; })
            .style('marker-end', 'url(#end-arrow)')
            .on('mousedown', eventHandler.link.mousedown);

        // remove old links
        paths.exit().remove();

        // update existing nodes (selected visual states)
        nodes.classed("selected", function(d) {
            return MM.graph.selected_node === d;
        });

        nodes.select("rect.node").each(function(d) {
            var rect = d3.select(this);
            var color = d.settings.shapeColor || rect.style("fill");
            if (MM.graph.selected_node === d) {
                rect.style('fill', d3.rgb(color).brighter(0.5));
            } else {
                rect.style('fill', color);
            }
        });

        // add new nodes
        var node = nodes.enter()
            .append('svg:g')
            .attr('class', 'node')
            .attr('node-id', function(d) { return d.id; });

        MM.node.draw(node);

        // remove old nodes
        nodes.exit().remove();

        // set the graph in motion
        MM.graph.force.start();
    };

    // shortens nodes and links data for saving to database
    function serializeGraph() {
        var nodes = MM.graph.nodes.map(function(node) {
            return {
                id: node.id,
                childrenIds: node.children.map(function(child) {return child.id}),
                parentIds: node.parents.map(function(parent) {return parent.id}),
                text: node.text
            }
        });

        var links = MM.graph.links.map(function(link) {
            return {
                sourceId: link.source.id,
                targetId: link.target.id
            }
        });

        return {
            nodes: nodes,
            links: links
        }
    }

    // converts fetched from DB graph data into format, used by D3
    function deserializeGraph(data) {
        var nodes = data.nodes;

        nodes.forEach(function(node, i, arr) {
            node = MM.node.create(node);
            node.children = node.childrenIds ? populate(node.childrenIds, arr) : [];
            node.parents = node.parentIds ? populate(node.parentIds, arr) : [];
            delete node.childrenIds;
            delete node.parentIds;
        });

        var links = data.links ?
            data.links.map(function(link) {
                return {
                    source: MM.graph.findNodeById(+(link.sourceId), nodes),
                    target: MM.graph.findNodeById(+(link.targetId), nodes)
                }
            }) :
            [];

        return {
            nodes: nodes,
            links: links
        };

        // substitutes node Ids with real node objects
        function populate(arrayOfIds, arrayOfNodes) {
            return arrayOfIds.map(function(id) {
                return MM.graph.findNodeById(id, arrayOfNodes);
            })
        }
    }

    return that;

}());


