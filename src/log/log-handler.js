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
 * This class provides log utility functions.
 * @class LogHandler
 * @namespace fr.ina.amalia.player.log
 * @constructor
 * @param {Object} settings Defines the configuration of this class
 */
$.Class( "fr.ina.amalia.player.log.LogHandler",{},{
    /**
     * Defines configuration
     * @property settings
     * @type {Object}
     * @default {}
     */
    settings : {},
    init : function (settings)
    {
        this.settings = $.extend( {
            enabled : false
        },
        settings || {} );
    },
    /**
     * Trace
     * @method trace
     * @param {String} className class name
     * @param {Object} functionName function name
     * @return {String} Returns log message
     */
    trace : function (className,functionName)
    {
        var message = null;
        if (this.settings.enabled && window.console && window.console.info)
        {
            message = className + ":" + functionName;
            console.info( message );
        }
        return message;
    },
    /**
     * Info
     * @method info
     * @param {String|Object} message log message
     * @return {String|Object} log message
     */
    info : function (message)
    {
        var msg = (message) ? message : null;
        if (this.settings.enabled && window.console && window.console.debug)
        {
            console.info( msg );
        }
        return msg;
    },
    /**
     * Error
     * @method error
     * @param {String|Object} message log message
     * @return {String|Object} log message
     */
    error : function (message)
    {
        var msg = (message) ? message : null;
        if (this.settings.enabled && window.console && window.console.error)
        {
            console.error( msg );
        }
        return msg;
    },
    /**
     * Warn
     * @method warn
     * @param {String|Object} message log message
     * @return {String|Object} log message
     */
    warn : function (message)
    {
        var msg = (message) ? message : null;
        if (this.settings.enabled && window.console && window.console.warn)
        {
            console.warn( msg );
        }
        return msg;
    },
    /**
     * Warn
     * @method warn
     * @param {String|Object} message log message
     * @return {String|Object} log message
     */
    debug : function (message)
    {
        var msg = (message) ? message : null;
        if (this.settings.enabled && window.console && window.console.debug)
        {
            console.debug( msg );
        }
        return msg;
    }

} );
