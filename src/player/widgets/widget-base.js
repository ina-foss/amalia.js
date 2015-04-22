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
 * Base class for widget
 * @class WidgetBase
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @param {Object} parameter configuration
 * @param {Object} mediaPlayer player instance
 * @param {Object} container main container
 */
$.Class( "fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase",{},{
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
     * Widget container element
     * @property element
     * @type {Object}
     * @default null
     */
    element : null,
    /**
     * Component container element
     * @property component
     * @type {Object}
     * @default null
     */
    component : null,
    /**
     * Player instance
     * @property mediaPlayer
     * @type {Object}
     * @default null
     */
    mediaPlayer : null,
    /**
     * Init this class
     * @constructor
     * @method init
     * @param {Object} parameter configuration
     * @param {Object} mediaPlayer player instance
     * @param {Object} container main container
     */
    init : function (parameter,mediaPlayer,container)
    {
        this.parameter = $.extend( {
            debug : true
        },
        parameter || {} );

        if (fr.ina.amalia.player.log !== undefined && fr.ina.amalia.player.log.LogHandler !== undefined)
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.parameter.debug
            } );
        }
        this.container = container;
        this.mediaPlayer = mediaPlayer;
        this.initialize();
    },
    /**
     * Initialize the component
     * @method initialize
     */
    initialize : function ()
    {

    },
    /**
     * Show this widget
     * @method show
     */
    show : function ()
    {
        this.component.show();
    },
    /**
     * Hide this widget
     * @method hide
     */
    hide : function ()
    {
        this.component.hide();
    }
} );
