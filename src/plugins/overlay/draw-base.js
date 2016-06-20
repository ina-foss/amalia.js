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
 * Base class for draw component
 * @class DrawBase
 * @namespace fr.ina.amalia.player.plugins.overlay
 * @module plugin
 * @submodule plugin-overlay
 * @constructor
 * @param {Object} settings Defines the configuration of this class
 * @param {Object} mediaPlayer
 * @param {Object} data
 */
$.Class("fr.ina.amalia.player.plugins.overlay.DrawBase", {
        classCss: "draw-base",
        eventTypes: {
            CLICK: "fr.ina.amalia.player.plugins.overlay.DrawBase.eventTypes.CLICK"
        }
    },
    {
        /**
         * Defines configuration
         * @property settings
         * @type {Object}
         * @default {}
         */
        settings: {},
        /**
         * In charge to render messages in the web console output
         * @property logger
         * @type {Object}
         * @default null
         */
        logger: null,
        /**
         * In charge to render messages in the web console output
         * @property container
         * @type {Object}
         * @default null
         */
        container: null,
        /**
         * In charge to render messages in the web console output
         * @property mediaPlayer
         * @type {Object}
         * @default null
         */
        mediaPlayer: null,
        /**
         * Component container element
         * @property element
         * @type {Object}
         * @default null
         */
        element: null,
        /**
         * Label container element
         * @property labelElement
         * @type {Object}
         * @default null
         */
        labelElement: null,
        /**
         * Spatial data
         * @property data
         * @type {Object}
         * @default null
         */
        data: null,
        /**
         * Main canvas paper
         * @property paper
         * @type {Object}
         * @default null
         */
        paper: null,
        /**
         * Main canvas paper
         * @property shape
         * @type {Object}
         * @default null
         */
        shape: null,
        /**
         * Localisation manager
         * @property localisationManager
         * @type {Object}
         * @default null
         */
        localisationManager: null,
        /**
         * overlay manager
         * @property overlayManager
         * @type {Object}
         * @default null
         */
        overlayManager: null,
        /**
         * Init
         * @constructor
         * @param {Object} settings
         * @param {Object} mediaPlayer
         * @param {Object} data
         */
        init: function (settings, mediaPlayer, data, overlayManager) {
            this.mediaPlayer = mediaPlayer;
            this.data = data;
            this.overlayManager = overlayManager;
            this.localisationManager = new fr.ina.amalia.player.LocalisationManager();
            this.settings = $.extend({
                    debug: false,
                    container: null,
                    canvas: null,
                    demo: false,
                    editable: false,
                    metadataId: '',
                    style: {
                        'fill': "#00CCFF",
                        'strokeWidth': 1,
                        'stroke': '#000',
                        'fillOpacity': 0.0,
                        'strokeDasharray': "- "
                    },
                    labelStyle: {
                        font: "12px Arial",
                        opacity: 1,
                        fill: "#00CCFF",
                        strokeWidth: 1,
                        stroke: '#000',
                        fillOpacity: 0.0
                    }
                },
                settings || {});
            this.paper = this.settings.canvas;
            this.container = this.settings.container;
            if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined") {
                this.logger = new fr.ina.amalia.player.log.LogHandler({
                    enabled: this.settings.debug
                });
            }
            if (typeof this.settings.canvas === "object" && this.data !== null) {
                this.initialize();
            }
            if (this.mediaPlayer !== null) {
                var mainContainer = this.mediaPlayer.getContainer();
                mainContainer.on(fr.ina.amalia.player.PlayerEventType.PLAYING, {
                    self: this
                }, this.onPlay);
                mainContainer.on(fr.ina.amalia.player.PlayerEventType.PAUSED, {
                    self: this
                }, this.onPause);
                mainContainer.on(fr.ina.amalia.player.PlayerEventType.SEEK, {
                    self: this
                }, this.onSeek);
            }
        },
        /**
         * Initialize
         * @method initialize
         */
        initialize: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "initialize");
                this.logger.info(this.data);
            }
        },
        /**
         * Return default style component
         * @method getStyle
         * @return {Object}
         */
        getStyle: function () {

            return {
                'fill': this.settings.style.fill,
                'stroke': (this.data.hasOwnProperty('color') && this.data.color !== "" && typeof this.data.color !== "undefined") ? this.data.color : this.settings.style.stroke,
                'stroke-width': this.settings.style.strokeWidth,
                'fill-opacity': this.settings.style.fillOpacity,
                'stroke-dasharray': this.settings.style.strokeDasharray
            };
        },
        /**
         * Return default style component
         * @method getLabelStyle
         * @return {Object}
         */
        getLabelStyle: function () {
            return {
                'font': this.settings.labelStyle.font,
                'opacity': this.settings.labelStyle.opacity,
                'fill': this.settings.labelStyle.fill,
                'stroke': this.settings.labelStyle.stroke,
                'stroke-width': this.settings.labelStyle.strokeWidth,
                'fill-opacity': this.settings.labelStyle.fillOpacity
            };
        },
        /**
         * In charge to plug free transform object
         * @returns {undefined}
         */
        plugFreeTransformObject: function () {
            if (this.element.attrs !== null) {
                var transformConfig = {
                    keepRatio: false,
                    fill: 'black',
                    draw: [
                        'bbox',
                        'circle'
                    ],
                    range: {
                        scale: [
                            0,
                            99999
                        ]
                    }
                };
                var _ft = this.settings.canvas.freeTransform(this.element, transformConfig, this.onTransformationCallback);
                _ft.self = this;
            }
        },
        /**
         * In charge to plug free transform object
         * @returns {undefined}
         */
        unplugFreeTransformObject: function () {
            if (this.element.hasOwnProperty('freeTransform') && this.element.freeTransform !== null) {
                this.element.freeTransform.unplug();
            }
        },
        /**
         * In charge to update shape position
         * @param {Object} shape
         * @param {Object} shapePos
         */
        updatePosShape: function (shapePos) {
            var _player = this.mediaPlayer;
            var tc = _player.getCurrentTime();
            if (this.data.hasOwnProperty('refLoc') && typeof this.data.refLoc === "object" && this.data.refLoc.tc !== tc) {
                if (this.data.refLoc.hasOwnProperty('sublocalisations') === false || this.data.refLoc.sublocalisations === null || typeof this.data.refLoc.sublocalisations !== "object") {
                    //init sublocalisation
                    this.data.refLoc.sublocalisations = {
                        localisation: []
                    };
                    var oldTc = parseFloat(this.data.refLoc.tc);
                    var firstShapePos = jQuery.extend({}, {
                        tc: oldTc,
                        shape: this.data.refLoc.shape,
                        tclevel: 1

                    });
                    this.data.refLoc.sublocalisations.localisation.push(firstShapePos);
                    this.data.refLoc.shape = null;
                    if (oldTc < tc) {
                        this.data.refLoc.tcin = oldTc;
                        this.data.refLoc.tc = oldTc;
                        this.data.refLoc.tcout = tc;
                    }
                    else {
                        this.data.refLoc.tcin = tc;
                        this.data.refLoc.tc = tc;
                        this.data.refLoc.tcout = oldTc;
                    }
                }
                //search if localisations pos for this tc
                var duplicateItem = $.grep(this.data.refLoc.sublocalisations.localisation, function (a) {
                    return a.tc === tc;
                });
                if (duplicateItem.length > 0) {
                    duplicateItem[0].shape = shapePos;
                }
                else {
                    // add new shap pos
                    this.data.refLoc.sublocalisations.localisation.push({
                        tc: tc,
                        shape: shapePos,
                        tclevel: 1
                    });
                }

                _player.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.DATA_CHANGE, {
                    id: this.data.hasOwnProperty('metadataId') ? this.data.metadataId : _player.getSelectedMetadataId()
                });
            }
            else if (this.data.hasOwnProperty('refLoc') && typeof this.data.refLoc === "object") {
                this.data.refLoc.shape = shapePos;
                _player.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.DATA_CHANGE, {
                    id: this.data.hasOwnProperty('metadataId') ? this.data.metadataId : _player.getSelectedMetadataId()
                });
            }
        },
        /**
         * Fired on click event
         * @method onClick
         * @param {Object} event
         */
        onClick: function (event) {
            if (event.data.self.container !== null) {
                event.data.self.container.trigger(fr.ina.amalia.player.plugins.overlay.DrawBase.eventTypes.CLICK, {
                    'tcin': event.data.tcin,
                    'tcout': event.data.tcout,
                    'data': event.data.data
                });
            }
        },
        /**
         * Fired on play event
         * @method onPlay
         * @param {Object} event
         */
        onPlay: function (event) {
            if (event.data.self.element !== null) {
                if (event.data.self.settings.editable === true) {
                    event.data.self.unplugFreeTransformObject();
                }
                event.data.self.element.resume();
                if (event.data.self.labelElement !== null) {
                    event.data.self.labelElement.resume();
                }
            }
        },
        /**
         * Fired on pause event
         * @method onPause
         * @param {Object} event
         */
        onPause: function (event) {
            if (event.data.self.element !== null) {
                event.data.self.element.pause();
                if (event.data.self.labelElement !== null) {
                    event.data.self.labelElement.pause();
                }
                if (event.data.self.settings.editable === true) {
                    event.data.self.unplugFreeTransformObject();
                    event.data.self.plugFreeTransformObject();
                }
            }
        },
        /**
         * Fired on seek event to clear canvas
         * @method onSeek
         * @param {Object} event
         */
        onSeek: function (event) {
            if (event.data.self.settings.editable === true) {
                event.data.self.unplugFreeTransformObject();
            }
            event.data.self.element.remove();
            if (event.data.self.labelElement !== null) {
                event.data.self.labelElement.remove();
            }
        },
        /**
         * Fired when an animation was complete.
         * @method onEndOfAnimation
         */
        onEndOfAnimation: function () {
            if (this.data.hasOwnProperty('self') && this.data.self.settings.editable === true) {
                this.data('self').unplugFreeTransformObject();
            }
            if (this.data('demo') !== true) {
                this.remove();
            }
        },
        /**
         * Call when end transformation
         * @param {type} ft
         * @param {type} events
         */
        onTransformationCallback: function (ft, events) {
            if ($.inArray('init', events) === -1 && ft.self.overlayManager.getEraseState() === true) {
                if (ft.self.data.refLoc.hasOwnProperty('sublocalisations') && ft.self.data.refLoc.sublocalisations !== null && ft.self.data.refLoc.sublocalisations.hasOwnProperty('localisation') && ft.self.data.refLoc.sublocalisations.localisation !== null) {
                    var localisations = ft.self.data.refLoc.sublocalisations.localisation;
                    for (var i = 0; i < localisations.length; i++) {
                        var loc = localisations[i];
                        if (loc.tc === ft.self.data.tcout) {
                            localisations.splice(i, 1);
                        }
                    }
                }
                else {
                    ft.self.data.refLoc.delete = true;
                    ft.self.data.refLoc.tc = null;
                    ft.self.data.refLoc.tcin = null;
                }
                ft.unplug();
                ft.subject.remove();
                ft.self.localisationManager.updateLocBlock(ft.self.mediaPlayer.getMetadataById(ft.self.data.metadataId));
                ft.self.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.DATA_CHANGE, {
                    id: ft.self.data.hasOwnProperty('metadataId') ? ft.self.data.metadataId : ft.self.mediaPlayer.getSelectedMetadataId()
                });
                ft.self.overlayManager.setEraseState(false);
            } else if ($.inArray('drag end', events) > -1 || $.inArray('scale end', events) > -1) {
                //translate pos is a center object
                var _shapePos = {
                    c: {
                        x: parseFloat((ft.attrs.center.x + ft.attrs.translate.x) / ft.self.paper.width),
                        y: parseFloat((ft.attrs.center.y + ft.attrs.translate.y) / ft.self.paper.height)
                    },
                    rx: parseFloat((ft.attrs.size.x * ft.attrs.scale.x) / 2 / ft.self.paper.width),
                    ry: parseFloat((ft.attrs.size.y * ft.attrs.scale.y) / 2 / ft.self.paper.height),
                    o: parseFloat(ft.attrs.rotate),
                    t: ft.self.shape
                };
                ft.self.updatePosShape(_shapePos);
            }
        }
    });
