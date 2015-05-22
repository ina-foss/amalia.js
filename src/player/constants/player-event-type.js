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
 * Player event type
 * @class PlayerEventType
 * @namespace fr.ina.amalia.player
 * @module player
 * @submodule player-constants
 */
$.Class( "fr.ina.amalia.player.PlayerEventType",{
    /**
     * Fired when the player has initialized.
     * @constant
     * @property STARTED
     * @type {String}
     */
    STARTED : "fr.ina.amalia.player.PlayerEventType.STARTED",
    /**
     * Fires when playing event.
     * @constant
     * @property PLAYING
     * @type {String}
     */
    PLAYING : "fr.ina.amalia.player.PlayerEventType.PLAYING",
    /**
     * Fires the paused/resumed
     * @constant
     * @property PAUSED
     * @type {String}
     */
    PAUSED : "fr.ina.amalia.player.PlayerEventType.PAUSED",
    /**
     * Ended event should fire when a video is completely.
     * @constant
     * @property ENDEN
     * @type {String}
     */
    ENDEN : "fr.ina.amalia.player.PlayerEventType.ENDEN",
    /**
     * This fires when the volume level is equal to 0.
     * @constant
     * @property MUTE
     * @type {String}
     */
    MUTE : "fr.ina.amalia.player.PlayerEventType.MUTE",
    /**
     * This fires when the volume level is equal to 0.
     * @constant
     * @property UN_MUTE
     * @type {String}
     */
    UN_MUTE : "fr.ina.amalia.player.PlayerEventType.UN_MUTE",
    /**
     * This fires when the volume level is changed.
     * @constant
     * @property UN_MUTE
     * @type {String}
     */
    VOLUME_CHANGE : "fr.ina.amalia.player.PlayerEventType.VOLUME_CHANGE",
    /**
     * This fires when the time change with attributes : 'obj' : instance of
     * player 'currentTime' : player currentTime 'duration' : media duration
     * 'percent'
     * @constant
     * @property TIME_CHANGE
     * @type {String}
     */
    TIME_CHANGE : "fr.ina.amalia.player.PlayerEventType.TIME_CHANGE",
    /**
     * This fires when full-screen mode change
     * @constant
     * @property FULLSCREEN_CHANGE
     * @type {String}
     */
    FULLSCREEN_CHANGE : "fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGES",
    /**
     * Fired when the user seeks.
     * @constant
     * @property SEEK
     * @type {String}
     */
    SEEK : "fr.ina.amalia.player.PlayerEventType.SEEK",
    /**
     * Fired when a media error has occurred.
     * @constant
     * @property ERROR
     * @type {String}
     */
    ERROR : "fr.ina.amalia.player.PlayerEventType.ERROR",
    /**
     * Fired when the player has initialized.
     * @constant
     * @property PLUGIN_READY
     * @type {String}
     * @deprecated
     */
    PLUGIN_READY : "fr.ina.amalia.player.PlayerEventType.PLUGIN_READY",
    /**
     * Fired when a plugin error has occurred.
     * @constant
     * @property PLUGIN_ERROR
     * @type {String}
     */
    PLUGIN_ERROR : "fr.ina.amalia.player.PlayerEventType.PLUGIN_ERROR",
    /**
     * Fired when data change
     * @constant
     * @property PLUGIN_ERROR
     * @type {String}
     */
    DATA_CHANGE : "fr.ina.amalia.player.PlayerEventType.DATA_CHANGE",
    /**
     * Fired when data change
     * @constant
     * @property BEGIN_DATA_CHANGE
     * @type {String}
     */
    BEGIN_DATA_CHANGE : "fr.ina.amalia.player.PlayerEventType.BEGIN_DATA_CHANGE",
    /**
     * Fired when data change
     * @constant
     * @property END_DATA_CHANGE
     * @type {String}
     */
    END_DATA_CHANGE : "fr.ina.amalia.player.PlayerEventType.END_DATA_CHANGE",
    /**
     * Fired when image capture
     * @constant
     * @property IMAGE_CAPTURE
     * @type {String}
     */
    IMAGE_CAPTURE : "fr.ina.amalia.player.PlayerEventType.IMAGE_CAPTURE",
    /**
     * Fired when zoom range change
     * @constant
     * @property ZOOM_RANGE_CHANGE
     * @type {String}
     */
    ZOOM_RANGE_CHANGE : "fr.ina.amalia.player.PlayerEventType.ZOOM_RANGE_CHANGE",
    /**
     * Fired when selected metadata has changed
     * @constant
     * @property SELECTED_METADATA_CHANGE
     * @type {String}
     */
    SELECTED_METADATA_CHANGE : "fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE",
    /**
     * Fired when selected item has changed
     * @constant
     * @property SELECTED_ITEMS_CHANGE
     * @type {String}
     */
    SELECTED_ITEMS_CHANGE : "fr.ina.amalia.player.PlayerEventType.SELECTED_ITEMS_CHANGE",
    /**
     * Fired when bind metadata
     * @constant
     * @property BIND_METADATA
     * @type {String}
     */
    BIND_METADATA : "fr.ina.amalia.player.PlayerEventType.BIND_METADATA",
    /**
     * Fired when unbind metadata
     * @constant
     * @property UNBIND_METADATA
     * @type {String}
     */
    UNBIND_METADATA : "fr.ina.amalia.player.PlayerEventType.UNBIND_METADATA",
    /**
     * Fired when unbind metadata
     * @constant
     * @property PLAYBACK_RATE_CHANGE
     * @type {String}
     */
    PLAYBACK_RATE_CHANGE : "fr.ina.amalia.player.PlayerEventType.PLAYBACK_RATE_CHANGE"
},
{} );
