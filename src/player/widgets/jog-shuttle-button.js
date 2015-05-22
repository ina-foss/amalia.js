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
 * Seek button widget
 * @class PlayButton
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend( "fr.ina.amalia.player.plugins.controlBar.widgets.JogShuttleButton",{
    classCss : "player-jog-shuttle-button",
    style : ""
},
{
    /**
     * Playback speed
     * @property playbackSpeed
     * @type {Object}
     * @default 3
     */
    playbackSpeed : 3,
    /**
     * Playback default speed
     * @property playbackSpeedList
     * @type {Object}
     * @default 3
     */
    playbackDefaultSpeed : 4,
    /**
     * Player instance
     * @property playbackSpeedList
     * @type {Object}
     * @default null
     */
    playbackSpeedList : [
        -8,
        -4,
        -2,
        -0.5,
        1,
        0.5,
        2,
        4,
        8
    ],
    forwardSpeedIdx : 0,
    backwardSpeedIdx : 0,
    backwardSpeedList : [
        {
            style : 'ajs-icon ajs-icon-jogs-backward-0x',
            speed : 1
        },
        {
            style : 'ajs-icon ajs-icon-jogs-backward-1x',
            speed : -0.5
        },
        {
            style : 'ajs-icon ajs-icon-jogs-backward-2x',
            speed : -2
        },
        {
            style : 'ajs-icon ajs-icon-jogs-backward-3x',
            speed : -4
        },
        {
            style : 'ajs-icon ajs-icon-jogs-backward-3x',
            speed : -8
        }
    ],
    forwardSpeedList : [
        {
            style : 'ajs-icon ajs-icon-jogs-forward-0x',
            speed : 1
        },
        {
            style : 'ajs-icon ajs-icon-jogs-forward-1x',
            speed : 0.5
        },
        {
            style : 'ajs-icon ajs-icon-jogs-forward-2x',
            speed : 2
        },
        {
            style : 'ajs-icon ajs-icon-jogs-forward-3x',
            speed : 4
        },
        {
            style : 'ajs-icon ajs-icon-jogs-forward-3x',
            speed : 8
        }
    ],
    sliding : false,
    /**
     * Initialize the component
     * @method initialize
     */
    initialize : function ()
    {
        this.forwardSpeedIdx = 0;
        this.backwardSpeedIdx = 0;
        this.sliding = false;
        // Create component
        this.component = $( '<div>',{
            'class' : this.Class.classCss,
            'style' : this.Class.style
        } );
        var buttonContainer = $( "<span>",{
            class : "button-container"
        } );

        //backward ctrl 
        var backwardCtrl = $( "<div>",{
            class : "backward-container"
        } );
        var iconBackward = $( '<span>',{
            class : this.backwardSpeedList[0].style
        } );
        backwardCtrl.append( iconBackward );
        backwardCtrl.on( 'click',{
            self : this
        },this.onClickToBackward );
        backwardCtrl.on( 'dblclick',{
            self : this
        },this.onDblClickToBackward );

        buttonContainer.append( backwardCtrl );
        // forward ctrl
        var forwardCtrl = $( "<div>",{
            class : "forward-container"
        } );
        var iconForward = $( '<span>',{
            class : this.forwardSpeedList[0].style
        } );
        forwardCtrl.append( iconForward );
        forwardCtrl.on( 'click',{
            self : this
        },this.onClickToForward );
        forwardCtrl.on( 'dblclick',{
            self : this
        },this.onDblClickToForward );

        buttonContainer.append( forwardCtrl );

        var jogShuttleSeparator = $( "<div>",{
            class : "jog-shuttle-separator"
        } ).on( 'mouseover',{
            self : this
        },this.onHoverJogShuttle );
        buttonContainer.append( jogShuttleSeparator );

        //jog shuttle container
        var self = this;
        var jogShuttle = $( '<div>',{
            class : 'jog-shuttle',
            style : 'display:none;'
        } ).slider( {
            min : 0,
            max : 8,
            value : self.playbackDefaultSpeed,
            slide : function (event,ui) {
                if (self.playbackSpeedList.length >= ui.value)
                {
                    self.setPlaybackSpeed( parseFloat( self.playbackSpeedList[ui.value] ) );
                }
                self.sliding = true;
            },
            stop : function () {
                //set default value
                $( this ).slider( "option","value",self.playbackDefaultSpeed );
                self.setPlaybackSpeed( self.playbackDefaultSpeed );
                self.mediaPlayer.play();
                self.sliding = false;
            }
        } );
        buttonContainer.append( jogShuttle );


        this.component.append( buttonContainer );

        // Add to container
        this.container.append( this.component );
        this.container.on( 'mouseleave',{
            self : this
        },this.onJogShuttleMouseout );
        this.definePlayerEvents();
    },
    /**
     * set player events
     * @returns {undefined}
     */
    definePlayerEvents : function ()
    {
        this.mediaPlayer.mediaContainer.on( fr.ina.amalia.player.PlayerEventType.PLAYBACK_RATE_CHANGE,{
            self : this
        },
        this.onPlaybackRateChange );

    },
    /**
     * In charge to set player playback rate
     * @method setPlaybackSpeed
     * @param playbackSpeed Number
     */
    setPlaybackSpeed : function (playbackSpeed)
    {
        this.playbackSpeed = parseFloat( playbackSpeed );
        this.mediaPlayer.setPlaybackrate( this.playbackSpeed );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"playbackRate:" + this.playbackSpeed );
        }
    },
    /**
     * In charge to update backward and forward controls
     */
    updateControls : function ()
    {
        var playbackSpeed = parseFloat( this.playbackSpeed );

        var forwardSpeed = $.grep( this.forwardSpeedList,function (item) {
            return item.speed === playbackSpeed;
        } );
        var forwardSpeedStyle = (forwardSpeed.length <= 0) ? this.forwardSpeedList[0].style : forwardSpeed[0].style;

        var backwardSpeed = $.grep( this.backwardSpeedList,function (item) {
            return item.speed === playbackSpeed;
        } );
        var backwardSpeedStyle = (backwardSpeed.length <= 0) ? this.backwardSpeedList[0].style : backwardSpeed[0].style;

        this.component.find( '.forward-container span:first' ).attr( 'class',forwardSpeedStyle );
        this.component.find( '.backward-container span:first' ).attr( 'class',backwardSpeedStyle );
    },
    /**
     * Triggered to click forward control
     * @param event Object
     */
    onClickToForward : function (event)
    {
        if (event.data.self.sliding === false)
        {
            event.data.self.forwardSpeedIdx = (event.data.self.forwardSpeedList.length - 1 > event.data.self.forwardSpeedIdx) ? event.data.self.forwardSpeedIdx + 1 : 0;
            event.data.self.backwardSpeedIdx = 0;
            var forwardSpeed = event.data.self.forwardSpeedList[event.data.self.forwardSpeedIdx].speed;
            event.data.self.setPlaybackSpeed( forwardSpeed );
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName,"onClickToForward : " + event.data.self.forwardSpeedIdx );
            }
        }
    },
    /**
     * Triggered to click backward control
     * @param event Object
     */
    onClickToBackward : function (event)
    {
        if (event.data.self.sliding === false)
        {
            event.data.self.forwardSpeedIdx = 0;
            event.data.self.backwardSpeedIdx = (event.data.self.backwardSpeedList.length - 1 > event.data.self.backwardSpeedIdx) ? event.data.self.backwardSpeedIdx + 1 : 0;
            var backwardSpeed = event.data.self.backwardSpeedList[event.data.self.backwardSpeedIdx].speed;
            event.data.self.setPlaybackSpeed( backwardSpeed );
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName,"onClickToBackward :" + event.data.self.backwardSpeedIdx );
            }
        }
    },
    /**
     * Triggered to db click forward control
     * @param event Object
     */
    onDblClickToForward : function (event)
    {
        event.data.self.forwardSpeedIdx = 0;
        event.data.self.mediaPlayer.setCurrentTime( event.data.self.mediaPlayer.getDuration() );

        var defaultForwardSpeedStyle = event.data.self.forwardSpeedList[0].style;
        event.data.self.component.find( '.forward-container span:first' ).attr( 'class','ajs-icon ajs-icon-jogs-fast-forward' ).delay( 1500 ).queue( function () {
            event.data.self.component.find( '.forward-container span:first' ).attr( 'class',defaultForwardSpeedStyle );
        } );

        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onDbClickToForward : " + event.data.self.forwardSpeedIdx );
        }
    },
    /**
     * Triggered to db click backward control
     * @param event Object
     */
    onDblClickToBackward : function (event)
    {
        event.data.self.backwardSpeedIdx = 0;
        event.data.self.mediaPlayer.setCurrentTime( 0 );

        var defaultBackwardSpeedStyle = event.data.self.backwardSpeedList[0].style;
        event.data.self.component.find( '.backward-container span:first' ).attr( 'class','ajs-icon ajs-icon-jogs-fast-backward' ).delay( 1500 ).queue( function () {
            event.data.self.component.find( '.backward-container span:first' ).attr( 'class',defaultBackwardSpeedStyle );
        } );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onDbClickToBackward :" + event.data.self.backwardSpeedIdx );
        }
    },
    /**
     * Triggered to db click backward control
     * @param event Object
     */
    onHoverJogShuttle : function (event)
    {
        event.data.self.component.find( 'div.jog-shuttle' ).show();
    },
    /**
     * Triggered when mouse out event
     * @param {type} event
     * @returns {undefined}
     */
    onJogShuttleMouseout : function (event)
    {
        event.data.self.component.find( 'div.jog-shuttle' ).hide();
    },
    /**
     * Triggered when playback rate change
     * @returns {undefined}
     */
    onPlaybackRateChange : function (event,data)
    {
        event.data.self.playbackSpeed = parseFloat(data.rate);
        event.data.self.updateControls();
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"playbackRate:" + event.data.self.playbackSpeed );
        }
    }
} );
