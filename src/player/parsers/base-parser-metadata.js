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
 * In charge to parse metadata (json)
 * @class MetadataParser
 * @namespace fr.ina.amalia.player.parsers
 * @module player
 * @constructor
 * @param {Object} settings Defines the configuration of this class
 */
$.Class( "fr.ina.amalia.player.parsers.BaseParserMetadata",{},{
    /**
     * Defines configuration
     * @property settings
     * @type {Object}
     * @default {}
     */
    settings : {},
    /**
     * In charge to render messages in the web console output
     * @property logger
     * @type {Object}
     * @default null
     */
    logger : null,
    /**
     * Parsed data
     * @property data
     * @type {Object}
     * @default null
     */
    data : null,
    /**
     * Init this class
     * @constructor
     * @method init
     * @param {Object} settings
     */
    init : function (settings)
    {
        this.settings = $.extend( {
            debug : false,
            mainLevel : false
        },
        settings || {} );
        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined")
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
    },
    /**
     * Filter loaded data
     * @method processFilterData
     * @param {Object} data
     */
    processParserData : function (data)
    {
        if (data !== null && typeof data !== "undefined")
        {
            if (data.hasOwnProperty( 'status' ) === true && data.hasOwnProperty( 'data' ) === true && data.status === 0 && data !== null)
            {
                return this.parseData( data.data );
            }
            else if (data.hasOwnProperty( 'id' ) === true)
            {
                return this.parseData( data );
            }
            else if (data.length !== "undefined")
            {
                return this.parseData( data );
            }
            else
            {
                if (this.logger !== null)
                {
                    this.logger.warn( this.Class.fullName,"Error while filtering Data." );
                    this.logger.warn( data );
                }
            }
        }
        return null;
    },
    /**
     * Parse data
     * @method parseData
     * @param {Object} data
     * @returns {metadataParserAnonym$1.parseData@call;getData|Array}
     */
    parseData : function (data)
    {
        var parsedMetadata = null;
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"parseData" );
        }
        // if data has many entity
        if (typeof data.length !== "undefined")
        {
            parsedMetadata = [
            ];
            for (var d in data)
            {
                if (data[d].hasOwnProperty( 'id' ) === true)
                {
                    parsedMetadata.push( this.getData( data[d] ) );
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
        else if (data.hasOwnProperty( 'id' ) === true)
        {
            parsedMetadata = this.getData( data );
        }
        else
        {
            if (this.logger !== null)
            {
                this.logger.warn( "parseData : Error to find data type." );
            }
        }
        return parsedMetadata;
    },
    /**
     * Return parsed localisations data
     * @method methodName
     * @param {Object} data
     * @returns {Array}
     */
    getData : function (data)
    {
        var parsedMetadata = null;
        parsedMetadata = {};
        parsedMetadata.id = data.id;
        parsedMetadata.type = data.type;
        parsedMetadata.viewControl = data.hasOwnProperty( 'viewControl' ) ? data.viewControl : null;
        parsedMetadata.label = data.hasOwnProperty( 'label' ) ? data.label : data.id;
        parsedMetadata.list = [
        ];
        if (data.hasOwnProperty( 'localisation' ) === true && data.localisation !== null)
        {
            if (data.localisation.length > 0)
            {
                var localisations = null;
                if (this.settings.hasOwnProperty( 'parameters' ) && this.settings.parameters !==null && this.settings.parameters.hasOwnProperty( 'mainLevel' ) && this.settings.parameters.mainLevel === true)
                {
                    localisations = data.localisation;
                }
                else
                {
                    localisations = (data.localisation[0].hasOwnProperty( 'sublocalisations' ) === true && data.localisation[0].sublocalisations !== null && data.localisation[0].sublocalisations.hasOwnProperty( 'localisation' )) ? data.localisation[0].sublocalisations.localisation : data.localisation;
                }
                var entry = null;
                var localisation = null;
                var label = '';
                var thumb = '';
                if (localisations !== null && typeof localisations !== "undefined" && localisations.hasOwnProperty( 'length' ))
                {
                    for (var i = 0;
                        i < localisations.length;
                        i++)
                    {
                        localisation = localisations[i];
                        label = localisation.hasOwnProperty( 'label' ) ? localisation.label : '';
                        thumb = localisation.hasOwnProperty( 'thumb' ) ? localisation.thumb : null;

                        if (localisation.hasOwnProperty( 'tcin' ) === true && localisation.hasOwnProperty( 'tcout' ) === true)
                        {
                            entry = {
                                shape : (localisation.hasOwnProperty( 'shape' ) === true) ? localisation.shape : null,
                                data : (localisation.hasOwnProperty( 'data' ) === true) ? localisation.data : null,
                                sublocalisations : (localisation.hasOwnProperty( 'sublocalisations' ) === true) ? localisation.sublocalisations : null,
                                label : label,
                                thumb : thumb,
                                tclevel : (localisation.hasOwnProperty( 'tclevel' ) === true) ? localisation.tclevel : 0,
                                tc : (typeof localisation.tc === "number") ? localisation.tc : fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( localisation.tc ),
                                tcin : (typeof localisation.tcin === "number") ? localisation.tcin : fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( localisation.tcin ),
                                tcout : (typeof localisation.tcout === "number") ? localisation.tcout : fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( localisation.tcout ),
                                duration : fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( localisation.tcout ) - fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( localisation.tcin ),
                                type : (localisation.hasOwnProperty( 'type' ) === true) ? localisation.type : null
                            };
                            parsedMetadata.list.push( entry );
                        }
                        else if (localisation.hasOwnProperty( 'tc' ) === true && localisation.tc !== null)
                        {
                            entry = {
                                shape : (localisation.hasOwnProperty( 'shape' ) === true) ? localisation.shape : null,
                                data : (localisation.hasOwnProperty( 'data' ) === true) ? localisation.data : null,
                                sublocalisations : (localisation.hasOwnProperty( 'sublocalisations' ) === true) ? localisation.sublocalisations : null,
                                label : label,
                                thumb : thumb,
                                tclevel : (localisation.hasOwnProperty( 'tclevel' ) === true) ? localisation.tclevel : 0,
                                tc : (typeof localisation.tc === "number") ? localisation.tc : fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( localisation.tc ),
                                type : (localisation.hasOwnProperty( 'type' ) === true) ? localisation.type : null
                            };
                            parsedMetadata.list.push( entry );
                        }
                    }
                }
            }
        }
        return parsedMetadata;
    }
} );
