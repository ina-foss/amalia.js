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
 * In charge to http loader
 * @class LoaderHTTP
 * @namespace fr.ina.amalia.player
 * @module player
 */
fr.ina.amalia.player.BaseLoader.extend( "fr.ina.amalia.player.HttpLoader",{},{
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
    init : function (settings,player,completeHandler,handlerData)
    {
        this._super( settings,player,completeHandler,handlerData );
        this.waitLoadEvent = true;
    },
    /**
     * initialize
     * @constructor
     * @method initialize
     */
    initialize : function ()
    {
        this._super();
        this.load( this.settings.url );
    },
    /**
     * Load http service
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
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"Load url :" + url );
        }
    },
    /**
     * On success
     * @method onSuccess
     * @param {Object} data
     * @param {String} textStatus
     */
    onSuccess : function (data,textStatus)
    {
        this._super( data,textStatus );
        this.data = null;
        if (this.parser !== null)
        {
            this.data = this.parser.processParserData( data );
            this.player.addAllMetadata( this.data );
        }
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
        this._super( textStatus );
        this.data = null;
        if (typeof this.completeHandler === 'function')
        {
            this.completeHandler( this.handlerData,textStatus );
        }
    }

} );
