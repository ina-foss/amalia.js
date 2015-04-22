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
 * Base class for multi blocks plugin
 * @class PluginBaseMultiBlocks
 * @namespace fr.ina.amalia.player.plugins
 * @module player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaPlayer Instance of Player
 * @param {Object} pluginContainer plugin container element
 */
fr.ina.amalia.player.plugins.PluginBase.extend( "fr.ina.amalia.player.plugins.PluginBaseMultiBlocks",{
    METADATA_DISPLAY_TYPE : {
        'STATIC' : 1,
        'STATIC_DYNAMIC' : 2,
        'DYNAMIC' : 3
    }
},{
    /**
     * true if load data started anw
     * @property loadDataStarted
     * @default null
     */
    loadDataStarted : false,
    /**
     * List of id to deal
     * @property loadDataStarted
     * @default null
     */
    dataToDeal : null,
    /**
     * List of data type managed by this plugin
     * @property managedDataTypes
     * @type {String}
     * @default null
     */
    managedMetadataIds : [
    ],
    /**
     * List of data id not managed by this plugin
     * @property managedDataTypes
     * @type {String}
     * @default null
     */
    notManagedMetadataIds : null,
    /**
     * List of data type managed by this plugin
     * @property managedDataTypes
     * @type {String}
     * @default null
     */
    listOfMetadataTypes : null,
    /**
     * Add data type to managed data type list
     * @param {String} type
     */
    addManagedMetadataType : function (type)
    {
        if (typeof type === 'string' && type !== '')
        {
            this.listOfMetadataTypes.push( type );
        }
    },
    /**
     * Return true if managed type
     * @param {String} type
     * @return Boolean
     */
    isManagedMetadataType : function (type)
    {
        return $.inArray( type,this.listOfMetadataTypes ) > -1;
    },
    /**
     * Return managed types
     * @return array
     */
    getManagedMetadataTypes : function ()
    {
        return this.listOfMetadataTypes;
    },
    /**
     * Return true if managed id
     * @param {String} id
     * @return Boolean
     */
    isManagedMetadataId : function (id)
    {
        return $.inArray( id,this.managedMetadataIds ) > -1 || $.inArray( id,this.notManagedMetadataIds ) > -1;
    },
    /**
     * Return true if  id
     * @param {String} id
     * @method isBound
     * @return Boolean
     */
    isBoundMetadataId : function (id)
    {
        return $.inArray( id,this.managedMetadataIds ) > -1;
    },
    /**
     * Return bind ids
     * @method isBound
     * @return Boolean
     */
    getBindIds : function ()
    {
        return this.managedMetadataIds;
    },
    /**
     * Add data type to managed data type list
     * @param {String} id
     */
    bindMetadataId : function (id)
    {
        this.addManagedMetadataId( id );
    },
    /**
     * Add data type to managed data type list
     * @param {String} id
     */
    unbindMetadataId : function (id)
    {
        this.removeManagedMetadataId( id );
    },
    /**
     * Add data type to managed data type list
     * @param {String} id
     */
    addManagedMetadataId : function (id)
    {
        id = (typeof id === 'number') ? id.toString() : id;

        if (typeof id === 'string' && id !== '' && this.managedMetadataIds.indexOf( id ) === -1)
        {
            this.managedMetadataIds.push( id );
            var idx = this.notManagedMetadataIds.indexOf( id );
            if (idx > -1)
            {
                this.notManagedMetadataIds.splice( idx,1 );
            }
        }
    },
    /**
     * Add data type to managed data type list
     * @param {String} id
     */
    removeManagedMetadataId : function (id)
    {
        id = (typeof id === 'number') ? id.toString() : id;
        if (typeof id === 'string' && id !== '' && this.notManagedMetadataIds.indexOf( id ) === -1)
        {
            this.notManagedMetadataIds.push( id );
            var idx = this.managedMetadataIds.indexOf( id );
            if (idx > -1)
            {
                this.managedMetadataIds.splice( idx,1 );
            }
        }
    }
} );
