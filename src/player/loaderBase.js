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
$.Class( "fr.ina.amalia.player.LoaderBase",{},{
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
     * Load data request type
     * @property requestType
     * @type {String}
     * @default 'GET'
     */
    requestType : 'GET',
    /**
     * Load data type
     * @property logger
     * @type {String}
     * @default 'json'
     */
    dataType : 'json',
    /**
     * Send data object
     * @property sendData
     * @type {Object}
     * @default null
     */
    sendData : {},
    /**
     * call time out
     * @property timeout
     * @type {Number}
     * @default null
     */
    timeout : 120000,
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
     * Init this class
     * @constructor
     * @method init
     * @param {Object} settings
     */
    init : function (settings,completeHandler,handlerData)
    {
        this.settings = $.extend( {
            debug : false
        },
        settings || {} );
        this.handlerData = $.extend( {
            debug : false
        },
        handlerData || {} );
        this.completeHandler = completeHandler;
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
     * Get loaded data
     * @method initialize
     */
    getData : function ()
    {
        return this.data;
    },
    /**
     * Filter loaded data
     * @method processFilterData
     * @param {Object} data
     */
    processFilterData : function (data)
    {
        if (data !== null && typeof data !== "undefined")
        {
            if (data.hasOwnProperty( 'status' ) === true && data.hasOwnProperty( 'data' ) === true && data.status === 0 && data !== null)
            {
                return data.data;
            }
            else if (data.hasOwnProperty( 'id' ) === true)
            {
                return data;
            }
            else
            {
                if (this.logger !== null)
                {
                    this.logger.warn( this.Class.fullName,"Error while filtering Data." );
                    this.logger.warn( data );
                }
            }
        }

        return null;
    },
    /**
     * Load data
     * @method load
     * @param {Object} url
     */
    load : function (url)
    {
        var self = this;
        $.ajax( {
            type : this.requestType,
            url : url,
            timeout : this.timeout,
            data : this.sendData,
            dataType : this.dataType,
            success : function (data,textStatus)
            {
                self.onSuccess( data,textStatus );
            },
            error : function (data,textStatus)
            {
                self.onError( textStatus );
            }
        } );
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
        this.data = this.processFilterData( data );

        if (typeof this.completeHandler === 'function')
        {
            this.completeHandler( this.handlerData,textStatus );
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
        this.data = null;
        if (typeof this.completeHandler === 'function')
        {
            this.completeHandler( this.handlerData,textStatus );
        }
    }
} );
