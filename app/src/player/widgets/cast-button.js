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
 * Cast widget
 * @class Cast
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend("fr.ina.amalia.player.plugins.controlBar.widgets.CastButton", {
        classCss: "iplayer-cast cast-default-button",
        style: "",
        eventTypes: {},
        STYLED_MEDIA_RECEIVER_APP_ID: '54A187F2' // default app ID to the default media receiver app
    },
    {

        logger: null,
        /**
         * Cast initialization timer delay
         **/
        CAST_API_INITIALIZATION_DELAY: 1000,
        /**
         * Progress bar update timer delay
         **/
        PROGRESS_BAR_UPDATE_DELAY: 1000,
        /**
         * Session idle time out in miliseconds
         **/
        SESSION_IDLE_TIMEOUT: 300000,
        CAST_STATE_ACTIVE: 'ajs-icon ajs-icon-chromecast-active',
        CAST_STATE_IDLE: 'ajs-icon ajs-icon-chromecast',
        CAST_STATE_WARNING: '',
        //join session
        session: null,
        storedSession: null,
        joinsessionbyid: null,
        timer: null,
        currentMediaSession: null,
        mediaCurrentTime: 0,
        currentMediaTime: 0,
        progressFlag: 1,
        /**
         * Initialize the component
         * @method initialize
         */
        initialize: function () {
            this.session = null;
            this.storedSession = null;
            this.joinsessionbyid = null;
            this.timer = null;
            this.currentMediaSession = null;
            this.mediaCurrentTime = 0;
            this.currentMediaTime = 0;
            this.progressFlag = 1;
            // Create component
            this.component = $('<div>', {
                'class': this.Class.classCss,
                'style': this.Class.style
            });
            // Add to container
            this.container.append(this.component);
            /**
             * Call initialization
             */
            if (chrome.cast || chrome.cast.isAvailable) {
                this.createButton();
                setTimeout($.proxy(this.initializeCastApi, this), this.CAST_API_INITIALIZATION_DELAY);
                this.definePlayerEvents();
            }
            else {
                if (this.logger !== null) {
                    this.logger.trace(this.Class.fullName, "chrome.cast is not available");
                }
            }

        },
        /**
         * Add player events for play button
         * @method definePlayerEvents
         */
        definePlayerEvents: function () {
            this.mediaPlayer.getContainer().on(fr.ina.amalia.player.PlayerEventType.CAST_PLAYING, $.proxy(this.onPlaying, this));
            this.mediaPlayer.getContainer().on(fr.ina.amalia.player.PlayerEventType.CAST_PAUSED, $.proxy(this.onPaused, this));
            this.mediaPlayer.getContainer().on(fr.ina.amalia.player.PlayerEventType.SEEKING, $.proxy(this.onSeek, this));
        },
        /**
         * Create button for chrome cast control
         */
        createButton: function () {
            var buttonContainer = $("<span>", {
                'class': "button-container",
                'style': 'font-size: 30px; color: white;'
            });
            var icon = $('<i>', {
                'class': this.CAST_STATE_IDLE
            });
            buttonContainer.append(icon);
            // set events
            this.component.on('click', $.proxy(this.onClickToCast, this));
            this.component.append(buttonContainer);
            // Add to container
            this.container.append(this.component);
        },
        /**
         * Initialize chrome cast API
         */
        initializeCastApi: function () {
            // auto join policy can be one of the following three
            // 1) no auto join
            // 2) same appID, same URL, same tab
            // 3) same appID and same origin URL
            var autoJoinPolicyArray = [
                chrome.cast.AutoJoinPolicy.PAGE_SCOPED,
                chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED,
                chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            ];
            // request session
            var sessionRequest = new chrome.cast.SessionRequest(this.Class.STYLED_MEDIA_RECEIVER_APP_ID);
            var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                $.proxy(this.sessionListener, this),
                $.proxy(this.receiverListener, this),
                autoJoinPolicyArray[1]);
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "initialize");
            }
            chrome.cast.initialize(apiConfig, $.proxy(this.onInitSuccess, this), $.proxy(this.onError, this));
        },
        /**
         * Load media
         * @param {string} mediaURL media URL string
         * @this loadMedia
         */
        loadMedia: function (mediaURL, currentTime) {
            if (!this.session) {
                if (this.logger !== null) {
                    this.logger.trace(this.Class.fullName, 'no session');
                }
                return;
            }

            if (mediaURL) {
                var mediaInfo = new chrome.cast.media.MediaInfo(mediaURL);
                var currentMediaTitle = this.mediaPlayer.getTitle();
                var currentMediaThumb = this.mediaPlayer.getPoster();
                mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
                mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
                mediaInfo.contentType = this.mediaPlayer.getContentType();
                if (currentMediaTitle !== "") {
                    mediaInfo.metadata.title = currentMediaTitle;
                }
                if (currentMediaThumb !== "") {
                    mediaInfo.metadata.images = [{'url': currentMediaThumb}];
                }
                var request = new chrome.cast.media.LoadRequest(mediaInfo);
                request.autoplay = true;
                request.currentTime = currentTime;
                this.session.loadMedia(request, this.onMediaDiscovered.bind(this, 'loadMedia'),
                    $.proxy(this.onMediaError, this));
                this.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.CAST_PLAYING);
            }
        },
        /**
         * Set Current time
         * @param currentTime
         */
        setCurrentTime: function (currentTime) {
            if (this.currentMediaSession !== null) {
                var request = new chrome.cast.media.SeekRequest();
                request.currentTime = currentTime;
                this.currentMediaSession.seek(request);
            }
        },
        /**
         * Initialization success callback
         */
        onInitSuccess: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, 'init success');
            }
            // check if a session ID is saved into localStorage
            this.storedSession = JSON.parse(localStorage.getItem('storedSession'));
        },

        /**
         * Generic error callback
         * @param {Object} e A chrome.cast.Error object.
         */
        onMediaError: function (e) {
            this.mediaPlayer.setCastMode(false);
            this.mediaPlayer.stop();
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onMediaError: " + e);
            }
        },

        /**
         * Generic error callback
         * @param {Object} e A chrome.cast.Error object.
         */
        onError: function (e) {
            this.mediaPlayer.setCastMode(false);
            this.mediaPlayer.stop();
            this.component.find('i').attr('class', this.CAST_STATE_IDLE);
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, e);
            }
        },

        /**
         * Generic success callback
         * @param {string} message from callback
         */
        onSuccess: function (message) {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, message);
            }
        },

        /**
         * Callback on success for stopping app
         */
        onStopAppSuccess: function () {
            this.mediaPlayer.setCastMode(false);
            this.mediaPlayer.stop();
            this.component.find('i').attr('class', this.CAST_STATE_IDLE);
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, 'Session stopped');
            }
        },

        /**
         * Session listener during initialization
         * @param {Object} e session object
         * @this sessionListener
         */
        sessionListener: function (e) {
            this.session = e;
            this.component.find('i').attr('class', this.CAST_STATE_IDLE);
            if (this.session.media.length !== 0) {
                if (this.logger !== null) {
                    this.logger.trace(this.Class.fullName, 'Found ' + this.session.media.length + ' existing media sessions.');
                }
                this.onMediaDiscovered('sessionListener', this.session.media[0]);
            }
            this.session.addMediaListener(this.onMediaDiscovered.bind(this, 'addMediaListener'));
            this.session.addUpdateListener(this.sessionUpdateListener.bind(this));
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, 'New session ID: ' + e.sessionId);
            }
        },
        /**
         * Receiver listener during initialization
         * @param {string} e status string from callback
         */
        receiverListener: function (e) {
            if (e === 'available') {
                if (this.logger !== null) {
                    this.logger.trace(this.Class.fullName, 'receiver found');
                }
            }
            else {
                if (this.logger !== null) {
                    this.logger.trace(this.Class.fullName, 'receiver list empty : ' + e);
                }
            }
        },
        /**
         * Launch app and request session
         */
        launchApp: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, 'launching app...');
            }
            chrome.cast.requestSession($.proxy(this.onRequestSessionSuccess, this), $.proxy(this.onLaunchError, this));
            if (this.timer) {
                clearInterval(this.timer);
            }
        },
        /**
         * In charge to stop casting
         */
        stopCasting: function () {
            if (this.session !== null) {
                this.session.stop(this.onStopAppSuccess.bind(this), $.proxy(this.onError, this));
            }
        },

        /**
         * Callback on success for requestSession call
         * @param {Object} e A non-null new session.
         * @this onRequestSesionSuccess
         */
        onRequestSessionSuccess: function (e) {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, 'session success: ' + e.sessionId);
            }
            this.session = e;
            this.session.addUpdateListener(this.sessionUpdateListener.bind(this));
            if (this.session.media.length !== 0) {
                this.onMediaDiscovered('onRequestSession', this.session.media[0]);
            }
            this.session.addMediaListener(this.onMediaDiscovered.bind(this, 'addMediaListener'));

            this.loadMedia(this.mediaPlayer.getSrc(), this.mediaPlayer.getCurrentTime());
        },
        /**
         * Session update listener
         * @param {boolean} isAlive status from callback
         * @this sessionUpdateListener
         */
        sessionUpdateListener: function (isAlive) {
            if (!isAlive) {
                this.session = null;
                this.component.find('i').attr('class', this.CAST_ICON_THUMB_IDLE);
            }
        },
        /**
         * Callback on success for loading media
         * @param {string} how info string from callback
         * @param {Object} mediaSession media session object
         * @this onMediaDiscovered
         */
        onMediaDiscovered: function (how, mediaSession) {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, 'new media session ID:' + mediaSession.mediaSessionId + ' (' + how + ')');
            }
            this.currentMediaSession = mediaSession;
            this.currentMediaSession.addUpdateListener($.proxy(this.onMediaStatusUpdate, this));
            this.mediaCurrentTime = this.currentMediaSession.currentTime;
        },
        /**
         * Callback for media status event
         * @param {boolean} isAlive status from callback
         */
        onMediaStatusUpdate: function (apiMedia) {
            if (!apiMedia) {
                if (this.currentMediaSession.playerState === 'IDLE') {
                    this.stopCasting();
                }
            }
            else {
                this.mediaPlayer.setCastMode(true);
                this.component.find('i').attr('class', this.CAST_STATE_ACTIVE);
            }
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, 'currentMediaSession.playerState :' + this.currentMediaSession.playerState);
            }
        },
        /**
         * Callback on launch error
         */
        onLaunchError: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, 'launch error');
            }
        },
        /**
         * Callback on click to cast button
         */
        onClickToCast: function () {
            if (this.session === null) {
                this.launchApp();
            }
        },
        /**
         * Fired on playing event for hide play button.
         * @method onPlaying
         * @param {Object} event
         */
        onPlaying: function () {
            if (this.currentMediaSession !== null) {
                this.mediaPlayer.stop();
                var playRequest = new chrome.cast.media.PlayRequest();
                this.currentMediaSession.play(playRequest);
            }
        },
        /**
         * Fired on paused event for show play button.
         * @method onPaused
         * @param {Object} event
         */
        onPaused: function () {
            if (this.currentMediaSession !== null) {
                this.mediaPlayer.stop();
                var pauseRequest = new chrome.cast.media.PauseRequest();
                this.currentMediaSession.play(pauseRequest);
            }
        },

        onSeek: function (event, data) {
            if (this.currentMediaSession !== null) {
                var duration = this.mediaPlayer.getDuration();
                var tc = (duration * data.percentage) / 100;
                this.setCurrentTime(tc);
            }
        }
    })
;
