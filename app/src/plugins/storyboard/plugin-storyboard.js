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
 * In charge to display storyboard
 * @class StoryboardPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-watermark
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBase.extend("fr.ina.amalia.player.plugins.StoryboardPlugin", {
        classCss: "ajs-plugin plugin-storyboard",
        eventTypes: {}
    },
    {
        /**
         * Thumbnail overlay canvas
         * @property thumbnailOverlayCanvas
         * @type {Object}
         * @default []
         */
        thumbnailOverlayCanvas: null,
        /**
         * storyboard image obj
         * @property storyboardImageObj
         * @type {Object}
         * @default []
         */
        storyboardImageObj: null,
        /**
         * Main container of this plugin
         * @property container
         * @type {Object}
         * @default []
         */
        container: null,
        /**
         * Position calculator
         * @property positionCalculator
         * @type {Function}
         * @default []
         */
        positionCalculator: null,
        /**
         * Initialize storyboard plugin and create container of this plugin
         * @method initialize
         */
        initialize: function () {
            this._super();
            this.thumbnailOverlayCanvas = null;
            this.settings = $.extend({
                topOffset: 80,
                framePositionCalculator: 'fr.ina.amalia.player.BaseFramePositionCalculator',
                storyboardSourceFile: '',
                framePreviewWidth: 160,
                framePreviewHeight: 90,
                storyboardRow: 36,
                storyboardCol: 10,
                fadeInDuration: 300,
                fadeOutDuration: 600,
                fadeInEffect: 'swing',
                fadeOutEffect: 'easeInExpo',
                filmstrip: true,
                thumbScale: 1.5
            }, this.settings.parameters || {});

            if (this.settings.storyboardSourceFile !== '') {
                this.container = $('<div>', {
                    'class': this.Class.classCss
                });
                try {
                    /* jslint evil: true */
                    this.positionCalculator = eval(this.settings.framePositionCalculator + '.getFrameByTc');
                }
                catch (e) {
                    this.positionCalculator = fr.ina.amalia.player.BaseFramePositionCalculator.getFrameByTc;
                    if (this.logger !== null) {
                        this.logger.warn("Set Default position calculator");
                    }
                }
                this.storyboardImageObj = new Image();
                this.storyboardImageObj.src = this.settings.storyboardSourceFile;
                this.pluginContainer.append(this.container);
                this.createStoryboardElement();
                this.defineListeners();
            }
        },
        /**
         * Set player events
         * @method defineListeners
         */
        defineListeners: function () {
            var mainContainer = this.mediaPlayer.getContainer();
            // Player events
            mainContainer.one(fr.ina.amalia.player.PlayerEventType.TIME_CHANGE, {
                self: this
            }, this.onPluginReady);
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.START_SEEKING, {
                self: this
            }, this.onStartSeeking);
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.SEEKING, {
                self: this
            }, this.onSeeking);
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.STOP_SEEKING, {
                self: this
            }, this.onStopSeeking);
            // call function 200 ms after resize is complete.
            $(window).on('debouncedresize', {
                self: this
            }, this.onWindowResize);
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "definePlayerListeners");
            }
        },
        /**
         * Initialize watermark plugin on load start event and create plugin
         * container
         * @method initializeOnLoadStart
         * @returns {undefined}
         */
        initializeOnLoadStart: function () {
            this.updateFramePreview(0);
        },
        /**
         * In charge to create watermark element
         * @method createWatermarkElement
         */
        createStoryboardElement: function () {
            var storyboard = $('<div>', {
                'class': 'preview-storyboard'
            });
            var thumbnail = $('<div>', {
                'class': 'thumbnail'
            });
            thumbnail.css({
                'bottom': this.settings.topOffset,
                'height': this.settings.framePreviewHeight,
                'width': this.settings.framePreviewWidth,
                'margin-left': -this.settings.framePreviewWidth / 2,
                'background-image': 'url(' + this.settings.storyboardSourceFile + ')'

            });
            //Filmstrip
            if (this.settings.filmstrip === true) {
                var filmstripContainer = $('<div>', {
                    'class': 'filmstrip'
                });
                filmstripContainer.css({
                    'bottom': this.settings.topOffset,
                    'height': this.settings.framePreviewHeight
                });
                this.container.append(filmstripContainer);
            }
            var thumbnailOverlay = $('<canvas>', {
                'class': 'thumbnail-overlay'
            });
            thumbnailOverlay.attr('width', this.settings.framePreviewWidth);
            thumbnailOverlay.attr('height', this.settings.framePreviewHeight);
            this.thumbnailOverlayCanvas = thumbnailOverlay.get(0).getContext('2d');
            storyboard.append(thumbnailOverlay);
            this.container.append(thumbnail);
            this.container.append(storyboard);
            this.updateFramePreview(0);
        },
        /**
         * In charge to update frame preview
         * @method updateFramePreview
         */
        updateFramePreview: function (percentage) {
            var videoSize = this.getVideoSize();
            var width = videoSize.w;
            var height = videoSize.h;
            var left = (this.container.width() - width) / 2;
            var top = (this.container.height() - height - this.settings.topOffset) / 2;
            this.container.find('.preview-storyboard').css({
                width: width + 'px',
                height: height + 'px',
                top: top + 'px',
                left: left + 'px'
            });
            var duration = this.mediaPlayer.getDuration();
            var tc = percentage * 10 * duration / 1000;
            if (this.positionCalculator !== null && typeof this.positionCalculator !== "undefined") {
                var pos = this.positionCalculator(tc, duration, this.settings.storyboardCol, this.settings.storyboardRow, this.settings.framePreviewHeight, this.settings.framePreviewWidth);
                this.container.find('.thumbnail').css({'background-position': Math.round(pos.x) + 'px ' + Math.round(pos.y) + 'px'});
                this.thumbnailOverlayCanvas.drawImage(this.storyboardImageObj, pos.x, pos.y, this.settings.framePreviewWidth * this.settings.storyboardCol, this.settings.framePreviewHeight * this.settings.storyboardRow);
                //update filmstripPos
                if (this.settings.filmstrip === true) {
                    this.updateFilmstrip(percentage * 10);
                }
            }
        },
        /**
         * In charge to refresh filmstrip container
         * @param percentage
         */
        updateFilmstrip: function (percentage) {
            var maxItem = Math.ceil(this.container.width() / this.settings.framePreviewWidth);
            var duration = this.mediaPlayer.getDuration();
            var startPercent = Math.max(0, percentage - maxItem);
            var endPercent = Math.min(1000, percentage + maxItem);
            this.container.find('.filmstrip').empty();
            var leftPos = this.container.width() / 2 - ( this.settings.framePreviewWidth / 2);
            for (var leftPercent = percentage; leftPercent > startPercent; leftPercent--) {
                var tcLeft = leftPercent * duration / 1000;
                var getPosLeft = this.positionCalculator(tcLeft, duration, this.settings.storyboardCol, this.settings.storyboardRow, this.settings.framePreviewHeight, this.settings.framePreviewWidth);
                var filmstripItemLeft = $('<div>', {'class': 'storyboard-thumbnail left'});
                filmstripItemLeft.css({
                    'background-position': getPosLeft.x + 'px ' + getPosLeft.y + 'px',
                    'left': leftPos + 'px',
                    'height': this.settings.framePreviewHeight,
                    'width': this.settings.framePreviewWidth,
                    'background-image': 'url(' + this.settings.storyboardSourceFile + ')'
                });
                this.container.find('.filmstrip').append(filmstripItemLeft);
                leftPos -= this.settings.framePreviewWidth;
            }
            var rightPos = this.container.width() / 2 - ( this.settings.framePreviewWidth / 2);
            for (var rightPercent = percentage; rightPercent < endPercent; rightPercent++) {
                var tcRight = rightPercent * duration / 1000;
                var getPosRight = this.positionCalculator(tcRight, duration, this.settings.storyboardCol, this.settings.storyboardRow, this.settings.framePreviewHeight, this.settings.framePreviewWidth);
                var filmstripItemRight = $('<div>', {'class': 'storyboard-thumbnail right'});
                filmstripItemRight.css({
                    'background-position': getPosRight.x + 'px ' + getPosRight.y + 'px',
                    'left': rightPos + 'px',
                    'height': this.settings.framePreviewHeight,
                    'width': this.settings.framePreviewWidth,
                    'background-image': 'url(' + this.settings.storyboardSourceFile + ')'
                });
                this.container.find('.filmstrip').append(filmstripItemRight);
                rightPos += this.settings.framePreviewWidth;
            }
        },
        /**
         * Return video size
         * @method getVideoSize
         * @return {Object}
         */
        getVideoSize: function () {
            var player = this.mediaPlayer.getMediaPlayer();
            var videoHeight = player.get(0).videoHeight;
            var videoWidth = player.get(0).videoWidth;
            if (videoHeight === 0) {
                videoHeight = player.height();
            }
            if (videoWidth === 0) {
                videoWidth = player.width();
            }
            var widthRatio = player.width() / videoWidth;
            var heightRatio = player.height() / videoHeight;
            var ratio = Math.min(widthRatio, heightRatio);
            return {
                w: ratio * videoWidth,
                h: ratio * videoHeight
            };
        },
        /** Player Events * */
        /**
         * Fired when plugin ready event
         * @method onPluginReady
         * @param {Object} event
         */
        onPluginReady: function (event) {
            event.data.self.initializeOnLoadStart();
        },
        /**
         * Fired on windows resize event
         * @method onWindowResize
         * @param {Object} event
         */
        onWindowResize: function (event) {
            event.data.self.updateFramePreview();
        },
        /**
         * Fired on seeking event
         * @method onStartSeeking
         * @param {Object} event
         */
        onStartSeeking: function (event) {
            event.data.self.container.fadeIn({
                duration: event.data.self.settings.fadeInDuration,
                easing: event.data.self.settings.fadeInEffect
            });
        },
        /**
         * Fired on seeking event
         * @method onSeeking
         * @param {Object} event
         */
        onSeeking: function (event, data) {
            event.data.self.updateFramePreview(data.percentage);
        },
        /**
         * Fired on seeking event
         * @method onStopSeeking
         * @param {Object} event
         */
        onStopSeeking: function (event) {
            event.data.self.container.fadeOut({
                duration: event.data.self.settings.fadeOutDuration,
                easing: event.data.self.settings.fadeOutEffect
            });
        }
    });