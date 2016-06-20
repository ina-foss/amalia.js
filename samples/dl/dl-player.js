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
 * In charge of the player html5
 * @class dlPlayer
 * @module player
 * @namespace fr.ina.amalia.player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaContainer
 */
fr.ina.amalia.player.BasePlayer.extend("fr.ina.amalia.player.DlPlayer", {
        dtPlayerContainerClassCss: "video-js ",
        dlPlayerContainerStyle: "",
        SWF_BASE_URI: "http://collgate.ina.fr:6699/collplay.dlweb/video-js/video-js.swf"
    },
    {
        /**
         * Dl playerContainer
         * @property dlPlayerContainer
         * @type {Object}
         * @default null
         */
        dlPlayerContainer: null,
        /**
         * Dl Player
         * @property dtPlayer
         * @type {Object}
         * @default null
         */
        dlPlayer: null,

        /**
         * Media time update
         * @property dlTimeupdateInterval
         * @type {Object}
         * @default null
         */
        dlTimeupdateInterval: null,

        /**
         * Method in charge to initialize youtube player
         * @method initialize
         * @override
         */
        initialize: function () {
            this.dlTimeupdateInterval = null;
            var playerId = fr.ina.amalia.player.helpers.UtilitiesHelper.generateUUID('ajs-dl-player-');
            var withControlBar = (typeof this.settings.controlBar === "object" && this.settings.controlBar.hasOwnProperty('hide') === true && this.settings.controlBar.hide === true);
            /* If you need flash support */
            videojs.options.flash.swf = this.Class.SWF_BASE_URI;
            this.dlPlayerContainer = $('<video/>', {
                'class': this.Class.dtPlayerContainerClassCss + (withControlBar ? 'vjs-default-skin' : 'vjs-controls-none' ),
                'style': this.Class.dlPlayerContainerStyle,
                'id': playerId
            });

            this.mediaContainer.append(this.dlPlayerContainer);
            this.dlPlayer = videojs(playerId, {
                techOrder: ['html5_dlmedia', 'flash_dlmedia'],
                responsive: true
            });
            this.dlPlayer.ready($.proxy(this.onReady, this));
            this.setSrc(this.settings.src, this.settings.autoplay);
            //set events
            $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenChange MSFullscreenChange', $.proxy(this.onFullscreenHandler, this));
            this.setVolume((this.localStorageManager.hasItem('volume') === false) ? this.settings.defaultVolume : this.localStorageManager.getItem('volume'));
            this._super();
        },

        onReady: function () {
            this.resizeVideoJS();
            window.onresize = $.proxy(this.resizeVideoJS, this); // Call the function on resize
        },

        resizeVideoJS: function () {
            // Get the parent element's actual width
            var w = this.mediaContainer.width();
            var h = this.getFullscreenState() ? this.mediaContainer.height() : this.mediaContainer.parent().height();
            // Set width to fill parent element, Set height
            this.dlPlayer.width(w).height(h);
        },

        /**
         * In charge to set source with autoplay state
         * @param {String} src
         * @param {Boolean} autoplay
         * @method setSrc
         */
        setSrc: function (src, autoplay) {
            this.dlPlayer.src(src);
            this.dlPlayer.on('loadedmetadata', $.proxy(this.onLoadstart, this));
            this.dlPlayer.one('durationchange', $.proxy(this.onDurationChange, this));
            this.dlPlayer.on('timeupdate', $.proxy(this.onTimeupdate, this));
            this.dlPlayer.on('error', $.proxy(this.onPlayerError, this));
            this.dlPlayer.on('playing', $.proxy(this.onPlay, this));
            this.dlPlayer.on('pause', $.proxy(this.onPause, this));
            this.dlPlayer.on('ended', $.proxy(this.onEnded, this));
        },

        /**
         * In charge to update container size
         */
        updateContainerSize: function () {
            var stickyMode = !(typeof this.settings.controlBar === "object" && this.settings.controlBar.hasOwnProperty('sticky') === true && this.settings.controlBar.sticky === true);
            if (!stickyMode) {
                var controlBarHeight = (typeof this.settings.controlBar === "object" && this.settings.controlBar.hasOwnProperty('height') === true && this.settings.controlBar.height !== "") ? this.settings.controlBar.height : 45;
                this.mediaContainer.find('iframe').first().css('height', this.mediaContainer.height() - controlBarHeight);
            }
        },

        onLoadstart: function () {
            this.hideLoader();
            var stickyMode = !(typeof this.settings.controlBar === "object" && this.settings.controlBar.hasOwnProperty('sticky') === true && this.settings.controlBar.sticky === true);
            if (!stickyMode) {
                var controlBarHeight = (typeof this.settings.controlBar === "object" && this.settings.controlBar.hasOwnProperty('height') === true && this.settings.controlBar.height !== "") ? this.settings.controlBar.height : 45;
                this.mediaContainer.find('iframe').first().css('height', this.mediaContainer.height() - controlBarHeight);
            }
            this.setVolume((this.localStorageManager.hasItem('volume') === false) ? this.settings.defaultVolume : this.localStorageManager.getItem('volume'));
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.STARTED);
        },
        /**
         * Fired on media duration change
         * @method onFirstTimeUpdate
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.STARTED
         */
        onDurationChange: function () {
            this.hideLoader();

            if (!isNaN(this.getDuration()) && this.getDuration() !== 0) {
                this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.STARTED, [
                    this
                ]);
                if (this.settings.autoplay === true) {
                    this.play();
                }
            }
            else {
                this.dlPlayer.one('durationchange', $.proxy(this.onDurationChange, this));
            }
        },
        /**
         * Fired on time change evnet
         * @method onTimeupdate
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.TIME_CHANGE
         */
        onTimeupdate: function () {
            var tcOffset = this.getTcOffset();
            var currentTime = this.getCurrentTime();
            var duration = this.getDuration() + tcOffset;
            var percentage = ((currentTime - tcOffset) * 100) / (duration - tcOffset);
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.TIME_CHANGE, {
                self: this,
                currentTime: currentTime,
                duration: duration,
                percentage: percentage,
                tcOffset: this.getTcOffset()
            });
            // In Range play mode
            if (this.isRangePlayer === true && typeof this.rangePlayerTcout === "number" && this.rangePlayerTcout <= currentTime) {
                this.pause();
            }
            if (typeof this.settings.callbacks.onTimeupdate !== "undefined") {
                try {
                    /* jslint evil: true */
                    eval(this.settings.callbacks.onTimeupdate + '(currentTime)');
                }
                catch (e) {
                    if (this.logger !== null) {
                        this.logger.warn("Send callback failed.");
                    }
                }
            }
        },
        /**
         * Fired on full-screen state change
         * @method onFullscreenHandler
         * @event fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE
         * @param {Object} event
         */
        onFullscreenHandler: function (event) {
            var inFullScreen = fr.ina.amalia.player.helpers.HTML5Helper.inFullScreen();
            var targetElement = (typeof event.originalEvent.originalTarget === "object" && typeof event.originalEvent.originalTarget.mozFullScreenElement === "object") ? $(event.originalEvent.originalTarget.mozFullScreenElement) : $(event.originalEvent.target);
            if (inFullScreen) {
                this.dlPlayer.requestFullscreen();
            } else {
                this.dlPlayer.exitFullscreen();
            }
            if (targetElement.attr('id') === this.mediaContainer.attr('id') || inFullScreen === false) {
                this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE, {
                    inFullScreen: inFullScreen
                });
            }
            else if (event.type === "MSFullscreenChange") {
                if ($(document.msFullscreenElement).attr('id') === this.mediaContainer.attr('id') || inFullScreen === false) {
                    this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE, {
                        inFullScreen: inFullScreen
                    });
                }
            }
            this.mediaContainer.toggleClass('ajs-fullscreen', inFullScreen);
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onFullscreenHandler :" + inFullScreen);
            }
        },
        onPlayerError: function (event) {
            if (this.logger !== null) {
                this.logger.warn(this.Class.fullName + " :: onPlayerError");
                this.logger.warn(event);
            }
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.ERROR, {
                self: this,
                errorCode: fr.ina.amalia.player.PlayerErrorCode.MEDIA_FILE_NOT_FOUND
            });
            this.dtPlayer.dispose();
            this.dtPlayer = null;
        },
        /**
         * Fired on playing event
         * @method onPlay
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.PLAYING
         */
        onPlay: function (event) {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onPlay");
            }
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.PLAYING, [
                this
            ]);
        },
        /**
         * Fired on paused event
         * @method onPause
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.PAUSED
         */
        onPause: function (event) {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onPause");
            }
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.PAUSED, [
                this
            ]);
        },
        /**
         * Ended event occurs when the audio/video has reached the end.
         * @method onEnded
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.ENDED
         */
        onEnded: function (event) {

            if (this.settings.duration !== null) {
                this.setCurrentTime(this.tcOffset);
                this.stop();
            }
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onEnded");
            }
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.ENDED, [
                this
            ]);
            if (typeof this.settings.callbacks.onComplete !== "undefined") {
                try {
                    /* jslint evil: true */
                    eval(this.settings.callbacks.onComplete + '()');
                }
                catch (e) {
                    if (this.logger !== null) {
                        this.logger.warn("Send callback failed.");
                    }
                }
            }
        },
        /**
         * In charge to play media
         * @method play
         */
        play: function () {
            if (this.dlPlayer !== null) {
                this.dlPlayer.play();
                this._super();
            }
        },
        /**
         * In charge to pause media
         * @method pause
         */
        pause: function () {
            if (this.dlPlayer !== null) {
                this.dlPlayer.pause();
                this._super();
            }
        },
        /**
         * In charge to stop media
         * @method stop
         */
        stop: function () {
            if (this.dlPlayer !== null) {
                //  this.dlPlayer.stopVideo();
                this._super();
            }
        },
        /**
         * In charge to set mute state
         * @method mute
         * @event fr.ina.amalia.player.PlayerEventType.MUTE
         * @return {Number}
         */
        mute: function () {
            if (this.dlPlayer !== null) {
                this.dlPlayer.muted(true);
                this._super();
            }
        },
        /**
         * In charge to set unmute state
         * @method unmute
         * @event fr.ina.amalia.player.PlayerEventType.UN_MUTE
         */
        unmute: function () {
            if (this.dlPlayer !== null) {
                this.dlPlayer.muted(false);
                this._super();
            }
        },
        /**
         * Return media duration with tc offset
         * @method getDuration
         * @return {Number}
         */
        getDuration: function () {
            return this.dlPlayer ? this.dlPlayer.duration() : 0;
        },
        /**
         * Returns the current playback volume percentage, as a number from 0 to
         * 100.
         * @method getVolume
         * @return {Number}
         */
        getVolume: function () {
            if (this.dlPlayer !== null) {
                return this.dlPlayer.volume() * 100;
            }

            return null;
        },
        /**
         * Sets the volume. Accepts an integer between 0 and 100.
         * @method getVolume
         * @return {Number}
         */
        setVolume: function (volume) {
            if (this.dlPlayer !== null) {
                this.dlPlayer.volume(volume / 100);
            }
            return this._super(volume);
        },
        /**
         * Return current position in seconds
         * @method getCurrentTime
         * @return {Number}
         */
        getCurrentTime: function () {
            if (this.dlPlayer !== null) {
                return this.dlPlayer.currentTime() + this.tcOffset;
            }
            return this.tcOffset;
        },
        /**
         * Set seek position in seconds
         * @method setCurrentTime
         * @param {Object} value
         * @event fr.ina.amalia.player.PlayerEventType.SEEK
         * @return return current time without tc offset.
         */
        setCurrentTime: function (value) {
            var currentTime = isNaN(value) ? 0 : value;
            if (this.dlPlayer !== null) {
                this.dlPlayer.currentTime(Math.max(0, currentTime - this.tcOffset));
            }
            this._super(currentTime);
        },
        /**
         * Return true if media is paused
         * @method isPaused
         * @return {Boolean}
         */
        isPaused: function () {
            if (this.dlPlayer !== null) {
                return this.dlPlayer.paused();
            }
            return null;
        },
        /**
         * This function retrieves the playback rate
         * @returns the current playback speed of the audio/video.
         */
        getPlaybackrate: function () {
            if (this.dlPlayer !== null) {
                return this.dlPlayer.playbackRate();
            }
            return null;
        },
        /**
         * This function sets the suggested playback rate
         * @param {Objecy} suggested playback rate
         */
        setPlaybackrate: function (suggestedRate) {
            if (this.dlPlayer !== null) {
                this.dlPlayer.playbackRate(suggestedRate);
            }
        },
        /**
         * Returns the current fullscreen state
         * @method getFullscreenState
         * @return {Boolean} description
         */
        getFullscreenState: function () {
            return this.dlPlayer.isFullscreen();
        }


    });