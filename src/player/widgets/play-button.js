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
 * Play button widget
 * @class PlayButton
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend("fr.ina.amalia.player.plugins.controlBar.widgets.PlayButton", {
        classCss: "player-play-button",
        style: "",
        playIcon: 'ajs-icon ajs-icon-controlbar-play'
    },
    {
        /**
         * Initialize the component
         * @method initialize
         */
        initialize: function () {
            // Create component
            this.component = $('<div>', {
                'class': this.Class.classCss,
                'style': this.Class.style
            });
            var buttonContainer = $("<span>", {
                class: "button-container"
            });
            var playIcon = $('<i>', {
                class: this.Class.playIcon
            });
            buttonContainer.append(playIcon);
            this.component.append(buttonContainer);
            // set events
            this.component.on('click', {
                    self: this,
                    component: this.component
                },
                this.onClick);
            // Add to container
            this.container.append(this.component);
            this.definePlayerEvents();
        },
        /**
         * Add player events for play button
         * @method definePlayerEvents
         */
        definePlayerEvents: function () {
            this.mediaPlayer.getContainer().on(fr.ina.amalia.player.PlayerEventType.PLAYING, {
                self: this
            }, this.onPlaying);
            this.mediaPlayer.getContainer().on(fr.ina.amalia.player.PlayerEventType.PAUSED, {
                self: this
            }, this.onPaused);
            this.mediaPlayer.getContainer().on(fr.ina.amalia.player.PlayerEventType.CAST_PLAYING, {
                self: this
            }, this.onPlaying);
            this.mediaPlayer.getContainer().on(fr.ina.amalia.player.PlayerEventType.CAST_PAUSED, {
                self: this
            }, this.onPaused);
        },
        /**
         * Fired on click event
         * @method onClick
         * @param {Object} event
         */
        onClick: function (event) {
            if (!event.data.self.mediaPlayer.getCastMode()) {
                event.data.self.mediaPlayer.play();
            }
            else {
                event.data.self.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.CAST_PLAYING);
            }
        },
        /**
         * Fired on playing event for hide play button.
         * @method onPlaying
         * @param {Object} event
         */
        onPlaying: function (event) {
            event.data.self.component.addClass('off').removeClass('on');
        },
        /**
         * Fired on paused event for show play button.
         * @method onPaused
         * @param {Object} event
         */
        onPaused: function (event) {
            event.data.self.component.addClass('on').removeClass('off');
        }
    });
