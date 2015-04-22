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
 * This class provides borwser utility functions.
 * @class BrowserFeatureDetection
 * @namespace fr.ina.amalia.player.helpers
 * @module player-utils
 * @constructor
 * @param {Object} settings Defines the configuration of this class
 */
$.Class( "fr.ina.amalia.player.helpers.BrowserFeatureDetection",{
    /**
     * True if mobile device
     * @method isMobilePlatform
     * @return {Array}
     */
    isMobilePlatform : function ()
    {
        return (navigator.userAgent.match( /(iPod|iPhone|iPad)/ ) || navigator.userAgent.toLowerCase().indexOf( 'android' ) > -1);
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
     * Init this class
     * @constructor
     * @method init
     * @param {Object} settings
     */
    init : function (settings)
    {
        this.settings = $.extend( {
            debug : false
        },
        settings || {} );
        if (fr.ina.amalia.player.log !== undefined && fr.ina.amalia.player.log.LogHandler !== undefined)
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
    },
    /**
     * Method checks if the browser can play the specified audio/video
     * @method isSupportsVideos
     * @returns {Boolean} Return false if browser don't support this audio/video
     * file.
     */
    isSupportsVideos : function ()
    {
        if (!!document.createElement( 'video' ).canPlayType)
        {
            if (this.logger !== null)
            {
                this.logger.info( "Support html5" );
            }
            return true;
        }
        else
        {
            if (this.logger !== null)
            {
                this.logger.info( "Can't support html5" );
            }
            return false;
        }
    },
    /**
     * Method checks if the browser can play the specified mp4 file.
     * @method isSupportsMp4
     * @returns {Boolean} Return false if browser don't this audio/video file.
     */
    isSupportsMp4 : function ()
    {
        if (!this.isSupportsVideos())
        {
            return false;
        }
        else
        {
            var video = document.createElement( "video" );
            if (video.canPlayType( 'video/mp4' ))
            {
                if (this.logger !== null)
                {
                    this.logger.info( "Support mp4" );
                }
                return true;
            }
            else
            {
                if (this.logger !== null)
                {
                    this.logger.info( "Can't support mp4" );
                }
                return false;
            }
        }
    }
} );
