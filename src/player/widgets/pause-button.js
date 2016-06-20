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
 * Class en charge du bouton de commande pause.
 * @class PauseButton
 * @module player
 * @submodule player-controlbar
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend("fr.ina.amalia.player.plugins.controlBar.widgets.PauseButton", {
        classCss: "player-pause-button",
        style: "",
        pauseIcon: 'ajs-icon ajs-icon-controlbar-pause'
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
            var pauseIcon = $('<i>', {
                class: this.Class.pauseIcon
            });
            buttonContainer.append(pauseIcon);
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
            this.component.addClass('off').removeClass('on');
        },
        /**
         * Add player event listener
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
                if (event.data.self.mediaPlayer.isPaused()) {
                    event.data.self.mediaPlayer.play();
                }
                else {
                    event.data.self.mediaPlayer.pause();
                }
            }
            else {
                event.data.self.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.CAST_PAUSED);
            }
        },
        /**
         * Fired on playing event for show pause button.
         * @method onPlaying
         * @param {Object} event
         */
        onPlaying: function (event) {
            event.data.self.component.addClass('on').removeClass('off');
        },
        /**
         * Fired on paused event for hide pause button.
         * @method onPaused
         * @param {Object} event
         */
        onPaused: function (event) {
            event.data.self.component.addClass('off').removeClass('on');
        }
    });
