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
 * Base class
 * @class BasePlayer
 * @module player
 * @namespace fr.ina.amalia.player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaContainer
 */
$.Class("fr.ina.amalia.player.BasePlayer", {
        mediaPlayerClassCss: "player",
        mediaPlayerStyleCss: "position: relative; width: inherit; height: inherit; background-color: black; ",
        playButtonStyleCss: "ajs-icon ajs-icon-controlbar-play",
        pauseButtonStyleCss: "ajs-icon ajs-icon-controlbar-pause",
        loaderStyleCss: "ajs-icon ajs-icon-cog"

    },
    {
        logger: null,
        settings: {},
        /**
         * Media title
         * @property title
         * @type {Object}
         * @default null
         */
        title: "",
        /**
         * Media poster
         * @property poster
         * @type {Object}
         * @default null
         */
        poster: "",
        /**
         * Main container
         * @property mediaContainer
         * @type {Object}
         * @default null
         */
        mediaContainer: null,
        /**
         * Player instance
         * @property mediaPlayer
         * @type {Object}
         * @default null
         */
        mediaPlayer: null,
        /**
         * Plugin manager instance
         * @property pluginManager
         * @type {Object} fr.ina.amalia.player.plugins.PluginManager
         * @default null
         */
        pluginManager: null,
        /**
         * Instance of local storage manager.
         * @property localStorageManager
         * @type {Object} fr.ina.amalia.player.LocalStorageManager
         * @default null
         */
        localStorageManager: null,
        /**
         * Element to display loader
         * @property loaderContainer
         * @type {Object}
         * @default null
         */
        loaderContainer: null,
        /**
         * Element to display play/pause button on screen
         * @property controlLayerElement
         * @type {Object}
         * @default null
         */
        controlLayerElement: null,
        /**
         * Element to display error
         * @property errorContainer
         * @type {Object}
         * @default null
         */
        errorContainer: null,
        /**
         * True play only range
         * @property isRangePlayer
         * @type {Boolean}
         * @default false
         */
        isRangePlayer: false,
        /**
         * Tc for stop player in range mode
         * @property rangePlayerTcout
         * @type {Number}
         * @default null
         */
        rangePlayerTcout: null,
        /**
         * Image capture id
         * @property captureId
         * @type {Number}
         * @default null
         */
        captureId: null,
        /**
         * Image capture tc
         * @property captureTc
         * @type {Number}
         * @default null
         */
        captureTc: null,
        /**
         * Image caputre ratio
         * @property captureScale
         * @type {Number}
         * @default 100
         */
        captureScale: 1,
        /**
         * Zoom tcin
         * @property zTcin
         * @type {Number}
         * @default null
         */
        zTcin: null,
        /**
         * Zoom tcout
         * @property zTcout
         * @type {Number}
         * @default null
         */
        zTcout: null,
        /**
         * Tc offset
         * @property tcOffset
         * @type {Number}
         * @default 0
         */
        tcOffset: 0,
        /**
         * Media type manager, if your media is not mp4 file.
         * @property tcOffset
         * @type {Number}
         * @default 0
         */
        mediaTypeManager: null,
        /**
         * In charge to manage all metadata
         * @property metadataManager
         * @type {Object}
         * @default null
         */
        metadataManager: null,
        /**
         * timeout representing the ID
         * @property intervalRewind
         * @type {Object}
         * @default null
         */
        intervalRewind: null,
        /**
         * Shortcut manager
         * @property shortcutManager
         * @type {Object}
         * @default null
         */
        shortcutManager: null,
        /**
         * playbackRate speed
         * @property playbackRate
         * @type {Number}
         * @default null
         */
        playbackRateIdx: 7,
        playbackRateList: [
            -2,
            -1.5,
            -1,
            -0.75,
            -0.5,
            -0.25,
            -0.1,
            1,
            0.5,
            0.75,
            1.5,
            2,
            4,
            6,
            8
        ],
        /**
         * True if ios devices
         * @property isIOSDevices
         * @type {Boolean}
         * @default false
         */
        isIOSDevices: false,
        /**
         * media source url
         * @property source
         * @type {Boolean}
         * @default false
         */
        mediaSourceUrl: "",
        /**
         * In Cast Mode
         * @property inCastMode
         * @type {Boolean}
         * @default false
         */
        inCastMode: false,


        /**
         * Init player class
         * @constructor
         * @param {Object} settings
         * @param {Object} mediaContainer
         */
        init: function (settings, mediaContainer) {
            this.controlLayerElement = null;
            this.mediaSourceUrl = "";
            this.inCastMode = false;
            this.settings = $.extend({
                autoplay: false,
                poster: "",
                src: "",
                title: "",
                defaultVolume: 75,
                crossorigin: '',
                shortcuts: {},
                defaultPlaybackRateIdx: 7,
                duration: null
            }, settings || {});
            if (fr.ina.amalia.player.log !== undefined && fr.ina.amalia.player.log.LogHandler !== undefined) {
                this.logger = new fr.ina.amalia.player.log.LogHandler({
                    enabled: this.settings.debug
                });
            }
            this.mediaContainer = mediaContainer;
            this.setStyleBreakpoint();
            this.tcOffset = parseInt(this.settings.tcOffset);
            this.createLoaderContainer();
            if (this.settings.togglePlayPause === true) {
                this.createControlLayerElement();
            }
            this.createErrorContainer();
            this.localStorageManager = new fr.ina.amalia.player.LocalStorageManager({});
            this.shortcutManager = new fr.ina.amalia.player.ShortcutsManager(this.settings.shortcuts, this);
            this.playbackRateIdx = this.settings.defaultPlaybackRateIdx;
            var IsiPhone = navigator.userAgent.indexOf("iPhone") !== -1;
            var IsiPod = navigator.userAgent.indexOf("iPod") !== -1;
            var IsiPad = navigator.userAgent.indexOf("iPad") !== -1;
            this.isIOSDevices = IsiPhone || IsiPad || IsiPod;
            this.setTitle(this.settings.title);
            this.setPoster(this.settings.poster);
            this.initialize();
        },
        /**
         * initialize plugin manager
         * @method initializePlugins
         */
        initializePlugins: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "initializePlugins");
            }
            this.pluginManager = new fr.ina.amalia.player.plugins.PluginManager(this.settings, this, this.mediaContainer);
        },
        /**
         * initialize plugin manager
         * @method initializeMetadataManager
         */
        initializeMetadataManager: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "initializeMetadataManager");
            }
            this.metadataManager = new fr.ina.amalia.player.MetadataManager(this.settings, this, this.mediaContainer);
        },
        /**
         * In charge to create loader container
         * @method createLoaderContainer
         */
        createLoaderContainer: function () {
            this.loaderContainer = $('<div>', {
                'class': 'ajs-loader'
            });
            var loader = $('<i>', {
                class: this.Class.loaderStyleCss
            });
            this.loaderContainer.append(loader);
            this.mediaContainer.append(this.loaderContainer);
            this.showLoader();
        },
        /**
         * In charge to create control layer element
         * @method createControlLayerElement
         */
        createControlLayerElement: function () {
            this.controlLayerElement = $('<div>', {
                'class': 'ajs-control-layer'
            });
            this.controlLayerElement.append($('<i>'));
            this.mediaContainer.append(this.controlLayerElement);
        },
        /**
         * In charge to create error container
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
         * In charge to create error container
         * @method createErrorContainer
         */
        getContainer: function () {
            return this.mediaContainer;
        },
        /**
         * Method in charge to initialize player : - Create containers - Load
         * plugins
         * @method initialize
         */
        initialize: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "initialize");
            }
            // plugins
            this.initializePlugins();
            this.initializeMetadataManager();
            this.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.INIT, [
                this
            ]);
            this.getContainer().on(fr.ina.amalia.player.PlayerEventType.ERROR, {
                self: this
            }, this.onError);
        },
        /**
         * In charge to load media
         * @method load
         */
        load: function () {
            this.mediaPlayer.get(0).load();
        },
        /**
         * In charge to show loader.
         * @method showControlLayerElement
         */
        showControlLayerElement: function (action) {
            if (this.controlLayerElement !== null) {
                var btn = action === "play" ? this.Class.playButtonStyleCss : this.Class.pauseButtonStyleCss;
                this.controlLayerElement.find('i').attr('class', btn);
                var self = this;
                this.controlLayerElement.fadeIn("speed").addClass("scale-up").delay(200).queue(function () {
                    self.controlLayerElement.removeClass("scale-up").fadeOut("speed").dequeue();
                });
            }
        },
        /**
         * In charge to show loader.
         * @method showLoader
         */
        showLoader: function () {
            this.loaderContainer.show();
        },
        /**
         * In charge to hide loader.
         * @method hideLoader
         */
        hideLoader: function () {
            this.loaderContainer.hide();
        },
        /**
         * return the title of the media
         * @param {String} title
         * @method getTitle
         * @abstract
         */
        getTitle: function () {
            return this.title;
        },
        /**
         * Set the title of the media
         * @param {String} src
         * @method setSrc
         * @abstract
         */
        setTitle: function (title) {
            this.title = title;
        },
        /**
         * return the cast state
         * @param {String} inCastMode
         * @method getCastMode
         * @abstract
         */
        getCastMode: function () {
            return this.inCastMode;
        },
        /**
         * Set the cast state
         * @param {String} src
         * @method setCastMode
         * @abstract
         */
        setCastMode: function (state) {
            this.inCastMode = state;
        },
        /**
         * return the title of the media
         * @param {String} title
         * @method getTitle
         * @abstract
         */
        getPoster: function () {
            return this.poster;
        },
        /**
         * Set the title of the media
         * @param {String} src
         * @method setSrc
         * @abstract
         */
        setPoster: function (poster) {
            this.poster = poster;
        },


        /**
         * In charge to set source
         * @param {String} src
         * @param {Boolean} autoplay
         * @method setSrc
         * @abstract
         */
        setSrc: function (src, autoplay) {
            this.mediaSourceUrl = src;
            if (autoplay === true) {
                this.play();
            }
        },
        /**
         * In charge to set source
         * @param {String} src
         * @param {Boolean} autoplay
         * @method getSrc
         * @abstract
         */
        getSrc: function () {
            return this.mediaSourceUrl;
        },
        /**
         * Return source content type
         * @method getContentType
         * @abstract
         */
        getContentType: function () {
            return '';
        },
        /**
         * In charge to set player events
         * @method initEvents
         */
        initEvents: function () {
            // call function 200 ms after resize is complete.
            $(window).on('debouncedresize', {
                self: this
            }, this.onWindowResize);
            if (this.logger !== null) {
                this.logger.info("initEvents");
            }
        },
        /**
         * In charge to set style brack point
         * @method setStyleBreakpoint
         */
        setStyleBreakpoint: function () {
            var style = 'lg';
            var playerWidth = this.mediaContainer.width();
            // player width
            if (playerWidth <= 320) {
                style = 'xxs';
            }
            else if (playerWidth > 320 && playerWidth <= 480) {
                style = 'xs';
            }
            else if (playerWidth > 480 && playerWidth <= 768) {
                style = 'sm';
            }
            else if (playerWidth > 768 && playerWidth <= 992) {
                style = 'md';
            }

            //Style
            if (this.mediaContainer.hasClass(style) === false) {
                this.mediaContainer.removeClass('xxs').removeClass('xs').removeClass('sm').removeClass('md').removeClass('lg').addClass(style);
            }
            return style;
        },
        /**
         * In charge to play media
         * @method play
         */
        play: function () {
            this.mediaContainer.addClass('playing-mode').removeClass('paused-mode');
            if (typeof this.settings.callbacks.onPlay !== "undefined") {
                try {
                    /* jslint evil: true */
                    eval(this.settings.callbacks.onPlay + '()');
                }
                catch (e) {
                    if (this.logger !== null) {
                        this.logger.warn("Send callback failed.");
                    }
                }
            }
        },
        /**
         * In charge to pause media
         * @method pause
         */
        pause: function () {
            this.mediaContainer.removeClass('playing-mode').addClass('paused-mode');
            this.isRangePlayer = false;
            this.rangePlayerTcout = null;
            if (typeof this.settings.callbacks.onPause !== "undefined") {
                try {
                    /* jslint evil: true */
                    eval(this.settings.callbacks.onPause + '()');
                }
                catch (e) {
                    if (this.logger !== null) {
                        this.logger.warn("Send callback failed.");
                    }
                }
            }
        },
        /**
         * In charge to stop media
         * @method stop
         */
        stop: function () {
            if (this.settings.callbacks.hasOwnProperty("onStop") && typeof this.settings.callbacks.onStop !== "undefined") {
                try {
                    /* jslint evil: true */
                    eval(this.settings.callbacks.onStop + '()');
                }
                catch (e) {
                    if (this.logger !== null) {
                        this.logger.warn("Send callback failed.");
                    }
                }
            }
        },
        /**
         * In charge toggle Play
         * @method stop
         */
        togglePlayPause: function () {
            if (this.isPaused()) {
                this.play();
                this.showControlLayerElement('play');
            }
            else {
                this.pause();
                this.showControlLayerElement('pause');
            }
        },
        /**
         * In charge to seek
         * @method seek
         * @param {Number} time
         * @return {Number} current time
         */
        seek: function (time) {
            return this.setCurrentTime(time);
        },
        /**
         * Set current time to the beginning of the file
         * @method seekToBegin
         * @param {Number} time
         * @return {Number} current time
         */
        seekToBegin: function () {
            return this.setCurrentTime(0);
        },
        /**
         * Set current time to the end of the file
         * @method seekToEnd
         * @param {Number} time
         * @return {Number} current time
         */
        seekToEnd: function () {
            return this.setCurrentTime(this.getDuration());
        },
        /**
         * In charge to set mute state
         * @method mute
         * @event fr.ina.amalia.player.PlayerEventType.MUTE
         * @return {Number}
         */
        mute: function () {
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.MUTE);
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.VOLUME_CHANGE, {
                volume: 0
            });
        },
        /**
         * In charge to set unmute state
         * @method unmute
         * @event fr.ina.amalia.player.PlayerEventType.UN_MUTE
         */
        unmute: function () {
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.UN_MUTE);
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.VOLUME_CHANGE, {
                volume: 100
            });
        },
        /**
         * Return true if is mute
         * @method isMute
         * @event fr.ina.amalia.player.PlayerEventType.UN_MUTE
         */
        isMute: function () {
            return this.getVolume() === 0;
        },
        /**
         * Return player instance
         * @method muteUnmute
         * @return {Object}
         */
        muteUnmute: function () {
            if (this.isMute()) {
                this.unmute();
            }
            else {
                this.mute();
            }
        },
        /**
         * Return tc offset
         * @returns {Number}
         */
        getTcOffset: function () {
            return this.tcOffset;
        },
        /**
         * Return player instance
         * @method getMediaPlayer
         * @return {Object}
         */
        getMediaPlayer: function () {
            return this.mediaPlayer;
        },
        /**
         * Return media duration with tc offset
         * @method getDuration
         * @return {Number}
         */
        getDuration: function (duration) {
            return typeof duration === "number" && isFinite(duration) ? duration : 0;
        },
        /**
         * Returns the current playback volume percentage, as a number from 0 to
         * 100.
         * @method getVolume
         * @return {Number}
         */
        getVolume: function () {
            throw new Error("Get volume is abstract method.");
        },
        /**
         * In charge to play segment
         * @param {Number} tcin
         * @param {Number} tcout
         * @param {Boolean} autoplay true for autolay
         */
        rangePlay: function (tcin, tcout, autoplay) {
            autoplay = (typeof autoplay === "undefined") ? false : autoplay;
            this.isRangePlayer = true;
            this.rangePlayerTcout = tcout + this.tcOffset;
            this.setCurrentTime(tcin);
            if (autoplay === true) {
                this.play();
            }
        },
        /**
         * Sets the player's audio volume percentage, as a number between 0 and 100.
         * @method setVolume
         * @param {Number} value
         */
        setVolume: function (value) {
            if (value >= 0 && value <= 100) {
                this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.VOLUME_CHANGE, {
                    volume: value
                });
                this.localStorageManager.setItem('volume', value);
                if (this.logger !== null) {
                    this.logger.trace(this.Class.fullName, "setVolume" + value);
                }
                return true;
            }
            return false;
        },
        /**
         * Return current position in seconds
         * @method getCurrentTime
         * @return {Number}
         */
        getCurrentTime: function (currentTime) {
            if (this.settings.duration === null) {
                return currentTime + this.tcOffset;
            } else {
                return this.lastSeekTime + currentTime + this.tcOffset;
            }
        },
        /**
         * Set seek position in seconds
         * @method setCurrentTime
         * @param {Object} currentTime
         * @event fr.ina.amalia.player.PlayerEventType.SEEK
         * @return return current time without tc offset.
         */
        setCurrentTime: function (value) {
            var currentTime = isNaN(value) ? 0 : value;
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.SEEK, {
                currentTime: currentTime
            });
        },

        /**
         * Return playback rate
         * @returns the current playback speed of the audio/video.
         */
        getPlaybackrate: function () {
            throw new Error("Get volume is abstract method.");
        },
        /**
         * Set playback rate
         * @param {Objecy} speed the current playback speed of the audio/video.
         * @returns the current playback speed of the audio/video.
         */
        setPlaybackrate: function (speed) {
            throw new Error("Get volume is abstract method. Speed: " + speed);
        },
        upPlaybackrate: function () {
            this.playbackRateIdx = Math.min(this.playbackRateList.length, this.playbackRateIdx + 1);
            this.setPlaybackrate(parseInt(this.playbackRateList[this.playbackRateIdx]));
        },
        downPlaybackrate: function () {
            this.playbackRateIdx = Math.max(0, this.playbackRateIdx - 1);
            this.setPlaybackrate(parseInt(this.playbackRateList[this.playbackRateIdx]));
        },
        /**
         * Set Error
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
         * Returns the current fullscreen state
         * @method getFullscreenState
         * @return {Boolean} description
         */
        getFullscreenState: function () {
            throw new Error("Get fullscreen is abstract method.");
        },

        /**
         * Return true if media is paused
         * @method isPaused
         * @return {Boolean}
         */
        isPaused: function () {
            throw new Error("Is paused is abstract method.");
        },
        /**
         * In charge to toggle full-screen state
         * @see HTML5 Fullscreen API
         * @method toggleFullScreen
         * @return {Boolean} true
         */
        toggleFullScreen: function (inFullScreen) {
            var container = (this.isIOSDevices) ? this.mediaPlayer.get(0) : this.mediaContainer.get(0);
            var iFS = fr.ina.amalia.player.helpers.HTML5Helper.toggleFullScreen(container, this.isIOSDevices);
            if (typeof this.settings.callbacks.onFullscreen !== "undefined") {
                try {
                    /* jslint evil: true */
                    eval(this.settings.callbacks.onFullscreen + '(inFullScreen)');
                }
                catch (e) {
                    if (this.logger !== null) {
                        this.logger.warn("Send callback failed.");
                    }
                }
            }
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onClickFullscreenButton :" + inFullScreen);
            }
            return iFS;
        },
        /**
         * Returns the current fullscreen state
         * @method getFullscreenState
         * @return {Boolean} description
         */
        getContentTupe: function () {
            throw new Error("Get media content type is abstract method.");
        },
        /**
         * Return current image
         * @param {Nomber} scale max 1=> 100%
         * @method getCurrentImage
         * @event fr.ina.amalia.player.PlayerEventType.IMAGE_CAPTURE
         */
        getCurrentImage: function (scale) {
            throw new Error("Get currentTime is abstract method. Scale: " + scale);
        },
        /**
         * Return current image for specified time code.
         * @param {String} id
         * @param {Number} tc
         * @param {Number} scale max 1=> 100%
         * @method getTcImage
         * @event fr.ina.amalia.player.PlayerEventType.IMAGE_CAPTURE
         */
        getTcImage: function (id, tc, scale) {
            this.setCurrentTime(tc);
            // Need to call player for make capture
            this.play();
            this.captureId = id;
            this.captureTc = tc + this.tcOffset;
            this.captureScale = (typeof scale !== 'undefined') ? Math.min(1, parseFloat(scale)) : 1;
        },
        /**
         * In charge to move next frame
         * @method moveNextFrame
         * @param {Object} event
         */
        moveNextFrame: function () {
            this.pause();
            this.setCurrentTime(Math.min(this.getDuration() + this.tcOffset, this.getCurrentTime() + (1 / this.settings.framerate)));
        },
        /**
         * In charge to move prev frame
         * @method movePrevFrame
         * @param {Object} event
         */
        movePrevFrame: function () {
            this.pause();
            this.setCurrentTime(Math.max(0, this.getCurrentTime() - (1 / this.settings.framerate)));
        },

        /**
         * In charge to add menu context item
         * @param {String} title
         * @param {String} link
         * @param {String} className
         */
        addMenuItemWithLink: function (title, link, className) {
            if (typeof this.pluginManager === "object" && typeof this.pluginManager.getContextMenuPlugin === "function") {
                var contextMenuPlugin = this.pluginManager.getContextMenuPlugin();
                if (typeof contextMenuPlugin === "object" && typeof contextMenuPlugin.addItemWithLink === "function") {
                    return contextMenuPlugin.addItemWithLink(title, link, className);
                }
            }
            return false;
        },

        /** Metadata **/
        /**
         * Return instance of metadata manager
         */
        getMetadataManager: function () {
            return this.metadataManager;
        },
        /**
         * Return all block of metadata
         */
        getBlocksMetadata: function () {
            return this.metadataManager.getBlocksMetadata();
        },
        /**
         * Return the block of metadata by id
         */
        getBlockMetadata: function (id) {
            return this.metadataManager.getBlockMetadata(id);
        },
        /**
         * Update the block metadata
         */
        updateBlockMetadata: function (id, data, action) {
            this.metadataManager.updateBlockMetadata(id, data, action);
        },
        /**
         * Remove the block metadata with id metadata
         */
        removeBlockMetadata: function (id) {
            return this.metadataManager.removeBlockMetadata(id);
        },
        /**
         * In charge to add metadata, it is called by metadata parser
         * @method addAllMetadata
         * @param {Object} data
         * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
         */
        addAllMetadata: function (parsedData) {
            this.metadataManager.addAllMetadata(parsedData);
        },
        /**
         * In charge to return metadata by id
         * @method addMetadataById
         * @param {Object} data
         * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
         */
        addMetadataById: function (id, parsedData) {
            this.metadataManager.addMetadataById(id, parsedData);
        },
        /**
         * In charge to replace metadata by id
         * @method replaceAllMetadataById
         * @param {Object} data
         * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
         */
        replaceAllMetadataById: function (id, parsedData) {
            this.metadataManager.replaceAllMetadataById(id, parsedData);
        },
        /**
         * In charge to delete metadata by id
         * @method deleteAllMetadataById
         * @param {Object} data
         * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
         */
        deleteAllMetadataById: function (id) {
            this.metadataManager.deleteAllMetadataById(id);
        },
        /**
         * Return metadata by id
         * @method getMetadataById
         * @param {String} id
         * @return {Array}
         */
        getMetadataById: function (id) {
            return this.metadataManager.getMetadataById(id);
        },
        /**
         * Set metadata by id
         * @method setMetadataById
         * @param {String} id
         * @param {Object} data
         * @return {Array}
         */
        setMetadataById: function (id, data) {
            return this.metadataManager.setMetadataById(id, data);
        },
        /**
         * In charge to remove metadata
         * @method removeMetadataById
         */
        removeMetadataById: function (id) {
            return this.metadataManager.removeMetadataById(id);
        },
        /**
         * Return a metadata by specified time code.
         * @method getMetadataWithRange
         * @param id
         * @param tcin
         * @param tcout
         * @return {Array}
         */
        getMetadataWithRange: function (id, tcin, tcout) {
            return this.metadataManager.getMetadataWithRange(id, tcin, tcout);
        },
        /**
         * Return selected component id
         * @method getSelectedMetadataId
         */
        getSelectedMetadataId: function () {
            return this.metadataManager.getSelectedMetadataId();
        },
        /**
         * Set selected component id
         * @method setSelectedMetadataId
         */
        setSelectedMetadataId: function (metadataId) {
            this.metadataManager.setSelectedMetadataId(metadataId);
        },
        /**
         * In charge to add metadata item
         * @method addMetadataItem
         */
        addMetadataItem: function (metadataId, data) {
            return this.metadataManager.addMetadataItem(metadataId, data);
        },
        /**
         * Return selected items
         */
        getSelectedItems: function () {
            return this.metadataManager.getSelectedItems();
        },
        /**
         * Add selected item
         */
        addSelectedItem: function (item) {
            this.metadataManager.addSelectedItem(item);
        },
        /**
         * Remove all selected items
         */
        removeAllSelectedItems: function () {
            this.metadataManager.removeAllSelectedItems();
        },
        /**
         * Return tcin with tc offset
         * @returns {Number}
         */
        getTcin: function () {
            return this.getTcOffset();
        },
        /**
         * Return Tcout with tcoffset and media duration
         * @returns {Number}
         */
        getTcout: function () {
            return this.getTcOffset() + this.getDuration();
        },
        /**
         * In charge to set zoom tc
         * @param {Number} zTcin
         * @param {Number} zTcout
         * @param {String} eventTag
         */
        setZoomTc: function (zTcin, zTcout, eventTag) {
            eventTag = (typeof eventTag !== 'undefined') ? eventTag : '';
            if (Math.ceil(this.zTcin) !== Math.ceil(zTcin) || Math.ceil(this.zTcout) !== Math.ceil(zTcout)) {
                this.zTcin = Math.max(0, parseFloat(zTcin));
                this.zTcout = parseFloat(zTcout);
                if (this.logger !== null) {
                    this.logger.info("SetZoomTc: // Tcin: " + this.zTcin + " // Tcout:" + this.zTcout + " // Event Tag Name:" + eventTag);
                }
                this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.ZOOM_RANGE_CHANGE, {
                    zTcin: parseFloat(zTcin),
                    zTcout: parseFloat(zTcout),
                    eventTag: eventTag
                });
            }
        },
        /**
         * In Charge to remove instance
         */
        destroy: function () {
            //Fix clear socket
            this.setSrc("", false);
            if (typeof this.mediaContainer.data("fr.ina.amalia.player") !== "undefined") {
                this.mediaContainer.data("fr.ina.amalia.player", null);
            }
            //clear html content
            this.mediaContainer.get(0).innerHTML = "";
            this.mediaContainer.remove();
        },
        /**
         * Fired on player has errors.
         * @method onError
         * @param {Object} event
         * @param {Object} data
         * @event fr.ina.amalia.player.PlayerEventType.ERROR
         */
        onError: function (event, data) {
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onError");
            }
            var errorCode = (typeof data.errorCode === "undefined") ? '' : data.errorCode;
            event.data.self.setErrorCode(errorCode);
            if (typeof event.data.self.settings.callbacks.onError !== "undefined") {
                try {
                    /* jslint evil: true */
                    eval(event.data.self.settings.callbacks.onError + '(errorCode)');
                }
                catch (e) {
                    if (event.data.self.logger !== null) {
                        event.data.self.logger.warn("Send callback failed.");
                    }
                }
            }
        },
        /**
         * Fired on windows resize
         * @method onWindowResize
         * @param {Object} event
         */
        onWindowResize: function (event) {
            event.data.self.setStyleBreakpoint();
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onWindowResize");
            }
        }

    });
