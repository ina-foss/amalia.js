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
 * In charge to bind the plugins with data service
 * @class PluginBindingManager
 * @namespace fr.ina.amalia.player.plugins
 * @module player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaPlayer player instance
 */
$.Class( "fr.ina.amalia.player.PluginBindingManager",{
    dataTypes : {
        'DEFAULT' : 'default',
        'DETECTION' : 'detection',
        'VISUAL_DETECTION' : 'visual_detection',
        'VISUAL_TRACKING' : 'visual_tracking',
        'SEGMENTATION' : 'segmentation',
        'AUDIO_SEGMENTATION' : 'audio_segmentation',
        'TRANSCRIPTION' : 'transcription',
        'SYNCHRONIZED_TEXT' : 'synchronized_text',
        'KEYFRAMES' : 'keyframes',
        'HISTOGRAM' : 'histogram'
    },
    pluginTypes : {
        'TIMELINE_CUEPOINT' : 'timeline_cuepoint',
        'TIMELINE_SEGMENT' : 'timeline_segment',
        'TIMELINE_IMAGE' : 'timeline_image',
        'TIMELINE_HISTOGRAM' : 'timeline_histogram',
        'TIMELINE_VISUAL' : 'timeline_visual',
        'TEXT_SYNC' : 'text-sync',
        'CAPTION' : 'caption',
        'OVERLAY' : 'overlay'
    }
},
{
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
     * List of registered plugins
     * @property listOfPluginsIds
     * @type {Object}
     * @default "{}"
     */
    listOfDataTypes : null,
    listOfPluginTypes : null,
    pluginAndDataTypeMap : null,
    listOfPlugins : null,
    /**
     * Init
     * @method initialize
     */
    init : function (settings,mediaPlayer)
    {
        this.listOfPlugins = [
        ];
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
        // Set default values
        this.setDefaultDataTypes();
        this.setDefaultPluginAndDataTypeMap();
        this.setDefaultPluginsTypes();
    },
    /**
     * @method setDefaultDataTypes
     */
    setDefaultDataTypes : function ()
    {
        this.listOfDataTypes = [
        ];
        this.listOfDataTypes.push( fr.ina.amalia.player.PluginBindingManager.dataTypes.DETECTION );
        this.listOfDataTypes.push( fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_DETECTION );
        this.listOfDataTypes.push( fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_TRACKING );
        this.listOfDataTypes.push( fr.ina.amalia.player.PluginBindingManager.dataTypes.SEGMENTATION );
        this.listOfDataTypes.push( fr.ina.amalia.player.PluginBindingManager.dataTypes.AUDIO_SEGMENTATION );
        this.listOfDataTypes.push( fr.ina.amalia.player.PluginBindingManager.dataTypes.TRANSCRIPTION );
        this.listOfDataTypes.push( fr.ina.amalia.player.PluginBindingManager.dataTypes.SYNCHRONIZED_TEXT );
        this.listOfDataTypes.push( fr.ina.amalia.player.PluginBindingManager.dataTypes.KEYFRAMES );
        this.listOfDataTypes.push( fr.ina.amalia.player.PluginBindingManager.dataTypes.HISTOGRAM );

    },
    /**
     * @method setDefaultPluginsTypes
     */
    setDefaultPluginsTypes : function ()
    {
        this.listOfPluginTypes = [
        ];
        this.listOfPluginTypes.push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_CUEPOINT );
        this.listOfPluginTypes.push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_SEGMENT );
        this.listOfPluginTypes.push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_IMAGE );
        this.listOfPluginTypes.push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_HISTOGRAM );
        this.listOfPluginTypes.push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.CAPTION );
        this.listOfPluginTypes.push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TEXT_SYNC );
        this.listOfPluginTypes.push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.OVERLAY );
    },
    /**
     * @method setDefaultPluginAndDataTypeMap
     */
    setDefaultPluginAndDataTypeMap : function ()
    {
        this.pluginAndDataTypeMap = [
        ];
        // DEFAULT
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.DEFAULT] = [
        ];

        // DETECTION
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.DETECTION] = [
        ];
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.DETECTION].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_CUEPOINT );
        // VISUAL_DETECTION
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_DETECTION] = [
        ];
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_DETECTION].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_VISUAL );
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_DETECTION].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.OVERLAY );
        // VISUAL_TRACKING
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_TRACKING] = [
        ];
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_TRACKING].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_VISUAL );
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_TRACKING].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.OVERLAY );
        // SEGMENTATION
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.SEGMENTATION] = [
        ];
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.SEGMENTATION].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_SEGMENT );
        // AUDIO_SEGMENTATION
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.AUDIO_SEGMENTATION] = [
        ];
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.AUDIO_SEGMENTATION].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_SEGMENT );
        // TRANSCRIPTION
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.TRANSCRIPTION] = [
        ];
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.TRANSCRIPTION].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.CAPTION );
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.TRANSCRIPTION].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TEXT_SYNC );
        // SYNCHRONIZED_TEXT
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.SYNCHRONIZED_TEXT] = [
        ];
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.SYNCHRONIZED_TEXT].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.CAPTION );
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.SYNCHRONIZED_TEXT].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TEXT_SYNC );
        // KEYFRAMES
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.KEYFRAMES] = [
        ];
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.KEYFRAMES].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_IMAGE );
        // HISTOGRAM
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.HISTOGRAM] = [
        ];
        this.pluginAndDataTypeMap[fr.ina.amalia.player.PluginBindingManager.dataTypes.HISTOGRAM].push( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_HISTOGRAM );
    },
    /**
     * Return the line type with data type
     */
    getLinetypeWithDataType : function (dataType)
    {
        if (dataType === fr.ina.amalia.player.PluginBindingManager.dataTypes.DETECTION)
        {
            return fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_CUEPOINT;
        }
        else if (dataType === fr.ina.amalia.player.PluginBindingManager.dataTypes.AUDIO_SEGMENTATION)
        {
            return fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_SEGMENT;
        }
        else if (dataType === fr.ina.amalia.player.PluginBindingManager.dataTypes.SEGMENTATION)
        {
            return fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_SEGMENT;
        }
        else if (dataType === fr.ina.amalia.player.PluginBindingManager.dataTypes.KEYFRAMES)
        {
            return fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_IMAGE;
        }
        else if (dataType === fr.ina.amalia.player.PluginBindingManager.dataTypes.HISTOGRAM)
        {
            return fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_HISTOGRAM;
        }
        else if (dataType === fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_DETECTION || dataType === fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_TRACKING)
        {
            return fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_VISUAL;
        }
        return null;
    },
    /**
     * Register plugin
     * @method registerPlugin
     * @param id string plugin id
     * @param type data type
     */
    registerPlugin : function (id,listOfTypes)
    {
        if (typeof this.listOfPlugins[id] === 'undefined')
        {
            this.listOfPlugins[id] = [
            ];
        }
        if (typeof listOfTypes === 'object' && listOfTypes.length > 0)
        {
            for (var i = 0;
                i < listOfTypes.length;
                i++)
            {
                if ($.inArray( listOfTypes[i],this.listOfPlugins[id] ) < 0)
                {
                    this.listOfPlugins[id].push( listOfTypes[i] );
                }
            }
        }
    },
    /**
     * @method isManagedDataType
     */
    isManagedDataType : function (pId,dataType)
    {
        var list = this.listOfPlugins[pId];
        if (typeof list === 'object' && list.length)
        {
            for (var i = 0;
                i < list.length;
                i++)
            {
                if ($.inArray( list[i],this.pluginAndDataTypeMap[dataType] ) > -1)
                {
                    return true;
                }
            }
        }
        return false;
    }
} );
