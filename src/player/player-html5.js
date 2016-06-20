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
 * @class PlayerHtml5
 * @module player
 * @namespace fr.ina.amalia.player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaContainer
 */
fr.ina.amalia.player.BasePlayer.extend("fr.ina.amalia.player.PlayerHtml5", {},
    {


        /**
         * Method in charge to initialize player : - Create containers - Load
         * plugins
         * @method initialize
         * @override
         */
        initialize: function () {
            this.lastSeekTime = 0;
            this.createPlayer();
            this.setSrc(this.settings.src, this.settings.autoplay);
            // set default volume
            this.setVolume((this.localStorageManager.hasItem('volume') === false) ? this.settings.defaultVolume : this.localStorageManager.getItem('volume'));
            this._super();
        },
        /**
         * In charge to set source with autoplay state
         * @param {String} src
         * @param {Boolean} autoplay
         * @method setSrc
         */
        setSrc: function (src, autoplay) {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "setSrc:" + src);
            }

            if (this.settings.mediaType === "mpd") {
                this.mediaTypeManager = new fr.ina.amalia.player.media.type.DashMpeg(this.settings, this);
                this.mediaTypeManager.setSrc(src);
            }
            else {
                // charge la video
                this.mediaPlayer.find('source:first').attr({
                    src: src
                });
                if (this.settings.mediaType !== "") {
                    this.mediaPlayer.find('source:first').attr('type', this.settings.mediaType);
                }
                this.load();
            }
            this._super(src, autoplay);
        },
        /**
         * In charge to create Player dom element
         * @method createPlayer
         */
        createPlayer: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "createPlayer");
            }

            this.mediaPlayer = $('<video/>', {
                'class': this.Class.mediaPlayerClassCss,
                'style': this.Class.mediaPlayerStyleCss,
                'x-webkit-airplay': 'allow'
                //'webkit-playsinline':''
            });
            // Add cross origin
            if (this.settings.crossorigin !== "") {
                this.mediaPlayer.attr('crossorigin', this.settings.crossorigin);
            }
            // preload
            if (this.settings.hasOwnProperty('preload') && this.settings.preload !== "") {
                this.mediaPlayer.attr('preload', this.settings.preload);
            }

            if (this.getPoster() !== "") {
                this.mediaPlayer.attr('poster', this.getPoster());
            }


            //support mpeg dash
            if (this.settings.mediaType !== "mpd") {
                var source = $('<source />');
                this.mediaPlayer.append(source);
            }
            this.mediaContainer.append(this.mediaPlayer);
            this.initEvents();
        },

        /**
         * In charge to set player events
         * @method initEvents
         */
        initEvents: function () {
            this._super();
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "adEvents");
            }
            this.mediaPlayer.on('loadstart', {
                self: this
            }, this.onLoadstart);
            this.mediaPlayer.on('playing', {
                self: this
            }, this.onPlay);
            this.mediaPlayer.on('pause', {
                self: this
            }, this.onPause);
            this.mediaPlayer.on('ended', {
                self: this
            }, this.onEnded);
            this.mediaPlayer.one('durationchange', {
                self: this
            }, this.onDurationchange);
            this.mediaPlayer.on('timeupdate', {
                self: this
            }, this.onTimeupdate);
            this.mediaPlayer.find("source").on('error', {
                self: this
            }, this.onSourceError);
            this.mediaPlayer.on('seeked', {
                self: this
            }, this.onSeeked);
            if (this.settings.togglePlayPause === true) {
                this.mediaPlayer.on('click', $.proxy(this.togglePlayPause, this));
            }
            $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenChange MSFullscreenChange', {
                self: this
            }, this.onFullscreenHandler);

        },
        /**
         * In charge to load media
         * @method load
         */
        load: function () {
            this.mediaPlayer.get(0).load();
        },

        /**
         * In charge to play media
         * @method play
         */
        play: function () {
            this.mediaPlayer.get(0).play();
            this._super();
        },
        /**
         * In charge to pause media
         * @method pause
         */
        pause: function () {
            this._super();
            this.mediaPlayer.get(0).pause();

        },
        /**
         * In charge to stop media
         * @method stop
         */
        stop: function () {
            this.mediaPlayer.get(0).pause();
            this.mediaPlayer.get(0).currentTime = 0;
            this._super();
        },

        /**
         * In charge to set mute state
         * @method mute
         * @event fr.ina.amalia.player.PlayerEventType.MUTE
         * @return {Number}
         */
        mute: function () {
            this.mediaPlayer.get(0).volume = 0;
            this._super();
        },
        /**
         * In charge to set unmute state
         * @method unmute
         * @event fr.ina.amalia.player.PlayerEventType.UN_MUTE
         */
        unmute: function () {
            this.mediaPlayer.get(0).volume = 1;
            this._super();
        },

        /**
         * Return media duration with tc offset
         * @method getDuration
         * @return {Number}
         */
        getDuration: function () {
            return this._super(this.settings.duration === null ? this.mediaPlayer.get(0).duration : parseFloat(this.settings.duration));
        },

        /**
         * Returns the player's current volume, an integer between 0 and 100. Note that getVolume() will return the volume even if the player is muted.
         * @method getVolume
         * @return {Number}
         */
        getVolume: function () {
            return this.mediaPlayer.get(0).volume * 100;
        },

        /**
         * Sets the volume. Accepts an integer between 0 and 100.
         * @method setVolume
         * @param {Number} volume
         */
        setVolume: function (volume) {
            this.mediaPlayer.get(0).volume = volume / 100;
            return this._super(volume);
        },
        /**
         * Return current position in seconds
         * @method getCurrentTime
         * @return {Number}
         */
        getCurrentTime: function () {
            return this._super(this.mediaPlayer.get(0).currentTime);
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
            if (this.settings.duration === null) {
                this.mediaPlayer.get(0).currentTime = Math.max(0, currentTime - this.tcOffset);
            } else {
                this.lastSeekTime = Math.max(0, currentTime - this.tcOffset);
                var startTime = Math.max(0, currentTime - this.tcOffset);
                var newSrc = this.settings.src.search(/\?/) === -1 ? this.settings.src + '?start=' + startTime : this.settings.src + '&start=' + startTime;
                this.setSrc(newSrc, true);
            }
            this._super(currentTime);
        },
        /**
         * Return playback rate
         * @returns the current playback speed of the audio/video.
         */
        getPlaybackrate: function () {
            return this.mediaPlayer.get(0).playbackRate;
        },
        /**
         * Set playback rate
         * @param {Objecy} speed the current playback speed of the audio/video.
         * @returns the current playback speed of the audio/video.
         */
        setPlaybackrate: function (speed) {
            var self = this;
            if (speed <= 0) {
                clearInterval(self.intervalRewind);
                self.intervalRewind = setInterval(function () {
                    self.mediaPlayer.get(0).playbackRate = 1;
                    var currentTime = self.getCurrentTime();
                    if (currentTime === 0) {
                        self.mediaPlayer.get(0).playbackRate = 1.0;
                        clearInterval(self.intervalRewind);
                        self.pause();
                    }
                    else {
                        currentTime += speed;
                        self.setCurrentTime(currentTime);
                    }
                }, 30);
            }
            else {
                clearInterval(self.intervalRewind);
                if (this.isPaused()) {
                    this.play();
                }
                self.mediaPlayer.get(0).playbackRate = parseFloat(speed);
            }
            this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.PLAYBACK_RATE_CHANGE, {
                rate: speed
            });
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "setPlaybackrate :" + speed);
            }
        },
        /**
         * return media content type
         * @method getContentType
         * @return {Boolean} description
         */
        getContentType: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "getContentType");
            }
            return this.mediaPlayer.find('source').get(0);
        },
        /**
         * Returns the current fullscreen state
         * @method getFullscreenState
         * @return {Boolean} true  if container is in full-screen mode
         */
        getFullscreenState: function () {
            return fr.ina.amalia.player.helpers.HTML5Helper.inFullScreen();
        },

        /**
         * Return true if media is paused
         * @method isPaused
         * @return {Boolean}
         */
        isPaused: function () {
            return this.mediaPlayer.get(0).paused;
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
            if (targetElement.attr('id') === event.data.self.mediaContainer.attr('id') || inFullScreen === false) {
                event.data.self.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE, {
                    inFullScreen: inFullScreen
                });
            }
            else if (event.type === "MSFullscreenChange") {
                if ($(document.msFullscreenElement).attr('id') === event.data.self.mediaContainer.attr('id') || inFullScreen === false) {
                    event.data.self.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE, {
                        inFullScreen: inFullScreen
                    });
                }
            }
            event.data.self.mediaContainer.toggleClass('ajs-fullscreen', inFullScreen);
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onFullscreenHandler :" + inFullScreen);
            }
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
         * Return current image
         * @param {Nomber} scale max 1=> 100%
         * @method getCurrentImage
         * @event fr.ina.amalia.player.PlayerEventType.IMAGE_CAPTURE
         */
        getCurrentImage: function (scale) {
            var image = "";
            try {
                var videoContent = this.mediaPlayer.get(0);
                var canvas = document.createElement("canvas");
                scale = (typeof scale !== 'undefined') ? Math.min(1, parseFloat(scale)) : 1;
                canvas.width = videoContent.videoWidth * scale;
                canvas.height = videoContent.videoHeight * scale;
                canvas.getContext('2d').drawImage(videoContent, 0, 0, canvas.width, canvas.height);
                image = canvas.toDataURL("image/png");
                this.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.IMAGE_CAPTURE, {
                    currentTime: this.getCurrentTime(),
                    captureTc: this.getCurrentTime(),
                    captureId: this.getCurrentTime(),
                    captureImage: image.toString()
                });
                return image;
            }
            catch (error) {
                if (this.logger !== null) {
                    this.logger.warn("Error lors de la capture d'imagette");
                    this.logger.warn(error.stack);
                }
            }
            return image;
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
         * Fired on load start event
         * @method onLoadstart
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.STARTED
         */
        onLoadstart: function (event) {
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onLoadstart");
            }
            if (typeof event.data.self.settings.callbacks.onReady !== "undefined") {
                try {
                    /* jslint evil: true */
                    eval(event.data.self.settings.callbacks.onReady + '()');
                }
                catch (e) {
                    if (event.data.self.logger !== null) {
                        event.data.self.logger.warn("Send callback failed.");
                    }
                }
            }
        },
        /**
         * Fired on playing event
         * @method onPlay
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.PLAYING
         */
        onPlay: function (event) {
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onPlay");
            }
            event.data.self.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.PLAYING, [
                event.data.self
            ]);
        },
        /**
         * Fired on paused event
         * @method onPause
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.PAUSED
         */
        onPause: function (event) {
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onPause");
            }
            event.data.self.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.PAUSED, [
                event.data.self
            ]);
        },
        /**
         * @method onSeeked
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.SEEK
         */
        onSeeked: function (event) {
            event.data.self.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.SEEK, {
                currentTime: event.data.self.getCurrentTime()
            });
            // Lecture d'un segment
            if (typeof event.data.self.captureTc === "number") {
                try {
                    event.data.self.getCurrentImage(event.data.self.captureScale);
                    event.data.self.captureTc = null;
                }
                catch (error) {
                    if (event.data.self.logger !== null) {
                        event.data.self.logger.warn("Error to capture Tc");
                        event.data.self.logger.warn(error.stack);
                    }
                }
            }
        },
        /**
         * Ended event occurs when the audio/video has reached the end.
         * @method onEnded
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.ENDED
         */
        onEnded: function (event) {

            if (event.data.self.settings.duration !== null) {
                event.data.self.setCurrentTime(event.data.self.tcOffset);
                event.data.self.stop();
            }
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onEnded");
            }
            event.data.self.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.ENDED, [
                event.data.self
            ]);
            if (typeof event.data.self.settings.callbacks.onComplete !== "undefined") {
                try {
                    /* jslint evil: true */
                    eval(event.data.self.settings.callbacks.onComplete + '()');
                }
                catch (e) {
                    if (event.data.self.logger !== null) {
                        event.data.self.logger.warn("Send callback failed.");
                    }
                }
            }
        },
        /**
         * Fired on media duration change
         * @method onFirstTimeUpdate
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.STARTED
         */
        onDurationchange: function (event) {
            event.data.self.hideLoader();
            if (!isNaN(event.data.self.getDuration()) && event.data.self.getDuration() !== 0) {
                event.data.self.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.STARTED, [
                    event.data.self
                ]);
                if (event.data.self.settings.autoplay === true) {
                    event.data.self.play();
                }
            }
            else {
                event.data.self.mediaPlayer.one('durationchange', {
                    self: event.data.self
                }, event.data.self.onDurationchange);
            }
        },
        /**
         * Fired on time change evnet
         * @method onTimeupdate
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.TIME_CHANGE
         */
        onTimeupdate: function (event) {
            var tcOffset = event.data.self.getTcOffset();
            var currentTime = event.data.self.getCurrentTime();
            var duration = event.data.self.getDuration() + tcOffset;
            var percentage = ((currentTime - tcOffset) * 100) / (duration - tcOffset);

            event.data.self.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.TIME_CHANGE, {
                self: event.data.self,
                currentTime: currentTime,
                duration: duration,
                percentage: percentage,
                tcOffset: event.data.self.getTcOffset()
            });
            // In Range play mode
            if (event.data.self.isRangePlayer === true && typeof event.data.self.rangePlayerTcout === "number" && event.data.self.rangePlayerTcout <= currentTime) {
                event.data.self.pause();
            }
            if (typeof event.data.self.settings.callbacks.onTimeupdate !== "undefined") {
                try {
                    /* jslint evil: true */
                    eval(event.data.self.settings.callbacks.onTimeupdate + '(currentTime)');
                }
                catch (e) {
                    if (event.data.self.logger !== null) {
                        event.data.self.logger.warn("Send callback failed.");
                    }
                }
            }
        },
        /**
         * Fired when error to load media
         * @method onSourceError
         * @param {Object} event
         * @event fr.ina.amalia.player.PlayerEventType.ERROR
         */
        onSourceError: function (event) {
            if (event.data.self.logger !== null) {
                event.data.self.logger.warn(event.data.self.Class.fullName + " :: onSourceError");
                event.data.self.logger.warn(event);
            }
            event.data.self.mediaContainer.trigger(fr.ina.amalia.player.PlayerEventType.ERROR, {
                self: event.data.self,
                errorCode: fr.ina.amalia.player.PlayerErrorCode.MEDIA_FILE_NOT_FOUND
            });
        }

    });
