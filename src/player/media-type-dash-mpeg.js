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
 * Desh-mpeg streaming
 * @class DashMpeg
 * @namespace fr.ina.amalia.player.media.type
 * @module player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaPlayer player instance
 */
fr.ina.amalia.player.mediaTypeManager.extend( "fr.ina.amalia.player.media.type.DashMpeg",{},{
    /**
     * Dash context
     * @property context
     * @type {Object}
     * @default null
     */
    context : null,
    /**
     * Dash player instance
     * @property context
     * @type {Object}
     * @default null
     */
    dashPlayer : null,
    /**
     * Initialize dash context
     * @method initialize
     */
    initialize : function ()
    {
        this.context = new Dash.di.DashContext();
        this.dashPlayer = new MediaPlayer( this.context );
    },
    /**
     * Set media source file (mdp file)
     * @param {String} url
     * @method setSrc
     */
    setSrc : function (url)
    {
        this.dashPlayer.startup();
        this.dashPlayer.attachView( this.mediaPlayer.get( 0 ) );// document.querySelector("#videoPlayer")*
        this.dashPlayer.attachSource( url );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"set dash src :" + this.url );
        }
    }
} );
