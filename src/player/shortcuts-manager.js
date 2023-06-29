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
$.Class("fr.ina.amalia.player.ShortcutsManager", {}, {
    /**
     * Instance of Player HTML5
     * @property mediaPlayer
     * @type {Object} HTMLVideoElement
     * @default null
     */
    mediaPlayer: null,
    /**
     * Defines configuration
     * @property settings
     * @type {Object}
     * @default {}
     */
    settings: {},
    /**
     * In charge to render messages in the web console output
     * @property logger
     * @type {Object}
     * @default null
     */
    logger: null,
    listOfShortcuts: null,
    init: function (settings, mediaPlayer) {
        this.mediaPlayer = mediaPlayer;
        this.settings = $.extend({
            enabled: false,
            debug: false,
            listOfShortcuts: [
                {'s': 'f1', 'c': 'togglePlayPause'},
                {'s': 'f11', 'c': 'toggleFullScreen'},
                {'s': 'f2', 'c': 'muteUnmute'},
                {'s': 'f3', 'c': 'seekToBegin'},
                {'s': 'f4', 'c': 'seekToEnd'}
            ]
        }, settings || {});
        this.listOfShortcuts = this.settings.listOfShortcuts;

        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined") {
            this.logger = new fr.ina.amalia.player.log.LogHandler({
                enabled: this.settings.debug
            });
        }
        this.initialize();
    },
    /**
     * initialize
     * @constructor
     * @method initialize
     */
    initialize: function () {
        if (this.logger !== null) {
            this.logger.trace(this.Class.fullName, "initialize");
        }
        if (this.settings.enabled === true) {
            // the fetching shortcuts i is element index. e is element as text.
            for (var i = 0; i < this.listOfShortcuts.length; i++) {
                try {
                    var conf = this.listOfShortcuts[i];
                    if (conf !== null && conf.hasOwnProperty('s') && conf.hasOwnProperty('c')) {
                        var f = conf.c;
                        /* jslint evil: true */
                        var callback = eval('this.mediaPlayer.' + f);
                        if (typeof callback === "function") {
                            // Binding keys
                            $(document).bind('keydown', {keys: conf.s, callback: conf.c, self: this}, this.callback);
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
            eval('event.data.self.mediaPlayer.' + event.data.callback + '()');
        }
        catch (error) {
            if (event.data.self.logger !== null) {
                event.data.self.logger.warn(event.data.self.Class.fullName + ' : Error to send callback to bind shortcut :' + event.data.callback);
            }
        }

    }
});