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
 * Progress bar widget
 * @class ProgressBar
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend("fr.ina.amalia.player.plugins.controlBar.widgets.ProgressBar", {
        classCss: "player-progress-bar",
        style: ""
    },
    {
        /**
         * Slider start value
         * @property sliderStart
         * @type {Number}
         * @default 0
         */
        sliderStart: 0,
        /**
         * Slider end value
         * @property sliderEnd
         * @type {Object}
         * @default 1000
         */
        sliderEnd: 1000,
        /**
         * Slider state, true in sliding mode
         * @property sliding
         * @type {Boolean}
         * @default false
         */
        sliding: false,
        /**
         * Defines configuration
         * @property defaultValue
         * @type {Number}
         * @default 0
         */
        defaultValue: 0,
        /**
         * Last slide event
         * @property lastSlideEvent
         * @type {Number}
         * @default 0
         */
        lastSlideEvent: 0,
        /**
         * Last playback state, true for playing state
         * @property lastPlaybackState
         * @type {Boolean}
         * @default 0
         */
        lastPlaybackState: false,

        /**
         * Initialize the component
         * @method initialize
         */
        initialize: function () {
            this.lastPlaybackState = false;
            // Create component
            this.component = $('<div>', {
                'class': this.Class.classCss,
                'style': this.Class.style
            });
            // ui bootstrap
            this.component.slider({
                range: "min",
                min: this.sliderStart,
                max: this.sliderEnd,
                value: this.defaultValue,
                height: 10,
                framepreview: true,
                framepreviewTimeBound: 500
            });
            this.component.prepend($('<div>', {
                class: 'buffer-bar'
            }));
            // set events
            this.component.on('slidestart', {
                self: this,
                component: this.component
            }, this.onSlideStart);
            this.component.on('slidestop', {
                self: this,
                component: this.component
            }, this.onSlideStop);

            // Add event on slide
            this.component.on('slide', {
                self: this,
                component: this.component
            }, this.onSlide);

            // Add to container
            this.container.append(this.component);
            this.definePlayerEvents();
        },
        /**
         * Set progress bar value.
         * @method setValue
         * @param {Object} value
         */
        setValue: function (value) {
            if (this.sliding === false) {
                this.component.slider("value", value * 10);
            }
        },
        /**
         * Set progress bar title
         * @method setTitle
         * @param {Object} value
         */
        setTitle: function (value) {
            this.component.attr("title", value);
        },
        /**
         * Update buffer component
         * @method updateBuffer
         * @param {Object} bufferOffset
         * @param {Object} bufferWidth
         */
        updateBuffer: function (bufferOffset, bufferWidth) {
            this.component.find('.buffer-bar').css({
                "left": bufferOffset + '%',
                'width': bufferWidth + '%'
            });
        },
        /**
         * Add player events listener
         * @method definePlayerEvents
         */
        definePlayerEvents: function () {
            this.mediaPlayer.getContainer().on(fr.ina.amalia.player.PlayerEventType.TIME_CHANGE, {
                self: this
            }, this.onTimechange);
        },
        /**
         * Fired on time change event for update progress bar position
         * @method onTimechange
         * @param {Object} event
         * @param {Object} data
         */
        onTimechange: function (event, data) {
            var currentTime = fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(data.currentTime, event.data.self.settings.framerate, event.data.self.settings.timeFormat);
            // Set progress bar position
            event.data.self.setValue(data.percentage);
            // Set tooltip time
            event.data.self.setTitle(currentTime);
            if (event.data.self.mediaPlayer.getMediaPlayer() !== null && typeof event.data.self.mediaPlayer.getMediaPlayer().get(0).buffered !== "undefined" && event.data.self.mediaPlayer.getMediaPlayer().get(0).buffered.length > 0) {
                // The buffered regions of the video
                var currentBuffer = event.data.self.mediaPlayer.getMediaPlayer().get(0).buffered.end(Math.max(0, event.data.self.mediaPlayer.getMediaPlayer().get(0).buffered.length - 1));
                var bufferPercentage = 100 * currentBuffer / (data.duration - data.tcOffset);
                event.data.self.updateBuffer(0, bufferPercentage);
            }
        },
        /**
         * Fired on slide start
         * @method onSlideStart
         * @param {Object} event
         * @param {Object} ui
         */
        onSlideStart: function (event, ui) {
            event.data.self.sliding = true;
            event.data.self.lastPlaybackState = !event.data.self.mediaPlayer.isPaused();
            event.data.self.mediaPlayer.pause();
            event.data.self.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.START_SEEKING, {
                percentage: ui.value / 10
            });
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onSlideStart Value : " + ui.value);
            }
        },
        /**
         * Fired on slide end
         * @method onSlideStop
         * @param {Object} event
         * @param {Object} ui
         */
        onSlideStop: function (event, ui) {
            event.data.self.sliding = false;
            var duration = event.data.self.mediaPlayer.getDuration();
            var percentage = ui.value / 10;
            var tc = (duration * percentage) / 100;
            event.data.self.mediaPlayer.setCurrentTime(tc + event.data.self.mediaPlayer.getTcOffset());
            if (event.data.self.lastPlaybackState === true) {
                event.data.self.mediaPlayer.play();
            }
            event.data.self.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.STOP_SEEKING, {
                percentage: ui.value / 10
            });
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onSlideStop value : " + ui.value);
            }
        },
        /**
         * Fired on slide event
         * @method onSlide
         * @param {Object} event
         * @param {Object} ui
         */
        onSlide: function (event, ui) {

            event.data.self.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.SEEKING, {
                percentage: ui.value / 10
            });
            // Only if framepreview is enabled
            if (event.data.self.parameter.framepreview === true) {
                var slideEvent = new Date();
                var diff = (slideEvent - event.data.self.lastSlideEvent);
                if (diff > event.data.self.parameter.framepreviewTimeBound) {
                    event.data.self.lastSlideEvent = new Date();
                    var duration = event.data.self.mediaPlayer.getDuration();
                    var percentage = ui.value / 10;
                    var tc = (duration * percentage) / 100;
                    event.data.self.mediaPlayer.setCurrentTime(tc + event.data.self.mediaPlayer.getTcOffset());
                    if (event.data.self.logger !== null) {
                        event.data.self.logger.trace(event.data.self.Class.fullName, "onSlide value : " + ui.value);
                    }
                }
            }

        }
    });
