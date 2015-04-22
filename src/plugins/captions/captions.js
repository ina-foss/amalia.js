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
 * In charge to caption plugin and display sub title on the player
 * @class CaptionsPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-captions
 * @constructor
 * @extends fr.ina.amalia.player.plugins.captions.CaptionsBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.captions.CaptionsBase.extend( "fr.ina.amalia.player.plugins.CaptionsPlugin",{
    classCss : "ajs-plugin plugin-caption",
    classCssFullscreenOn : "fullScreenOn",
    classCssFullscreenOff : "fullScreenOff"
},
{
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
    /**
     * In charge to create container for display subtitle
     * @method initialize
     */
    initialize : function ()
    {
        this.container = $( '<div>',{
            class : this.Class.classCss
        } );
        this.container.addClass( this.Class.classCssFullscreenOff );
        this.listOfData = [
        ];
        this.settings = $.extend( {
            debug : this.settings.debug,
            framerate : '25',
            internalPlugin : false,
            metadataId : '',
            level : 2
        },
        this.settings.parameters || {} );
        this.pluginContainer.append( this.container );
        this.definePlayerListeners();
    },
    /**
     * Set events listener
     * @method definePlayerListeners
     */
    definePlayerListeners : function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();
        if (this.settings.metadataId === '')
        {
            player.on( fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE,{
                self : this
            },
            this.onSelectedMetadataChange );
        }
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

        // Player events
        player.on( fr.ina.amalia.player.PlayerEventType.TIME_CHANGE,{
            self : this
        },
        this.onTimeupdate );
        // Player full screen events
        player.on( fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE,{
            self : this
        },
        this.onFullscreenModeChange );

        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"definePlayerListeners" );
        }
    },
    /**
     * In charge to update block data
     */
    updataBlockData : function ()
    {
        // use settings metadata if not empty
        if (this.settings.metadataId !== '')
        {
            this.updateMetadata( this.settings.metadataId,this.settings.level,0,this.mediaPlayer.getDuration() );
        }
        else if (this.selectedMetadataId !== '')
        {
            this.updateMetadata( this.selectedMetadataId,this.settings.level,0,this.mediaPlayer.getDuration() );
        }
    },
    /**
     * In charge to update text with current time
     * @method updatePos
     * @param {Object} currentTime
     */
    updatePos : function (currentTime)
    {
        currentTime = parseFloat( currentTime );
        var displayData = $.grep( this.listOfData,function (n)
        {
            return (currentTime >= parseFloat( n.tcin ) && currentTime < parseFloat( n.tcout ));
        } );
        var text = "";
        var textData = null;
        for (var i = 0;
            i < displayData.length;
            i++)
        {
            textData = displayData[i];
            if (textData !== null && typeof textData !== "undefined" && textData.hasOwnProperty( 'text' ) === true)
            {
                text += textData.text.toString();
            }
        }
        if (text !== "")
        {
            this.container.html( text );
            this.container.show();
        }
        else
        {
            this.container.html( "" );
            this.container.hide();
        }
    },
    /**
     * Set full-screen mode
     * @method setFullscreenMode
     * @param {Boolean} state true pour le mode plein ecran
     */
    setFullscreenMode : function (state)
    {
        if (state === true)
        {
            this.container.removeClass( this.Class.classCssFullscreenOff ).addClass( this.Class.classCssFullscreenOn );
        }
        else
        {
            this.container.removeClass( this.Class.classCssFullscreenOn ).addClass( this.Class.classCssFullscreenOff );

        }
    },
    /**
     * Fired on full-screen mode change
     * @method onFullscreenModeChange
     * @param {Object} event
     */
    onFullscreenModeChange : function (event,data)
    {
        event.data.self.setFullscreenMode( data.inFullScreen );
    },
    /**
     * Fired on selected metadata change
     * @method onSelectedMetadataChange
     */
    onSelectedMetadataChange : function (event,data)
    {
        if (data.metadataId !== null)
        {
            event.data.self.selectedMetadataId = data.metadataId.toString();
            event.data.self.updataBlockData();
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
    onDataChange : function (event,data)
    {
        if (event.data.self.loadDataStarted === false && event.data.self.selectedMetadataId === data.id)
        {
            this.updataBlockData();
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
        event.data.self.updataBlockData();
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"EndDataChange" );
        }
    }
} );
