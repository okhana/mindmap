// basic node functionality.
MM.node = (function() {

    'use strict';

    var that = {};

    // default node settings
    var prefs = {
        width: 110,
        height: 50,
        padding: { hor: 15, vert: 10 },
        placeholder: "write here",
        fontSize: 14,
        rx: 10,
        ry: 10,
        settings: {
            shape: 'rounded',
            borderWidth: {
                thin: 1,
                normal: 2,
                thick: 4
            },
            borderStyle: {
                solid: 0,
                dotted: 1,
                dashed: 0.5
            }
        }
    };

    var mouseOver; // true while mouse is over node
    // contains functions, handling events over nodes
    var handler = {

        mouseover: function(d) {
            d.fixed = true;
            mouseOver = true;

            // prevent widget.hide() if mouse moved from widget to it's node
//            if (MM.widget.nodeId === d.id) {
//                MM.widget.hovered = true;
//            }
            setTimeout(function() {
                if (mouseOver && !MM.graph.mousedown_node && !MM.graph.nodeBeingResized) {
                    MM.widget.show(d);
                }
            }, 600);

            if (MM.graph.mousedown_node && d !== MM.graph.mousedown_node) {
                // outline target node
                d3.select(this).select("rect.node").style('stroke-width', 3);
            }
        },

        mouseout: function(d) {
            mouseOver = false;

            setTimeout(function() {
                if (!mouseOver && !MM.widget.hovered) {
                    if (!MM.graph.findNodeGById(d.id).classed("fixed")) {
                        d.fixed = false;
                    }
                    MM.widget.hide();
                }
            }, 400);

            if(!MM.graph.mousedown_node || d === MM.graph.mousedown_node) return;

            // deoutline target node
            d3.select(this).select("rect.node").style('stroke-width', 1.5);
        },

        mousedown: function(d) {
            MM.graph.disableZooming();
            MM.widget.hide();

            // remove 'write here' placeholder of the last node edited (if no text was typed)
            if (MM.graph.lastClickedNode && !MM.graph.lastClickedNode.text) {
                MM.node.updateTextField(MM.graph.findNodeGById(MM.graph.lastClickedNode.id));
            }

            MM.graph.lastClickedNode = d;
            MM.graph.mousedown_node = d;
            if(d3.event.ctrlKey) return;

            if (d === MM.graph.selected_node) {
                MM.graph.deselectNodes();
            } else {
                MM.graph.selectNode(d);
            }
            MM.graph.selected_link = null;

            // reposition drag line
            d3.select("path.dragline")
                .style('marker-end', 'url(#end-arrow)')
                .classed('hidden', false)
                .attr('d', 'M' + MM.graph.mousedown_node.x + ',' + MM.graph.mousedown_node.y + 'L' + MM.graph.mousedown_node.x + ',' + MM.graph.mousedown_node.y);

            MM.restart();
        },

        mouseup: function(d) {

            if (!MM.graph.mousedown_node || MM.graph.mousedown_node === d) {
                return;
            }

            // needed by FF
            d3.select("path.dragline")
                .classed('hidden', true)
                .style('marker-end', '');

            MM.graph.mouseup_node = d;

            // deoutline target node
            d3.select(this).select("rect.node").style('stroke-width', 1.5);

            // add link to graph (update if exists)
            var link;
            link = MM.graph.links.filter(function(l) {
                return (l.source === MM.graph.mousedown_node && l.target === MM.graph.mouseup_node);
            })[0];

            if(!link) {
                link = MM.graph.linkNodes(MM.graph.mousedown_node, MM.graph.mouseup_node);
                MM.outliner.moveNodeUnderParent(MM.graph.mouseup_node, MM.graph.mousedown_node);
            }

            // select new link
            MM.graph.selected_link = link;
            MM.graph.deselectNodes();
            MM.restart();
        },

        dblclick: function(d) {
            d3.event.stopPropagation(); // to prevent zooming

            // if dblclicked rect.node
            if (d3.event.srcElement.className.baseVal === "node" && d3.event.srcElement.tagName === "rect") {
                // put cursor to the end of the text
                var textBackground = $172("g.node[node-id='" + d.id + "']").find("g.text rect.background");
                var down = $172.Event("mousedown.");
                down.clientX = textBackground.offset().left + textBackground[0].getBoundingClientRect().width-2;
                down.clientY = textBackground.offset().top + textBackground[0].getBoundingClientRect().height-2;
                textBackground.trigger(down);
                textBackground.trigger($172.Event("mouseup."));
            }
        },

        textFieldResized: function(height, node) {
            var newHeight = height + 2 * prefs.padding.vert;
            if (newHeight > node.datum().height) {
                changeSize(node, null, newHeight, 200);
            }
        },

        unpinNode: function(d) {
            d.fixed = false;
            d3.select(this.parentNode).classed("fixed", false);
            //d3.select("g.node[node-id='" + d.id + "']").classed("fixed", false);
        }
    };

    /**
     * mutating function for constructing node data objects
     * @param {Object} node - prototype of the node object. Field 'id' is required.
     * @returns {Object} node - the mutated object passed in
     */
    that.create = function(node) {

        node.id = +node.id;
        node.text = node.text || "";
        node.width = prefs.width;
        node.height = prefs.height;
        node.parents = node.parents || [];
        node.children = node.children || [];
        // default node settings
        node.settings = {
            shape: 'rounded',
            shapeColor: '#B2B2B2',
            borderStyle: 'solid',
            borderWidth: prefs.settings.borderWidth.normal
        };

        Object.defineProperty(node, 'size', {
            get: function() { return this.width * this.height }
        });

        return node;
    };

    /** changes the size of node being resized **/
    that.resize = function() {
        MM.graph.force.stop();
        var d = MM.graph.nodeBeingResized;
        var node = MM.graph.findNodeGById(d.id);
        // calculate coordinates of top-left corner of the node being resized
        var topLeft = {
            x: d.x - d.width/2,
            y: d.y - d.height/2
        };
        var mouse = d3.mouse(d3.select("g.vis").node());
        // calculate new width and height
        var newWidht = Math.round(mouse[0] - topLeft.x);
        var newHeight = Math.round(mouse[1] - topLeft.y);
        changeSize(node, newWidht, newHeight, 0);

        // update the size of textfield
        MM.node.updateTextField(node);

        // normalize node motion after resuming the force
        MM.graph.nodeBeingResized.x = topLeft.x + newWidht/2;
        MM.graph.nodeBeingResized.y = topLeft.y + newHeight/2;
        MM.graph.nodeBeingResized.px = MM.graph.nodeBeingResized.x;
        MM.graph.nodeBeingResized.py = MM.graph.nodeBeingResized.y;
    };

    /**
     * resizes the node <rect>, changes the node's data width and height properties
     * @param node - node to be resized (d3 selection)
     * @param {Number} width - new width (if falsy - width will not change)
     * @param {Number} height - new height
     * @param {Number} duration - duration of node transition
     * @param {Function} [done] - callback, called at the end of transition
     */
    function changeSize(node, width, height, duration, done) {
        var nodeD = node.datum();
        // if size not changed - do nothing;
        if ((width ? nodeD.width === width : true) && nodeD.height === height) {
            return done && done();
        }
        // calculate node width if only height is changed
        if (!width) {
            width = nodeD.width;
        }

        if (width < 50) {
            width = 50;
        }
        if (height < prefs.height) {
            height = prefs.height;
        }

        var nodeTransition = node.transition().duration(duration);
        // move the resize node handle
        nodeTransition.select(".resize")
            .attr("transform", "translate(" + width + "," + height + ")");

        // move pin button
        nodeTransition.select(".pin")
            .attr("transform", "translate(" + (width - 5) + ",-7)");

        var rectTransition = nodeTransition.select("rect.node");
        width && rectTransition.attr("width", width);
        height && rectTransition.attr("height", height);
        switch (nodeD.settings.shape) {
            case 'circle':
                rectTransition.attr("rx", width/2).attr("ry", height/2);
                break;
            case 'diamond': // fall-through is intended
            case 'transparent':
                nodeTransition.select("polygon.node")
                    .attr("points", pointsForDiamond(width, height).join(" "));
                break;
        }
        // assign new size to the datum
        nodeD.width = width;
        nodeD.height = height;

        rectTransition.each('end', function() {
            done && done();
        });
//        or:
//        nodeTransition.each('end', function() {
//            done && done();
//        })
    }

    that.updateTextField = function(node) {
        node.selectAll("g.text").remove();
        appendTextField(node);
    };

    that.dragged = function(d) {
        d.fixed = true;
        d3.select(this).classed("fixed", true);
    };

    /** draws the node and its content**/
    that.draw = function(node) {
        node.append('svg:rect')
            .attr('class', 'node')
            .attr('width', prefs.width)
            .attr('height', prefs.height)
            .attr('rx', prefs.rx)
            .attr('ry', prefs.ry)
            .style('fill', function(d) {
                return d.settings.shapeColor;
            })
            .style("stroke", function(d) {
                return d3.rgb(d.settings.shapeColor).darker();
            })
            .style('stroke-dasharray', function(d) {
                return prefs.settings.borderStyle[d.settings.borderStyle] * d.settings.borderWidth;
            })
            .style("stroke-width", function(d) {
                return d.settings.borderWidth;
            });

        node.on('mouseover', handler.mouseover)
            .on('mouseout', handler.mouseout)
            .on('mousedown', handler.mousedown)
            .on('mouseup', handler.mouseup)
            .on('dblclick', handler.dblclick);


        //append resize handle
        var resHandleSize = prefs.height/15;
        var resHandlePadding = resHandleSize;
        var resHandle = node.append("g")
            .attr("class", "resize")
            .attr("transform", "translate(" + prefs.width + "," + prefs.height + ")");
        resHandle.append("circle")
            .attr('r', resHandleSize*2.3)
            .attr('cx', -resHandleSize*2)
            .attr('cy', -resHandleSize*2)
            .style({"opacity": 0, 'fill': node.datum().settings.shapeColor })
            .on("mousedown", function() {
                d3.event.stopPropagation(); // not trigger 'mousedown' on the node
                MM.graph.nodeBeingResized = d3.select(this).datum();
                MM.widget.hide();
            });
        resHandle.selectAll("line").data([1,2,3])
            .enter()
            .append("line")
            .attr("x1", function(d) {return -resHandleSize*(d + 0.5);})
            .attr("y1", resHandleSize/2 - resHandlePadding)
            .attr("x2", resHandleSize/2 - resHandlePadding)
            .attr("y2", function(d) {return -resHandleSize*(d + 0.5);});


        // append pin button
        var pin = node.append("g")
            .attr("class", "pin")
            .attr("transform", "translate(" + (prefs.width - 5) + ",-7)")
            .on("click", handler.unpinNode);
        // for mouseevents:
        pin.append("circle")
            .attr("r", 7)
            .attr("cx", 6)
            .attr("cy", 6)
            .style("opacity", 0);

        pin.append("path")
            .attr("d", "M32,8c0-4.416-3.586-8-8-8c-2.984,0-5.562,1.658-6.938,4.086c0-0.002,0.004-0.004,0.004-0.006   c-0.367-0.035-0.723-0.111-1.098-0.111c-6.629,0-12,5.371-12,12c0,2.527,0.789,4.867,2.121,6.797L0,32l9.289-6.062   c1.91,1.281,4.207,2.031,6.68,2.031c6.629,0,12-5.371,12-12c0-0.346-0.07-0.67-0.102-1.008C30.32,13.594,32,11.006,32,8z    M15.969,23.969c-4.414,0-8-3.586-8-8c0-4.412,3.586-8,8-8c0.012,0,0.023,0.004,0.031,0.004c0-0.008,0.004-0.014,0.004-0.02   C16.004,7.969,16,7.984,16,8c0,0.695,0.117,1.355,0.281,1.998l-3.172,3.174c-1.562,1.562-1.562,4.094,0,5.656s4.094,1.562,5.656,0   l3.141-3.141c0.66,0.18,1.344,0.305,2.059,0.309C23.949,20.398,20.371,23.969,15.969,23.969z M24,12c-2.203,0-4-1.795-4-4   s1.797-4,4-4s4,1.795,4,4S26.203,12,24,12z")
            .attr("transform", "scale(0.4)");


        // attach text field
        node.each(function() {
            appendTextField(d3.select(this));
        });
    };

    that.changeFontSize = function(nodeId, newSize) {
        var nodeG = MM.graph.findNodeGById(nodeId);
        nodeG.datum().settings.fontSize = newSize;
        MM.node.updateTextField(nodeG);
    };

    that.changeFontColor = function(nodeId, newColor) {
        var nodeG = MM.graph.findNodeGById(nodeId);
        nodeG.datum().settings.fontColor = newColor;
        MM.node.updateTextField(nodeG);
    };

    that.changeShapeColor = function(nodeId, newColor) {
        var nodeG = MM.graph.findNodeGById(nodeId);
        var nodeD = nodeG.datum();
        nodeD.settings.shapeColor = newColor;
        if (nodeD.settings.shape === 'transparent') {
            that.changeShape(nodeId, 'rounded');
        }
        var shapeTransition = nodeG.selectAll(".node").transition();
        shapeTransition.style({ "fill": newColor });
        if (!nodeD.settings.borderColor) {
            var darker = d3.rgb(newColor).darker();
            shapeTransition.style({'stroke': darker})
        }
        var resizeHandle = nodeG.select('g.resize');
        resizeHandle.select("circle").style({ 'fill': newColor });
        resizeHandle.selectAll("line").style({ 'stroke': darker });
    };

    that.changeShape = function(nodeId, newShape) {
        var nodeG = MM.graph.findNodeGById(nodeId);
        var datum = nodeG.datum();
        var oldShape = datum.settings.shape;
        if (oldShape !== newShape) {
            if (oldShape === 'transparent') {
                nodeG.select("rect.node").style("fill-opacity", 1);
            }
            if ((oldShape === 'diamond' || oldShape === 'transparent') && newShape !== 'transparent') {
                nodeG.select("rect.node").style("opacity", 1);
                nodeG.select("polygon.node").remove();
            }
            if (newShape === 'circle' || newShape === "diamond") {
                nodeG.select(".resize").select("circle").style("opacity", 0.5);
            } else {
                nodeG.select(".resize").select("circle").style("opacity", 0);
            }
            datum.settings.shape = newShape;
            datum.settings.prevShape = oldShape;
            shape[newShape].call(shape, nodeG, datum);
        }
        MM.graph.force.start();
    };

    var shape = {
        circle: function(nodeG, d) {
            shape.makeEqualSides(nodeG, d, function(side) {
                nodeG.select("rect.node")
                    .transition()
                    .attr('rx', side)
                    .attr('ry', side);

            });
        },
        rounded: function(nodeG, d, done) {
            nodeG.select("rect.node")
                .transition()
                .attr('rx', prefs.rx)
                .attr('ry', prefs.ry)
                .each('end', function() {
                    done && done();
                });
        },
        straight: function(nodeG, d, done) {
            nodeG.select("rect.node")
                .transition()
                .attr('rx', 0)
                .attr('ry', 0)
                .each('end', function() {
                    done && done();
                });
        },
        diamond: function(nodeG, d) {
            var rect = nodeG.select("rect.node");
            var rectStyle = rect.attr('style');
            rect.transition().style('opacity', 0);
            nodeG.insert("polygon", 'rect.node')
                .attr("class", 'node')
                .attr("points", pointsForDiamond(d.width, d.height).join(" "))
                .attr('style', rectStyle);
        },
        transparent: function(nodeG, d) {
            nodeG.select(".node").transition().style('fill-opacity', 0);
        },
        // resizes node to equal sides square and then calls done()
        makeEqualSides: function(nodeG, d, done) {
            var side = Math.floor(Math.sqrt(d.size));
            changeSize(nodeG, side, side, 400, function() {
                MM.node.updateTextField(nodeG);
                done(side);
            });
        }
    };

    that.changeBorderStyle = function(nodeId, newStyle) {
        var nodeG = MM.graph.findNodeGById(nodeId);
        var datum = nodeG.datum();
        var style;
        if (newStyle) {
            style = newStyle;
            datum.settings.borderStyle = newStyle;
        } else {
            style = datum.settings.borderStyle;
        }
        nodeG.selectAll(".node").style("stroke-dasharray", datum.settings.borderWidth * prefs.settings.borderStyle[style]);
    };

    that.changeBorderWidth = function(nodeId, newWidth) {
        var nodeG = MM.graph.findNodeGById(nodeId);
        var datum = nodeG.datum();
        datum.settings.borderWidth = prefs.settings.borderWidth[newWidth];
        nodeG.selectAll(".node").transition().style("stroke-width", prefs.settings.borderWidth[newWidth]);
        that.changeBorderStyle(nodeId);
    };

    that.changeBorderColor = function(nodeId, newColor) {
        var nodeG = MM.graph.findNodeGById(nodeId);
        var datum = nodeG.datum();
        nodeG.selectAll(".node").transition().style('stroke', newColor);
        datum.settings.borderColor = newColor;
    };

    function appendTextField(node) {
        var nodeD = node.datum();
        var text = nodeD.text || prefs.placeholder;
        var nodeSVG = node.node();
        // older version of jQuery must be used here (1.7.2)
        $172(nodeSVG).svg(function(svg) {
            var textWidth = nodeD.width - prefs.padding.hor * 2;
            var settings = {width: textWidth}; //  align: 'middle'
            // for custom font size (override the CSS rules) provide fontSize
            if (nodeD.settings.fontSize) {
                settings.fontSize = nodeD.settings.fontSize + 'px';
            }
            if (nodeD.settings.fontColor) {
                settings.fontColor = nodeD.settings.fontColor;
            }
            var textInput = svg.input.text(prefs.padding.hor, prefs.padding.vert, text, settings);

            if (text.length > 20 && !MM.graph.nodeBeingResized) {
                // make node bigger
                var textHeight = textInput._textPositions[0].length * prefs.fontSize;
                handler.textFieldResized(textHeight, node);
            }

            centerTextVertically(node);

            textInput.bind("changeSize", function(e, width, height) {
                handler.textFieldResized(height, node);
            });

            textInput.bind("change", function(e, text) {
                centerTextVertically(node);
                // -1 used here as a workaround to deal with one last 'change' event
                // after the text was submitted
                if (MM.graph.textBeingEdited === -1) {
                    MM.graph.textBeingEdited = null;
                } else {
                    MM.graph.textBeingEdited = text;
                }
            });

            if (!node.datum().text) {
                // if no text - select the placeholder text (by simulating mousedown)
                setTimeout(function() {
                    var down = $172.Event("mousedown.");
                    down.clientX = nodeD.x + 20;
                    down.clientY = nodeD.y + 15;
                    $172(nodeSVG).find("text").trigger(down);

                    // simulate pressing CTRL+A (to select all the text in node)
                    var ctrlAPress = $172.Event("keydown");
                    ctrlAPress.metaKey = true;
                    ctrlAPress.ctrlKey = true;
                    ctrlAPress.keyCode = 65;
                    $172(window).trigger(ctrlAPress);
                }, 100);
                MM.graph.textBeingEdited = text;
            }
        });
    }

    function centerTextVertically(node) {
        var textarea = node.select("g.selectable.text");
        var offsetTop = (node.datum().height - textarea.select("rect.background").attr("height"))/2;
        textarea.attr("transform", 'translate(' + [prefs.padding.hor, offsetTop] + ')');
    }

    function pointsForDiamond(width, height) {
        return [[width/2, 0], [width, height/2], [width/2, height], [0, height/2]];
    }

    return that;

}());