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
 * Blocks metadata editor charge to list, add and delete blocks
 * @class MetadataListEditorPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-editor
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBase.extend( "fr.ina.amalia.player.plugins.MetadataListEditorPlugin",{
    classCss : "ajs-plugin editor plugin-list-editor",
    eventTypes : {}
},
{
    /**
     * Main container of this plugin
     * @property container
     * @type {Object}
     * @default []
     */
    container : null,
    /**
     * true if load data started anw
     * @property loadDataStarted
     * @default null
     */
    loadDataStarted : false,
    /**
     * Instance of metadata manager
     * @property metadataManager
     * @default null
     */
    metadataManager : null,
    /**
     * Initialize editor plugin and create container of this plugin
     * @method initialize
     */
    initialize : function ()
    {
        this._super();
        this.settings = $.extend( {
            defaultDataType : 'default',
            defaultAuthor : 'amalia.js',
            defaultColor : '#2196f3',
            defaultShape : 'circle'
        },
        this.settings.parameters || {} );

        this.container = $( '<div>',{
            'class' : this.Class.classCss
        } );
        this.pluginContainer.append( this.container );
        this.createHeaderElement();
        this.createMetadataListBlock();
        this.createFooterElement();
        this.defineListeners();
        this.metadataManager = this.mediaPlayer.getMetadataManager();
        this.loaderContainer.show();
    },
    /**
     * Set player events
     * @method defineListeners
     */
    defineListeners : function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();

        player.on( fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE,{
            self : this
        },
        this.onSelectedMetadataChange );
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

        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"definePlayerListeners" );
        }
    },
    /**
     * Create block header
     * @method createHeaderElement
     */
    createHeaderElement : function ()
    {
        var element = $( '<div>',{
            'class' : 'heading'
        } );
        var titleElement = $( '<h3>',{
            'class' : 'title',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_LIST_EDITOR_LABEL_HEADER
        } );
        element.append( titleElement );
        this.container.append( element );
    },
    /**
     * Create metadata list block
     * @method createHeaderElement
     */
    createMetadataListBlock : function ()
    {
        var element = $( '<div>',{
            'class' : 'body'
        } );
        var list = $( '<ul>',{
            'class' : 'listOfmetadata'
        } );

        element.append( list );
        this.container.append( element );
    },
    /**
     * Create block header
     * @method createHeaderElement
     */
    createFooterElement : function ()
    {
        var element = $( '<div>',{
            'class' : 'footer'
        } );
        var btnAddMetadata = $( '<button>',{
            'class' : 'add-metadata ajs-icon ajs-icon-plus'
        } ).on( 'click',{
            self : this
        },
        this.onAddMetadata );
        element.append( btnAddMetadata );
        this.container.append( element );
    },
    /**
     * In charge to update list of metadata
     */
    updateMetadataListBlock : function ()
    {
        var list = this.container.find( 'ul.listOfmetadata' );
        // clean old list
        list.empty();
        var listOfMetadata = this.mediaPlayer.getBlocksMetadata();

        if (listOfMetadata !== null)
        {
            for (var key in listOfMetadata)
            {
                var item = $( '<li>',{
                    'class' : 'item item-' + key,
                    'data-metadata-id' : key
                } );
                var textElement = $( '<span>',{
                    'class' : 'text',
                    'text' : key
                } );
                var deleteElement = $( '<span>',{
                    'class' : 'delete ajs-icon ajs-icon-remove'
                } );

                var duplicateElement = $( '<span>',{
                    'class' : 'duplicate ajs-icon ajs-icon-reorder'
                } );

                item.append( textElement );
                item.append( deleteElement );
                item.append( duplicateElement );
                list.append( item );
            }
        }
        list.find( 'li' ).on( 'click',{
            self : this
        },
        this.onSelectMetadata );
        var selectedMetadataId = this.mediaPlayer.getSelectedMetadataId();
        list.find( 'li.item' ).removeClass( 'selected' );
        if (selectedMetadataId !== null)
        {
            list.find( 'li.item.item-' + selectedMetadataId ).addClass( 'selected' );
        }
        this.loaderContainer.hide();
    },
    /**
     * Set selected metadata id in the instance of player
     * @param metadataId identification
     */
    setSelectedMetadataId : function (metadataId)
    {
        if (this.mediaPlayer.getSelectedMetadataId() !== metadataId)
        {
            this.mediaPlayer.setSelectedMetadataId( metadataId );
        }
    },
    /**
     * For remove metadata
     * @param metadataId identification
     */
    removeMetadataById : function (metadataId)
    {
        this.mediaPlayer.deleteAllMetadataById( metadataId );
        this.updateMetadataListBlock();
    },
    /**
     * In charge to duplicate block data
     * @param oldMetadataId identification
     */
    duplicateBlock : function (oldMetadataId)
    {
        var newMetadataId = '_' + fr.ina.amalia.player.helpers.UtilitiesHelper.generateUUID();
        var dupArray = JSON.parse( JSON.stringify( this.mediaPlayer.getMetadataById( oldMetadataId ) ) );
        var blockMetadata = this.metadataManager.getBlockMetadata( oldMetadataId );
        this.metadataManager.updateBlockMetadata( newMetadataId,{
            id : newMetadataId,
            label : newMetadataId,
            type : (blockMetadata.hasOwnProperty( 'type' )) ? blockMetadata.type : this.settings.defaultDataType,
            author : (blockMetadata.hasOwnProperty( 'author' )) ? blockMetadata.type : this.settings.defaultAuthor,
            color : (blockMetadata.hasOwnProperty( 'color' )) ? blockMetadata.type : this.settings.defaultColor,
            shape : (blockMetadata.hasOwnProperty( 'shape' )) ? blockMetadata.type : this.settings.defaultShape
        } );
        this.mediaPlayer.setMetadataById( newMetadataId,dupArray );
        this.mediaPlayer.setSelectedMetadataId( newMetadataId );
        this.updateMetadataListBlock();
    },
    /**
     * For add metadata
     * @param e event
     */
    onAddMetadata : function (e)
    {
        var metadataId = '_' + fr.ina.amalia.player.helpers.UtilitiesHelper.generateUUID();
        e.data.self.metadataManager.updateBlockMetadata( metadataId,{
            id : metadataId,
            label : metadataId,
            type : e.data.self.settings.defaultDataType,
            author : e.data.self.settings.defaultAuthor,
            color : e.data.self.settings.defaultColor,
            shape : e.data.self.settings.defaultShape
        } );
        e.data.self.mediaPlayer.addMetadataById( metadataId,[
        ] );
        e.data.self.mediaPlayer.setSelectedMetadataId( metadataId );
        e.data.self.updateMetadataListBlock();
    },
    /**
     * Fired on select metadata
     * @method onSelectMetadata
     * @param e event
     */
    onSelectMetadata : function (e)
    {
        var metadataId = $( event.currentTarget ).attr( 'data-metadata-id' );
        var targetElement = $( event.target );

        if (targetElement.hasClass( 'delete' ))
        {
            e.data.self.removeMetadataById( metadataId );
        }

        else if (targetElement.hasClass( 'duplicate' ))
        {
            e.data.self.duplicateBlock( metadataId );
        }
        else
        {
            e.data.self.setSelectedMetadataId( metadataId );
        }

        if (e.data.self.logger !== null)
        {
            e.data.self.logger.trace( e.data.self.Class.fullName,"onSelectMetadata  : " + metadataId );
        }
    },
    /**
     * Fired on selected metadata change
     * @method onSelectedMetadataChange
     * @param {Object} e
     * @param {Object} data
     */
    onSelectedMetadataChange : function (e,data)
    {
        e.data.self.container.find( 'ul.listOfmetadata .item' ).removeClass( 'selected' );
        if (data.metadataId !== null)
        {
            e.data.self.container.find( 'ul.listOfmetadata .item.item-' + data.metadataId ).addClass( 'selected' );
            var movePos = e.data.self.container.find( 'ul.listOfmetadata .item.item-' + data.metadataId ).offset();
            if (typeof movePos === 'object' && movePos.hasOwnProperty( 'top' ))
            {
                e.data.self.container.find( 'ul.listOfmetadata' ).stop().animate( {
                    scrollTop : movePos.top
                },
                500,'easeInOutExpo' );
            }
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
            event.data.self.updateMetadataListBlock();
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
        event.data.self.updateMetadataListBlock();
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"EndDataChange" );
        }
    }
} );
