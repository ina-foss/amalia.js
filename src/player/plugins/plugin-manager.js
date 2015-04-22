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
 * In charge to load plugins.
 * @class PluginManager
 * @module player
 * @submodule player
 * @namespace fr.ina.amalia.player.plugins
 * @param {Object} settings
 * @param {Object} mediaContainer Player main container
 * @param {Object} mediaPlayer player instance
 */
$.Class( "fr.ina.amalia.player.plugins.PluginManager",{},{
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
     * Plugin settings
     * @property pluginsSettings
     * @type {Object}
     * @default {}
     */
    pluginsSettings : {},
    /**
     * List of plugins
     * @property plugins
     * @type {Object}
     * @default null
     */
    plugins : null,
    /**
     * Player dom element
     * @property mediaContainer
     * @type {Object}
     * @default null
     */
    mediaContainer : null,
    /**
     * Player instance
     * @property mediaPlayer
     * @type {Object}
     * @default null
     */
    mediaPlayer : null,
    /**
     * Instance of menu contextuel plugin
     * @property contextMenuPlugin
     * @type {Object}
     * @default null
     */
    contextMenuPlugin : null,
    /**
     * Counts the number plugin loaded.
     * @property loadedCount
     * @type {Object}
     * @default null
     */
    loadedCount : 0,
    /**
     * Counts the number plugin hasn't loaded.
     * @property failCount
     * @type {Object}
     * @default null
     */
    failCount : 0,
    /**
     * Counts the number of metadata.
     * @property dataLoaded
     * @type {Object}
     * @default null
     */
    dataLoaded : 0,
    /**
     * Count of http resource
     * @property httpDataServicesCount
     * @type {Object}
     * @default null
     */
    httpDataServicesCount : 0,
    /**
     * List of plugins ids
     * @property listOfPluginsIds
     * @type {Object}
     * @default []
     */
    listOfPluginIds : [
    ],
    /**
     * List of plugins ids
     * @property listOfPluginsIds
     * @type {Object}
     * @default []
     */
    listOfPluginTypes : [
    ],
    bindingManager : null,
    /**
     * @constructor
     * @param {Object} settings
     * @param {Object} mediaPlayer
     * @param {Object} mediaContainer
     */
    init : function (settings,mediaPlayer,mediaContainer)
    {
        this.mediaPlayer = mediaPlayer;
        this.mediaContainer = mediaContainer;
        this.httpDataServicesCount = 0;
        this.settings = $.extend( {
            debug : false
        },
        settings || {} );
        this.pluginsSettings = $.extend( {
            debug : this.settings.debug,
            dataServices : [
            ],
            list : [
            ]
        },
        settings.plugins || {} );
        if (fr.ina.amalia.player.log !== undefined && fr.ina.amalia.player.log.LogHandler !== undefined)
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        this.plugins = [
        ];
        this.initialize();
    },
    /**
     * In charge to initialize plugin Manger
     * @method initialize
     */
    initialize : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initialize" );
        }
        this.bindingManager = new fr.ina.amalia.player.PluginBindingManager( this.settings,this.mediaPlayer );

        this.mediaPlayer.mediaPlayer.one( fr.ina.amalia.player.PlayerEventType.STARTED,{
            self : this
        },
        this.onStarted );
        this.mediaPlayer.mediaPlayer.on( fr.ina.amalia.player.PlayerEventType.ERROR,{
            self : this
        },
        this.onError );
    },
    loadPlugins : function ()
    {
        // Load static plugins
        var settingsContextMenuPlugin = {
            internalPlugin : true
        };
        this.contextMenuPlugin = this.loadPlugin( 'fr.ina.amalia.player.plugins.ContextMenuPlugin',settingsContextMenuPlugin,this.mediaPlayer,this.mediaContainer );
        // default configuration
        var settingsControlBar = $.extend( {
            internalPlugin : true,
            framerate : this.settings.framerate,
            debug : this.settings.debug
        },
        this.settings.controlBar || {} );
        this.loadPlugin( this.settings.controlBarClassName,settingsControlBar,this.mediaPlayer,this.mediaContainer );
        // Load dynamic plugins
        this.loadDynamicPlugins( this.pluginsSettings.list );
    },
    /**
     * Return context menu instance
     * @method getContextMenuPlugin
     */
    getContextMenuPlugin : function ()
    {
        return this.contextMenuPlugin;
    },
    /**
     * Fired on load started event
     * @method onStarted
     * @param {Object} event
     */
    onStarted : function (event)
    {
        event.data.self.loadPlugins();
        event.data.self.loadData( event.data.self.pluginsSettings.dataServices );
    },
    /**
     * Fired on error event
     * @method onError
     * @param {Object} event
     */
    onError : function (event)
    {
        event.data.self.mediaPlayer.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.PLUGIN_ERROR,{
            errorCode : fr.ina.amalia.player.PlayerErrorCode.ERROR_LOAD_PLUGIN
        } );
    },
    /**
     * In charge to load data.
     * @method loadData
     * @param {Array} urls List of plugin resource
     */
    loadData : function (hosts)
    {
        // Send BEGIN_DATA_CHANGE event
        this.mediaPlayer.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.BEGIN_DATA_CHANGE );

        if ($.isArray( hosts ))
        {
            var i = 0;
            var loader = null;
            var host = null;
            var settings = {
                debug : this.settings.debug
            };
            for (i = 0;
                i < hosts.length;
                ++i)
            {
                loader = null;
                host = hosts[i];
                settings = {
                    debug : this.pluginsSettings.debug,
                    format : host.hasOwnProperty( 'format' ) ? host.format : 'json',
                    url : host.hasOwnProperty( 'url' ) ? host.url : host,
                    parameters : (host.hasOwnProperty( 'parameters' )) ? host.parameters : null,
                    sublocalisations: (host.hasOwnProperty( 'sublocalisations' )) ? host.sublocalisations : false
                };

                if (typeof host[i] === 'string')
                {
                    loader = new fr.ina.amalia.player.HttpLoader( settings,this.mediaPlayer,this.dataLoadedHandler,{
                        self : this
                    } );
                }
                else if (host.hasOwnProperty( 'protocol' ))
                {
                    if (host.protocol === "http")
                    {
                        loader = new fr.ina.amalia.player.HttpLoader( settings,this.mediaPlayer,this.dataLoadedHandler,{
                            self : this
                        } );
                    }
                    else if (host.protocol === "ws")
                    {
                        loader = new fr.ina.amalia.player.WsLoader( settings,this.mediaPlayer,this.dataLoadedHandler,{
                            self : this
                        } );
                    }
                    else
                    {
                        try
                        {
                            // In charge to instantiate custom class
                            /* jslint evil: true */
                            loader = eval( 'new ' + host.protocol + '(settings, this.mediaPlayer, this.dataLoadedHandler)' );
                        }
                        catch (error)
                        {
                            if (this.logger !== null)
                            {
                                this.logger.warn( "Unknown host configuration type." );
                                this.logger.error( error.stack );
                            }
                        }
                    }
                }
                else
                {
                    this.logger.warn( "Unknown host configuration." );
                    this.logger.warn( host );
                }
                // Necessary for to start the plugin ready event
                if (loader !== null && loader.getWaitLoadEvent())
                {
                    this.httpDataServicesCount++;
                }
            }
        }
        else
        {
            if (this.logger !== null)
            {
                this.logger.warn( "Error dataServices is not array." );
            }
        }
    },
    /**
     * Méthode en charge de traiter les chargements de métadata.
     * @method loadDynamicPlugins
     * @param {Object} event
     * @param {String} status
     * @event fr.ina.amalia.player.PlayerEventType.PLUGIN_READY
     */
    dataLoadedHandler : function (event,status)
    {
        if (status === "success")
        {
            event.self.dataLoaded++;
            if (event.self.dataLoaded === event.self.httpDataServicesCount)
            {
                // Event BEGIN_DATA_CHANGE
                event.self.mediaPlayer.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.END_DATA_CHANGE );
                // Deprecated
                event.self.mediaPlayer.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.PLUGIN_READY );
            }
        }
        else
        {
            if (this.logger !== null)
            {
                this.logger.warn( "Failed to load data. status: " + status );
                this.logger.warn( event );
            }
            event.self.mediaPlayer.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.PLUGIN_ERROR,{
                errorCode : fr.ina.amalia.player.PlayerErrorCode.ERROR_LOAD_PLUGIN
            } );
        }
    },
    /**
     * In charge to load plugins
     * @method loadDynamicPlugins
     * @param {Object} list list of plugin resource
     */
    loadDynamicPlugins : function (list)
    {
        if (this.logger !== null)
        {
            this.logger.info( this.Class.fullName,"loadPlugins List : " );
            this.logger.info( list );
        }

        for (var item in list)
        {
            var pluginSettings = list[item];
            pluginSettings = $.extend( {
                debug : this.pluginsSettings.debug,
                className : null,
                container : null,
                data : this.data,
                parameters : {}
            },
            pluginSettings || {} );
            if (typeof pluginSettings === "object" && pluginSettings.className !== null)
            {
                var pluginContainer = (pluginSettings.container === null) ? this.mediaContainer : $( pluginSettings.container );
                pluginSettings.internalPlugin = (pluginSettings.container === null);
                this.loadPlugin( pluginSettings.className,pluginSettings,this.mediaPlayer,pluginContainer );
            }
            else
            {
                if (this.logger !== null)
                {
                    this.logger.warn( this.Class.fullName,"Error to load plugin className:" + pluginSettings.className );
                }
            }
        }
    },
    /**
     * In charge to load plugin
     * @method loadPlugin
     * @param {Object} className plugin class name
     * @param {Object} settings plugin configuration
     * @param {Object} mediaPlayer player instance
     * @param {Object} pluginContainer plugin dom element
     * @return {Boolean}
     */
    loadPlugin : function (className,settings,mediaPlayer,pluginContainer)
    {

        if (this.logger !== null)
        {
            this.logger.info( this.Class.fullName,"loadPlugin className:" + className );
        }

        try
        {
            /* jslint evil: true */
            /* jshint unused:false */
            var obj = eval( 'new ' + className + '(settings,mediaPlayer,pluginContainer,this.bindingManager)' );
            obj.setUuid( fr.ina.amalia.player.helpers.UtilitiesHelper.generateUUID( 'p_' ) );

            this.bindingManager.registerPlugin( obj.getUuid(),obj.getPluginTypes() );

            this.listOfPluginIds.push( obj.getUuid() );
            this.listOfPluginTypes[obj.getUuid()] = obj.getPluginTypes();

            this.plugins.push( obj );
            this.loadedCount++;
            if (this.logger !== null)
            {
                this.logger.info( className + "Plugin loaded :  " + className + " ID: " + obj.getUuid() );
            }
            return obj;
        }
        catch (error)
        {
            this.failCount++;
            if (this.logger !== null)
            {
                this.logger.warn( "Error to load plugin : " + className );
                this.logger.warn( error.stack );
            }
            return false;
        }
    }
} );
