/*
 * jQuery simple-color plugin
 * @requires jQuery v1.4.2 or later
 *
 * See https://github.com/recurser/jquery-simple-color
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Version: <%= pkg.version %> (<%= meta.date %>)
 */
 (function($) {
/**
 * simpleColor() provides a mechanism for displaying simple color-choosers.
 *
 * If an options Object is provided, the following attributes are supported:
 *
 *  defaultColor:       Default (initially selected) color.
 *                      Default value: '#FFF'
 *
 *  cellWidth:          Width of each individual color cell.
 *                      Default value: 10
 *
 *  cellHeight:         Height of each individual color cell.
 *                      Default value: 10
 *
 *  cellMargin:         Margin of each individual color cell.
 *                      Default value: 1
 *
 *  boxWidth:           Width of the color display box.
 *                      Default value: 115px
 *
 *  boxHeight:          Height of the color display box.
 *                      Default value: 20px
 *
 *  columns:            Number of columns to display. Color order may look strange if this is altered.
 *                      Default value: 16
 *
 *  insert:             The position to insert the color chooser. 'before' or 'after'.
 *                      Default value: 'after'
 *
 *  colors:             An array of colors to display, if you want to customize the default color set.
 *                      Default value: default color set - see 'defaultColors' below.
 *
 *  displayColorCode:   Display the color code (eg #333333) as text inside the button. true or false.
 *                      Default value: false
 *
 *  colorCodeAlign:     Text alignment used to display the color code inside the button. Only used if
 *                      'displayColorCode' is true. 'left', 'center' or 'right'
 *                      Default value: 'center'
 *
 *  colorCodeColor:     Text color of the color code inside the button. Only used if 'displayColorCode'
 *                      is true.
 *                      Default value: '#FFF'
 *
 *  onSelect:           Callback function to call after a color has been chosen. The callback
 *                      function will be passed two arguments - the hex code of the selected color,
 *                      and the input element that triggered the chooser.
 *                      Default value: null
 *                      Returns:       hex value
 *
 *  onCellEnter:        Callback function that excecutes when the mouse enters a cell. The callback
 *                      function will be passed two arguments - the hex code of the current color,
 *                      and the input element that triggered the chooser.
 *                      Default value: null
 *                      Returns:       hex value
 *
 *  onClose:            Callback function that executes when the chooser is closed. The callback
 *                      function will be passed one argument - the input element that triggered
 *                      the chooser.
 *                      Default value: null
 *
 *  livePreview:        The color display will change to show the color of the hovered color cell.
 *                      The display will revert if no color is selected.
 *                      Default value: false
 *
 *  chooserCSS:         An associative array of CSS properties that will be applied to the pop-up
 *                      color chooser.
 *                      Default value: see options.chooserCSS in the source
 *
 *  displayCSS:         An associative array of CSS properties that will be applied to the color
 *                      display box.
 *                      Default value: see options.displayCSS in the source
 */
  $.fn.simpleColor = function(options) {

    var element = this;

    var defaultColors = [
      '990033',  'cc0033',  'ff9999',  'ffccff',
      '993366',  'cc3399',  'ff66cc',  'ff6699',
      'ff0066',  'ff0099',  'ff00cc',  'ff33ff',
      'cc0099',  'cc66cc',  'cc99ff',  'cc33ff',
      'cc00cc',  '9900cc',  'cc99cc',  '663366',
      '9933cc',  '9900ff',  '9966cc',  '663399',
      '6600cc',  '330066',  '6633ff',  '9999ff',
      '6666cc',  '666699',  '333399',  '3300cc',
      '3333ff',  '0066ff',  '3366ff',  '000066',
      '0000ff',  '0033cc',  '336699',  '99ccff',
      '003366',  '006699',  '0099cc',  '3399ff',
      '0099ff',  '00ccff',  '66ffff',  '00ffff',
      '009999',  '99cccc',  '33cccc',  '339999',
      '006666',  '00ffcc',  '33cc99',  '66ffcc',
      '00ff99',  '006633',  '669966',  '99ff99',
      '339933',  '66ff99',  '33cc66',  '66cc99',
      '009933',  '00ff66',  'ccff99',  '99ff33',
      '33ff33',  '33cc33',  '00ff00',  '006600',
      '009900',  '66ff00',  '66cc00',  '33cc00',
      '99cc66',  '99cc33',  '669900',  'ccff66',
      'ccff00',  'cccc00',  '333300',  '999933',
      '666633',  'cccc99',  'ffff99',  'ffff33',
      'ffcc00',  'ffcc33',  '996600',  'ff9900',
      '993300',  '663300',  'ff6633',  'ff6600',
      '996633',  '663333',  'cc9999',  'cc6666',
      'ff3333',  'ff6666',  '990000',  'ff0000',
      'cc9966',  'ffffff',  '999999',  '333333',
      '000000',  '000000',
    ];

    // Option defaults
    options = $.extend({
      defaultColor:     this.attr('defaultColor') || '#FFF',
      cellWidth:        this.attr('cellWidth') || 10,
      cellHeight:       this.attr('cellHeight') || 10,
      cellMargin:       this.attr('cellMargin') || 1,
      boxWidth:         this.attr('boxWidth') || '115px',
      boxHeight:        this.attr('boxHeight') || '20px',
      columns:          this.attr('columns') || 16,
      insert:           this.attr('insert') || 'after',
      colors:           this.attr('colors') || defaultColors,
      displayColorCode: this.attr('displayColorCode') || false,
      colorCodeAlign:   this.attr('colorCodeAlign') || 'center',
      colorCodeColor:   this.attr('colorCodeColor') || '#FFF',
      onSelect:         null,
      onCellEnter:      null,
      onClose:          null,
      livePreview:      false
    }, options || {});

    // Figure out the cell dimensions
    options.totalWidth = options.columns * (options.cellWidth + (2 * options.cellMargin));

    // Custom CSS for the chooser, which relies on previously defined options.
    options.chooserCSS = $.extend({
      'border':           '1px solid #000',
      'margin':           '0 0 0 5px',
      'width':            options.totalWidth,
      'height':           options.totalHeight,
      'top':              0,
      'left':             options.boxWidth,
      'position':         'absolute',
      'background-color': '#fff'
    }, options.chooserCSS || {});

    // Custom CSS for the display box, which relies on previously defined options.
    options.displayCSS = $.extend({
      'background-color': options.defaultColor,
      'border':           '1px solid #000',
      'width':            options.boxWidth,
      'height':           options.boxHeight,
      'line-height':      options.boxHeight + 'px',
      'cursor':           'pointer'
    }, options.displayCSS || {});

    // Hide the input
    this.hide();

    // this should probably do feature detection - I don't know why we need +2 for IE
    // but this works for jQuery 1.9.1
    if (navigator.userAgent.indexOf("MSIE")!=-1){
      options.totalWidth += 2;
    }

    options.totalHeight = Math.ceil(options.colors.length / options.columns) * (options.cellHeight + (2 * options.cellMargin));

    // Store these options so they'll be available to the other functions
    // TODO - must be a better way to do this, not sure what the 'official'
    // jQuery method is. Ideally i want to pass these as a parameter to the
    // each() function but i'm not sure how
    $.simpleColorOptions = options;

    function buildChooser(index) {
      options = $.simpleColorOptions;

      // Create a container to hold everything
      var container = $("<div class='simpleColorContainer' />");

      // Absolutely positioned child elements now 'work'.
			container.css('position', 'relative');

      // Create the color display box
      var defaultColor = (this.value && this.value != '') ? this.value : options.defaultColor;

      var displayBox = $("<div class='simpleColorDisplay' />");
      displayBox.css($.extend(options.displayCSS, { 'background-color': defaultColor }));
      displayBox.data('color', defaultColor);
      container.append(displayBox);

      // If 'displayColorCode' is turned on, display the currently selected color code as text inside the button.
      if (options.displayColorCode) {
        displayBox.data('displayColorCode', true);
        displayBox.text(this.value);
        displayBox.css({
          'color':     options.colorCodeColor,
          'textAlign': options.colorCodeAlign
        });
      }

      var selectCallback = function (event) {
        // Bind and namespace the click listener only when the chooser is
        // displayed. Unbind when the chooser is closed.
        $('html').bind("click.simpleColorDisplay", function(e) {
          $('html').unbind("click.simpleColorDisplay");
          $('.simpleColorChooser').hide();

          // If the user has not selected a new color, then revert the display.
          // Makes sure the selected cell is within the current color chooser.
          var target = $(e.target);
          if (target.is('.simpleColorCell') === false || $.contains( $(event.target).closest('.simpleColorContainer')[0], target[0]) === false) {
            displayBox.css('background-color', displayBox.data('color'));
            if (options.displayColorCode) {
              displayBox.text(displayBox.data('color'));
            }
          }
          // Execute onClose callback whenever the color chooser is closed.
          if (options.onClose) {
            options.onClose(element);
          }
        });

        // Use an existing chooser if there is one
        if (event.data.container.chooser) {
          event.data.container.chooser.toggle();

        // Build the chooser.
        } else {
          // Make a chooser div to hold the cells
          var chooser = $("<div class='simpleColorChooser'/>");
          chooser.css(options.chooserCSS);

          event.data.container.chooser = chooser;
          event.data.container.append(chooser);

          // Create the cells
          for (var i=0; i<options.colors.length; i++) {
            var cell = $("<div class='simpleColorCell' id='" + options.colors[i] + "'/>");
            cell.css({
              'width':            options.cellWidth + 'px',
              'height':           options.cellHeight + 'px',
              'margin':           options.cellMargin + 'px',
              'cursor':           'pointer',
              'lineHeight':       options.cellHeight + 'px',
              'fontSize':         '1px',
              'float':            'left',
              'background-color': '#'+options.colors[i]
            });
            chooser.append(cell);
            if (options.onCellEnter || options.livePreview) {
              cell.bind('mouseenter', function(event) {
                if (options.onCellEnter) {
                  options.onCellEnter(this.id, element);
                }
                if (options.livePreview) {
                  displayBox.css('background-color', '#' + this.id);
                  if (options.displayColorCode) {
                    displayBox.text('#' + this.id);
                  }
                }
              });
            }
            cell.bind('click', {
              input: event.data.input,
              chooser: chooser,
              displayBox: displayBox
            },
            function(event) {
              var color = '#' + this.id
              event.data.input.value = color;
              $(event.data.input).change();
              $(event.data.displayBox).data('color', color);
              event.data.displayBox.css('background-color', color);
              event.data.chooser.hide();

              // If 'displayColorCode' is turned on, display the currently selected color code as text inside the button.
              if (options.displayColorCode) {
                event.data.displayBox.text(color);
              }

              // If an onSelect callback function is defined then excecute it.
              if (options.onSelect) {
                options.onSelect(this.id, element);
              }
            });
          }
        }
      };

      // Also bind the display box button to display the chooser.
      var callbackParams = {
        input:      this,
        container:  container,
        displayBox: displayBox
      };
      displayBox.bind('click', callbackParams, selectCallback);

      $(this).after(container);
      $(this).data('container', container);
    };

    this.each(buildChooser);

    $('.simpleColorDisplay').each(function() {
      $(this).click(function(e){
        e.stopPropagation();
      });
    });

    return this;
  };

  /*
   * Close the given color choosers.
   */
  $.fn.closeChooser = function() {
    this.each( function(index) {
      $(this).data('container').find('.simpleColorChooser').hide();
    });

    return this;
  };

  /*
   * Set the color of the given color choosers.
   */
  $.fn.setColor = function(color) {
    this.each( function(index) {
      var displayBox = $(this).data('container').find('.simpleColorDisplay');
      displayBox.css('background-color', color).data('color', color);
      if (displayBox.data('displayColorCode') === true) {
        displayBox.text(color);
      }
    });

    return this;
  };

})(jQuery);
