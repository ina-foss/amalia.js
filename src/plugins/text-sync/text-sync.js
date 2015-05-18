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
 * In charge to text sync plugin
 * @class TextSyncPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-text-sync
 * @constructor
 * @extends fr.ina.amalia.player.plugins.captions.CaptionsBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.captions.CaptionsBase.extend( "fr.ina.amalia.player.plugins.TextSyncPlugin",{
    classCss : "ajs-plugin plugin-text-sync",
    style : ""
},
{
    /**
     * Enable Main level
     * @property withMainLevel
     * @type {Object}
     * @default null
     */
    withMainLevel : false,
    /**
     * True if mode karaoke is enabled
     * @property karaoke
     * @default null
     */
    karaoke : false,
    /**
     * true if load data started anw
     * @property loadDataStarted
     * @default null
     */
    loadDataStarted : false,
    /**
     * Selected metadata id provide by player core.
     * @property loadDataStarted
     * @default ''
     */
    selectedMetadataId : '',
    initialize : function ()
    {
        this.container = $( '<ul>',{
            class : 'ajs-media-list'
        } );
        this.settings = $.extend( {
            debug : this.settings.debug,
            framerate : '25',
            internalPlugin : false,
            metadataId : '',
            level : 2,
            title : '',
            description : '',
            displayLevel : '',
            scrollAuto : false
        },
        this.settings.parameters || {} );
        this.settings.displayLevel = (this.settings.displayLevel === "") ? this.settings.level : this.settings.displayLevel;
        this.withMainLevel = (this.settings.displayLevel !== this.settings.level);
        this.karaoke = this.withMainLevel;
        if (this.settings.title !== '')
        {
            this.createTitleBlock( this.settings.title,this.settings.description );
        }

        // events
        this.container.on( fr.ina.amalia.player.plugins.textSyncPlugin.Component.eventTypes.CLICK,{
            self : this
        },
        this.onClickTc );

        this.pluginContainer.append( this.container );
        this.defineEventListeners();
    },
    /**
     * In charge to define event listener
     * @method defineEventListeners
     */
    defineEventListeners : function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();
        player.on( fr.ina.amalia.player.PlayerEventType.BEGIN_DATA_CHANGE,{
            self : this
        },
        this.onBeginDataChange );
        player.on( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            self : this
        },
        this.onDataChange );
        player.on( fr.ina.amalia.player.PlayerEventType.END_DATA_CHANGE,{
            self : this
        },
        this.onEndDataChange );

        player.on( fr.ina.amalia.player.PlayerEventType.TIME_CHANGE,{
            self : this
        },
        this.onTimeupdate );
        if (this.settings.scrollAuto === true)
        {
            player.on( fr.ina.amalia.player.PlayerEventType.SEEK,{
                self : this
            },
            this.onSeek );
        }
        player.on( fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE,{
            self : this
        },
        this.onSelectedMetadataChange );
    },
    /**
     * In charge to update display items
     * @method updateListOfDisplayItems
     * @param {Number} displayLevel
     */
    updateListOfDisplayItems : function (displayLevel)
    {
        var component = null;
        var data = null;
        // Clear old data
        this.container.empty();
        for (var i = 0;
            i < this.listOfData.length;
            i++)
        {
            data = this.listOfData[i];
            if (data.level === displayLevel)
            {
                component = this.createComponent( this.container );
                if (component !== null)
                {
                    if (typeof component.createLine === "function")
                    {
                        component.createLine( data.tcin,data.tcout,data.label,(this.withMainLevel === true) ? '' : data.text,data.thumb );
                    }
                }
                else
                {
                    if (this.logger !== null)
                    {
                        this.logger.warn( "Error initializing the component." );
                    }
                }
            }
            else
            {
                if (component !== null)
                {
                    component.addText( this.createWord( data ) );
                }
            }
        }
        // Définie la hauteur du container
        this.container.height( parseInt( this.pluginContainer.height() - parseInt( this.pluginContainer.find( ".header" ).first().height() ) - 20 ) + "px" );
    },
    /**
     * In charge to create word element
     * @param {Object} data
     */
    createWord : function (data)
    {
        return $( '<span>',{
            class : 'word',
            text : data.text,
            'data-tcin' : data.tcin,
            'data-tcout' : data.tcout
        } );
    },
    /**
     * In charge to create text sync component
     * @param {String} container
     * @param {Object} settings
     */
    createComponent : function (container,settings)
    {
        var component = null;
        var componentSettings = $.extend( {
            debug : this.settings.debug,
            container : container
        },
        settings || {} );

        try
        {
            component = new fr.ina.amalia.player.plugins.textSyncPlugin.Component( componentSettings );
        }
        catch (e)
        {
            if (this.logger !== null)
            {
                this.logger.warn( e );
            }
        }
        return component;
    },
    /**
     * In charge to update positions
     * @method updatePos
     * @param {Object} currentTime
     */
    updatePos : function (currentTime)
    {
        currentTime = parseFloat( currentTime );
        // Line
        this.container.find( '.line' ).removeClass( 'on' );
        this.container.find( '.line' ).filter( function (index,element)
        {
            return (currentTime >= Math.round( parseFloat( $( element ).attr( 'data-tcin' ) ) ) && currentTime < Math.round( parseFloat( $( element ).attr( 'data-tcout' ) ) ));
        } ).addClass( 'on' ).each( function (index,element)
        {
            element = $( element );
            var percentWidth = 0;
            var tcin = Math.round( parseInt( $( element ).attr( 'data-tcin' ) ) );
            var tcout = Math.round( parseInt( $( element ).attr( 'data-tcout' ) ) );
            percentWidth = ((Math.round( currentTime ) - tcin) * 100) / (tcout - tcin);
            element.find( '.ajs-progress' ).show();
            element.find( '.ajs-progress-bar' ).css( 'width',Math.round( percentWidth ) + '%' );
        } );
        // Word
        if (this.karaoke === true)
        {
            this.container.find( '.word' ).removeClass( 'on' );
            this.container.find( '.word' ).filter( function (index,element)
            {
                return (currentTime >= parseFloat( $( element ).attr( 'data-tcin' ) ) && currentTime < parseFloat( $( element ).attr( 'data-tcout' ) ));
            } ).addClass( 'on' );
        }
        if (this.settings.scrollAuto === true)
        {
            var elementPosition = this.container.find( 'li.line' ).eq( 0 ).position();
            var offsetPosition = this.container.find( 'li.line.on' ).position();
            if (elementPosition && offsetPosition)
            {
                this.container.stop().animate( {
                    scrollTop : offsetPosition.top - elementPosition.top
                } );
            }
        }
    },
    /**
     * In charge to create tile block
     * @param {Object} title
     * @param {Object} description
     */
    createTitleBlock : function (title,description)
    {
        var container = $( '<div>',{
            class : "header"
        } );
        var containerBody = $( '<div>',{
            class : "resume"
        } );
        var titleContainer = $( '<h3>',{
            class : "heading",
            text : title
        } );
        containerBody.append( titleContainer );
        var descriptionContaienr = $( '<p>',{
            text : description
        } );
        containerBody.append( descriptionContaienr );
        container.append( containerBody );
        this.pluginContainer.append( container );
    },
    /**
     * In charge to update block data
     */
    updateBlockData : function ()
    {
        // use settings metadata if not empty
        if (this.settings.metadataId !== '')
        {
            this.updateMetadata( this.settings.metadataId,this.settings.level,0,this.mediaPlayer.getDuration(),true );
            this.updateListOfDisplayItems( this.settings.displayLevel );
        }
        else if (this.selectedMetadataId !== '')
        {
            this.updateMetadata( this.selectedMetadataId,this.settings.level,0,this.mediaPlayer.getDuration(),true );
            this.updateListOfDisplayItems( this.settings.displayLevel );
        }

    },
    /**
     * Fired on click event
     * @param {Object} event
     * @param {Object} data
     */
    onClickTc : function (event,data)
    {
        if (data.hasOwnProperty( 'tc' ) === true && data.tc !== true)
        {
            event.data.self.mediaPlayer.setCurrentTime( parseFloat( data.tc ) );
        }
    },
    /**
     * In charge of seek events
     * @method onSeek
     * @param {Object} event
     * @param {Object} data
     */
    onSeek : function (event,data)
    {
        var currentTime = (parseFloat( data.currentTime ));
        var offsetPosition = event.data.self.container.find( 'li.line' ).eq( 0 ).position();
        var elementPosition = event.data.self.container.find( 'li.line' ).filter( function (index,element)
        {
            return (currentTime >= Math.round( parseFloat( $( element ).attr( 'data-tcin' ) ) ) && currentTime < Math.round( parseFloat( $( element ).attr( 'data-tcout' ) ) ));
        } ).first().position();
        if (elementPosition && offsetPosition)
        {
            event.data.self.container.stop().animate( {
                scrollTop : elementPosition.top - offsetPosition.top
            },
            1500,'easeInOutExpo' );
        }
    },
    /**
     * Fired on selected metadata change
     * @method onSelectedMetadataChange
     */
    onSelectedMetadataChange : function (event,data)
    {
        if (event.data.self.settings.metadataId === '' && data.metadataId !== null)
        {
            event.data.self.selectedMetadataId = data.metadataId.toString();
            event.data.self.updateBlockData();
        }
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onSelectedMetadataChange id:" + data.metadataId );
        }
    },
    /**
     * Fired on begin data change event
     * @method onBeginDataChange
     * @param {Object} event
     */
    onBeginDataChange : function (event)
    {
        event.data.self.loadDataStarted = true;
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onBeginDataChange" );
        }
    },
    /**
     * Fired on data change event
     * @param {Object} event
     */
    onDataChange : function (event)
    {
        if (event.data.self.loadDataStarted === false)
        {
            this.updateBlockData();
        }
    },
    /**
     * Fired on end data change event
     * @method onEndDataChange
     * @param {Object} event
     */
    onEndDataChange : function (event)
    {
        event.data.self.loadDataStarted = false;
        event.data.self.updateBlockData();
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"EndDataChange" );
        }
    }
} );
