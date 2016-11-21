// widget for node graphical settings
MM.widget = (function() {

    'use strict';

    var circleD = 20;
    var padding = 4;

    //
    var currentNodeData;

    var that = {
        nodeId: null, // truthy when widget is visible
        hovered: false // if the mouse is over widget
    };

    // the structure of widget
    var options = {
        name: 'main',
        depth: 1,
        children: [
            {
                name: 'font',
                depth: 2,
                icon: "M260 517 c0 -2 -29 -100 -65 -217 -36 -117 -65 -215 -65 -217 0 -2 23 -3 51 -1 l52 3 16 55 17 55 61 3 62 3 17 -61 17 -60 54 0 c40 0 54 3 51 13 -3 6 -33 105 -68 220 l-64 207 -68 0 c-37 0 -68 -2 -68 -3z m106 -219 c5 -27 5 -28 -41 -28 -34 0 -46 4 -42 13 2 6 13 46 23 87 l18 75 18 -60 c9 -33 20 -72 24 -87z",
                children: [
                    {
                        name: 'size',
                        depth: 3,
                        icon: "M151 403 c-16 -54 -41 -135 -55 -181 l-25 -83 42 3 c41 3 42 4 51 46 l9 43 55 -3 c55 -3 55 -3 66 -43 11 -38 14 -40 54 -43 23 -2 42 -2 42 0 0 2 -24 82 -54 178 l-52 175 -52 3 -51 3 -30 -98z m99 -42 l18 -71 -40 0 c-37 0 -40 2 -34 23 4 12 12 45 18 74 7 29 14 51 16 49 2 -3 12 -36 22 -75z M475 368 c-14 -45 -65 -216 -65 -222 0 -3 11 -6 25 -6 20 0 27 6 32 30 5 27 9 30 43 30 34 0 39 -3 45 -30 5 -25 12 -30 35 -30 l28 0 -24 78 c-13 42 -29 96 -35 120 -11 39 -14 42 -46 42 -18 0 -35 -6 -38 -12z m52 -83 c10 -45 10 -45 -17 -45 -26 0 -26 0 -16 45 6 25 13 45 17 45 3 0 10 -20 16 -45z",
                        children: [
                            {
                                name: 'bigger',
                                depth: 4,
                                icon: "M192 343 c-40 -131 -72 -244 -72 -250 0 -9 18 -13 54 -13 l55 0 15 54 c9 30 16 59 16 65 0 7 27 11 74 11 l73 0 18 -65 17 -65 60 0 60 0 -7 27 c-3 16 -37 127 -74 248 l-69 220 -74 3 -74 3 -72 -238z m171 40 c13 -46 22 -85 19 -88 -7 -7 -87 -6 -94 0 -3 3 0 27 8 53 7 26 18 67 25 92 6 25 13 41 15 35 2 -5 14 -47 27 -92z",
                                action: function() {
                                    MM.node.changeFontSize(that.nodeId, 16);
                                }
                            },
                            {
                                name: 'smaller',
                                depth: 4,
                                icon: "M277 338 c-15 -51 -27 -96 -27 -100 0 -5 11 -8 24 -8 18 0 25 6 28 23 2 17 11 23 34 25 27 3 33 -1 38 -22 5 -19 13 -26 31 -26 14 0 25 3 25 8 0 4 -13 48 -29 97 -27 89 -28 90 -62 93 l-34 3 -28 -93z m76 -20 c-7 -13 -33 -9 -33 5 0 6 3 23 7 37 l7 25 12 -30 c7 -17 10 -33 7 -37z",
                                action: function() {
                                    MM.node.changeFontSize(that.nodeId, 10);
                                }
                            }
                        ]
                    },
                    {
                        name: 'fontStyle',
                        depth: 3,
                        icon: "M121 393 c-16 -54 -41 -135 -55 -181 l-25 -83 42 3 c41 3 42 4 51 46 l9 43 55 -3 c55 -3 55 -3 66 -43 l12 -40 56 -3 56 -3 29 53 28 53 62 3 c68 3 68 3 75 -73 2 -23 9 -31 26 -33 21 -3 23 -1 17 30 -5 29 -45 317 -45 325 0 2 -11 3 -25 3 -22 0 -34 -18 -111 -172 -48 -95 -89 -167 -92 -160 -2 7 -25 84 -52 170 l-47 157 -51 3 -51 3 -30 -98z m443 -70 l7 -53 -51 0 c-27 0 -50 4 -50 9 0 5 17 44 37 87 l37 78 7 -34 c4 -19 10 -59 13 -87z m-344 28 l18 -71 -40 0 c-37 0 -40 2 -34 23 4 12 12 45 18 74 7 29 14 51 16 49 2 -3 12 -36 22 -75z",
                        children: [
                            {
                                name: 'underline',
                                depth: 4,
                                icon: "M190 383 c0 -136 10 -180 46 -214 34 -32 119 -34 160 -3 41 30 52 75 53 212 1 113 0 122 -18 122 -18 0 -19 -10 -23 -134 -3 -126 -5 -136 -27 -160 -18 -19 -35 -26 -61 -26 -26 0 -43 7 -61 26 -22 24 -24 34 -27 160 -4 124 -5 134 -23 134 -18 0 -19 -9 -19 -117z M150 100 c0 -6 62 -10 165 -10 103 0 165 4 165 10 0 6 -62 10 -165 10 -103 0 -165 -4 -165 -10z",
                                action: function() {
                                    var nodeG = MM.graph.findNodeGById(that.nodeId);
                                    var isUnderlined = nodeG.style('text-decoration') === 'underline';
                                    nodeG.style('text-decoration', isUnderlined ? null : 'underline');
                                    nodeG.datum().settings.fontUnderline = true;
                                }
                            },
                            {
                                name: 'bold',
                                depth: 4,
                                icon: "M197 483 c-16 -4 -17 -19 -15 -176 l3 -172 45 -3 c91 -7 151 7 187 43 18 18 33 43 33 54 0 32 -27 79 -49 86 -17 5 -17 8 10 35 16 15 29 37 29 47 0 29 -29 64 -66 79 -31 13 -137 17 -177 7z m157 -75 c18 -29 -4 -53 -53 -56 l-41 -3 0 41 0 41 41 -3 c27 -2 46 -9 53 -20z m-4 -138 c24 -24 24 -29 4 -58 -11 -16 -25 -22 -55 -22 l-39 0 0 50 0 50 35 0 c22 0 43 -8 55 -20z",
                                action: function() {
                                    var nodeG = MM.graph.findNodeGById(that.nodeId);
                                    var isBold = nodeG.style('font-weight') === 'bold';
                                    nodeG.style('font-weight', isBold ? null : 'bold');
                                    nodeG.datum().settings.fontBold = true;
                                }
                            },
                            {
                                name: 'italic',
                                depth: 4,
                                icon: "M356 463 c-3 -10 -17 -83 -31 -163 -14 -80 -28 -153 -31 -162 -4 -13 0 -18 15 -18 24 0 23 -2 56 180 14 80 28 153 31 163 4 12 0 17 -15 17 -11 0 -22 -8 -25 -17z",
                                action: function() {
                                    var nodeG = MM.graph.findNodeGById(that.nodeId);
                                    var isItalic = nodeG.style('font-style') === 'italic';
                                    nodeG.style('font-style', isItalic ? null : 'italic');
                                    nodeG.datum().settings.fontItalic = true;
                                }
                            }
                        ]
                    },
                    {
                        name: 'color',
                        depth: 3,
                        action: function(color) {
                            MM.node.changeFontColor(that.nodeId, color);
                        }
                    }
                ]
            },
            {
                name: 'body',
                depth: 2,
                icon: "M202 475 c-37 -16 -62 -64 -62 -120 l0 -35 -70 0 c-68 0 -70 -1 -70 -25 0 -24 2 -25 69 -25 l68 0 5 -52 c7 -72 47 -108 118 -108 l50 0 0 -55 c0 -52 1 -55 25 -55 24 0 25 3 25 55 l0 55 45 0 c66 0 106 38 113 108 l5 52 68 0 c67 0 69 1 69 25 0 24 -2 25 -70 25 l-70 0 0 43 c0 96 -47 127 -190 127 -60 -1 -107 -6 -128 -15z",
                children: [
                    {
                        name: 'shape',
                        depth: 3,
                        icon: "M425 566 c-48 -22 -77 -60 -82 -108 -13 -126 139 -197 224 -105 42 46 51 94 27 143 -34 68 -107 99 -169 70z M60 340 l0 -121 118 3 117 3 3 118 3 117 -121 0 -120 0 0 -120z M346 193 c77 -119 128 -193 133 -193 5 0 130 191 139 212 2 4 -62 8 -143 8 l-147 0 18 -27z",
                        children: [
                            {
                                name: 'circle',
                                depth: 4 ,
                                icon: "M225 526 c-89 -41 -137 -118 -137 -221 -1 -141 106 -245 249 -245 213 1 323 263 176 415 -75 77 -189 97 -288 51z",
                                action: function() {
                                    MM.node.changeShape(that.nodeId, 'circle');
                                }
                            },
                            {
                                name: 'rounded',
                                depth: 4,
                                icon: "M179 485 c-43 -23 -51 -59 -47 -204 3 -127 4 -131 31 -158 l27 -28 146 0 146 0 30 33 29 34 -3 145 c-3 145 -3 145 -31 169 -27 23 -34 24 -165 24 -99 -1 -144 -5 -163 -15z",
                                action: function() {
                                    MM.node.changeShape(that.nodeId, 'rounded');
                                }
                            },
                            {
                                name: 'straight',
                                depth: 4,
                                icon: "M120 310 l0 -210 210 0 210 0 0 210 0 210 -210 0 -210 0 0 -210z",
                                action: function() {
                                    MM.node.changeShape(that.nodeId, 'straight');
                                }
                            },
                            {
                                name: 'diamond',
                                depth: 4,
                                icon: "M180 445 l-145 -145 148 -148 147 -147 147 147 148 148 -145 145 c-80 80 -147 145 -150 145 -3 0 -70 -65 -150 -145z",
                                action: function() {
                                    MM.node.changeShape(that.nodeId, 'diamond');
                                }
                            },
                            {
                                name: 'transparent',
                                depth: 4,
                                icon: "M120 310 l0 -210 210 0 210 0 0 210 0 210 -210 0 -210 0 0 -210z",
                                iconStyle: { 'fill': '#CBCBCB' },
                                action: function() {
                                    MM.node.changeShape(that.nodeId, 'transparent');
                                }
                            }
                        ]
                    },
                    {
                        name: 'color',
                        depth: 3,
                        action: function(color) {
                            MM.node.changeShapeColor(that.nodeId, color);
                        }
                    }
                ]
            },
            {
                name: 'border',
                depth: 2,
                icon: "M215 520 c-55 -17 -86 -60 -92 -128 l-6 -61 -56 -3 c-49 -3 -56 -6 -59 -25 -3 -22 0 -23 57 -23 l61 0 0 -43 c0 -89 60 -147 153 -147 l47 0 0 -45 c0 -41 2 -45 25 -45 23 0 25 4 25 45 l0 45 43 0 c89 0 147 58 147 148 l0 42 50 0 c47 0 50 2 50 25 0 23 -3 25 -50 25 l-50 0 0 46 c0 59 -22 105 -63 129 -26 16 -54 20 -142 22 -60 1 -124 -2 -140 -7z m244 -65 c36 -18 41 -37 41 -158 0 -91 -2 -100 -25 -122 -23 -24 -31 -25 -135 -25 -104 0 -112 1 -135 25 -23 23 -25 31 -24 127 0 117 5 135 40 154 34 19 201 19 238 -1z",
                children: [
                    {
                        name: 'borderStyle',
                        depth: 3,
                        icon: "M82 440 c0 -19 2 -27 5 -17 2 9 2 25 0 35 -3 9 -5 1 -5 -18z M110 440 c0 -16 5 -30 10 -30 6 0 10 14 10 30 0 17 -4 30 -10 30 -5 0 -10 -13 -10 -30z M150 440 c0 -16 5 -30 10 -30 6 0 10 14 10 30 0 17 -4 30 -10 30 -5 0 -10 -13 -10 -30z M200 440 c0 -16 5 -30 10 -30 6 0 10 14 10 30 0 17 -4 30 -10 30 -5 0 -10 -13 -10 -30z M240 440 c0 -16 5 -30 10 -30 6 0 10 14 10 30 0 17 -4 30 -10 30 -5 0 -10 -13 -10 -30z M280 440 c0 -20 5 -30 15 -30 10 0 15 10 15 30 0 20 -5 30 -15 30 -10 0 -15 -10 -15 -30z M330 440 c0 -16 5 -30 10 -30 6 0 10 14 10 30 0 17 -4 30 -10 30 -5 0 -10 -13 -10 -30z M370 440 c0 -20 5 -30 15 -30 10 0 15 10 15 30 0 20 -5 30 -15 30 -10 0 -15 -10 -15 -30z M420 440 c0 -16 5 -30 10 -30 6 0 10 14 10 30 0 17 -4 30 -10 30 -5 0 -10 -13 -10 -30z M460 440 c0 -16 5 -30 10 -30 6 0 10 14 10 30 0 17 -4 30 -10 30 -5 0 -10 -13 -10 -30z M510 440 c0 -16 5 -30 10 -30 6 0 10 14 10 30 0 17 -4 30 -10 30 -5 0 -10 -13 -10 -30z M550 440 c0 -16 5 -30 10 -30 6 0 10 14 10 30 0 17 -4 30 -10 30 -5 0 -10 -13 -10 -30z M592 440 c0 -19 2 -27 5 -17 2 9 2 25 0 35 -3 9 -5 1 -5 -18z M80 320 c0 -25 4 -30 25 -30 21 0 25 5 25 30 0 25 -4 30 -25 30 -21 0 -25 -5 -25 -30z M210 320 c0 -29 2 -30 45 -30 43 0 45 1 45 30 0 29 -2 30 -45 30 -43 0 -45 -1 -45 -30z M380 320 c0 -29 2 -30 45 -30 43 0 45 1 45 30 0 29 -2 30 -45 30 -43 0 -45 -1 -45 -30z M550 320 c0 -25 4 -30 25 -30 21 0 25 5 25 30 0 25 -4 30 -25 30 -21 0 -25 -5 -25 -30z M80 170 l0 -30 260 0 260 0 0 30 0 30 -260 0 -260 0 0 -30z",
                        children: [
                            {
                                name: 'solid',
                                depth: 4,
                                icon: "M302 347 c-127 -127 -181 -188 -177 -199 3 -8 19 -24 34 -36 l28 -20 184 184 184 184 -35 35 -35 35 -183 -183z",
                                action: function() {
                                    MM.node.changeBorderStyle(that.nodeId, 'solid')
                                }
                            },
                            {
                                name: 'dotted',
                                depth: 4,
                                icon: "M485 490 c-18 -20 -18 -21 1 -41 20 -20 20 -20 39 1 18 20 18 21 -1 41 l-20 20 -19 -21z M380 375 c-22 -24 -23 -26 -7 -42 16 -16 19 -16 44 9 22 23 24 29 13 42 -17 21 -23 20 -50 -9z M260 255 c-22 -24 -23 -26 -7 -42 16 -16 19 -16 44 9 22 23 24 29 13 42 -17 21 -23 20 -50 -9z M147 152 c-16 -18 -16 -20 3 -37 19 -18 22 -18 37 -2 16 16 16 18 -3 37 -20 20 -21 20 -37 2z",
                                action: function() {
                                    MM.node.changeBorderStyle(that.nodeId, 'dotted')
                                }
                            },
                            {
                                name: 'dashed',
                                depth: 4,
                                icon: "M515 490 c10 -11 20 -20 23 -20 3 0 -3 9 -13 20 -10 11 -20 20 -23 20 -3 0 3 -9 13 -20z M470 483 c0 -12 38 -48 45 -41 3 2 -6 15 -20 28 -14 13 -25 19 -25 13z M440 442 c0 -14 36 -43 43 -35 4 3 0 15 -10 25 -17 19 -33 24 -33 10z M410 411 c0 -13 29 -35 37 -28 7 8 -15 37 -28 37 -5 0 -9 -4 -9 -9z M380 381 c0 -13 29 -35 37 -28 7 8 -15 37 -28 37 -5 0 -9 -4 -9 -9z M350 352 c0 -14 36 -43 43 -35 4 3 0 15 -10 25 -17 19 -33 24 -33 10z M330 305 c13 -14 26 -23 28 -20 7 7 -29 45 -41 45 -6 0 0 -11 13 -25z M290 293 c0 -5 9 -18 20 -28 11 -10 20 -14 20 -8 0 5 -9 18 -20 28 -11 10 -20 14 -20 8z M260 256 c0 -2 8 -10 18 -17 15 -13 16 -12 3 4 -13 16 -21 21 -21 13z M235 210 c10 -11 23 -20 28 -20 6 0 2 9 -8 20 -10 11 -23 20 -28 20 -6 0 -2 -9 8 -20z M190 203 c0 -12 38 -48 45 -41 3 2 -6 15 -20 28 -14 13 -25 19 -25 13z M160 162 c0 -14 36 -43 43 -35 4 3 0 15 -10 25 -17 19 -33 24 -33 10z M150 125 c13 -14 26 -25 28 -25 3 0 -5 11 -18 25 -13 14 -26 25 -28 25 -3 0 5 -11 18 -25z",
                                action: function() {
                                    MM.node.changeBorderStyle(that.nodeId, 'dashed')
                                }
                            }
                        ]
                    },
                    {
                        name: 'width',
                        depth: 3,
                        icon: "M130 445 c0 -13 29 -15 200 -15 171 0 200 2 200 15 0 13 -29 15 -200 15 -171 0 -200 -2 -200 -15z M130 325 l0 -35 200 0 200 0 0 35 0 35 -200 0 -200 0 0 -35z M130 175 l0 -55 200 0 200 0 0 55 0 55 -200 0 -200 0 0 -55z",
                        children: [
                            {
                                name: 'thin',
                                depth: 4,
                                icon: "M312 318 c-151 -150 -180 -184 -170 -195 11 -10 46 20 197 171 161 161 197 207 163 206 -4 0 -89 -82 -190 -182z",
                                action: function() {
                                    MM.node.changeBorderWidth(that.nodeId, 'thin');
                                }
                            },
                            {
                                name: 'normal',
                                depth: 4,
                                icon: "M307 342 l-187 -188 35 -34 36 -34 187 187 187 187 -35 35 -35 35 -188 -188z",
                                action: function() {
                                    MM.node.changeBorderWidth(that.nodeId, 'normal');
                                }
                            },
                            {
                                name: 'thick',
                                depth: 4,
                                icon: "M277 372 l-187 -187 65 -65 65 -65 188 188 187 187 -65 65 -65 65 -188 -188z",
                                action: function() {
                                    MM.node.changeBorderWidth(that.nodeId, 'thick');
                                }
                            }
                        ]
                    },
                    {
                        name: 'color',
                        depth: 3,
                        action: function(color) {
                            MM.node.changeBorderColor(that.nodeId, color);
                        }
                    }
                ]
            }
        ]
    };
    // TODO set depth in loop (recurse)


    var mainPanelWidth = options.children.length * (circleD + padding) + padding;
    var mainPanelHeight = circleD + 3*padding;

    var panel = {

        toggle: function(panelG, data) {
            if (panelG.classed('hidden')) {
                this.hideIfDeeper(data.depth);
                this.show(panelG);
            } else {
                this.hide(panelG);
            }
        },
        show: function(panel) {
            panel.classed('hidden', false);
        },
        hide: function(panel) {
            panel.classed('hidden', true);
            colorpicker.close();
        },
        hideIfDeeper: function(depth) {
            var otherPanels = d3.selectAll('g.option')
                .filter(function(d) { return d.depth >= depth })
                .select('g.panel');
            this.hide(otherPanels);
        }

    };

    var eventHandler = {
        circleClick: function(d) {
            if (!d) { return; }
            var panelG = d3.select("g.panel." + d.name);
            if (!panelG.empty()) {
                panel.toggle(panelG, d);
            }
            if (d.name === 'color') {
                panel.hideIfDeeper(d.depth);
                colorpicker.open(d.action);
            } else if (d.action && typeof d.action === 'function') {
                d.action.call();
            }
        },

        widget: {
            mouseover: function() {
                that.hovered = true;
            },
            mouseout: function() {
                that.hovered = false;
                setTimeout(function() {
                    if (!that.hovered) {
                        that.hide();
                    }
                }, 400);
            },
            mousedown: function() {
                d3.event.stopPropagation();
            },
            mouseup: function() {
                d3.event.stopPropagation();
            }
        }
    };

    // Returns path data for a rectangle with rounded right corners.
    // x: x-coordinate
    // y: y-coordinate
    // w: width
    // h: height
    // r: corner radius
    // tl: top_left rounded?
    // tr: top_right rounded?
    // bl: bottom_left rounded?
    // br: bottom_right rounded?
    function roundedRect(x, y, w, h, r, tl, tr, bl, br) {
        var retval;
        retval  = "M" + (x + r) + "," + y;
        retval += "h" + (w - 2*r);
        if (tr) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + r; }
        else { retval += "h" + r; retval += "v" + r; }
        retval += "v" + (h - 2*r);
        if (br) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + r; }
        else { retval += "v" + r; retval += "h" + -r; }
        retval += "h" + (2*r - w);
        if (bl) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + -r; }
        else { retval += "h" + -r; retval += "v" + -r; }
        retval += "v" + (2*r - h);
        if (tl) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + -r; }
        else { retval += "v" + -r; retval += "h" + r; }
        retval += "z";
        return retval;
    }

    // parses svg transform attribute to json
    function parseTransform (a) {
        var b={};
        for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*,?)+\))+/g))
        {
            var c = a[i].match(/[\w\.\-]+/g);
            b[c.shift()] = c;
        }
        return b;
    }

    // builds the tree recursively
    function build(optionsGroup, vis) {

        var children = optionsGroup.children;

        if (children) {

            var depth = optionsGroup.depth;
            // the size of the panel
            var length = children.length * (circleD + padding) + padding;
            var width = circleD + 2 * padding;
            // determine panel's orientation
            var hor = depth % 2; // true for panels of 1st, 3rd, 5ths, etc. order

            var panel = vis
                .append('g')
                .attr('class', 'panel ' + optionsGroup.name)
                .attr('depth', depth)
                .classed('hidden', depth > 1);

            // calculate size and positioning of panel's path
            var panelHeight = hor ? width : length;
            // main panel thicker by padding, vertical panels - padded from top
            if (depth === 1 || !hor) {
                panelHeight += padding;
            }
            // vertical panels if depth == 2 arelonger by main panel's border radius
            if (depth === 2) {
                panelHeight += circleD/2;
            }
            var panelWidth = hor ? length : width;
            if (hor && depth !== 1) {
                panelWidth += padding;
            }

            var path = panel.append('path')
                .attr('d', roundedRect(
                    0,
                    // main panel (depth=1) higher by padding
                    // vert panels made higher cuz main panel has rounded bottom corners
                    depth === 1 ? -padding : (depth === 2 ? -circleD/2 : 0),
                    panelWidth,
                    panelHeight,
                    circleD/2+2,
                    false,
                    hor && depth > 1,
                    hor ? depth === 1 : true,
                    true
                    )
                )
                .attr('transform', function() {
                    var d1 = depth > 1 ? width : 0;
                    var d2 = width;
                    var translate = hor ? [d1, 0] : [0, d2];
                    return 'translate(' + translate + ')'
                })
                .attr('class', 'panel');

            var options = panel
                .selectAll('g.option')
                .data(children)
                .enter()
                .append('g')
                .attr('class', function(d) {
                    return 'option ' + d.name;
                })
                .attr('transform', function(d, i) {
                    var d1 = optionsGroup.depth > 1 ? width + padding : 0;
                    var d2 = ((circleD + padding) * i);
                    var d3 = width + padding;
                    var translate = hor ? [d1 + d2, 0] : [0, d2 + d3];
                    return 'translate(' + translate + ')'
                });

            var controls = options.append('svg:g')
                .attr('class', 'controls')
                .on('click', eventHandler.circleClick);

            controls.append('circle')
                .attr('r', circleD/2)
                .attr('cx', padding + circleD/2)
                .attr('cy', padding + circleD/2);

            controls.each(function(d) {
                if (d.icon) {
                    var icon = d3.select(this)
                        .append('svg:path')
                        .attr('d', d.icon)
                        .attr('class', 'icon')
                        .attr('transform', 'scale(0.025, -0.025) translate(230,-850)');
                    if (d.iconStyle) {
                        icon.style(d.iconStyle);
                    }
                }
                if (d.name === 'color') {
                    d3.select(this)
                        .append('svg:path')
                        .attr('d', colorpicker.paletteSVG)
                        .attr('class', 'icon')
                        .attr('transform', 'scale(0.3) translate(0,40) rotate(-40)');
                }
            });

            // for using in <use> tag to simulate z-index of main panel
            if (depth === 1) {
                path.attr('id', 'mainPanel');
                controls.attr('id', function(d, i) {
                    return 'mainControl' + i;
                })
            }

            options.each(function(d) {
                return build(d, d3.select(this));
            });

        }
    }

    var colorpicker = {

        // function to be called when color is choosen. is set in colorpicker.open()
        action: null,

        init: function() {
            // use dummy div as trigger for colorpicker
            $("#colorpickerTrigger").simpleColor({
                columns: 10,
                onSelect: function(color) {
                    if (typeof colorpicker.action === 'function') {
                        colorpicker.action.call(null, "#" + color);
                    }
                },
                boxWidth: 0,
                boxHeight: 0,
                displayCSS: { 'border': 'none' },
                chooserCSS: { 'border-color': 'white', 'background-color': 'rgba(0,0,0,0)' },
//            cellMargin: 0
            });
            $(".simpleColorDisplay").click();
            $(".simpleColorChooser")
                .mouseenter(function() { that.hovered = true; })
                .mouseleave(eventHandler.widget.mouseout);
        },

        open: function(action) {
            this.action = action;
            $(".simpleColorChooser").css({
                top: d3.event.pageY,
                left: d3.event.pageX
            }).show();
        },

        close: function() {
            this.action = null;
            $("#colorpickerTrigger").closeChooser()
        },

        paletteSVG: "M4.275,29.442c-1.545,5.567,4.231,11.984,10.01,11.984  c0.422,0,0.835-0.032,1.243-0.081c1.974-0.2,3.252,0.367,4.073,1.098c1.152,1.026,1.242,3.625,1.43,5.156  c0.294,2.396,1.27,4.064,2.226,5.161c1.013,1.164,3.246,2.385,4.74,2.771c0.752,0.195,1.55,0.355,2.288,0.48  c1.521,0.258,4.021,0.418,5.562,0.36c4.824-0.181,10.668-1.844,16.076-7.253c12.001-12,3.909-23.794-2.535-29.136  C30.819,4.592,8.685,13.544,4.275,29.442z M13.361,35.785c-2.097,0-3.795-1.699-3.795-3.795s1.698-3.795,3.795-3.795  c2.096,0,3.795,1.7,3.795,3.795S15.457,35.785,13.361,35.785z M23.207,27.066c-2.096,0-3.795-1.699-3.795-3.795  c0-2.096,1.699-3.795,3.795-3.795c2.097,0,3.796,1.699,3.796,3.795C27.003,25.367,25.304,27.066,23.207,27.066z M31.004,50.861  c-2.493,0-4.513-2.021-4.513-4.513c0-2.492,2.02-4.513,4.513-4.513c2.492,0,4.512,2.021,4.512,4.513  C35.516,48.84,33.496,50.861,31.004,50.861z M34.388,27.066c-2.097,0-3.795-1.699-3.795-3.795c0-2.096,1.698-3.795,3.795-3.795  c2.096,0,3.795,1.699,3.795,3.795C38.183,25.367,36.483,27.066,34.388,27.066z M45.565,32.502c-2.095,0-3.794-1.7-3.794-3.795  c0-2.096,1.699-3.795,3.794-3.795c2.097,0,3.796,1.699,3.796,3.795C49.361,30.803,47.662,32.502,45.565,32.502z"


};

    that.init = function(vis) {
        var widgetG = vis
            .select('g.node-widget')
            .classed('hidden', true)
            .attr('style', "filter:url(#dropshadow)")
            .on('mouseover', eventHandler.widget.mouseover)
            .on('mouseout', eventHandler.widget.mouseout)
            .on('mouseup', eventHandler.widget.mouseup)
            .on('mousedown', eventHandler.widget.mousedown);


        build(options, widgetG);

        // make main panel to appear to be on top of others
        widgetG.append('svg:use').attr('xlink:href', "#mainPanel");
        widgetG.selectAll('use.control')
            .data(options.children)
            .enter()
            .append('svg:use')
            .attr('xlink:href', function(d, i) {
                return '#mainControl' + i;
            })
            .attr('class', 'control')
            .attr('transform', function(d, i) {
                return 'translate(' + (circleD + padding) * i + ',0)';
            });

        colorpicker.init();

    };

    that.show = function(node) {
        var bottomRight = {
            x: node.x + node.width/2,
            y: node.y + node.height/2
        };
        var coords = [bottomRight.x - mainPanelWidth - 15, bottomRight.y + 4];
        d3.select("g.node-widget")
            .attr('transform', 'translate(' + [coords[0], coords[1] - mainPanelHeight - 2] + ')')
            .classed('hidden', false)
            .transition()
            .ease("cubic-out")
            .attr('transform', 'translate(' + coords + ')');

        this.nodeId = node.id;
        currentNodeData = node;
    };

    that.hide = function() {
        var widget = d3.select("g.node-widget");
        var translate = parseTransform(widget.attr('transform')).translate;
        var hiddenTranslate = [+translate[0], +translate[1] - mainPanelHeight];

        widget.transition()
            .ease("cubic-in")
            .attr('transform', 'translate(' + hiddenTranslate + ')')
            .each('end', function() {
                d3.select(this).attr('transform', 'translate(' + translate + ')').classed('hidden', true);
            });
        panel.hideIfDeeper(2);
        this.nodeId = null;
        currentNodeData = null;
    };

    that.options = options; // TODO remove this
    return that;

}());