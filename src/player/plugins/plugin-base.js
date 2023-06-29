/**
 * Copyright (c) 2015-2023 Institut National de l'Audiovisuel, INA
 *
 * This file is part of amalia.js
 *
 * Amalia.js is free software: you can redistribute it and/or modify it under
 * the terms of the MIT License
 *
 * Redistributions of source code, javascript and css minified versions must
 * retain the above copyright notice, this list of conditions and the following
 * disclaimer
 *
 * Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission
 *
 * You should have received a copy of the MIT License along with
 * amalia.js. If not, see <https://opensource.org/license/mit/>
 *
 * Amalia.js is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.
 */
/**
 * Base class for plugin
 * @class PluginBase
 * @namespace fr.ina.amalia.player.plugins
 * @module player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaPlayer Instance of Player
 * @param {Object} pluginContainer plugin container element
 */
$.Class("fr.ina.amalia.player.plugins.PluginBase", {
        classCss: "plugin-default",
        style: ""
    },
    {
        /**
         * Plugin namespace
         * @property uuid
         * @type {String}
         * @default null
         */
        namespace: null,
        /**
         * universal unique id of this plugins
         * @property uuid
         * @type {String}
         * @default null
         */
        uuid: null,
        /**
         * The element to display media player.
         * @property pluginContainer
         * @type {Object}
         * @default null
         */
        pluginContainer: null,
        /**
         * Instance of Player HTML5
         * @property mediaPlayer
         * @type {Object} HTMLVideoElement
         * @default null
         */
        mediaPlayer: null,
        /**
         * Instance d'un class logger
         * @property logger
         * @type {Object} HTMLVideoElement
         * @default null
         */
        logger: null,
        /**
         * The element to display loader
         * @property loaderContainer
         * @type {Object}
         * @default null
         */
        loaderContainer: null,
        /**
         * Configuration
         * @property settings
         * @type {Object}
         * @default "{}"
         */
        settings: {},
        /**
         * Event Tag Name
         * @property eventTag
         * @type {String}
         * @default ''
         */
        eventTag: '',
        /**
         * List of plugin Types
         * @property eventTag
         * @type {String}
         * @default ''
         */
        listOfpluginTypes: [],
        bindingManager: null,
        /**
         * @contructor
         * @param {Object} settings
         * @param {Object} mediaPlayer
         * @param {Object} pluginContainer
         */
        init: function (settings, mediaPlayer, pluginContainer, bindingManager) {
            this.mediaPlayer = mediaPlayer;
            this.pluginContainer = $(pluginContainer);
            // Config default values
            this.namespace = this.Class.fullName;
            this.bindingManager = bindingManager;
            this.settings = $.extend({
                    debug: false,
                    internalPlugin: false,
                    shortcuts: {
                        enabled: false,
                        listOfShortcuts: []
                    }
                },
                settings || {});
            this.eventTag = this.Class.fullName + "_" + this.pluginContainer.attr('id');
            if (this.settings.internalPlugin === false) {
                this.pluginContainer.addClass(this.Class.classCss);
                this.createLoader();
                this.loaderContainer.show();
            }
            if (fr.ina.amalia.player.log !== undefined && fr.ina.amalia.player.log.LogHandler !== undefined) {
                this.logger = new fr.ina.amalia.player.log.LogHandler({
                    enabled: this.settings.debug
                });
            }

            if (this.mediaPlayer === null) {
                throw new Error("Can't initialize plugin name" + this.Class.fullName);
            }
            try {
                if (this.settings.internalPlugin === false) {
                    if (this.loaderContainer !== null) {
                        this.loaderContainer.hide();
                    }
                    this.initialize();
                }
                else {
                    this.initialize();
                }
            }
            catch (error) {
                if (this.logger !== null) {
                    this.logger.error(error.stack);
                }
            }
            this.initializeShortcuts();
        },
        /**
         * Initialize
         * @method initialize
         */
        initialize: function () {

        },
        /**
         * Set uuid
         */
        setUuid: function (uuid) {
            this.uuid = uuid.toString();
            this.pluginContainer.attr('data-plugin-id', this.uuid);
        },
        /**
         * Return uuid genereted by plugin manager
         */
        getUuid: function () {
            return this.uuid.toString();
        },
        /**
         * InitializeError
         * @method initializeError
         * @param {Object} errorCode
         */
        initializeError: function (errorCode) {
            var errorMessage = fr.ina.amalia.player.PlayerErrorCode.getMessage(errorCode);
            var errorContainer = $('<div>', {
                'class': 'ajs-error',
                'style': '',
                'text': errorMessage
            });
            this.pluginContainer.append(errorContainer);
        },
        /**
         * In charge to create loader element for plugin
         * @returns {undefined}
         */
        createLoader: function () {
            this.loaderContainer = $('<div>', {
                'class': 'ajs-loader ajs-icon ajs-icon-cog',
                'style': ''
            });

            this.loaderContainer.hide();
            this.pluginContainer.append(this.loaderContainer);
        },
        /**
         * In charge to add plugin type
         */
        registerPluginType: function (type) {
            if (typeof type === "string" && type !== "") {
                this.listOfpluginTypes.push(type);
            }
        },
        /**
         * Return this plugin types
         */
        getPluginTypes: function () {
            return this.listOfpluginTypes;
        },
        /**
         * Fired on plugin is ready
         * @method onPluginReady
         * @param {Object} event
         */
        onPluginReady: function (event) {
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onPluginReady");
            }
            if (event.data.self !== null) {
                event.data.self.initialize();
                if (event.data.self.loaderContainer !== null) {
                    event.data.self.loaderContainer.hide();
                }
            }
        },
        /**
         * Fired on error event
         * @method onPluginError
         * @param {Object} event
         * @param {Object} data
         */
        onPluginError: function (event, data) {
            if (event.data.self.logger !== null) {
                event.data.self.logger.warn("PluginBase/onPluginError");
            }
            if (event.data.self !== null) {
                var errorCode = (typeof data.errorCode === "undefined") ? '' : data.errorCode;
                event.data.self.initializeError(errorCode);
                if (event.data.self.loaderContainer !== null) {
                    event.data.self.loaderContainer.hide();
                }
            }
        },
        /**
         * initialize
         * @constructor
         * @method initialize
         */
        initializeShortcuts: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "initialize shortcuts");
            }
            if (typeof this.settings.shortcuts === "object" && this.settings.shortcuts.enabled === true) {
                // the fetching shortcuts i is element index. e is element as text.
                for (var i = 0; i < this.settings.shortcuts.listOfShortcuts.length; i++) {
                    try {
                        var conf = this.settings.shortcuts.listOfShortcuts[i];
                        if (conf !== null && conf.hasOwnProperty('s') && conf.hasOwnProperty('c')) {
                            var f = conf.c;
                            /* jslint evil: true */
                            var callback = eval('this.' + f);
                            if (typeof callback === "function") {
                                // Binding keys
                                $(document).bind('keydown', {
                                    keys: conf.s,
                                    callback: conf.c,
                                    self: this
                                }, this.callback);
                            }
                            else {
                                if (this.logger !== null) {
                                    this.logger.warn(this.Class.fullName + ' : error to bind shortcut ' + conf.c);
                                    this.logger.warn(conf);
                                }
                            }
                        }
                    }
                    catch (error) {
                        if (this.logger !== null) {
                            this.logger.warn(this.Class.fullName + ' : error to bind shortcut ' + conf.c);
                        }
                    }
                }
            }
        },
        /**
         * Call shortcut event and prevent default event
         * @param {type} event
         * @param {type} d
         * @returns {undefined}
         */
        callback: function (event) {
            try {
                event.preventDefault();
                /* jslint evil: true */
                eval('event.data.self.' + event.data.callback + '()');
            }
            catch (error) {
                if (event.data.self.logger !== null) {
                    event.data.self.logger.warn(event.data.self.Class.fullName + ' : Error to send callback to bind shortcut :' + event.data.callback);
                }
            }

        }
    });
