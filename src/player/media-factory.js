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
 * Media factory
 * @class MediaFactory
 * @namespace fr.ina.amalia.player
 * @module player
 * @param {Object} mediaContainer
 * @param {Object} settings
 * @constructor
 */
$.Class( "fr.ina.amalia.player.MediaFactory",{},{
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
     * Player dom element
     * @property mediaContainer
     * @type {Object}
     * @default null
     */
    mediaContainer : null,
    /**
     * Player instance
     * @property player
     * @type {Object}
     * @default null
     */
    player : null,
    /**
     * Error message container
     * @property errorContainer
     * @type {Object}
     * @default null
     */
    errorContainer : null,
    /**
     * Init this class
     * @constructor
     * @method init
     * @param {Object} mediaContainer
     * @param {Object} settings
     */
    init : function (mediaContainer,settings)
    {
        this.mediaContainer = $( mediaContainer );
        this.settings = $.extend( {
            src : null,
            poster : "",
            autoplay : false,
            plugins : {},
            callbacks : {},
            debug : false

        },
        settings || {} );
        if (fr.ina.amalia.player.log !== undefined && fr.ina.amalia.player.log.LogHandler !== undefined)
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        this.initialize();
    },
    /**
     * Initialize
     * @method initialize
     * @throws {Object}
     */
    initialize : function ()
    {
        try
        {
            this.loadPlayer();
            if (this.logger !== null)
            {
                this.logger.trace( this.Class.fullName,"initialize" );
            }
        }
        catch (error)
        {
            this.createErrorContainer();
            this.setErrorCode( 8000 );
            if (this.logger !== null)
            {
                this.logger.error( error.stack );
            }

        }
    },
    /**
     * Method for create error container elements.
     * @method createErrorContainer
     */
    createErrorContainer : function ()
    {
        this.errorContainer = $( '<div>',{
            'class' : 'ajs-error'
        } );
        this.errorContainer.hide();
        this.mediaContainer.append( this.errorContainer );
    },
    /**
     * Set error code
     * @method setErrorCode
     * @param {Object} errorCode
     */
    setErrorCode : function (errorCode)
    {
        if (typeof this.errorContainer !== "undefined")
        {
            var messageContainer = $( '<p>',{
                text : fr.ina.amalia.player.PlayerErrorCode.getMessage( errorCode )
            } );
            this.errorContainer.html( messageContainer );
            this.errorContainer.show();
        }
    },
    /**
     * Load player
     * @method loadPlayer
     */
    loadPlayer : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"Load html 5 media player" );
        }
        if (this.src !== null)
        {
            var browserFeatureDetection = new fr.ina.amalia.player.helpers.BrowserFeatureDetection();
            if (browserFeatureDetection.isSupportsVideos())
            {
                this.loadHtml5MediaPlayer();
            }
            else
            {
                if (this.logger !== null)
                {
                    this.logger.error( "Your browser does not support the video tag." );
                }
                throw new Error( "Your browser does not support the video tag." );
            }
        }
        else
        {
            throw new Error( "Can't find media src" );
        }
    },
    /**
     * Load player html5
     * @method loadHtml5MediaPlayer
     */
    loadHtml5MediaPlayer : function ()
    {
        if (this.logger !== null)
        {
            this.logger.info( "Load html 5 media player" );
        }
        this.player = new fr.ina.amalia.player.PlayerHtml5( this.settings,this.mediaContainer );
    },
    /**
     * Return player instance
     * @method getPlayer
     * @returns {Object}
     */
    getPlayer : function ()
    {
        return this.player;
    }
} );
