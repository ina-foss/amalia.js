/**
 * Copyright (c) 2015-2023 Institut National de l'Audiovisuel, INA
 *
 * This file is part of amalia.js
 *
 * Amalia.js is free software: you can redistribute it and/or modify it under
 * the terms of the MIT License
 *
 * Redistributions of source code, javascript and css minified versions must
 * retain the above copyright notice, this list of conditions and the following
 * disclaimer
 *
 * Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission
 *
 * You should have received a copy of the MIT License along with
 * amalia.js. If not, see <https://opensource.org/license/mit/>
 *
 * Amalia.js is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.
 */
/**
 * Base class for simple block plugin
 * @class PluginBaseSimpleBlock
 * @namespace fr.ina.amalia.player.plugins
 * @module player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaPlayer Instance of Player
 * @param {Object} pluginContainer plugin container element
 */
fr.ina.amalia.player.plugins.PluginBase.extend("fr.ina.amalia.player.plugins.PluginBaseSimpleBlock", {}, {
    /**
     * List of data type managed by this plugin
     * @property managedDataTypes
     * @type {String}
     * @default null
     */
    managedDataType: '',
    /**
     * Selected metadata id provide by player core.
     * @property loadDataStarted
     * @default ''
     */
    selectedMetadataId: '',
    /**
     * Add data type to managed data type list
     * @param type string
     */
    addManagedDataType: function (type) {
        if (typeof type === 'string' && type !== '') {
            this.managedDataType = type;
        }
    },
    /**
     * Return true if managed type
     * @return Boolean
     */
    isManagedType: function (type) {
        return (this.managedDataType === type);
    },


    /**
     * Return managed types
     * @return array
     */
    getManagedType: function () {
        return this.managedDataType;
    },

    /**
     * Return managed types
     * @return array
     */
    getSelectedMetadata: function () {
        return this.selectedMetadataId.toString();
    },

    /**
     * Fired on selected metadata change
     * @method onSelectedMetadataChange
     */
    onSelectedMetadataChange: function (event, data) {
        if (data.metadataId !== null) {
            this.selectedMetadataId = data.metadataId.toString();
        }
    }
});
