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
 * Time label widget
 * @class TimeLabel
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend( "fr.ina.amalia.player.plugins.controlBar.widgets.TimeLabel",{
    classCss : "player-timelabel time-display off",
    style : "",
    eventTypes : {}
},
{
    /**
     * Current position (in seconds) of the audio/video
     * @property currentTime
     * @type {Object}
     * @default null
     */
    currentTime : null,
    /**
     * time seperator element
     * @property timeSeparator
     * @type {Object}
     * @default null
     */
    timeSeparator : null,
    /**
     * Media duration in seconds
     * @property duration
     * @type {Object}
     * @default null
     */
    duration : null,
    /**
     * Initialize the component
     * @method initialize
     */
    initialize : function ()
    {
        // Create component
        this.component = $( '<div>',{
            'class' : this.Class.classCss,
            'style' : this.Class.style
        } );
        this.currentTime = $( '<span>',{
            'class' : 'time-current'
        } );
        this.timeSeparator = $( '<span>',{
            'class' : 'time-separator'
        } );
        this.duration = $( '<span>',{
            'class' : 'time-duration'
        } );
        this.component.append( this.currentTime );
        this.component.append( this.timeSeparator );
        this.component.append( this.duration );

        // Add to container
        this.container.append( this.component );
        this.definePlayerEvents();
    },
    /**
     * Set current time
     * @method setCurrentTime
     * @param {Object} value
     */
    setCurrentTime : function (value)
    {
        if (this.currentTime !== null)
        {
            this.currentTime.text( value );
        }
    },
    /**
     * Set media duration
     * @method setDuration
     * @param {Object} value
     */
    setDuration : function (value)
    {
        if (this.duration !== null)
        {
            this.duration.text( value );
            this.component.removeClass( 'off' ).addClass( 'on' );
        }
    },
    /**
     * Add player events listener
     * @method definePlayerEvents
     */
    definePlayerEvents : function ()
    {
        this.mediaPlayer.mediaContainer.on( fr.ina.amalia.player.PlayerEventType.TIME_CHANGE,{
            self : this
        },
        this.onTimechange );
    },
    /**
     * Fired on time change event
     * @param {Object} event
     * @param {Object} data
     */
    onTimechange : function (event,data)
    {
        var currentTime = fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.currentTime,event.data.self.parameter.framerate,event.data.self.parameter.timeFormat );
        var duration = fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.duration,event.data.self.parameter.framerate,event.data.self.parameter.timeFormat );
        // set current time
        event.data.self.setCurrentTime( currentTime );
        event.data.self.setDuration( duration );
    }
} );
