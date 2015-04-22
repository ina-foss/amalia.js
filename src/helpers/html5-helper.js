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
 * This class provides html5 utility functions
 * @class HTML5Helper
 * @namespace fr.ina.amalia.player.helpers
 * @module player-utils
 */
$.Class( "fr.ina.amalia.player.helpers.HTML5Helper",{
    /**
     * Method checks whether the document is in full-screen mode.
     * @method isFullScreen
     * @returns {Boolean} Return true if the document is in full-screen mode.
     */
    isFullScreen : function ()
    {
        var doc = $( document ).context;
        return doc.fullscreen || doc.mozFullScreen || doc.webkitIsFullScreen;
    },
    /**
     * Method in charge to toggle full-screen mode
     * @method toggleFullScreen
     * @param dom container
     * @param force force to call full-screen mode
     * @return {Boolean} Return true if in full-screen mode.
     */
    toggleFullScreen : function (dom,force)
    {
        var doc = $( document ).context;
        var isFullScreen = doc.fullscreen || doc.mozFullScreen || doc.webkitIsFullScreen ? true : false;
        if (isFullScreen === false || force === true)
        {
            var requestFullScreen = dom.requestFullScreen || dom.webkitRequestFullScreen || dom.mozRequestFullScreen || dom.msRequestFullscreen || dom.webkitEnterFullscreen;
            if (typeof requestFullScreen !== "undefined" && requestFullScreen)
            {
                requestFullScreen.call( dom );
                return true;
            }
        }
        else
        {
            var cancelFullScreen = document.cancelFullScreen || document.mozCancelFullScreen || document.webkitCancelFullScreen;
            if (typeof cancelFullScreen !== "undefined" && cancelFullScreen)
            {
                cancelFullScreen.call( document );
                return false;
            }
        }
    }
},
{} );
