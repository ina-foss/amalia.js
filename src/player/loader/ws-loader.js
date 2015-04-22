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
 * In charge to web socket loader
 * @class LoaderHTTP
 * @namespace fr.ina.amalia.player
 * @module player
 */
fr.ina.amalia.player.BaseLoader.extend( "fr.ina.amalia.player.WsLoader",{},{
    /**
     * Defines configuration
     * @property socket
     * @type {Object}
     * @default null
     */
    socket : null,
    listOfMetadata : null,
    init : function (settings,player,completeHandler,handlerData)
    {
        this._super( settings,player,completeHandler,handlerData );
        this.waitLoadEvent = false;
    },
    /**
     * initialize
     * @constructor
     * @method initialize
     */
    initialize : function ()
    {
        this._super();
        this.socket = null;
        this.listOfMetadata = [
        ];
        this.connect( this.settings.url );

        this.player.getMediaPlayer().on( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            self : this
        },
        this.onPlayerDataChange );
    },
    /**
     * In charge to create a new WebSocket
     */
    connect : function (url)
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"Load url :" + url );
        }
        // creates a new WebSocket
        if (typeof WebSocket === "function")
        {
            this.socket = new WebSocket( url );
            if (this.socket !== null)
            {
                $( this.socket ).on( 'open',{
                    self : this
                },
                this.onOpen ).on( 'close',{
                    self : this
                },
                this.onClose ).on( 'message',{
                    self : this
                },
                this.onMessage ).on( 'error',{
                    self : this
                },
                this.onError );
            }
        }
        else
        {
            if (this.logger !== null)
            {
                this.logger.error( 'Error: WebSocket is not supported by this browser or the server is not started.' );
            }
        }

    },
    /**
     * This event occurs when socket connection is established
     * @method onOpen
     * @param {Object}
     */
    onOpen : function (event)
    {
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,'WebSocket connection opened' );
        }
    },
    /**
     * This event occurs when connection is closed.
     * @method onClose
     * @param {Object}
     */
    onClose : function (event)
    {
        event.data.self.socket = null;
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,'WebSocket connection closed' );
        }
    },
    /**
     * This event occurs when client receives data from server.
     * @method onMessage
     * @param {Object} event
     */
    onMessage : function (event)
    {
        try
        {
            //recived data
            var jsonData = JSON.parse( event.originalEvent.data );
            event.data.self.data = event.data.self.parser.processParserData( jsonData );
            var viewControl = event.data.self.data.viewControl;
            var action = (event.data.self.data.viewControl !== null && event.data.self.data.viewControl.hasOwnProperty( 'action' )) ? event.data.self.data.viewControl.action : '';
            //action
            if (event.data.self.data !== null)
            {
                switch (action)
                {
                    case 'add-all' :
                        event.data.self.player.updateBlockMetadata( event.data.self.data.id,{
                            id : event.data.self.data.id,
                            label : event.data.self.data.label,
                            type : event.data.self.data.hasOwnProperty( 'type' ) ? event.data.self.data.type : 'default',
                            author : (viewControl !== null && viewControl.hasOwnProperty( 'author' )) ? viewControl.author : '',
                            color : (viewControl !== null && viewControl.hasOwnProperty( 'color' )) ? viewControl.color : '',
                            shape : (viewControl !== null && viewControl.hasOwnProperty( 'shape' )) ? viewControl.shape : ''
                        },
                        null );
                        event.data.self.player.addMetadataById( event.data.self.data.id,event.data.self.data.list );
                        break;
                    case 'replace-all' :
                        event.data.self.player.updateBlockMetadata( event.data.self.data.id,{
                            id : event.data.self.data.id,
                            label : event.data.self.data.label,
                            type : event.data.self.data.hasOwnProperty( 'type' ) ? event.data.self.data.type : 'default',
                            author : (viewControl !== null && viewControl.hasOwnProperty( 'author' )) ? viewControl.author : '',
                            color : (viewControl !== null && viewControl.hasOwnProperty( 'color' )) ? viewControl.color : '',
                            shape : (viewControl !== null && viewControl.hasOwnProperty( 'shape' )) ? viewControl.shape : ''
                        },
                        action );
                        event.data.self.player.replaceAllMetadataById( event.data.self.data.id,event.data.self.data.list );
                        break;
                    case 'delete-all' :
                        event.data.self.player.deleteAllMetadataById( event.data.self.data.id );
                        break;
                    default :
                        event.data.self.player.updateBlockMetadata( event.data.self.data.id,{
                            id : event.data.self.data.id,
                            label : event.data.self.data.label,
                            type : event.data.self.data.hasOwnProperty( 'type' ) ? event.data.self.data.type : 'default',
                            author : (viewControl !== null && viewControl.hasOwnProperty( 'author' )) ? viewControl.author : '',
                            color : (viewControl !== null && viewControl.hasOwnProperty( 'color' )) ? viewControl.color : '',
                            shape : (viewControl !== null && viewControl.hasOwnProperty( 'shape' )) ? viewControl.shape : ''
                        },
                        null );
                        event.data.self.player.addMetadataById( event.data.self.data.id,event.data.self.data.list );
                }
            }
        }
        catch (e)
        {
            // Exception SyntaxError
            event.data.self.data = null;
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.error( "Error to add metadata" );
                event.data.self.logger.error( event.originalEvent.data );
            }
        }

    },
    /**
     * This event occurs when there is any error in communication.
     * @method onError
     * @param {Object} event
     */
    onError : function (event)
    {
        event.data.self.socket = null;
        event.data.self.data = null;
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.error( "Error to initialize, web socket connection." );
            event.data.self.logger.error( event );
        }
    },
    /**
     * This event occurs when data change event
     * @method onPlayerDataChange
     * @param {Object} event
     * @param {Object} data
     */
    onPlayerDataChange : function (event,data)
    {
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,'onPlayerDataChange' );
            event.data.self.logger.debug( event );
            event.data.self.logger.debug( event.data.self.player.getMetadataById( data.id ) );
        }
    }

} );
