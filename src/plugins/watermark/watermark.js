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
 * In charge to watermark plugin
 * @class WatermarkPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-watermark
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBase.extend( "fr.ina.amalia.player.plugins.WatermarkPlugin",{
    classCss : "ajs-plugin plugin-watermark",
    eventTypes : {}
},
{
    /**
     * Main container of this plugin
     * @property container
     * @type {Object}
     * @default []
     */
    container : null,
    /**
     * Ratio of disply object
     * @property ratio
     * @type {Object}
     * @default []
     */
    ratio : 0,
    /**
     * Object position
     * @property placement
     * @type {Object}
     * @default []
     */
    placement : '',
    /**
     * List of positions
     * @property placementList
     * @type {Object}
     * @default []
     */
    placementList : [
        // Center
        'c',
        // Top left
        'tl',
        // TopRight
        'tr',
        // BottomLeft
        'bl',
        // BottomRight
        'br'
    ],
    /**
     * Initialize watermark plugin and create container of this plugin
     * @method initialize
     */
    initialize : function ()
    {
        this._super();
        this.settings = $.extend( {
            backgroundImageUrl : '',
            ratio : 50,
            placement : 'c',
            imageWidth : 0,
            imageHeight : 0,
            topOffet : 45
        },
        this.settings.parameters || {} );
        this.setPlacement( this.settings.placement );
        this.container = $( '<div>',{
            'class' : this.Class.classCss
        } );
        this.pluginContainer.append( this.container );
        this.defineListeners();
    },
    /**
     * Set player events
     * @method defineListeners
     */
    defineListeners : function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();
        // Player events
        player.one( fr.ina.amalia.player.PlayerEventType.TIME_CHANGE,{
            self : this
        },
        this.onPluginReady );
        // call function 200 ms after resize is complete.
        $( window ).on( 'debouncedresize',{
            self : this
        },
        this.onWindowResize );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"definePlayerListeners" );
        }
    },
    /**
     * Initialize watermark plugin on load start event and create plugin
     * container
     * @method initializeOnLoadStart
     * @returns {undefined}
     */
    initializeOnLoadStart : function ()
    {
        this.createWatermarkElement();
    },
    /**
     * In charge to create watermark element
     * @method createWatermarkElement
     */
    createWatermarkElement : function ()
    {
        var watermark = $( '<div>',{
            style : 'background-image: url(' + this.settings.backgroundImageUrl + ');',
            'class' : 'watermark'
        } );
        this.container.append( watermark );
        this.updatePos();
    },
    /**
     * In charge of update positions
     * @method updatePos
     */
    updatePos : function ()
    {
        var videoSize = this.getVideoSize();
        var width = videoSize.w;
        var height = videoSize.h;
        var left = (this.container.width() - width) / 2;
        var top = (this.container.height() - height - this.settings.topOffet) / 2;
        this.container.find( '.watermark' ).css( {
            width : width + 'px',
            height : height + 'px',
            top : top + 'px',
            left : left + 'px'
        } );
        this.updateImagePositionWithPlacement();
        this.updateImageSize();
    },
    /**
     * Set image size
     * @method updateImageSize
     */
    updateImageSize : function ()
    {
        var videoSize = this.getVideoSize();
        var rw = videoSize.w / this.settings.imageWidth;
        var rh = videoSize.h / this.settings.imageHeight;
        var ratio = Math.min( rw,rh );
        ratio = ratio * (this.settings.ratio / 100);
        var w = ratio * this.settings.imageWidth;
        var h = ratio * this.settings.imageHeight;
        var watermarkElement = this.container.find( '.watermark' );
        watermarkElement.css( 'background-size',w + 'px ' + h + 'px' );
    },
    /**
     * In charge of set image position with specified configuration
     * @method updateImagePositionWithPlacement
     */
    updateImagePositionWithPlacement : function ()
    {
        var watermarkElement = this.container.find( '.watermark' );
        // Default Center
        var x = '50%';
        var y = '50%';
        if (this.placement === 'tl')
        {
            // Top left
            x = '0%';
            y = '0%';
        }
        else if (this.placement === 'tr')
        {
            // TopRight
            x = '100%';
            y = '0%';
        }
        else if (this.placement === 'bl')
        {
            // BottomLeft
            x = '0%';
            y = '100%';
        }
        else if (this.placement === 'br')
        {
            // BottomRight
            x = '100%';
            y = '100%';
        }

        watermarkElement.css( 'background-position',x + ' ' + y );
    },
    /**
     * Return video size
     * @method getVideoSize
     * @return {Object}
     */
    getVideoSize : function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();
        var videoHeight = player.get( 0 ).videoHeight;
        var videoWidth = player.get( 0 ).videoWidth;
        if (videoHeight === 0)
        {
            videoHeight = player.height();
        }
        if (videoWidth === 0)
        {
            videoWidth = player.width();
        }
        var widthRatio = player.width() / videoWidth;
        var heightRatio = player.height() / videoHeight;
        var ratio = Math.min( widthRatio,heightRatio );
        return {
            w : ratio * videoWidth,
            h : ratio * videoHeight
        };
    },
    /**
     * Return image position
     * @method getPosition
     * @return {String}
     */
    getPosition : function ()
    {
        return this.placement;
    },
    /**
     * Set image position$
     * @method setPlacement
     * @param {String} placement
     */
    setPlacement : function (placement)
    {
        if ($.inArray( placement,this.placementList ) === -1)
        {
            this.placement = this.placementList[0].toString();
        }
        else
        {
            this.placement = placement.toString();
        }
    },
    /** Player Events * */
    /**
     * Fired when plugin ready event
     * @method onPluginReady
     * @param {Object} event
     */
    onPluginReady : function (event)
    {
        event.data.self.initializeOnLoadStart();
    },
    /**
     * Fired on windows resize event
     * @method onWindowResize
     * @param {Object} event
     */
    onWindowResize : function (event)
    {
        event.data.self.updatePos();
    }
} );
