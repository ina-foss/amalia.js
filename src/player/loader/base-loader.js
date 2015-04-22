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
 * In charge to load data
 * @class LoaderBase
 * @namespace fr.ina.amalia.player
 * @module player
 * @constructor
 * @param {Object} parameter
 * @param {Object} mediaContainer
 * @param {Object} handlerData
 */
$.Class( "fr.ina.amalia.player.BaseLoader",{},{
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
     * Loaded data
     * @property logger
     * @type {Object}
     * @default null
     */
    data : null,
    /**
     * load handler function
     * @property logger
     * @type {Object}
     * @default null
     */
    handlerData : {},
    /**
     * complete handler function
     * @property logger
     * @type {Object}
     * @default null
     */
    completeHandler : null,
    /**
     * Instance of player
     * @property player
     * @type {Object}
     * @default null
     */
    player : null,
    /**
     * Wait load event
     * @property player
     * @type {Object}
     * @default null
     */
    waitLoadEvent : false,
    /**
     * Instance of parser class
     * @property player
     * @type {Object}
     * @default null
     */
    parser : null,
    /**
     * Init this class
     * @constructor
     * @method init
     * @param {Object} settings
     */
    init : function (settings,player,completeHandler,handlerData)
    {
        this.settings = $.extend( {
            debug : false,
            sublocalisations : false
        },
        settings || {} );
        this.player = player;
        this.parser = null;
        this.handlerData = $.extend( {
            debug : false
        },
        handlerData || {} );
        this.completeHandler = completeHandler;
        this.logger = null;
        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined")
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        this.initialize();
    },
    /**
     * initialize
     * @constructor
     * @method initialize
     */
    initialize : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initialize" );
        }
        this.initializeParser();
    },
    /**
     * In charge to instantiate parser
     * @method processFilterData
     * @param {Object} data
     */
    initializeParser : function ()
    {
        this.parser = null;
        if (this.settings.format === 'json')
        {
            this.parser = new fr.ina.amalia.player.parsers.BaseParserMetadata( this.settings );
        }
        else
        {
            try
            {
                // In charge to instantiate parser custom class
                /* jslint evil: true */
                this.parser = eval( 'new ' + this.settings.format + '(this.settings)' );
            }
            catch (error)
            {
                this.parser = null;
                if (this.logger !== null)
                {
                    this.logger.warn( "Unknown host configuration type." );
                    this.logger.error( error.stack );
                }
            }
        }
    },
    /**
     * Set request type
     * @method setRequestType
     */
    setRequestType : function (requestType)
    {
        this.requestType = requestType;
    },
    /**
     * Set data type
     * @method setDataType
     */
    setDataType : function (dataType)
    {
        this.dataType = dataType;
    },
    /**
     * Set time out value
     * @method setTimeout
     */
    setTimeout : function (timeout)
    {
        this.timeout = timeout;
    },
    /**
     * Set send data
     * @method setSendData
     */
    setSendData : function (data)
    {
        this.sendData = $.extend( this.sendData,data || {} );
    },
    /**
     * Get send data
     * @method getSendData
     */
    getSendData : function ()
    {
        return this.sendData;
    },
    /**
     * Return wait load state
     * @method getSendData
     */
    getWaitLoadEvent : function ()
    {
        return this.waitLoadEvent;
    },
    /**
     * Get loaded data
     * @method initialize
     */
    getData : function ()
    {
        return this.data;
    },
    /**
     * On success
     * @method onSuccess
     * @param {Object} data
     * @param {String} textStatus
     */
    onSuccess : function (data,textStatus)
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"onSuccess status: " + textStatus );
        }
    },
    /**
     * onError
     * @method onError
     * @param {Object} textStatus
     */
    onError : function (textStatus)
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"onError status :" + textStatus );
        }
    }
} );
