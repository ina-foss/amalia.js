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
$.Class( "fr.ina.amalia.player.plugins.overlay.DrawBase",{
    classCss : "draw-base",
    eventTypes : {
        CLICK : "fr.ina.amalia.player.plugins.overlay.DrawBase.eventTypes.CLICK"
    }
},
{
    /**
     * Defines configuration
     * @property settings
     * @type {Object}
     * @default {}
     */
    settings : {},
    /**
     * In charge to render messages in the web console output
     * @property logger
     * @type {Object}
     * @default null
     */
    logger : null,
    /**
     * In charge to render messages in the web console output
     * @property container
     * @type {Object}
     * @default null
     */
    container : null,
    /**
     * In charge to render messages in the web console output
     * @property mediaPlayer
     * @type {Object}
     * @default null
     */
    mediaPlayer : null,
    /**
     * Component container element
     * @property element
     * @type {Object}
     * @default null
     */
    element : null,
    /**
     * Label container element
     * @property labelElement
     * @type {Object}
     * @default null
     */
    labelElement : null,
    /**
     * Spatial data
     * @property data
     * @type {Object}
     * @default null
     */
    data : null,
    /**
     * Main canvas paper
     * @property paper
     * @type {Object}
     * @default null
     */
    paper : null,
    /**
     * Main canvas paper
     * @property shape
     * @type {Object}
     * @default null
     */
    shape : null,
    /**
     * Init
     * @constructor
     * @param {Object} settings
     * @param {Object} mediaPlayer
     * @param {Object} data
     */
    init : function (settings,mediaPlayer,data)
    {
        this.mediaPlayer = mediaPlayer;
        this.data = data;
        this.settings = $.extend( {
            debug : false,
            container : null,
            canvas : null,
            demo : false,
            editable : false,
            style : {
                'fill' : "#00CCFF",
                'strokeWidth' : 1,
                'stroke' : '#000',
                'fillOpacity' : 0.0,
                'strokeDasharray' : "- "
            }
        },
        settings || {} );
        this.paper = this.settings.canvas;
        this.container = this.settings.container;
        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined")
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        if (typeof this.settings.canvas === "object" && this.data !== null)
        {
            this.initialize();
        }
        if (this.mediaPlayer !== null)
        {
            var player = this.mediaPlayer.getMediaPlayer();
            player.on( fr.ina.amalia.player.PlayerEventType.PLAYING,{
                self : this
            },
            this.onPlay );
            player.on( fr.ina.amalia.player.PlayerEventType.PAUSED,{
                self : this
            },
            this.onPause );

            player.on( fr.ina.amalia.player.PlayerEventType.SEEK,{
                self : this
            },
            this.onSeek );

        }
    },
    /**
     * Initialize
     * @method initialize
     */
    initialize : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initialize" );
            this.logger.info( this.data );
        }
    },
    /**
     * Return default style component
     * @method getStyle
     * @return {Object}
     */
    getStyle : function ()
    {
        return {
            'fill' : this.settings.style.fill,
            'stroke' : this.settings.style.stroke,
            'stroke-width' : this.settings.style.strokeWidth,
            'fill-opacity' : this.settings.style.fillOpacity,
            'stroke-dasharray' : this.settings.style.strokeDasharray
        };
    },
    /**
     * In charge to plug free transform object
     * @returns {undefined}
     */
    plugFreeTransformObject : function ()
    {
        if (this.element.attrs !== null)
        {
            var transformConfig = {
                keepRatio : false,
                fill : 'black',
                draw : [
                    'bbox',
                    'circle'
                ],
                range : {
                    scale : [
                        0,
                        99999
                    ]
                }
            };
            var _ft = this.settings.canvas.freeTransform( this.element,transformConfig,this.onTransformationCallback );
            _ft.self = this;
        }
    },
    /**
     * In charge to plug free transform object
     * @returns {undefined}
     */
    unplugFreeTransformObject : function ()
    {
        if (this.element.hasOwnProperty( 'freeTransform' ) && this.element.freeTransform !== null)
        {
            this.element.freeTransform.unplug();
        }
    },
    /**
     * In charge to update shape position
     * @param {Object} shape
     * @param {Object} shapePos
     */
    updatePosShape : function (shapePos)
    {
        var _player = this.mediaPlayer;
        var tc = _player.getCurrentTime();
        if (this.data.hasOwnProperty( 'refLoc' ) && typeof this.data.refLoc === "object" && this.data.refLoc.tc !== tc)
        {
            if (this.data.refLoc.hasOwnProperty( 'sublocalisations' ) === false || this.data.refLoc.sublocalisations === null || typeof this.data.refLoc.sublocalisations !== "object")
            {
                //init sublocalisation
                this.data.refLoc.sublocalisations = {
                    localisation : [
                    ]
                };
                var oldTc = parseFloat( this.data.refLoc.tc );
                var firstShapePos = jQuery.extend( {},{
                    tc : oldTc,
                    shape : this.data.refLoc.shape,
                    tclevel : 1

                } );
                this.data.refLoc.sublocalisations.localisation.push( firstShapePos );
                this.data.refLoc.shape = null;
                if (oldTc < tc)
                {
                    this.data.refLoc.tcin = oldTc;
                    this.data.refLoc.tc = oldTc;
                    this.data.refLoc.tcout = tc;
                }
                else
                {
                    this.data.refLoc.tcin = tc;
                    this.data.refLoc.tc = tc;
                    this.data.refLoc.tcout = oldTc;
                }
            }
            //search if localisations pos for this tc
            var duplicateItem = $.grep( this.data.refLoc.sublocalisations.localisation,function (a) {
                return a.tc === tc;
            } );
            if (duplicateItem.length > 0)
            {
                duplicateItem[0].shape = shapePos;
            }
            else
            {
                // add new shap pos
                this.data.refLoc.sublocalisations.localisation.push( {
                    tc : tc,
                    shape : shapePos,
                    tclevel : 1
                } );
            }

            _player.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                id : this.data.hasOwnProperty( 'metadataId' ) ? this.data.metadataId : _player.getSelectedMetadataId()
            } );
        }
        else if (this.data.hasOwnProperty( 'refLoc' ) && typeof this.data.refLoc === "object")
        {
            this.data.refLoc.shape = shapePos;
            _player.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                id : this.data.hasOwnProperty( 'metadataId' ) ? this.data.metadataId : _player.getSelectedMetadataId()
            } );
        }
    },
    /**
     * Fired on click event
     * @method onClick
     * @param {Object} event
     */
    onClick : function (event)
    {
        if (event.data.self.container !== null)
        {
            event.data.self.container.trigger( fr.ina.amalia.player.plugins.overlay.DrawBase.eventTypes.CLICK,{
                'tcin' : event.data.tcin,
                'tcout' : event.data.tcout,
                'data' : event.data.data
            } );
        }
    },
    /**
     * Fired on play event
     * @method onPlay
     * @param {Object} event
     */
    onPlay : function (event)
    {
        if (event.data.self.element !== null)
        {
            if (event.data.self.settings.editable === true)
            {
                event.data.self.unplugFreeTransformObject();
            }
            event.data.self.element.resume();
        }
    },
    /**
     * Fired on pause event
     * @method onPause
     * @param {Object} event
     */
    onPause : function (event)
    {
        if (event.data.self.element !== null)
        {
            event.data.self.element.pause();
            if (event.data.self.settings.editable === true)
            {
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
    onSeek : function (event)
    {
        if (event.data.self.settings.editable === true)
        {
            event.data.self.unplugFreeTransformObject();
        }
        event.data.self.element.remove();
    },
    /**
     * Fired when an animation was complete.
     * @method onEndOfAnimation
     */
    onEndOfAnimation : function ()
    {
        if (this.data( 'self' ).settings.editable === true)
        {
            this.data( 'self' ).unplugFreeTransformObject();
        }
        if (this.data( 'demo' ) !== true)
        {
            this.remove();
        }
    },
    /**
     * Call when end transformation
     * @param {type} ft
     * @param {type} events
     */
    onTransformationCallback : function (ft,events)
    {
        if ($.inArray( 'drag end',events ) > -1 || $.inArray( 'scale end',events ) > -1)
        {
            //translate pos is a center object
            var _shapePos = {
                c : {
                    x : parseFloat( (ft.attrs.center.x + ft.attrs.translate.x) / ft.self.paper.width ),
                    y : parseFloat( (ft.attrs.center.y + ft.attrs.translate.y) / ft.self.paper.height )
                },
                rx : parseFloat( (ft.attrs.size.x * ft.attrs.scale.x) / 2 / ft.self.paper.width ),
                ry : parseFloat( (ft.attrs.size.y * ft.attrs.scale.y) / 2 / ft.self.paper.height ),
                o : parseFloat( ft.attrs.rotate ),
                t : ft.self.shape
            };

            ft.self.updatePosShape( _shapePos );

        }
    }
} );
