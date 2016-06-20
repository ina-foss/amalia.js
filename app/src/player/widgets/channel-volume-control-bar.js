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
 * Control the volume of each channel
 * @class ChannelVolumeControlBar
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend("fr.ina.amalia.player.plugins.controlBar.widgets.ChannelVolumeControlBar", {
        mainClassCss: "player-channel-volume-control-position",
        classCss: "player-channel-volume-control",
        classCssVolumeOn: "ajs-icon ajs-icon-controlbar-volume_max",
        classCssVolumeDown: "ajs-icon ajs-icon-controlbar-volume-min",
        classCssVolumeOff: "ajs-icon ajs-icon-controlbar-volume-off",
        classUnifyVolumeStateOn: "ajs-icon-sound-link-on",
        classUnifyVolumeStateOff: "ajs-icon-sound-link-off",
        classLeftVolumeStateOn: "ajs-icon-controlbar-volume-left",
        classLeftVolumeStateOff: "ajs-icon-controlbar-volume-left-off",
        classRightVolumeStateOn: "ajs-icon-controlbar-volume-right",
        classRightVolumeStateOff: "ajs-icon-controlbar-volume-right-off",
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
         * AudioContext interface represents
         * @property audioContext
         * @type {Object}
         * @default null
         */
        audioContext: null,
        /**
         * Pan Left
         * @property panLeft
         * @type {Object}
         * @default null
         */
        panLeft: null,
        /**
         * Pan Right
         * @property panRight
         * @type {Object}
         * @default null
         */
        panRight: null,

        /***
         * Specific if channel is merged
         */
        channelMerger: false,
        /***
         * Specific channel to merge
         */
        channelMergerNode: null,
        unifyVolumeState: true,
        /**
         * Initialize the component
         * @method initialize
         */
        initialize: function () {
            this.defaultValue = 100;
            this.unifyVolumeState = true;
            this.channelMerger = (this.parameter.hasOwnProperty('channelMerger') === true) ? this.parameter.channelMerger : true;
            this.channelMergerNode = (this.parameter.hasOwnProperty('channelMergerNode') === true && this.parameter.channelMergerNode !== "" ) ? this.parameter.channelMergerNode : null;
            // Create component
            var mainContainer = $('<div>', {
                'class': this.Class.mainClassCss
            });
            // Create component
            this.component = $('<div>', {
                'class': this.Class.classCss,
                'style': this.Class.style
            });

            try {
                this.mediaPlayer.setVolume(100);
                var AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
                // this.audioContext.createGain = this.audioContext.createGain || this.audioContext.createGainNode; //fallback for gain naming
                this.setupAudioNodes();
            }
            catch (e) {
                this.audioContext = null;
                if (this.logger !== null) {
                    this.logger.warn(e);
                }
            }

            if (this.audioContext !== null) {
                this.createChannelVolume();
                this.definePlayerEvents();
                this.updateVolume();
            }

            // Add to container
            mainContainer.append( this.component);
            this.container.append(mainContainer);

            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "initialize");
            }
        },
        /**
         * In charge to init audio context
         * @returns {undefined}
         */
        setupAudioNodes: function () {
            //Connect to source
            var source = this.audioContext.createMediaElementSource(this.mediaPlayer.getMediaPlayer().get(0));
            this.panLeft = this.audioContext.createGain();
            this.panRight = this.audioContext.createGain();
            var splitter = this.audioContext.createChannelSplitter(2);
            //Connect the source to the splitter
            source.connect(splitter, 0, 0);
            //Connect splitter' outputs to each Gain Nodes
            splitter.connect(this.panLeft, 0);
            splitter.connect(this.panRight, 1);
            if (this.channelMergerNode !== null) {
                var panner = this.audioContext.createPanner();
                panner.coneOuterGain = 1;
                panner.coneOuterAngle = 180;
                panner.coneInnerAngle = 0;
                if (this.channelMergerNode === 'l') {
                    panner.setPosition(-1, 0, 0);
                }
                else if (this.channelMergerNode === 'r') {
                    panner.setPosition(1, 0, 0);
                }
                this.panLeft.connect(panner);
                this.panRight.connect(panner);
                panner.connect(this.audioContext.destination);
            }
            else {
                if (this.channelMerger === true) {
                    //Connect Left and Right Nodes to the output
                    //Assuming stereo as initial status
                    this.panLeft.connect(this.audioContext.destination, 0);
                    this.panRight.connect(this.audioContext.destination, 0);
                }
                else if (this.channelMergerNode === null) {
                    //Create a merger node, to get both signals back together
                    var merger = this.audioContext.createChannelMerger(2);

                    //Connect both channels to the Merger
                    this.panLeft.connect(merger, 0, 0);
                    this.panRight.connect(merger, 0, 1);

                    //Connect the Merger Node to the final audio destination
                    merger.connect(this.audioContext.destination);
                }
            }
        },
        /**
         * In charge to create channel volume container
         */
        createChannelVolume: function () {
            var self = this;

            var volumeControlBtn = $('<div>', {
                'class': 'volume-control-btn'
            });

            volumeControlBtn.on('click', {
                self: this
            }, this.onClickToVolume);
            //add volume bouton
            this.component.append(volumeControlBtn);

            var channelVolumeSlidersContainer = $('<div>', {
                'class': 'channel-volume-sliders'
            });

            channelVolumeSlidersContainer.on('mouseleave', {
                self: this
            }, this.onChannelVolumeMouseout);
            //Block Info
            var channelVolumeInfoContainer = $('<div>', {
                'class': 'channel-volume-info'
            });
            channelVolumeSlidersContainer.append(channelVolumeInfoContainer);
            var channelInfoLeftContainer = $('<div>', {
                'class': 'channel-volume-info-left'
            });
            channelInfoLeftContainer.on('click', {self: this}, this.onClickLeftVolume);
            var channelInfoLeft = $('<span>', {
                'class': 'text ajs-icon ' + this.Class.classLeftVolumeStateOn,
                'text': ''
            });
            channelInfoLeftContainer.append(channelInfoLeft);
            channelVolumeInfoContainer.append(channelInfoLeftContainer);
            //Mid
            var channelInfoMidContainer = $('<div>', {
                'class': 'channel-volume-info-mid'
            });
            var channelInfoUnify = $('<span>', {
                'class': 'unify on ajs-icon ' + this.Class.classUnifyVolumeStateOn,
                'text': ''
            });
            channelInfoUnify.on('click', {
                self: this
            }, this.onClickUnifyVolumeState);

            channelInfoMidContainer.append(channelInfoUnify);
            channelVolumeInfoContainer.append(channelInfoMidContainer);
            var channelInfoRightContainer = $('<div>', {
                'class': 'channel-volume-info-right'
            });
            channelInfoRightContainer.on('click', {self: this}, this.onClickRightVolume);
            var channelInfoRight = $('<span>', {
                'class': 'text ajs-icon ' + this.Class.classRightVolumeStateOn,
                'text': ''
            });
            channelInfoRightContainer.append(channelInfoRight);
            channelVolumeInfoContainer.append(channelInfoRightContainer);
            //Block Control
            var channelVolumeControlContainer = $('<div>', {
                'class': 'channel-volume-control'
            });
            channelVolumeSlidersContainer.append(channelVolumeControlContainer);
            var channelControlLeftContainer = $('<div>', {
                'class': 'channel-volume-control-left'
            });
            //Left slider
            var leftVolumeSlider = $('<div>', {
                'class': 'left-volume-slider'
            });
            leftVolumeSlider.slider({
                orientation: "vertical",
                min: 0,
                max: 100,
                value: 100,
                slide: function (event, ui) {
                    self.panLeft.gain.value = ui.value / 100;
                    if (self.unifyVolumeState === true) {
                        self.panRight.gain.value = ui.value / 100;
                        self.component.find('.right-volume-slider').slider("value", ui.value);
                    }
                    self.updateVolume();
                },
                change: function (event, ui) {
                    self.updateVolume();
                    self.panLeft.gain.value = ui.value / 100;
                    var rv = self.component.find('.right-volume-slider').slider("value");
                    if (self.unifyVolumeState === true && rv !== ui.value) {
                        self.panRight.gain.value = ui.value / 100;
                        self.component.find('.right-volume-slider').slider("value", ui.value);
                    }
                }
            });
            channelControlLeftContainer.append(leftVolumeSlider);
            channelVolumeControlContainer.append(channelControlLeftContainer);
            //Mid
            var channelControlMidContainer = $('<div>', {
                'class': 'channel-volume-control-mid on'
            });
            channelVolumeControlContainer.append(channelControlMidContainer);
            //Right
            var channelControlRightContainer = $('<div>', {
                'class': 'channel-volume-control-right'
            });
            //Right slider
            var rightVolumeSlider = $('<div>', {
                'class': 'right-volume-slider'
            });
            rightVolumeSlider.slider({
                orientation: "vertical",
                min: 0,
                max: 100,
                value: 100,
                slide: function (event, ui) {
                    self.panRight.gain.value = ui.value / 100;
                    if (self.unifyVolumeState === true) {
                        self.panLeft.gain.value = ui.value / 100;
                        self.component.find('.left-volume-slider').slider("value", ui.value);
                        var offset = $(event.target).position().top + $(ui.handle).outerWidth() / 2;
                        var handleHeight = $(ui.handle).position().top;
                        self.component.find('.channel-volume-control-mid').css('top', (handleHeight + offset) + 'px');
                    }
                    self.updateVolume();
                },
                change: function (event, ui) {
                    self.updateVolume();
                    var offset = $(event.target).position().top + $(ui.handle).outerWidth() / 2;
                    var handleHeight = $(ui.handle).position().top;
                    self.component.find('.channel-volume-control-mid').css('top', (handleHeight + offset) + 'px');
                    self.panRight.gain.value = ui.value / 100;
                    var lv = self.component.find('.left-volume-slider').slider("value");
                    if (self.unifyVolumeState === true && lv !== ui.value) {
                        self.panLeft.gain.value = ui.value / 100;
                        self.component.find('.left-volume-slider').slider("value", ui.value);
                    }
                }
            });
            channelControlRightContainer.append(rightVolumeSlider);
            channelVolumeControlContainer.append(channelControlRightContainer);
            // Add to main widget container
            this.component.append(channelVolumeSlidersContainer);

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
         * Set volume value
         * @method setValue
         * @param {Object} value
         */
        updateVolume: function () {
            var leftVolume = this.component.find('.left-volume-slider').slider("value");
            var rightVolume = this.component.find('.right-volume-slider').slider("value");
            var leftContainer = this.component.find('.channel-volume-info-left span.text');
            var rightContainer = this.component.find('.channel-volume-info-right span.text');
            if (leftVolume < 10) {
                leftContainer.addClass(this.Class.classLeftVolumeStateOff).removeClass(this.Class.classLeftVolumeStateOn);
            }
            else {
                leftContainer.removeClass(this.Class.classLeftVolumeStateOff).addClass(this.Class.classLeftVolumeStateOn);
            }
            if (rightVolume < 10) {
                rightContainer.addClass(this.Class.classRightVolumeStateOff).removeClass(this.Class.classRightVolumeStateOn);
            }
            else {
                rightContainer.removeClass(this.Class.classRightVolumeStateOff).addClass(this.Class.classRightVolumeStateOn);
            }

            // Main Volume
            var value = Math.max(leftVolume, rightVolume);
            var volumeIcon = this.component.find('.volume-control-btn');
            volumeIcon.attr('class', 'volume-control-btn');
            if (value < 10) {
                volumeIcon.addClass(this.Class.classCssVolumeOff);
            }
            else if (value < 75) {
                volumeIcon.addClass(this.Class.classCssVolumeDown);
            }
            else {
                volumeIcon.addClass(this.Class.classCssVolumeOn);
            }

            if (this.unifyVolumeState === true) {
                this.component.find('.channel-volume-info-mid .unify').addClass('on').addClass(this.Class.classUnifyVolumeStateOn).removeClass(this.Class.classUnifyVolumeStateOff);
                this.component.find('.channel-volume-control-mid').addClass('on');
            }
            else {
                this.component.find('.channel-volume-info-mid .unify').removeClass('on').addClass(this.Class.classUnifyVolumeStateOff).removeClass(this.Class.classUnifyVolumeStateOn);
                this.component.find('.channel-volume-control-mid').removeClass('on');
            }
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
         * Fired on volume change value
         * @param {Object} event
         * @param {Object} data
         */
        onPlayerVolumeChange: function (event, data) {
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onPlayerVolumeChange" + parseInt(data.volume));
            }
            event.data.self.component.find('.left-volume-slider').slider("value", data.volume);
            event.data.self.component.find('.right-volume-slider').slider("value", data.volume);
            event.data.self.updateVolume();
        },
        /**
         * Fired on volume change value
         * @param {Object} event
         */
        onClickUnifyVolumeState: function (event) {
            if (event.data.self.unifyVolumeState === false) {
                event.data.self.unifyVolumeState = true;
                var leftVolume = event.data.self.component.find('.left-volume-slider').slider("value");
                var rightVolume = event.data.self.component.find('.right-volume-slider').slider("value");
                event.data.self.component.find('.left-volume-slider').slider("value", Math.max(leftVolume, rightVolume));
                event.data.self.component.find('.right-volume-slider').slider("value", Math.max(leftVolume, rightVolume));
            }
            else {
                event.data.self.unifyVolumeState = false;
                event.data.self.updateVolume();
            }

            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onClickUnifyVolumeState/unifyVolumeState:" + event.data.self.unifyVolumeState);
            }
        },
        /**
         * Fired on volume change value
         * @method onClickToVolume
         * @param {Object} event
         */
        onClickToVolume: function (event) {
            event.data.self.component.find('.channel-volume-sliders').addClass("on");
        },
        /**
         * Fired on volume change value
         * @method onChannelVolumeMouseout
         * @param {Object} event
         */
        onChannelVolumeMouseout: function (event) {
            event.data.self.component.find('.channel-volume-sliders').removeClass("on");
        },
        /**
         * Fired on click to left Volume
         * @method onClickLeftVolume
         * @param {Object} event
         */
        onClickLeftVolume: function (event) {
            var leftVolume = event.data.self.component.find('.left-volume-slider').slider("value");
            if (leftVolume < 10) {
                event.data.self.component.find('.left-volume-slider').slider("value", 100);
            }
            else {
                event.data.self.component.find('.left-volume-slider').slider("value", 0);
            }
        },
        /**
         * Fired on click to right Volume
         * @method onClickLeftVolume
         * @param {Object} event
         */
        onClickRightVolume: function (event) {
            var rightVolume = event.data.self.component.find('.right-volume-slider').slider("value");
            if (rightVolume < 10) {
                event.data.self.component.find('.right-volume-slider').slider("value", 100);
            }
            else {
                event.data.self.component.find('.right-volume-slider').slider("value", 0);
            }
        }

    });
