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
 * In charge of custom control bar plugin and manage widgets
 * @class CustomControlBarPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-controlbar
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} pluginContainer
 */
fr.ina.amalia.player.plugins.PluginBase.extend( "fr.ina.amalia.player.plugins.CustomControlBarPlugin",{
    classCss : "plugin-custom-controlbar"
},
{
    /**
     * Plugin container object
     * @property container
     * @type {Object}
     * @default null
     */
    container : null,
    /**
     * left container element
     * @property leftContainer
     * @type {Object}
     * @default null
     */
    leftContainer : null,
    /**
     * Middle container element
     * @property midContainer
     * @type {Object}
     * @default null
     */
    midContainer : null,
    /**
     * Right container element
     * @property rightContainer
     * @type {Object}
     * @default null
     */
    rightContainer : null,
    /**
     * List of widgets
     * @property rightContainer
     * @type {Object}
     * @default null
     */
    widgets : null,
    /**
     * Control bar hight
     * @property height
     * @type {Object}
     * @default 130
     */
    height : 130,
    /**
     * Progress bar dom element
     * @property rightContainer
     * @type {Object}
     * @default null
     */
    progressBar : null,
    /**
     * Auto hide state, true if auto hide is enabled.
     * @property rightContainer
     * @type {Object}
     * @default null
     */
    autoHide : true,
    /**
     * Control bar display state, false when the control bar is hide.
     * @property rightContainer
     * @type {Object}
     * @default null
     */
    displayState : true,
    /**
     * Hide duration
     * @property rightContainer
     * @type {Object}
     * @default null
     */
    hideDuration : 500,
    /**
     * Auto hide state, true when the auto hide state is started.
     * @property rightContainer
     * @type {Object}
     * @default null
     */
    autoHideStarted : false,
    /**
     * Initialize the component
     * @method initialize
     */
    initialize : function ()
    {
        this.settings = $.extend( {
            height : (this.settings.sticky === true) ? '45' : '130',
            autohide : true,
            hideDuration : 500,
            timeFormat : (this.settings.sticky === true) ? 's' : 'ms',
            framerate : 25,
            framepreview : false,
            framepreviewTimeBound : 500,
            sticky : false,
            widgets : {
                left : {
                    'timelabelWidget' : 'fr.ina.amalia.player.plugins.controlBar.widgets.TimeLabel'
                },
                mid : {
                    'playWidget' : 'fr.ina.amalia.player.plugins.controlBar.widgets.PlayButton',
                    'pauseWidget' : 'fr.ina.amalia.player.plugins.controlBar.widgets.PauseButton'
                },
                right : {
                    'full' : 'fr.ina.amalia.player.plugins.controlBar.widgets.FullscreenButton',
                    'volume' : 'fr.ina.amalia.player.plugins.controlBar.widgets.VolumeControlBar'
                },
                settings : {}
            }
        },
        this.settings || {} );

        this.leftContainer = null;
        this.midContainer = null;
        this.rightContainer = null;
        this.widgets = [
        ];
        this.autoHide = (this.settings.sticky === true) ? false : this.settings.autohide;
        this.displayState = true;
        this.hideDuration = this.settings.hideDuration;
        this.height = this.settings.height;
        this.autoHideStarted = false;
        this.createControlBar();
        this.initializeWidgets();
        // add events
        this.definePlayerListeners();
        this.updatePlayerSize( false );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initialize" );
            this.logger.info( this.settings );
        }
    },
    /**
     * Create control bar elements.
     * @method createControlBar
     */
    createControlBar : function ()
    {
        var classCss = (this.settings.sticky === true) ? this.Class.classCss + ' sticky' : this.Class.classCss;
        this.container = $( '<div>',{
            'class' : classCss
        } );
        var row = $( '<div>',{
            'class' : 'ajs-row'
        } );
        this.leftContainer = $( '<div>',{
            'class' : "ajs-container left-container"
        } );
        this.midContainer = $( '<div>',{
            'class' : "ajs-container middle-container"
        } );
        this.rightContainer = $( '<div>',{
            'class' : "ajs-container right-container"
        } );
        // Add to main container
        row.append( this.leftContainer );
        row.append( this.midContainer );
        row.append( this.rightContainer );
        this.container.append( row );
        this.container.height( this.height );
        this.pluginContainer.append( this.container );
    },
    /**
     * Initialize widgets
     * @method initializeWidgets
     */
    initializeWidgets : function ()
    {
        var widgets = this.settings.widgets;
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initialize" );
            this.logger.info( widgets );
        }
        if (widgets.hasOwnProperty( 'left' ))
        {
            for (var leftWidgetName in widgets.left)
            {
                this.initWidget( leftWidgetName,widgets.left[leftWidgetName],this.leftContainer );
            }
        }
        if (widgets.hasOwnProperty( 'mid' ))
        {
            for (var midWidgetName in widgets.mid)
            {
                this.initWidget( midWidgetName,widgets.mid[midWidgetName],this.midContainer );
            }
        }
        if (widgets.hasOwnProperty( 'right' ))
        {
            for (var rightWidgetName in widgets.right)
            {
                this.initWidget( rightWidgetName,widgets.right[rightWidgetName],this.rightContainer );
            }
        }

        if (this.settings.enableProgressBar !== false)
        {
            this.progressBar = new fr.ina.amalia.player.plugins.controlBar.widgets.ProgressBar( {
                debug : this.settings.debug,
                framepreview : this.settings.framepreview,
                framepreviewTimeBound : this.settings.framepreviewTimeBound
            },
            this.mediaPlayer,this.container );
        }
    },
    /**
     * Initialize widget
     * @method initWidget
     * @param {Object} widgetName
     * @param {Object} widgetClassName
     * @param {Object} container
     */
    initWidget : function (widgetName,widgetClassName,container)
    {
        try
        {
            var settings = (typeof this.settings.widgets.settings[widgetName] === "object") ? this.settings.widgets.settings[widgetName] : this.settings;
            /* jslint evil: true */
            /* jshint unused:false */
            var obj = eval( 'new ' + widgetClassName + '(settings,this.mediaPlayer,container)' );
            this.widgets.push( obj );
        }
        catch (error)
        {
            if (this.logger !== null)
            {
                this.logger.warn( "Error to load widget : " + widgetClassName );
                this.logger.warn( error.stack );
            }
        }
    },
    /**
     * Add player events listener
     * @method definePlayerListeners
     */
    definePlayerListeners : function ()
    {
        this.mediaPlayer.mediaContainer.on( fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE,{
            self : this
        },
        this.onFullscreenModeChange );
        if (this.autoHide === true)
        {
            this.mediaPlayer.mediaContainer.one( fr.ina.amalia.player.PlayerEventType.PLAYING,{
                self : this
            },
            this.onPlaying );
            this.mediaPlayer.mediaContainer.one( fr.ina.amalia.player.PlayerEventType.SEEK,{
                self : this
            },
            this.onSeeking );
        }

        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"defineWidgetsListeners" );
        }
    },
    /**
     * Update control bar height
     * @method updatePlayerSize
     * @param {Boolean} inFullScreen
     */
    updatePlayerSize : function (inFullScreen)
    {
        if (this.settings.sticky === true)
        {
            if (inFullScreen === true)
            {
                this.mediaPlayer.mediaContainer.find( 'video' ).first().css( 'height',parseInt( window.screen.height - this.height ) );
            }
            else
            {
                this.mediaPlayer.mediaContainer.find( 'video' ).first().css( 'height',parseInt( this.mediaPlayer.mediaContainer.parent().height() - this.height ) );
            }
        }
        else
        {
            this.container.css( 'bottom',this.height + 'px' );
        }
    },
    /**
     * Show control bar with animation
     * @method show
     */
    show : function ()
    {
        var self = this;

        if (self.displayState === false)
        {
            self.container.find( '.row' ).show();
            self.container.find( '.player-progress-bar' ).css( 'height','20px' );
            self.container.find( '.player-progress-bar .ui-slider-handle' ).css( 'width','20px' );
            self.container.animate( {
                bottom : self.height + 'px'
            },
            250,function ()
            {
                self.displayState = true;
            } );
        }
    },
    /**
     * Hide control bar with animation
     * @method hide
     */
    hide : function ()
    {
        var self = this;
        if (self.displayState === true)
        {
            self.container.animate( {
                bottom : '10px'
            },
            250,function ()
            {
                self.container.find( '.row' ).hide();
                self.container.find( '.player-progress-bar' ).css( 'height','10px' );
                self.container.find( '.player-progress-bar .ui-slider-handle' ).css( 'width','10px' );
                self.displayState = false;
            } );
        }
    },
    /**
     * Fired when full-screen mode change
     * @method onFullscreenModeChange
     * @param {Object} event
     * @param {Object} data
     */
    onFullscreenModeChange : function (event,data)
    {
        event.data.self.updatePlayerSize( data.inFullScreen );
    },
    /**
     * Fired when mouse enter
     * @mthod onPlayerMouseEnter
     * @param {Object} event
     */
    onPlayerMouseEnter : function (event)
    {
        if (event.data.self.displayState === false)
        {
            event.data.self.show();
        }
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onPlayerMouseEnter" );
        }
    },
    /**
     * Fired when mouse leave event
     * @method onPlayerMouseLeave
     * @param {Object} event
     */
    onPlayerMouseLeave : function (event)
    {
        if (event.data.self.displayState === true)
        {
            setTimeout( function ()
            {
                event.data.self.hide();
            },event.data.self.hideDuration );
        }
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onPlayerMouseLeave" );
        }
    },
    /**
     * Fired one time when first playing event
     * @method onPlaying
     * @param {Object} event
     */
    onPlaying : function (event)
    {
        if (event.data.self.autoHideStarted === false)
        {
            event.data.self.autoHideStarted = true;
            event.data.self.mediaPlayer.mediaContainer.on( 'mouseenter touchstart',{
                self : event.data.self
            },
            event.data.self.onPlayerMouseEnter );
            event.data.self.mediaPlayer.mediaContainer.on( 'mouseleave touchleave',{
                self : event.data.self
            },
            event.data.self.onPlayerMouseLeave );
        }
    },
    /**
     * Fired one time when first seeking event
     * @method onSekking
     * @param {Object} event
     */
    onSeeking : function (event)
    {
        if (event.data.self.autoHideStarted === false)
        {
            event.data.self.autoHideStarted = true;
            event.data.self.hide();
            event.data.self.mediaPlayer.mediaContainer.on( 'mouseenter touchstart',{
                self : event.data.self
            },
            event.data.self.onPlayerMouseEnter );
            event.data.self.mediaPlayer.mediaContainer.on( 'mouseleave touchleave',{
                self : event.data.self
            },
            event.data.self.onPlayerMouseLeave );
        }
    }
} );
