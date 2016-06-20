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
 * In charge to progress bar plugin
 * @class ProgressBarPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-watermark
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBase.extend("fr.ina.amalia.player.plugins.ProgressBarPlugin", {
        classCss: "ajs-plugin plugin-progress-bar",
        eventTypes: {}
    },
    {
        /**
         * Main container of this plugin
         * @property container
         * @type {Object}
         * @default []
         */
        container: null,
        /**
         * progressBar container
         * @property progressBar
         * @type {Object}
         * @default []
         */
        progressBar: null,
        /**
         * progressBar container
         * @property sliding
         * @type {Object}
         * @default []
         */
        sliding: false,
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
         * Defines configuration
         * @property defaultValue
         * @type {Number}
         * @default 0
         */
        defaultValue: 0,
        /**
         * Initialize watermark plugin and create container of this plugin
         * @method initialize
         */
        initialize: function () {
            this._super();
            this.sliding = false;
            this.settings = $.extend({
                framerate: '25',
                timeFormat: 'f'
            }, this.settings.parameters || {});
            this.container = $('<div>', {
                'class': this.Class.classCss
            });
            this.pluginContainer.append(this.container);
            this.createProgressBarElement();
            this.defineListeners();

        },
        /**
         * Set player events
         * @method defineListeners
         */
        defineListeners: function () {
            this.mediaPlayer.getContainer().on(fr.ina.amalia.player.PlayerEventType.TIME_CHANGE, {
                self: this
            }, this.onTimechange);

            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "definePlayerListeners");
            }
        },
        /**
         * In charge to create watermark element
         * @method createWatermarkElement
         */
        createProgressBarElement: function () {
            this.timeIndicatorContainer = $('<div>', {
                class: 'ajs-time-indicator'
            });
            var timeIndicator = $('<span>', {
                class: 'ajs-tooltip-text'
            });
            this.timeIndicatorContainer.append(timeIndicator);
            this.container.append(this.timeIndicatorContainer);
            this.progressBar = $('<div>', {
                'class': 'ajs-progress-bar'
            });
            this.progressBar.slider({
                range: "min",
                min: this.sliderStart,
                max: this.sliderEnd,
                value: this.defaultValue,
                height: 20
            });
            this.progressBar.prepend($('<div>', {
                class: 'buffer-bar'
            }));
            // set events
            this.progressBar.on('slidestart', {
                self: this,
                component: this.component
            }, this.onSlideStart);
            // Add event on slide
            this.progressBar.on('slide', {
                self: this,
                component: this.component
            }, this.onSlide);
            this.progressBar.on('slidestop', {
                self: this,
                component: this.component
            }, this.onSlideStop);
            this.container.append(this.progressBar);
            //Set events
            this.container.find('.ajs-progress-bar').on('mouseover', $.proxy(this.onProgressBarMouseover, this));
            this.container.find('.ajs-progress-bar').on('mouseout', $.proxy(this.onProgressBarMouseoout, this));
            this.container.find('.ajs-progress-bar').on('mousemove', $.proxy(this.onProgressBarMousemove, this));
        },
        /**
         * Set progress bar value.
         * @method setValue
         * @param {Object} value
         */
        setValue: function (value) {
            if (this.sliding === false) {
                this.progressBar.slider("value", value * 10);
            }
        },
        /**
         * Set progress bar title
         * @method setTitle
         * @param {Object} value
         */
        setTitle: function (value) {
            this.progressBar.attr("title", value);
        },
        /** Player Events * */
        /**
         * Fired when plugin ready event
         * @method onTimechange
         * @param {Object} event
         */
        onTimechange: function (event, data) {
            var currentTime = fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(data.currentTime, event.data.self.settings.framerate, event.data.self.settings.timeFormat);
            // Set progress bar position
            event.data.self.setValue(data.percentage);
            // Set tooltip time
            event.data.self.setTitle(currentTime);

        },
        /**
         * Fired on slide start
         * @method onSlideStart
         * @param {Object} event
         * @param {Object} ui
         */
        onSlideStart: function (event, ui) {
            event.data.self.sliding = true;
            event.data.self.mediaPlayer.pause();
            event.data.self.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.START_SEEKING, {
                percentage: ui.value / 10
            });
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onSlideStart Value : " + ui.value);
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
            event.data.self.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.STOP_SEEKING, {
                percentage: ui.value / 10
            });
            event.data.self.mediaPlayer.play();
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onSlideStop value : " + ui.value);
            }
        },
        /**
         * Fired on mouse over in progress bar
         * @method onTimeChange
         * @param {Object} event
         */
        onProgressBarMouseover: function () {
            this.timeIndicatorContainer.show();
        },
        /**
         * Fired on mouseout in progress bar
         * @method onTimeChange
         * @param {Object} event
         */
        onProgressBarMouseoout: function () {
            this.timeIndicatorContainer.hide();
        },
        /**
         * Fired on mouse move in progress bar
         * @method onTimeChange
         * @param {Object} event
         */
        onProgressBarMousemove: function (event) {
            var currentTarget = $(event.currentTarget);
            var tooltipMid = this.timeIndicatorContainer.width() / 2;
            var mPos = event.clientX - currentTarget.offset().left;
            var leftPos = Math.max(tooltipMid, Math.min(mPos, currentTarget.width() - tooltipMid));
            var tc = ((mPos * this.mediaPlayer.getDuration()) / currentTarget.width()) + this.mediaPlayer.getTcOffset();
            this.timeIndicatorContainer.css('left', leftPos);
            this.timeIndicatorContainer.find('.ajs-tooltip-text').html(fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(tc, this.settings.framerate, this.settings.timeFormat));
        }
    });
