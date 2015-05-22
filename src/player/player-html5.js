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
 * In charge of the player html5
 * @class PlayerHtml5
 * @module player
 * @namespace fr.ina.amalia.player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaContainer
 */
$.Class( "fr.ina.amalia.player.PlayerHtml5",{
    mediaPlayerClassCss : "player",
    mediaPlayerStyleCss : "position: relative; width: inherit; height: inherit; background-color: black; "
},
{
    logger : null,
    settings : {},
    /**
     * Main container
     * @property mediaContainer
     * @type {Object}
     * @default null
     */
    mediaContainer : null,
    /**
     * Player instance
     * @property mediaPlayer
     * @type {Object}
     * @default null
     */
    mediaPlayer : null,
    /**
     * Plugin manager instance
     * @property pluginManager
     * @type {Object} fr.ina.amalia.player.plugins.PluginManager
     * @default null
     */
    pluginManager : null,
    /**
     * Instance of local storage manager.
     * @property localStorageManager
     * @type {Object} fr.ina.amalia.player.LocalStorageManager
     * @default null
     */
    localStorageManager : null,
    /**
     * Element to display loader
     * @property loaderContainer
     * @type {Object}
     * @default null
     */
    loaderContainer : null,
    /**
     * Element to display error
     * @property errorContainer
     * @type {Object}
     * @default null
     */
    errorContainer : null,
    /**
     * True if ios devices
     * @property isIOSDevices
     * @type {Boolean}
     * @default false
     */
    isIOSDevices : false,
    /**
     * True play only range
     * @property isRangePlayer
     * @type {Boolean}
     * @default false
     */
    isRangePlayer : false,
    /**
     * Tc for stop player in range mode
     * @property rangePlayerTcout
     * @type {Number}
     * @default null
     */
    rangePlayerTcout : null,
    /**
     * Image capture id
     * @property captureId
     * @type {Number}
     * @default null
     */
    captureId : null,
    /**
     * Image capture tc
     * @property captureTc
     * @type {Number}
     * @default null
     */
    captureTc : null,
    /**
     * Image caputre ratio
     * @property captureScale
     * @type {Number}
     * @default 100
     */
    captureScale : 1,
    /**
     * Zoom tcin
     * @property zTcin
     * @type {Number}
     * @default null
     */
    zTcin : null,
    /**
     * Zoom tcout
     * @property zTcout
     * @type {Number}
     * @default null
     */
    zTcout : null,
    /**
     * Tc offset
     * @property tcOffset
     * @type {Number}
     * @default 0
     */
    tcOffset : 0,
    /**
     * Media type manager, if your media is not mp4 file.
     * @property tcOffset
     * @type {Number}
     * @default 0
     */
    mediaTypeManager : null,
    /**
     * In charge to manage all metadata
     * @property metadataManager
     * @type {Object}
     * @default null
     */
    metadataManager : null,
    /**
     * timeout representing the ID
     * @property intervalRewind
     * @type {Object}
     * @default null
     */
    intervalRewind : null,
    /**
     * Init player class
     * @constructor
     * @param {Object} settings
     * @param {Object} mediaContainer
     */
    init : function (settings,mediaContainer)
    {
        this.settings = $.extend( {
            autoplay : false,
            poster : "",
            src : "",
            defaultVolume : 75,
            crossorigin : ''
        },
        settings || {} );
        if (fr.ina.amalia.player.log !== undefined && fr.ina.amalia.player.log.LogHandler !== undefined)
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        this.mediaContainer = mediaContainer;
        this.initialize();
    },
    /**
     * Method in charge to initialize player : - Create containers - Load
     * plugins
     * @method initialize
     */
    initialize : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initialize" );
        }
        var IsiPhone = navigator.userAgent.indexOf( "iPhone" ) !== -1;
        var IsiPod = navigator.userAgent.indexOf( "iPod" ) !== -1;
        var IsiPad = navigator.userAgent.indexOf( "iPad" ) !== -1;
        this.isIOSDevices = IsiPhone || IsiPad || IsiPod;
        this.tcOffset = parseInt( this.settings.tcOffset );
        this.createLoaderContainer();
        this.createErrorContainer();
        this.createPlayer();
        // plugins
        this.initializePlugins();
        this.initializeMetadataManager();
        this.localStorageManager = new fr.ina.amalia.player.LocalStorageManager( {} );
        this.setSrc( this.settings.src,this.settings.autoplay );
        // set default volume
        this.setVolume( (this.localStorageManager.hasItem( 'volume' ) === false) ? this.settings.defaultVolume : this.localStorageManager.getItem( 'volume' ) );
    },
    /**
     * initialize plugin manager
     * @method initializePlugins
     */
    initializePlugins : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initializePlugins" );
        }
        this.pluginManager = new fr.ina.amalia.player.plugins.PluginManager( this.settings,this,this.mediaContainer );
    },
    /**
     * initialize plugin manager
     * @method initializePlugins
     */
    initializeMetadataManager : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initializePlugins" );
        }
        this.metadataManager = new fr.ina.amalia.player.MetadataManager( this.settings,this,this.mediaContainer );
    },
    /**
     * In charge to set source with autoplay state
     * @param {String} src
     * @param {Boolean} autoplay
     * @method setSrc
     */
    setSrc : function (src,autoplay)
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"setSrc:" + src );
        }

        if (this.settings.mediaType === "mpd")
        {
            this.mediaTypeManager = new fr.ina.amalia.player.media.type.DashMpeg( this.settings,this.mediaPlayer );
            this.mediaTypeManager.setSrc( src );
        }
        else
        {
            // charge la video
            this.mediaPlayer.find( 'source:first' ).attr( {
                src : src
            } );
            this.load();
            if (autoplay === true)
            {
                this.play();
            }
        }

    },
    /**
     * In charge to create Player dom element
     * @method createPlayer
     */
    createPlayer : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"createPlayer" );
        }

        this.mediaPlayer = $( '<video/>',{
            'class' : this.Class.mediaPlayerClassCss,
            'style' : this.Class.mediaPlayerStyleCss,
            'x-webkit-airplay' : 'allow'
                //'webkit-playsinline':''
        } );
        if (this.settings.crossorigin !== "")
        {
            this.mediaPlayer.attr( 'crossorigin',this.settings.crossorigin );
        }

        // fix pour firefox
        if (this.settings.poster !== "")
        {
            this.mediaPlayer.attr( 'poster',this.settings.poster );
        }
        if (this.settings.mediaType !== "mpd")
        {
            var source = $( '<source />' );
            this.mediaPlayer.append( source );
        }
        this.mediaContainer.append( this.mediaPlayer );
        this.initEvents();
    },
    /**
     * In charge to create loader container
     * @method createLoaderContainer
     */
    createLoaderContainer : function ()
    {
        this.loaderContainer = $( '<div>',{
            'class' : 'ajs-loader'
        } );
        var loader = $( '<i>',{
            class : 'fa fa-cog fa-spin fa-5x'
        } );
        this.loaderContainer.append( loader );
        this.loaderContainer.hide();
        this.mediaContainer.append( this.loaderContainer );
        this.showLoader();
    },
    /**
     * In charge to create error container
     * @method createErrorContainer
     */
    createErrorContainer : function ()
    {
        this.errorContainer = $( '<div>',{
            'class' : 'ajs-error'
        } );
        this.errorContainer.hide();
        this.mediaContainer.append( this.errorContainer );
    },
    /**
     * In charge to set player events
     * @method initEvents
     */
    initEvents : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"adEvents" );
        }
        this.mediaPlayer.on( 'loadstart',{
            self : this
        },
        this.onLoadstart );
        this.mediaPlayer.on( 'playing',{
            self : this
        },
        this.onPlay );
        this.mediaPlayer.on( 'pause',{
            self : this
        },
        this.onPause );
        this.mediaPlayer.on( 'ended',{
            self : this
        },
        this.onEnded );

        this.mediaPlayer.one( 'durationchange',{
            self : this
        },
        this.onDurationchange );
        this.mediaPlayer.on( 'timeupdate',{
            self : this
        },
        this.onTimeupdate );
        this.mediaPlayer.find( "source" ).on( 'error',{
            self : this
        },
        this.onSourceError );
        this.mediaPlayer.on( 'seeked',{
            self : this
        },
        this.onSeeked );
        this.mediaPlayer.on( fr.ina.amalia.player.PlayerEventType.ERROR,{
            self : this
        },
        this.onError );
        $( document ).on( 'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange',{
            self : this
        },
        this.fullScreenHandler );
    },
    /**
     * In charge to load media
     * @method load
     */
    load : function ()
    {
        this.mediaPlayer.get( 0 ).load();
    },
    /**
     * In charge to show loader.
     * @method showLoader
     */
    showLoader : function ()
    {
        this.loaderContainer.show();
    },
    /**
     * In charge to hide loader.
     * @method hideLoader
     */
    hideLoader : function ()
    {
        this.loaderContainer.hide();
    },
    /**
     * In charge to play media
     * @method play
     */
    play : function ()
    {
        this.mediaPlayer.get( 0 ).play();
        this.setPlaybackrate( 1 );
        if (typeof this.settings.callbacks.onPlay !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( this.settings.callbacks.onPlay + '()' );
            }
            catch (e)
            {
                if (this.logger !== null)
                {
                    this.logger.warn( "Send callback failed." );
                }
            }
        }
    },
    /**
     * In charge to pause media
     * @method pause
     */
    pause : function ()
    {
        this.mediaPlayer.get( 0 ).pause();
        this.setPlaybackrate( 1 );

        this.isRangePlayer = false;
        this.rangePlayerTcout = null;
        if (typeof this.settings.callbacks.onPause !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( this.settings.callbacks.onPause + '()' );
            }
            catch (e)
            {
                if (this.logger !== null)
                {
                    this.logger.warn( "Send callback failed." );
                }
            }
        }
    },
    /**
     * In charge to stop media
     * @method stop
     */
    stop : function ()
    {
        this.mediaPlayer.get( 0 ).pause();
        this.mediaPlayer.get( 0 ).currentTime = 0;
        if (typeof this.settings.callback.onStop !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( this.settings.callbacks.onStop + '()' );
            }
            catch (e)
            {
                if (this.logger !== null)
                {
                    this.logger.warn( "Send callback failed." );
                }
            }
        }
    },
    /**
     * In charge to seek
     * @method seek
     * @param {Number} time
     * @return {Number} current time
     */
    seek : function (time)
    {
        return this.setCurrentTime( time );
    },
    /**
     * In charge to set mute state
     * @method mute
     * @event fr.ina.amalia.player.PlayerEventType.MUTE
     * @return {Number}
     */
    mute : function ()
    {
        this.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.MUTE );
        return this.mediaPlayer.get( 0 ).volume = 0;
    },
    /**
     * In charge to set unmute state
     * @method unmute
     * @event fr.ina.amalia.player.PlayerEventType.UN_MUTE
     */
    unmute : function ()
    {
        this.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.UN_MUTE );
        this.mediaPlayer.get( 0 ).volume = 1;
    },
    /**
     * Return player instance
     * @method getMediaPlayer
     * @return {Object}
     */
    getMediaPlayer : function ()
    {
        return this.mediaPlayer;
    },
    /**
     * Return media duration with tc offset
     * @method getDuration
     * @return {Number}
     */
    getDuration : function ()
    {
        return this.mediaPlayer.get( 0 ).duration;
    },
    /**
     * Return tc offset
     * @returns {Number}
     */
    getTcOffset : function ()
    {
        return this.tcOffset;
    },
    /**
     * Returns the current playback volume percentage, as a number from 0 to
     * 100.
     * @method getVolume
     * @return {Number}
     */
    getVolume : function ()
    {
        return this.mediaPlayer.get( 0 ).volume * 100;
    },
    /**
     * In charge to play segment
     * @param {Number} tcin
     * @param {Number} tcout
     * @param {Boolean} autoplay true for autolay
     */
    rangePlay : function (tcin,tcout,autoplay)
    {
        autoplay = (typeof autoplay === "undefined") ? false : autoplay;
        this.isRangePlayer = true;
        this.rangePlayerTcout = tcout + this.tcOffset;
        this.setCurrentTime( tcin );
        if (autoplay === true)
        {
            this.play();
        }
    },
    /**
     * Sets the player's audio volume percentage, as a number between 0 and 100.
     * @method setVolume
     * @param {Number} value
     */
    setVolume : function (value)
    {
        if (value >= 0 && value <= 100)
        {
            this.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.VOLUME_CHANGE,{
                volume : value
            } );
            this.localStorageManager.setItem( 'volume',value );
            if (this.logger !== null)
            {
                this.logger.trace( this.Class.fullName,"setVolume" + value );
            }
            return this.mediaPlayer.get( 0 ).volume = value / 100;
        }
        else
        {
            return null;
        }
    },
    /**
     * Set seek position in seconds
     * @method setCurrentTime
     * @param {Object} value
     * @event fr.ina.amalia.player.PlayerEventType.SEEK
     */
    setCurrentTime : function (value)
    {
        var currentTime = isNaN( value ) ? 0 : value;
        this.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.SEEK,{
            currentTime : currentTime
        } );
        return this.mediaPlayer.get( 0 ).currentTime = Math.max( 0,currentTime - this.tcOffset );
    },
    /**
     * Set playback rate
     * @param {Objecy} speed the current playback speed of the audio/video.
     * @returns the current playback speed of the audio/video.
     */
    setPlaybackrate : function (speed)
    {
        var self = this;
        if (speed <= 0)
        {
            clearInterval( self.intervalRewind );
            self.intervalRewind = setInterval( function () {
                self.mediaPlayer.get( 0 ).playbackRate = 1;
                var currentTime = self.getCurrentTime();
                if (currentTime === 0)
                {
                    self.mediaPlayer.get( 0 ).playbackRate = 1.0;
                    clearInterval( self.intervalRewind );
                    self.pause();
                }
                else
                {
                    currentTime += speed;
                    self.setCurrentTime( currentTime );
                }
            },30 );
        }
        else
        {
            clearInterval( self.intervalRewind );
            self.mediaPlayer.get( 0 ).playbackRate = parseFloat( speed );
        }
        this.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.PLAYBACK_RATE_CHANGE,{
            rate : speed
        } );
    },
    /**
     * Set Error
     * @method setErrorCode
     * @param {Object} errorCode
     */
    setErrorCode : function (errorCode)
    {
        if (typeof this.errorContainer !== "undefined")
        {
            var messageContainer = $( '<p>',{
                text : fr.ina.amalia.player.PlayerErrorCode.getMessage( errorCode )
            } );
            this.errorContainer.html( messageContainer );
            this.errorContainer.show();
        }
    },
    /**
     * Returns the current fullscreen state
     * @method getFullscreen
     * @return {Boolean} description
     */
    getFullscreen : function ()
    {
        return fr.ina.amalia.player.helpers.HTML5Helper.isFullScreen();
    },
    /**
     * Return current position in seconds
     * @method getCurrentTime
     * @return {Number}
     */
    getCurrentTime : function ()
    {
        return this.mediaPlayer.get( 0 ).currentTime + this.tcOffset;
    },
    /**
     * Return true if media is paused
     * @method isPaused
     * @return {Boolean}
     */
    isPaused : function ()
    {
        return this.mediaPlayer.get( 0 ).paused;
    },
    /**
     * In charge to toggle full-screen state
     * @see HTML5 Fullscreen API
     * @method toggleFullScreen
     * @return {Boolean} true
     */
    toggleFullScreen : function ()
    {
        var container = (this.isIOSDevices) ? this.mediaPlayer.get( 0 ) : this.mediaContainer.get( 0 );
        var inFullScreen = fr.ina.amalia.player.helpers.HTML5Helper.toggleFullScreen( container,this.isIOSDevices );
        if (typeof this.settings.callbacks.onFullscreen !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( this.settings.callbacks.onFullscreen + '(inFullScreen)' );
            }
            catch (e)
            {
                if (this.logger !== null)
                {
                    this.logger.warn( "Send callback failed." );
                }
            }
        }
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"onClickFullscreenButton :" + inFullScreen );
        }
        return inFullScreen;
    },
    /**
     * Fired on full-screen state change
     * @method fullScreenHandler
     * @event fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE
     * @param {Object} event
     */
    fullScreenHandler : function (event)
    {
        var doc = $( document ).context;
        var inFullScreen = doc.fullscreen || doc.mozFullScreen || doc.webkitIsFullScreen ? true : false;
        event.data.self.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE,{
            inFullScreen : inFullScreen
        } );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"fullScreenHandler :" + inFullScreen );
        }
    },
    /**
     * Return instance of metadata manager
     */
    getMetadataManager : function ()
    {
        return this.metadataManager;
    },
    /**
     * Return the block of metadata
     */
    getBlocksMetadata : function ()
    {
        return this.metadataManager.getBlocksMetadata();
    },
    /**
     * Return the block of metadata
     */
    getBlockMetadata : function (id)
    {
        return this.metadataManager.getBlockMetadata( id );
    },
    /**
     * Update the block metadata
     */
    updateBlockMetadata : function (id,data,action)
    {
        this.metadataManager.updateBlockMetadata( id,data,action );
    },
    /**
     * Remove the block metadata with id metadata
     */
    removeBlockMetadata : function (id)
    {
        return this.metadataManager.removeBlockMetadata( id );
    },
    /**
     * In charge to add metadata, it is called by metadata parser
     * @method addAllMetadata
     * @param {Object} data
     * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
     */
    addAllMetadata : function (parsedData)
    {
        this.metadataManager.addAllMetadata( parsedData );
    },
    /**
     * In charge to return metadata by id
     * @method addMetadataById
     * @param {Object} data
     * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
     */
    addMetadataById : function (id,parsedData)
    {
        this.metadataManager.addMetadataById( id,parsedData );
    },
    /**
     * In charge to replace metadata by id
     * @method replaceAllMetadataById
     * @param {Object} data
     * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
     */
    replaceAllMetadataById : function (id,parsedData)
    {
        this.metadataManager.replaceAllMetadataById( id,parsedData );
    },
    /**
     * In charge to delete metadata by id
     * @method deleteAllMetadataById
     * @param {Object} data
     * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
     */
    deleteAllMetadataById : function (id)
    {
        this.metadataManager.deleteAllMetadataById( id );
    },
    /**
     * Return metadata by id
     * @method getMetadataById
     * @param {String} id
     * @return {Array}
     */
    getMetadataById : function (id)
    {
        return this.metadataManager.getMetadataById( id );
    },
    /**
     * Set metadata by id
     * @method setMetadataById
     * @param {String} id
     * @param {Object} data
     * @return {Array}
     */
    setMetadataById : function (id,data)
    {
        return this.metadataManager.setMetadataById( id,data );
    },
    /**
     * In charge to remove metadata
     * @method removeMetadataById
     */
    removeMetadataById : function (id)
    {
        return this.metadataManager.removeMetadataById( id );
    },
    /**
     * Return a metadata by specified time code.
     * @method getMetadataWithRange
     * @param id
     * @param tcin
     * @param tcout
     * @return {Array}
     */
    getMetadataWithRange : function (id,tcin,tcout)
    {
        return this.metadataManager.getMetadataWithRange( id,tcin,tcout );
    },
    /**
     * Return selected component id
     * @method getSelectedMetadataId
     */
    getSelectedMetadataId : function ()
    {
        return this.metadataManager.getSelectedMetadataId();
    },
    /**
     * Set selected component id
     * @method setSelectedMetadataId
     */
    setSelectedMetadataId : function (metadataId)
    {
        this.metadataManager.setSelectedMetadataId( metadataId );
    },
    /**
     * In charge to add metadata item
     * @method addMetadataItem
     */
    addMetadataItem : function (metadataId,data)
    {
        return this.metadataManager.addMetadataItem( metadataId,data );
    },
    /**
     * Return selected items
     */
    getSelectedItems : function ()
    {
        return this.metadataManager.getSelectedItems();
    },
    /**
     * Add selected item
     */
    addSelectedItem : function (item)
    {
        this.metadataManager.addSelectedItem( item );
    },
    /**
     * Remove all selected items
     */
    removeAllSelectedItems : function ()
    {
        this.metadataManager.removeAllSelectedItems();
    },
    /**
     * In charge to set zoom tc
     * @param {Number} zTcin
     * @param {Number} zTcout
     * @param {String} eventTag
     */
    setZoomTc : function (zTcin,zTcout,eventTag)
    {
        eventTag = (typeof eventTag !== 'undefined') ? eventTag : '';
        if (Math.ceil( this.zTcin ) !== Math.ceil( zTcin ) || Math.ceil( this.zTcout ) !== Math.ceil( zTcout ))
        {
            this.zTcin = Math.max( 0,parseFloat( zTcin ) );
            this.zTcout = parseFloat( zTcout );
            if (this.logger !== null)
            {
                this.logger.info( "SetZoomTc: // Tcin: " + this.zTcin + " // Tcout:" + this.zTcout + " // Event Tag Name:" + eventTag );
            }
            this.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.ZOOM_RANGE_CHANGE,{
                zTcin : parseFloat( zTcin ),
                zTcout : parseFloat( zTcout ),
                eventTag : eventTag
            } );
        }
    },
    /**
     * Return current image
     * @param {Nomber} scale max 1=> 100%
     * @method getCurrentImage
     * @event fr.ina.amalia.player.PlayerEventType.IMAGE_CAPTURE
     */
    getCurrentImage : function (scale)
    {
        var image = "";
        try
        {
            var videoContent = this.mediaPlayer.get( 0 );
            var canvas = document.createElement( "canvas" );
            scale = (typeof scale !== 'undefined') ? Math.min( 1,parseFloat( scale ) ) : 1;
            canvas.width = videoContent.videoWidth * scale;
            canvas.height = videoContent.videoHeight * scale;
            canvas.getContext( '2d' ).drawImage( videoContent,0,0,canvas.width,canvas.height );
            image = canvas.toDataURL( "image/png" );
            this.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.IMAGE_CAPTURE,{
                currentTime : this.getCurrentTime(),
                captureTc : this.captureTc.toString(),
                captureId : this.captureId.toString(),
                captureImage : image.toString()
            } );
            return image;
        }
        catch (error)
        {
            if (this.logger !== null)
            {
                this.logger.warn( "Error lors de la capture d'imagette" );
                this.logger.warn( error.stack );
            }
        }
        return image;
    },
    /**
     * Return current image for specified time code.
     * @param {String} id
     * @param {Number} tc
     * @param {Number} scale max 1=> 100%
     * @method getTcImage
     * @event fr.ina.amalia.player.PlayerEventType.IMAGE_CAPTURE
     */
    getTcImage : function (id,tc,scale)
    {
        this.setCurrentTime( tc );
        // Need to call player for make capture
        this.play();
        this.captureId = id;
        this.captureTc = tc + this.tcOffset;
        this.captureScale = (typeof scale !== 'undefined') ? Math.min( 1,parseFloat( scale ) ) : 1;
    },
    /**
     * Fired on load start event
     * @method onLoadstart
     * @param {Object} event
     * @event fr.ina.amalia.player.PlayerEventType.STARTED
     */
    onLoadstart : function (event)
    {
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onLoadstart" );
        }
        if (typeof event.data.self.settings.callbacks.onReady !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( event.data.self.settings.callbacks.onReady + '()' );
            }
            catch (e)
            {
                if (event.data.self.logger !== null)
                {
                    event.data.self.logger.warn( "Send callback failed." );
                }
            }
        }
    },
    /**
     * Fired on playing event
     * @method onPlay
     * @param {Object} event
     * @event fr.ina.amalia.player.PlayerEventType.PLAYING
     */
    onPlay : function (event)
    {
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onPlay" );
        }
        event.data.self.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.PLAYING,[
            event.data.self
        ] );
    },
    /**
     * Fired on paused event
     * @method onPause
     * @param {Object} event
     * @event fr.ina.amalia.player.PlayerEventType.PAUSED
     */
    onPause : function (event)
    {
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onPause" );
        }
        event.data.self.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.PAUSED,[
            event.data.self
        ] );
    },
    /**
     * @method onSeeked
     * @param {Object} event
     * @event fr.ina.amalia.player.PlayerEventType.SEEK
     */
    onSeeked : function (event)
    {
        event.data.self.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.SEEK,{
            currentTime : event.data.self.getCurrentTime()
        } );
        // Lecture d'un segment
        if (typeof event.data.self.captureTc === "number")
        {
            try
            {
                event.data.self.getCurrentImage( event.data.self.captureScale );
                event.data.self.captureTc = null;
            }
            catch (error)
            {
                if (event.data.self.logger !== null)
                {
                    event.data.self.logger.warn( "Error to capture Tc" );
                    event.data.self.logger.warn( error.stack );
                }
            }
        }
    },
    /**
     * Ended event occurs when the audio/video has reached the end.
     * @method onEnded
     * @param {Object} event
     * @event fr.ina.amalia.player.PlayerEventType.ENDEN
     */
    onEnded : function (event)
    {
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onEnded" );
        }
        event.data.self.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.ENDEN,[
            event.data.self
        ] );
        if (typeof event.data.self.settings.callbacks.onComplete !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( event.data.self.settings.callbacks.onComplete + '()' );
            }
            catch (e)
            {
                if (event.data.self.logger !== null)
                {
                    event.data.self.logger.warn( "Send callback failed." );
                }
            }
        }
    },
    /**
     * Fired on media duration change
     * @method onFirstTimeUpdate
     * @param {Object} event
     * @event fr.ina.amalia.player.PlayerEventType.STARTED
     */
    onDurationchange : function (event)
    {
        event.data.self.hideLoader();
        event.data.self.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.STARTED,[
            event.data.self
        ] );
        if (event.data.self.settings.autoplay === true)
        {
            event.data.self.play();
        }
    },
    /**
     * Fired on time change evnet
     * @method onTimeupdate
     * @param {Object} event
     * @event fr.ina.amalia.player.PlayerEventType.TIME_CHANGE
     */
    onTimeupdate : function (event)
    {
        var tcOffset = event.data.self.getTcOffset();
        var currentTime = event.data.self.getCurrentTime();
        var duration = event.data.self.getDuration() + tcOffset;
        var percentage = ((currentTime - tcOffset) * 100) / (duration - tcOffset);

        event.data.self.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.TIME_CHANGE,{
            self : event.data.self,
            currentTime : currentTime,
            duration : duration,
            percentage : percentage,
            tcOffset : event.data.self.getTcOffset()
        } );
        // In Range play mode
        if (event.data.self.isRangePlayer === true && typeof event.data.self.rangePlayerTcout === "number" && event.data.self.rangePlayerTcout <= currentTime)
        {
            event.data.self.pause();
        }
        if (typeof event.data.self.settings.callbacks.onTimeupdate !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( event.data.self.settings.callbacks.onTimeupdate + '(currentTime)' );
            }
            catch (e)
            {
                if (event.data.self.logger !== null)
                {
                    event.data.self.logger.warn( "Send callback failed." );
                }
            }
        }
    },
    /**
     * Fired when error to load media
     * @method onSourceError
     * @param {Object} event
     * @event fr.ina.amalia.player.PlayerEventType.ERROR
     */
    onSourceError : function (event)
    {
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.warn( event.data.self.Class.fullName + " :: onSourceError" );
            event.data.self.logger.warn( event );
        }
        event.data.self.mediaPlayer.trigger( fr.ina.amalia.player.PlayerEventType.ERROR,{
            self : event.data.self,
            errorCode : fr.ina.amalia.player.PlayerErrorCode.MEDIA_FILE_NOT_FOUND
        } );
    },
    /**
     * Fired on player has errors.
     * @method onError
     * @param {Object} event
     * @param {Object} data
     * @event fr.ina.amalia.player.PlayerEventType.ERROR
     */
    onError : function (event,data)
    {
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onError" );
        }
        var errorCode = (typeof data.errorCode === "undefined") ? '' : data.errorCode;
        event.data.self.setErrorCode( errorCode );
        if (typeof event.data.self.settings.callbacks.onError !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( event.data.self.settings.callbacks.onError + '(errorCode)' );
            }
            catch (e)
            {
                if (event.data.self.logger !== null)
                {
                    event.data.self.logger.warn( "Send callback failed." );
                }
            }
        }
    },
    /**
     * In charge to add menu context item
     * @param {String} title
     * @param {String} link
     * @param {String} className
     */
    addMenuItemWithLink : function (title,link,className)
    {
        if (typeof this.pluginManager === "object" && typeof this.pluginManager.getContextMenuPlugin === "function")
        {
            var contextMenuPlugin = this.pluginManager.getContextMenuPlugin();
            if (typeof contextMenuPlugin === "object" && typeof contextMenuPlugin.addItemWithLink === "function")
            {
                return contextMenuPlugin.addItemWithLink( title,link,className );
            }
        }
        return false;
    }
} );
