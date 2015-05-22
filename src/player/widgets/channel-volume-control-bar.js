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
 * @class TimeLabel
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend( "fr.ina.amalia.player.plugins.controlBar.widgets.ChannelVolumeControlBar",{
    classCss : "player-channel-volume-control",
    classCssVolumeOn : "ajs-icon ajs-icon-volume-up",
    classCssVolumeDown : "ajs-icon ajs-icon-volume-down",
    classCssVolumeOff : "ajs-icon ajs-icon-volume-off",
    style : "",
    eventTypes : {
        CLICK : "fr.ina.amalia.player.plugins.widgets.VolumeControlBar.event.click",
        CHANGE : "fr.ina.amalia.player.plugins.widgets.VolumeControlBar.event.change",
        HOVER : "fr.ina.amalia.player.plugins.widgets.VolumeControlBar.event.hover"
    }
},
{
    /**
     * Slide start value
     * @property sliderStart
     * @type {Object}
     * @default 0
     */
    sliderStart : 0,
    /**
     * Slide end value
     * @property sliderEnd
     * @type {Object}
     * @default 100
     */
    sliderEnd : 100,
    /**
     * Default value
     * @property defaultValue
     * @type {Object}
     * @default 100
     */
    defaultValue : 100,
    /**
     * Volume component element
     * @property volumeControlComponent
     * @type {Object}
     * @default null
     */
    volumeControlComponent : null,
    /**
     * AudioContext interface represents 
     * @property audioContext
     * @type {Object}
     * @default null
     */
    audioContext : null,
    /**
     * Pan Left
     * @property panLeft
     * @type {Object}
     * @default null
     */
    panLeft : null,
    /**
     * Pan Right
     * @property panRight
     * @type {Object}
     * @default null
     */
    panRight : null,
    channelMerger : false,
    /**
     * Initialize the component
     * @method initialize
     */
    initialize : function ()
    {
        this.defaultValue = 100;
        if (this.parameter.hasOwnProperty( 'channelMerger' ) === true)
        {
            this.channelMerger = this.parameter.channelMerger;
        }
        else
        {
            this.channelMerger = true;
        }
        // Create component
        this.component = $( '<div>',{
            'class' : this.Class.classCss,
            'style' : this.Class.style
        } );

        try
        {
            //var AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            // this.audioContext.createGain = this.audioContext.createGain || this.audioContext.createGainNode; //fallback for gain naming
            this.setupAudioNodes();
        }
        catch (e)
        {
            this.audioContext = null;
        }

        if (this.audioContext !== null)
        {
            this.createChannelVolume();
            this.definePlayerEvents();
            this.setValue( this.mediaPlayer.getVolume() );
        }

        // Add to container
        this.container.append( this.component );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initialize" );
        }
    },
    /**
     * In charge to init audio context
     * @returns {undefined}
     */
    setupAudioNodes : function ()
    {
        this.panLeft = this.audioContext.createGain();
        this.panRight = this.audioContext.createGain();
        //Connect to source
        var source = this.audioContext.createMediaElementSource( this.mediaPlayer.getMediaPlayer().get( 0 ) );
        var splitter = this.audioContext.createChannelSplitter( 2 );
        //Connect the source to the splitter
        source.connect( splitter,0,0 );

        //Connect splitter' outputs to each Gain Nodes
        splitter.connect( this.panLeft,1 );
        splitter.connect( this.panRight,0 );

        if (this.channelMerger === true)
        {
            //Connect Left and Right Nodes to the output
            //Assuming stereo as initial status
            this.panLeft.connect( this.audioContext.destination,0 );
            this.panRight.connect( this.audioContext.destination,0 );
        }
        else
        {
            //Create a merger node, to get both signals back together
            var merger = this.audioContext.createChannelMerger( 2 );

            //Connect both channels to the Merger
            this.panLeft.connect( merger,0,0 );
            this.panRight.connect( merger,0,1 );

            //Connect the Merger Node to the final audio destination
            merger.connect( this.audioContext.destination );

        }

    },
    /**
     * In charge to create channel volume container     
     */
    createChannelVolume : function ()
    {
        var self = this;
        var channelVolumeSlidersContainer = $( '<div>',{
            'class' : 'channel-volume-sliders'
        } );
        //Block Info
        var channelVolumeInfoContainer = $( '<div>',{
            'class' : 'channel-volume-info'
        } );
        channelVolumeSlidersContainer.append( channelVolumeInfoContainer );
        var channelInfoLeftContainer = $( '<div>',{
            'class' : 'channel-volume-info-left'
        } );
        var channelInfoLeft = $( '<span>',{
            'class' : 'text',
            'text' : 'G'
        } );
        channelInfoLeftContainer.append( channelInfoLeft );
        channelVolumeInfoContainer.append( channelInfoLeftContainer );
        //Mid
        var channelInfoMidContainer = $( '<div>',{
            'class' : 'channel-volume-info-mid'
        } );
        var channelInfoUnify = $( '<span>',{
            'class' : 'unify',
            'text' : '͚'
        } );
        channelInfoMidContainer.append( channelInfoUnify );
        channelVolumeInfoContainer.append( channelInfoMidContainer );
        var channelInfoRightContainer = $( '<div>',{
            'class' : 'channel-volume-info-right'
        } );
        var channelInfoRight = $( '<span>',{
            'class' : 'text',
            'text' : 'D'
        } );
        channelInfoRightContainer.append( channelInfoRight );
        channelVolumeInfoContainer.append( channelInfoRightContainer );
        //Block Control
        var channelVolumeControlContainer = $( '<div>',{
            'class' : 'channel-volume-control'
        } );
        channelVolumeSlidersContainer.append( channelVolumeControlContainer );
        var channelControlLeftContainer = $( '<div>',{
            'class' : 'channel-volume-control-left'
        } );
        //Left slider
        var leftVolumeSlider = $( '<div>',{
            'class' : 'left-volume-slider'
        } );
        leftVolumeSlider.slider( {
            orientation : "vertical",
            min : 0,
            max : 100,
            value : 100,
            slide : function (event,ui) {
                self.panLeft.gain.value = ui.value / 100;
            }
        } );
        channelControlLeftContainer.append( leftVolumeSlider );
        channelVolumeControlContainer.append( channelControlLeftContainer );
        //Mid
        var channelControlMidContainer = $( '<div>',{
            'class' : 'channel-volume-control-mid'
        } );
        channelVolumeControlContainer.append( channelControlMidContainer );
        //Right
        var channelControlRightContainer = $( '<div>',{
            'class' : 'channel-volume-control-right'
        } );
        //Right slider
        var rightVolumeSlider = $( '<div>',{
            'class' : 'right-volume-slider'
        } );
        rightVolumeSlider.slider( {
            orientation : "vertical",
            min : 0,
            max : 100,
            value : 100,
            slide : function (event,ui) {
                self.panRight.gain.value = ui.value / 100;
            }
        } );
        channelControlRightContainer.append( rightVolumeSlider );
        channelVolumeControlContainer.append( channelControlRightContainer );
        // Add to main widget container
        this.component.append( channelVolumeSlidersContainer );
    },
    /**
     * Add player events listener
     * @method definePlayerEvents
     */
    definePlayerEvents : function ()
    {
        this.mediaPlayer.mediaContainer.on( fr.ina.amalia.player.PlayerEventType.VOLUME_CHANGE,{
            self : this
        },
        this.onPlayerVolumeChange );
    },
    /**
     * Set volume value
     * @method setValue
     * @param {Object} value
     */
    setValue : function (value)
    {
        this.component.find( 'input.volume-control' ).val( value ).trigger( 'change' );
        var volumeIcon = this.component.find( '.volume-control-btn span:first' );
        volumeIcon.attr( 'class','' );
        if (value === 0)
        {
            volumeIcon.addClass( this.Class.classCssVolumeOff );
        }
        else if (value < 75)
        {
            volumeIcon.addClass( this.Class.classCssVolumeDown );
        }
        else
        {
            volumeIcon.addClass( this.Class.classCssVolumeOn );
        }
    },
    /**
     * Fired on click event
     * @method onClick
     * @param {Object} event
     * @event fr.ina.amalia.player.plugins.controlBar.widgets.VolumeControlBar.event.type.HOVER
     */
    onClick : function (event)
    {
        event.data.component.trigger( event.data.self.Class.eventTypes.CLICK );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onClick/triggerevent:" + event.data.self.Class.eventTypes.CLICK );
        }
    },
    /**
     * Fired on slider change value
     * @method onSlide
     * @param {Object} value
     * @event fr.ina.amalia.player.plugins.controlBar.widgets.VolumeControlBar.event.type.CHANGE
     */
    onSlide : function (value)
    {
        this.component.trigger( this.Class.eventTypes.CHANGE,{
            'value' : value
        } );
        this.mediaPlayer.setVolume( value );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"onSlide/triggerevent:" + this.Class.eventTypes.CHANGE + " Value " + value );
        }
    },
    /**
     * Fired on click at volume button
     * @method onClickVolume
     * @param {Object} event
     * @event fr.ina.amalia.player.plugins.controlBar.widgets.VolumeControlBar.event.type.CHANGE
     */
    onClickVolume : function (event)
    {
        var value = ($( event.currentTarget ).find( 'span:first' ).hasClass( event.data.self.Class.classCssVolumeOn ) === true) ? 0 : 100;
        event.data.self.mediaPlayer.setVolume( value );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onClickVolume:" + event.data.self.Class.eventTypes.CHANGE + " Value " + value );
        }
    },
    /**
     * Fired on volume change value
     * @param {Object} event
     * @param {Object} data
     */
    onPlayerVolumeChange : function (event,data)
    {
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onPlayerVolumeChange" + parseInt( data.volume ) );
        }
        event.data.self.setValue( parseInt( data.volume ) );
    }
} );
