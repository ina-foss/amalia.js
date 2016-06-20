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
 * Volume control bar widget
 * @class VolumeControlBar
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend("fr.ina.amalia.player.plugins.controlBar.widgets.VolumeControlBar", {
        classCss: "player-volume-control",
        classCssVolumeOn: "ajs-icon ajs-icon-controlbar-volume_max",
        classCssVolumeUp: "ajs-icon ajs-icon-controlbar-volume_max",
        classCssVolumeDown: "ajs-icon ajs-icon-controlbar-volume-min",
        classCssVolumeOff: "ajs-icon ajs-icon-controlbar-volume-off",
        style: "",
        eventTypes: {
            CLICK: "fr.ina.amalia.player.plugins.widgets.VolumeControlBar.event.click",
            CHANGE: "fr.ina.amalia.player.plugins.widgets.VolumeControlBar.event.change",
            HOVER: "fr.ina.amalia.player.plugins.widgets.VolumeControlBar.event.hover"
        }
    },
    {
        /**
         * Slide start value
         * @property sliderStart
         * @type {Object}
         * @default 0
         */
        sliderStart: 0,
        /**
         * Slide end value
         * @property sliderEnd
         * @type {Object}
         * @default 100
         */
        sliderEnd: 100,
        /**
         * Default value
         * @property defaultValue
         * @type {Object}
         * @default 100
         */
        defaultValue: 100,
        /**
         * Volume component element
         * @property volumeControlComponent
         * @type {Object}
         * @default null
         */
        volumeControlComponent: null,
        /**
         * Volume slider component
         * @property volumeSliderComponent
         * @type {Object}
         * @default null
         */
        volumeSliderComponent: null,
        /**
         * Initialize the component
         * @method initialize
         */
        initialize: function () {
            this.volumeSliderComponent = null;
            // Create component
            this.component = $('<div>', {
                'class': this.Class.classCss,
                'style': this.Class.style
            });
            var volumeElement = '<input class="volume-control" data-width="70" data-height="70" data-displayInput="false" data-displayPrevious="true" data-skin="tron" data-thickness=".2" data-fgColor="#13e7f0"value="' + this.defaultValue + '" >';
            this.component.append(volumeElement);
            var volumeControleElement = $('<div>', {
                class: 'volume-control-btn'
            });

            var volumeControleBtn = $('<span>');
            volumeControleElement.append(volumeControleBtn);
            // self object for knob events
            var self = this;
            this.component.find('input.volume-control').knob({
                change: function (v) {
                    self.onSlide(v);
                }
            });
            //Set events
            volumeControleElement.on('mouseover', {
                self: this
            }, this.onMouseover);
            volumeControleElement.find('span').on('click', {
                self: this
            }, this.onClickVolume);

            this.component.find('div').append(volumeControleElement);
            // Slider
            var sliderElement = $('<div>', {
                'class': 'volume-slider-ctn off'
            });
            this.volumeSliderComponent = $('<div>', {
                'class': 'slider-volume'
            });
            sliderElement.append(this.volumeSliderComponent);
            volumeControleElement.append(sliderElement);
            this.volumeSliderComponent.slider({
                orientation: "vertical",
                min: 0,
                max: 100,
                range: "min",

                value: this.mediaPlayer.getVolume(),
                slide: function (event, ui) {
                    self.onSlide(ui.value);
                }
            });

            sliderElement.on('mouseleave', {
                self: this
            }, this.onMouseleave);

            // Add to container
            this.container.append(this.component);
            this.definePlayerEvents();
            this.setValue(this.mediaPlayer.getVolume());
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "initialize");
            }
        },
        /**
         * Add player events listener
         * @method definePlayerEvents
         */
        definePlayerEvents: function () {
            this.mediaPlayer.getContainer().on(fr.ina.amalia.player.PlayerEventType.VOLUME_CHANGE, {
                self: this
            }, this.onPlayerVolumeChange);
        },
        /**
         * Fired on click event
         * @method onClick
         * @param {Object} event
         * @event fr.ina.amalia.player.plugins.controlBar.widgets.VolumeControlBar.event.type.HOVER
         */
        onClick: function (event) {
            event.data.component.trigger(event.data.self.Class.eventTypes.CLICK);
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onClick/triggerevent:" + event.data.self.Class.eventTypes.CLICK);
            }
        },
        /**
         * Set volume value
         * @method setValue
         * @param {Object} value
         */
        setValue: function (value) {
            this.component.find('input.volume-control').val(value).trigger('change');
            var volumeIcon = this.component.find('.volume-control-btn span:first');
            volumeIcon.attr('class', '');
            if (value === 0) {
                volumeIcon.addClass(this.Class.classCssVolumeOff);
            }
            else if (value < 50) {
                volumeIcon.addClass(this.Class.classCssVolumeDown);
            }
            else if (value >= 50 && value < 75) {
                volumeIcon.addClass(this.Class.classCssVolumeUp);
            }
            else if (value >= 75) {
                volumeIcon.addClass(this.Class.classCssVolumeOn);
            }
        },
        /**
         * Fired on slider change value
         * @method onSlide
         * @param {Object} value
         * @event fr.ina.amalia.player.plugins.controlBar.widgets.VolumeControlBar.event.type.CHANGE
         */
        onSlide: function (value) {
            this.component.trigger(this.Class.eventTypes.CHANGE, {
                'value': value
            });
            this.mediaPlayer.setVolume(value);
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onSlide/triggerevent:" + this.Class.eventTypes.CHANGE + " Value " + value);
            }
        },
        /**
         * Fired on click at volume button
         * @method onClickVolume
         * @param {Object} event
         * @event fr.ina.amalia.player.plugins.controlBar.widgets.VolumeControlBar.event.type.CHANGE
         */
        onClickVolume: function (event) {
            var value = event.data.self.mediaPlayer.getVolume() > 50 ? 0 : 100;
            event.data.self.mediaPlayer.setVolume(value);
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onClickVolume:" + event.data.self.Class.eventTypes.CHANGE + " Value " + value);
            }
        },
        /**
         * Fired on volume change value
         * @param {Object} event
         * @param {Object} data
         */
        onPlayerVolumeChange: function (event, data) {
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onPlayerVolumeChange" + parseInt(data.volume));
            }
            event.data.self.setValue(parseInt(data.volume));
            event.data.self.volumeSliderComponent.slider('value', parseInt(data.volume));
        },
        /**
         * Fired on mouse over
         * @param {Object} event
         * @param {Object} data
         */
        onMouseover: function (event) {
            event.data.self.component.find('.volume-slider-ctn').addClass('on').removeClass('off');
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onMouseover");
            }
        },

        /**
         * Fired on mouse leave
         * @param {Object} event
         * @param {Object} data
         */
        onMouseleave: function (event) {
            event.data.self.component.find('.volume-slider-ctn').addClass('off').removeClass('on');
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onMouseover");
            }
        }
    });
