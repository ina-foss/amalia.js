/**
 * Copyright (c) 2015 Institut National de l'Audiovisuel, INA
 *
 * This file is part of amalia.js
 *
 * Amalia.js is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version
 *
 * Redistributions of source code, javascript and css minified versions must
 * retain the above copyright notice, this list of conditions and the following
 * disclaimer
 *
 * Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission
 *
 * You should have received a copy of the GNU General Public License along with
 * amalia.js. If not, see <http://www.gnu.org/licenses/>
 *
 * Amalia.js is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details
 */
/**
 * In charge to handle histogram component
 * @class HistogramComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @extends fr.ina.amalia.player.plugins.timeline.BaseComponent
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.timeline.BaseComponent.extend("fr.ina.amalia.player.plugins.timeline.HistogramComponent", {
        ComponentClassCss: "histogram-component",
        ComponentModuleClassCss: "module-histogram",
        eventTypes: {}
    },
    {
        /**
         * Creates a canvas object on which to draw.
         * @property canvas
         * @type Object
         * @default "null"
         */
        canvas: null,
        /**
         * If true, histogram was created.
         * @property histogramIsCreated
         * @type Boolean
         * @default False
         */
        histogramIsCreated: false,
        initialize: function () {
            this._super();
            this.settings = $.extend({
                mirror: false,
                color: '#ffffff'
                // in charge to duplicate hitogram line
            }, this.settings || {});
            this.histogramIsCreated = false;
            this.canvas = new Raphael(this.mainContainer.find('.line-content').get(0));
            this.mainContainer.on('click', {
                self: this
            }, this.onClickAtHistogram);
        },
        /**
         * In charge to create a histogram into the composant container.
         * @param {String} posbins string data encode in base64
         * @param {Number} posmax max positive values
         * @param {String} negbins string data encode in base64
         * @param {Number} negmax max negatif values
         * @param {Number} nbbins nombre de valeurs
         */
        createHistogram: function (posbins, posmax, negbins, negmax, nbbins) {
            var positiveValues = fr.ina.amalia.player.helpers.UtilitiesHelper.base64DecToArr(posbins, nbbins);
            var negativeValues = null;
            var maxHeight = parseInt(posmax);
            if (negbins !== null && negmax !== null) {
                negativeValues = fr.ina.amalia.player.helpers.UtilitiesHelper.base64DecToArr(negbins, nbbins);
                maxHeight = parseInt(posmax + negmax);
            }
            this.canvas.setViewBox(0, 0, nbbins, maxHeight, false);
            this.canvas.setSize('100%', '100%');
            this.canvas.canvas.setAttribute('preserveAspectRatio', 'none');
            var itemPositiveValue = null;
            var itemNegativeValue = null;
            var color = typeof this.settings.color === "undefined" ? "#FFFFFF" : this.settings.color;
            for (var i = 0;
                 i < nbbins;
                 i++) {
                itemPositiveValue = parseInt(positiveValues[i]);
                this.canvas.path('M' + i + ' ' + posmax + 'l 0 -' + itemPositiveValue).attr({
                    'type': 'path',
                    'stroke': color,
                    'stroke-width': '1',
                    'fill': color
                });
                if (negativeValues !== null) {
                    itemNegativeValue = parseInt(negativeValues[i]);
                    this.canvas.path('M' + i + ' ' + negmax + 'l 0 ' + itemNegativeValue).attr({
                        'type': 'path',
                        'stroke': color,
                        'stroke-width': '1',
                        'fill': color
                    });
                }
            }
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "CreateHistogramWithMirror posmax:" + posmax + "  negmax:" + negmax + "/" + " nbbins:" + nbbins);
            }
        },
        /**
         * In charge to create a histogram with mirror to container.
         * @param {String} posbins string data encode in base64
         * @param {Number} posmax max positive values
         * @param {Number} nbbins
         */
        createHistogramWithMirror: function (posbins, posmax, nbbins) {
            var positiveValues = fr.ina.amalia.player.helpers.UtilitiesHelper.base64DecToArr(posbins, nbbins);
            this.canvas.setViewBox(0, 0, nbbins, posmax * 2, false);
            this.canvas.setSize('100%', '100%');
            this.canvas.canvas.setAttribute('preserveAspectRatio', 'none');
            var itemPositiveValue = null;
            for (var i = 0;
                 i < nbbins;
                 i++) {
                itemPositiveValue = parseInt(positiveValues[i]);
                this.canvas.path('M' + i + ' ' + posmax + 'l 0 -' + itemPositiveValue).attr({
                    'type': 'path',
                    'stroke': this.settings.color,
                    'stroke-width': '1',
                    'fill': this.settings.color
                });
                this.canvas.path('M' + i + ' ' + posmax + 'l 0 ' + itemPositiveValue).attr({
                    'type': 'path',
                    'stroke': this.settings.color,
                    'stroke-width': '1',
                    'fill': this.settings.color
                });
            }
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "CreateHistogramWithMirror posmax:" + posmax + "/" + " nbbins:" + nbbins);
            }
        },
        /**
         * Set Zoom Tc
         * @param {Number} tcin
         * @param {Number} tcout
         */
        setZoomTc: function (tcin, tcout) {
            this._super(tcin, tcout);
            if (this.settings.zoomable === true) {
                var _tcin = parseInt(this.settings.tcOffset);
                var _tcout = parseInt(this.settings.duration);
                var dt = _tcout - _tcin;
                var d = this.zTcout - this.zTcin;
                var pW = (100 * dt) / d;
                var left = (pW * (this.zTcin - parseInt(this.settings.tcOffset))) / dt;
                this.mainContainer.find('.line-content').css({
                    'left': -left + '%',
                    'width': pW + '%'
                });
            }
        },
        /**
         * In charge to add histogram
         * @param {Object} data
         */
        addItem: function (data) {
            if (this.histogramIsCreated === false && data.data !== null && data.data.hasOwnProperty('histogram') === true && data.data.histogram !== null && data.data.histogram.length > 0) {
                this.canvas.clear();
                for (var i = 0;
                     i < data.data.histogram.length;
                     i++) {
                    var item = data.data.histogram[i];
                    if (item.hasOwnProperty('posbins') && item.hasOwnProperty('posmax') && item.hasOwnProperty('nbbins')) {
                        try {
                            if (this.settings.mirror === true) {
                                this.createHistogramWithMirror(item.posbins, item.posmax, item.nbbins);
                            }
                            else {
                                this.createHistogram(item.posbins, item.posmax, item.hasOwnProperty('negbins') ? item.negbins : null, item.hasOwnProperty('negmax') ? item.negmax : null, item.nbbins);
                            }
                        }
                        catch (error) {
                            if (this.logger !== null) {
                                this.logger.warn("Error to create histogram");
                                this.logger.warn(error.stack);
                            }
                        }
                    }
                    else if (this.logger !== null) {
                        this.logger.warn(this.Class.fullName + "Error to create histogram");
                        this.logger.warn(item);
                    }
                }
                this.histogramIsCreated = true;
            }
        },
        /**
         * In charge to clear elements
         */
        removeItems: function () {
            // There elements are never deleted.
        },
        /**
         * In  charge to set histogram state
         * @param state
         */
        setHistogramIsCreated: function (state) {
            this.histogramIsCreated = state;
        },
        /**
         * Fired on click event
         * @method onClickAtHistogram
         * @param {Object} event
         */
        onClickAtHistogram: function (event) {
            var currentTarget = $(event.currentTarget);
            var posX = ((event.clientX - currentTarget.offset().left) + currentTarget.position().left) * 100 / event.data.self.mainContainer.width();
            var tc = null;
            if (event.data.self.zoomable === false) {
                tc = ((event.data.self.tcout - event.data.self.tcin) * posX / 100) + parseInt(event.data.self.settings.tcOffset);

            }
            else {
                tc = (((event.data.self.zTcout - event.data.self.zTcin) * posX / 100) + event.data.self.zTcin);
            }
            event.data.self.mainContainer.trigger(event.data.self.Class.CLICK_TC, {
                tc: tc
            });
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onClickAtHistogram");
            }
        }
    });
