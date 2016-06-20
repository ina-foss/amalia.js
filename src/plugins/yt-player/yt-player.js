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
 * @class YtPlayer
 * @module player
 * @namespace fr.ina.amalia.player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaContainer
 */
fr.ina.amalia.player.BasePlayer.extend("fr.ina.amalia.player.YtPlayer", {
        ytPlayerContainerClassCss: "player",
        ytPlayerContainerStyle: "position: relative; width: inherit; height: inherit; background-color: black; ",
        YT_BASE_URI: "https://www.youtube.com/iframe_api"
    },
    {
        /**
         * Youtube player container
         * @property ytPlayer
         * @type {Object}
         * @default null
         */
        ytPlayerContainer: null,
        /**
         * Youtube player
         * @property ytPlayer
         * @type {Object}
         * @default null
         */
        ytPlayer: null,
        /**
         * last state change event for onPlayerStateChange function
         * @property ytPlayer
         * @type {Object}
         * @default null
         */
        lastState: null,
        /**
         * youtybe media time update
         * @property ytTimeupdateInterval
         * @type {Object}
         * @default null
         */
        ytTimeupdateInterval: null,

        /**
         * Method in charge to initialize youtube player
         * @method initialize
         * @override
         */
        initialize: function () {
            this.ytTimeupdateInterval = null;
            this.ytPlayerContainer = $('<div/>', {
                'class': this.Class.ytPlayerContainerClassCss,
                'style': this.Class.ytPlayerContainerStyle,
                'id': fr.ina.amalia.player.helpers.UtilitiesHelper.generateUUID('ajs-yt-player')
            });
            this.mediaContainer.append(this.ytPlayerContainer);
            this.setSrc(this.settings.src, this.settings.autoplay);
            this._super();
            $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', {
                self: this
            }, this.onFullscreenHandler);
        },
        /**
         * In charge to set source with autoplay state
         * @param {String} src
         * @param {Boolean} autoplay
         * @method setSrc
         */
        setSrc: function (src, autoplay) {
            var withControlBarYt = (typeof this.settings.controlBar === "object" && this.settings.controlBar.hasOwnProperty('hide') === true && this.settings.controlBar.hide === true);
            this.ytPlayer = new YT.Player(this.ytPlayerContainer.attr('id'), {
                videoId: src,
                playerVars: {
                    'autoplay': autoplay, showinfo: 0, controls: (withControlBarYt === true) ? 1 : 0, rel: 0, showsearch: 0, iv_load_policy: 3
                },
                events: {
                    'onReady': $.proxy(this.onPlayerReady, this),
                    'onStateChange': $.proxy(this.onPlayerStateChange, this),
                    //'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
                    'onError': $.proxy(this.onPlayerError, this)
                }
            })
            ;
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
        onPlayerReady: function (event) {
            this.hideLoader();
            var stickyMode = !(typeof this.settings.controlBar === "object" && this.settings.controlBar.hasOwnProperty('sticky') === true && this.settings.controlBar.sticky === true);
            if (!stickyMode) {
                var controlBarHeight = (typeof this.settings.controlBar === "object" && this.settings.controlBar.hasOwnProperty('height') === true && this.settings.controlBar.height !== "") ? this.settings.controlBar.height : 45;
                this.mediaContainer.find('iframe').first().css('height', this.mediaContainer.height() - controlBarHeight);
            }
            event.target.setVolume((this.localStorageManager.hasItem('volume') === false) ? this.settings.defaultVolume : this.localStorageManager.getItem('volume'));
        },
        onPlayerStateChange: function (event) {
            var state = event.data;
            if (state === this.lastState) {
                return;
            }
            if (event !== null && event.hasOwnProperty('data') && event.data !== null) {
                switch (event.data) {
                    case -1:
                        this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.STARTED, [
                            this
                        ]);
                        if (this.logger !== null) {
                            this.logger.trace(this.Class.fullName + " :: PlayerState -1");
                        }
                        break;
                    case YT.PlayerState.ENDED:
                        this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.ENDED, [
                            this
                        ]);
                        clearInterval(this.ytTimeupdateInterval);
                        if (this.logger !== null) {
                            this.logger.trace(this.Class.fullName + " :: PlayerState.ENDED", state);
                        }
                        break;
                    case YT.PlayerState.PLAYING:
                        this.ytTimeupdateInterval = setInterval($.proxy(this.onTimeupdate, this), 250);
                        this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.PLAYING, [
                            this
                        ]);
                        this.hideLoader();
                        if (this.logger !== null) {
                            this.logger.trace(this.Class.fullName + " :: PlayerState.PLAYING", state);

                        }
                        break;
                    case YT.PlayerState.PAUSED:
                        clearInterval(this.ytTimeupdateInterval);

                        this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.PAUSED, [
                            this
                        ]);
                        this.hideLoader();
                        if (this.logger !== null) {
                            this.logger.trace(this.Class.fullName + " :: PlayerState.PAUSED");
                        }
                        break;
                    case YT.PlayerState.BUFFERING:
                        this.showLoader();
                        if (this.logger !== null) {
                            this.logger.trace(this.Class.fullName + " :: PlayerState.BUFFERING");
                        }
                        break;
                    case YT.PlayerState.CUED:
                        this.hideLoader();
                        break;
                }
            }
            this.lastState = state;
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
            this.ytPlayer.stopVideo();
            this.ytPlayer.destroy();
            this.ytPlayer = null;
        },
        /**
         * Fired on full-screen state change
         * @method onFullscreenHandler
         * @event fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE
         * @param {Object} event
         */
        onFullscreenHandler: function (event) {
            if ($(event.originalEvent.target).attr('id') === event.data.self.mediaContainer.attr('id')) {
                event.data.self.updateContainerSize();
                if (event.data.self.logger !== null) {
                    event.data.self.logger.trace(event.data.self.Class.fullName, "onFullscreenHandler updateContainerSize");
                }
            }
        },
        /**
         * In charge to play media
         * @method play
         */
        play: function () {
            if (this.ytPlayer !== null) {
                this.ytPlayer.playVideo();
                this._super();
            }
        },
        /**
         * In charge to pause media
         * @method pause
         */
        pause: function () {
            if (this.ytPlayer !== null) {
                this.ytPlayer.pauseVideo();
                this._super();
            }
        },
        /**
         * In charge to stop media
         * @method stop
         */
        stop: function () {
            if (this.ytPlayer !== null) {
                this.ytPlayer.stopVideo();
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
            if (this.ytPlayer !== null) {
                this.ytPlayer.mute();
                this._super();
            }
        },
        /**
         * In charge to set unmute state
         * @method unmute
         * @event fr.ina.amalia.player.PlayerEventType.UN_MUTE
         */
        unmute: function () {
            if (this.ytPlayer !== null) {
                this.ytPlayer.unMute();
                this._super();
            }
        },
        /**
         * Return media duration with tc offset
         * @method getDuration
         * @return {Number}
         */
        getDuration: function () {
            return this.ytPlayer ? this.ytPlayer.getDuration() : 0;
        },
        /**
         * Returns the current playback volume percentage, as a number from 0 to
         * 100.
         * @method getVolume
         * @return {Number}
         */
        getVolume: function () {
            if (this.ytPlayer !== null) {
                return this.ytPlayer.getVolume();
            }
            return null;
        },
        /**
         * Sets the volume. Accepts an integer between 0 and 100.
         * @method getVolume
         * @return {Number}
         */
        setVolume: function (volume) {
            if (this.ytPlayer !== null) {
                return this.ytPlayer.setVolume(volume);
            }
            return null;
        },
        /**
         * Return current position in seconds
         * @method getCurrentTime
         * @return {Number}
         */
        getCurrentTime: function () {
            if (this.ytPlayer !== null) {
                return this.ytPlayer.getCurrentTime() + this.tcOffset;
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
            if (this.ytPlayer !== null) {
                this.ytPlayer.seekTo(Math.max(0, currentTime - this.tcOffset), true);
            }
            this._super(currentTime);
        },
        /**
         * Return true if media is paused
         * @method isPaused
         * @return {Boolean}
         */
        isPaused: function () {
            if (this.ytPlayer !== null) {
                return (this.lastState === YT.PlayerState.PAUSED);
            }
            return null;
        },
        /**
         * This function retrieves the playback rate
         * @returns the current playback speed of the audio/video.
         */
        getPlaybackrate: function () {
            if (this.ytPlayer !== null) {
                return this.ytPlayer.getPlaybackRate();
            }
            return null;
        },
        /**
         * This function sets the suggested playback rate
         * @param {Objecy} suggested playback rate
         */
        setPlaybackrate: function (suggestedRate) {
            if (this.ytPlayer !== null) {
                this.ytPlayer.setPlaybackrate(suggestedRate);
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
        }
    });