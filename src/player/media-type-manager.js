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
 * Base class for media type file
 * @class mediaTypeManager
 * @namespace fr.ina.amalia.player.media.type
 * @module player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaPlayer player instance
 */
$.Class("fr.ina.amalia.player.mediaTypeManager", {}, {
    /**
     * Instance of Player HTML5
     * @property mediaPlayer
     * @type {Object} HTMLVideoElement
     * @default null
     */
    mediaPlayer: null,
    /**
     * Instance of main class
     * @property mainObj
     * @type {Object} HTMLVideoElement
     * @default null
     */
    mainObj: null,

    /**
     * logger instance
     * @property logger
     * @type {Object} HTMLVideoElement
     * @default null
     */
    logger: null,
    /**
     * Configuration
     * @property settings
     * @type {Object}
     * @default "{}"
     */
    settings: {},
    init: function (settings, mainObj) {
        this.mediaPlayer = mainObj.mediaPlayer;
        this.mainObj=mainObj;
        this.namespace = this.Class.fullName;
        this.settings = $.extend({
                debug: false,
                internalPlugin: false
            },
            settings || {});
        if (fr.ina.amalia.player.log !== undefined && fr.ina.amalia.player.log.LogHandler !== undefined) {
            this.logger = new fr.ina.amalia.player.log.LogHandler({
                enabled: this.settings.debug
            });
        }
        if (this.mediaPlayer === null) {
            throw new Error("Can't initialize plugin name" + this.Class.fullName);
        }
        this.initialize();
    },
    /**
     * initialize
     * @method initialize
     */
    initialize: function () {

    }
});
