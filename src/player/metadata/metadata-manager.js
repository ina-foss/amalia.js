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
 * In charge to manage all metadata
 * @class MetadataManager
 * @namespace fr.ina.amalia.player
 * @module player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaPlayer player instance
 */
$.Class( "fr.ina.amalia.player.MetadataManager",{
},{
    /**
     * Instance of Player HTML5
     * @property mediaPlayer
     * @type {Object} HTMLVideoElement
     * @default null
     */
    mediaPlayer : null,
    /**
     * Logger instance
     * @property logger
     * @type {Object} HTMLVideoElement
     * @default null
     */
    logger : null,
    /**
     * Configuration
     * @property settings
     * @type {Object}
     * @default "{}"
     */
    settings : {},
    /**
     * Contains list of blocks metadata
     * @property listOfBlocks
     * @type {Object}
     * @default "[]"
     */
    listOfBlocks : {},
    /**
     * List of metadata with id
     * @property listOfMetadata
     * @type {Object}
     * @default null
     */
    listOfMetadata : [
    ],
    /**
     * Contains list of selected items
     * @property listOfSelectedItems
     * @type {Object}
     * @default "[]"
     */
    listOfSelectedItems : [
    ],
    /**
     * Selected metadata id
     * @property selectedMetadataId
     * @type {Number}
     * @default 0
     */
    selectedMetadataId : null,
    /**
     * Init
     * @method initialize
     */
    init : function (settings,mediaPlayer)
    {
        this.mediaPlayer = mediaPlayer;
        // Settings
        this.settings = $.extend( {
            debug : false,
            internalPlugin : false
        },
        settings || {} );
        // Logger
        if (fr.ina.amalia.player.log !== undefined && fr.ina.amalia.player.log.LogHandler !== undefined)
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        if (this.mediaPlayer === null)
        {
            throw new Error( "Can't initialize plugin name" + this.Class.fullName );
        }

    },
    /**
     * Return the block of metadata
     * @method getBlocksMetadata
     * @return Array return the list of blocks with data
     */
    getBlocksMetadata : function ()
    {
        try
        {
            var data = {};
            for (var key in this.listOfBlocks)
            {
                if (this.listOfBlocks.hasOwnProperty( key ))
                {
                    var d = JSON.parse( JSON.stringify( this.listOfBlocks[key] ) );

                    if (typeof this.listOfMetadata[key] !== 'undefined')
                    {
                        d.localisation = JSON.parse( JSON.stringify( this.listOfMetadata[key],function (key,value) {
                            if (key === "refLoc")
                            {
                                return undefined;
                            }
                            else
                            {
                                return value;
                            }
                        } ) );
                    }
                    else
                    {
                        d.localisation = null;
                    }
                    data[key] = d;
                }
            }
            return data;
        }
        catch (error)
        {
            if (this.logger !== null)
            {
                this.logger.warn( "Error to return blocks" );
                this.logger.error( error.stack );
            }
        }
        return null;
    },
    /**
     * Return the block of metadata
     * @method getBlockMetadata
     * @return Array return block without data
     */
    getBlockMetadata : function (id)
    {
        try
        {
            if (typeof this.listOfBlocks[id] !== 'undefined')
            {
                return this.listOfBlocks[id];
            }
        }
        catch (error)
        {
            if (this.logger !== null)
            {
                this.logger.warn( "Error to return blocks" );
                this.logger.error( error.stack );
            }
        }
        return null;
    },
    /**
     * In charge to update the block metadata with
     * @method updateBlockMetadata
     * @param id id of metadata
     * @param data block data
     * @param action trigger action
     */
    updateBlockMetadata : function (id,data,action)
    {
        try
        {
            this.listOfBlocks[id] = $.extend( this.listOfBlocks[id],JSON.parse( JSON.stringify( data ) ) );
            this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                id : id,
                action : action
            } );
        }
        catch (error)
        {
            if (this.logger !== null)
            {
                this.logger.warn( "Error to add blocks" );
                this.logger.error( error.stack );
            }
        }
    },
    /**
     * Remove the block metadata with id metadata
     * @method removeBlockMetadata
     * @param {String} id
     */
    removeBlockMetadata : function (id)
    {
        return delete (this.listOfBlocks[id]);
    },
    /**
     * In charge to add metadata, it is called by metadata parser
     * @method addAllMetadata
     * @param {Object} parsedData
     * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
     */
    addAllMetadata : function (parsedData)
    {

        if (typeof parsedData === "object" && parsedData !== null)
        {
            if (typeof parsedData.length !== "undefined")
            {
                for (var d in parsedData)
                {
                    if (parsedData[d].hasOwnProperty( 'id' ))
                    {
                        if (typeof this.listOfMetadata[parsedData[d].id] === 'undefined')
                        {
                            this.listOfMetadata[parsedData[d].id] = [
                            ];
                        }

                        for (var j = 0;
                            j < parsedData[d].list.length;
                            j++)
                        {
                            var obj = parsedData[d].list[j];
                            this.listOfMetadata[parsedData[d].id].push( obj );
                        }
                        if (parsedData[d].hasOwnProperty( 'type' ) === true)

                        {
                            this.updateBlockMetadata( parsedData[d].id,{
                                type : parsedData[d].type,
                                id : parsedData[d].id

                            } );
                        }
                        else
                        {
                            this.updateBlockMetadata( parsedData[d].id,{} );
                        }
                        this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                            id : parsedData[d].id
                        } );
                        if (this.logger !== null)
                        {
                            this.logger.info( "AddAllMetadata ID:" + parsedData[d].id );
                        }
                    }
                    else
                    {
                        if (this.logger !== null)
                        {
                            this.logger.warn( "parseData : Error to find data type." );
                        }
                    }
                }
            }
            else
            {
                if (typeof this.listOfMetadata[parsedData.id] === 'undefined')
                {
                    this.listOfMetadata[parsedData.id] = [
                    ];
                }

                for (var k = 0;
                    k < parsedData.list.length;
                    k++)
                {
                    var o = parsedData.list[k];
                    this.listOfMetadata[parsedData.id].push( o );
                }
                this.updateBlockMetadata( parsedData.id,{} );
                this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                    id : parsedData.id
                } );
                if (this.logger !== null)
                {
                    this.logger.info( "Add Metadata ID:" + parsedData.id );
                }
            }
        }
        else
        {
            if (this.logger !== null)
            {
                this.logger.warn( "Error to add metadata." );
                this.logger.warn( parsedData );
            }
        }
    },
    /**
     * In charge to return metadata by id
     * @method addMetadataById
     * @param {Object} data
     * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
     */
    addMetadataById : function (id,parsedData)
    {
        if (typeof this.listOfMetadata[id] === 'undefined')
        {
            this.listOfMetadata[id] = [
            ];
            this.updateBlockMetadata( id,{} );
        }
        if (typeof parsedData === "object")
        {
            for (var j = 0;
                j < parsedData.length;
                j++)
            {
                var obj = parsedData[j];
                this.listOfMetadata[id].push( obj );
            }
            this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                id : id
            } );
        }
    },
    /**
     * In charge to replace metadata by id
     * @method replaceAllMetadataById
     * @param {Object} data
     * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
     */
    replaceAllMetadataById : function (id,parsedData)
    {
        this.listOfMetadata[id] = [
        ];
        if (typeof parsedData === "object")
        {
            this.listOfMetadata[id] = [
            ];
            for (var j = 0;
                j < parsedData.length;
                j++)
            {
                var obj = parsedData[j];
                this.listOfMetadata[id].push( obj );
            }
            this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                id : id
            } );
        }
    },
    /**
     * In charge to delete metadata by id
     * @method deleteAllMetadataById
     * @param {Object} data
     * @event fr.ina.amalia.player.PlayerEventType.DATA_CHANGE
     */
    deleteAllMetadataById : function (id)
    {
        if (typeof this.listOfMetadata[id] !== "undefined")
        {

            var remove = this.listOfMetadata.splice( id,1 );
            if (remove.hasOwnProperty( 'length' ) === true && remove.length > 0)
            {
                this.removeBlockMetadata( id );
                this.selectedMetadataId = null;
                this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE,{
                    metadataId : this.selectedMetadataId
                } );
                this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                    id : id,
                    action : 'deleteBlock'
                } );
            }

        }
        return false;
    },
    /**
     * In charge to add metadata item
     * @method addMetadataItem
     */
    addMetadataItem : function (metadataId,data)
    {
        if (typeof this.listOfMetadata[metadataId] !== 'object')
        {
            this.listOfMetadata[metadataId] = [
            ];
        }

        if (typeof data === "object")
        {
            var len = this.listOfMetadata[metadataId].push( data );
            this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                id : metadataId
            } );
            return  this.listOfMetadata[metadataId][len - 1];
        }
    },
    /**
     * Return metadata by id
     * @method getMetadataById
     * @param {String} id
     * @return {Array}
     */
    getMetadataById : function (id)
    {
        return (typeof this.listOfMetadata[id] === 'undefined') ? null : this.listOfMetadata[id];
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
        if (typeof data === "object")
        {
            this.listOfMetadata[id] = data;
        }
        else if (typeof data === "string")
        {
            try
            {
                var jsonData = JSON.parse( data );
                this.listOfMetadata[id] = jsonData;
            }
            catch (e)
            {
                return false;
            }
        }
        else
        {
            return false;
        }
        this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            id : id
        } );
        return true;
    },
    /**
     * In charge to remove metadata
     * @method removeMetadataById
     */
    removeMetadataById : function (id)
    {
        this.listOfMetadata[id] = [
        ];
        this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            id : id
        } );
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
        var metadatas = this.getMetadataById( id );

        var results = [
        ];
        if (metadatas !== null && typeof metadatas === "object")
        {
            results = $.grep( metadatas,function (n)
            {
                return (n.tc >= tcin && n.tc <= tcout);
            } );
            if (this.logger !== null)
            {
                this.logger.trace( this.Class.fullName,"getMetadataWithRange Id:" + id + " Tcin:" + tcin + " Tcout:" + tcout + " Number of Elements:" + metadatas.length );
            }
        }
        else
        {
            if (this.logger !== null)
            {
                this.logger.warn( "GetMetadataWithRange:  No data id:" + id );
            }
        }

        return results;
    },
    /** selected metadata* */
    /**
     * Return selected component id
     * @method getSelectedMetadataId
     */
    getSelectedMetadataId : function ()
    {
        return (this.selectedMetadataId !== null) ? this.selectedMetadataId.toString() : null;
    },
    /**
     * Set selected component id
     * @method setSelectedMetadataId
     */
    setSelectedMetadataId : function (metadataId)
    {
        this.selectedMetadataId = metadataId;
        this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE,{
            metadataId : this.selectedMetadataId
        } );
    },
    /** selected items* */
    /**
     * Return selected items
     * @method getSelectedItems
     * @return {Array}
     */
    getSelectedItems : function ()
    {
        return this.listOfSelectedItems;
    },
    /**
     * In charge to selected item
     * @method addSelectedItem
     * @param item
     */
    addSelectedItem : function (item)
    {
        this.listOfSelectedItems.push( item );
        this.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.SELECTED_ITEMS_CHANGE );
    },
    /**
     * In charge to clear selected iteme
     * @method removeSelectedItem
     * @param idx
     */
    removeSelectedItem : function (idx)
    {
        if (this.listOfSelectedItems[idx] !== 'undefined' && isNaN( idx ) === false)
        {
            var data = this.listOfSelectedItems[idx];
            if (data !== null)
            {
                data.selected = false;
                data.formCreated = true;
            }
            this.listOfSelectedItems[idx] = null;
        }
    },
    /**
     * In charge to remove all selected items
     * @method removeAllSelectedItems
     */
    removeAllSelectedItems : function ()
    {
        if (typeof this.listOfSelectedItems !== 'undefined' && this.listOfSelectedItems.hasOwnProperty( 'length' ) && this.listOfSelectedItems.length > 0)
        {
            for (var i = 0;
                i < this.listOfSelectedItems.length;
                i++)
            {
                var data = this.listOfSelectedItems[i];

                if (data !== null)
                {
                    data.selected = false;
                    data.formCreated = true;
                }
            }
        }
        this.listOfSelectedItems = [
        ];
    }
} );
