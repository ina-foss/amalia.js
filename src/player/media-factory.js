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
 * Media factory
 * @class MediaFactory
 * @namespace fr.ina.amalia.player
 * @module player
 * @param {Object} mediaContainer
 * @param {Object} settings
 * @constructor
 */
$.Class("fr.ina.amalia.player.MediaFactory", {}, {
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
    /**
     * Player dom element
     * @property mediaContainer
     * @type {Object}
     * @default null
     */
    mediaContainer: null,
    /**
     * Player instance
     * @property player
     * @type {Object}
     * @default null
     */
    player: null,
    /**
     * Error message container
     * @property errorContainer
     * @type {Object}
     * @default null
     */
    errorContainer: null,

    /**
     * Last Seek time
     * @property lastSeekTime
     * @type {Object}
     * @default null
     */
    lastSeekTime: null,


    /**
     * Init this class
     * @constructor
     * @method init
     * @param {Object} mediaContainer
     * @param {Object} settings
     */
    init: function (mediaContainer, settings) {
        this.mediaContainer = $(mediaContainer);
        this.lastSeekTime = 0;
        this.settings = $.extend({
                player: 'default',
                src: null,
                poster: "",
                autoplay: false,
                plugins: {},
                callbacks: {},
                duration: null,
                debug: false
            },
            settings || {});
        if (fr.ina.amalia.player.log !== undefined && fr.ina.amalia.player.log.LogHandler !== undefined) {
            this.logger = new fr.ina.amalia.player.log.LogHandler({
                enabled: this.settings.debug
            });
        }
        this.initialize();
    },
    /**
     * Initialize
     * @method initialize
     * @throws {Object}
     */
    initialize: function () {
        try {
            if (this.settings.src !== null) {
                this.loadPlayer();
                if (this.logger !== null) {
                    this.logger.trace(this.Class.fullName, "initialize");
                }
            }
            else {
                this.createErrorContainer();
                this.setErrorCode(fr.ina.amalia.player.PlayerErrorCode.MEDIA_FILE_NOT_FOUND);
            }
        }
        catch (error) {
            this.createErrorContainer();
            this.setErrorCode(fr.ina.amalia.player.PlayerErrorCode.ERROR_HTML5_SUPPORT);
            if (this.logger !== null) {
                this.logger.error(error.stack);
            }
        }
    },
    /**
     * Method for create error container elements.
     * @method createErrorContainer
     */
    createErrorContainer: function () {
        this.errorContainer = $('<div>', {
            'class': 'ajs-error'
        });
        this.errorContainer.hide();
        this.mediaContainer.append(this.errorContainer);
    },
    /**
     * Set error code
     * @method setErrorCode
     * @param {Object} errorCode
     */
    setErrorCode: function (errorCode) {
        if (typeof this.errorContainer !== "undefined") {
            var messageContainer = $('<p>', {
                text: fr.ina.amalia.player.PlayerErrorCode.getMessage(errorCode)
            });
            this.errorContainer.html(messageContainer);
            this.errorContainer.show();
        }
    },
    /**
     * Load player
     * @method loadPlayer
     */
    loadPlayer: function () {

        if (this.settings.player === "default") {
            this.loadHtml5MediaPlayer();
        }
        else {
            /* jslint evil: true */
            this.player = eval("new " + this.settings.player + "(this.settings, this.mediaContainer);");
        }
    },
    /**
     * Load player html5
     * @method loadHtml5MediaPlayer
     */
    loadHtml5MediaPlayer: function () {
        if (this.logger !== null) {
            this.logger.info("Load html 5 media player");
        }
        var browserFeatureDetection = new fr.ina.amalia.player.helpers.BrowserFeatureDetection();
        if (browserFeatureDetection.isSupportsVideos()) {
            this.player = new fr.ina.amalia.player.PlayerHtml5(this.settings, this.mediaContainer);
        }
        else {
            if (this.logger !== null) {
                this.logger.error("Your browser does not support the video tag.");
            }
            throw new Error("Your browser does not support the video tag.");
        }
    },
    /**
     * Return player instance
     * @method getPlayer
     * @returns {Object}
     */
    getPlayer: function () {
        return this.player;
    }
});
