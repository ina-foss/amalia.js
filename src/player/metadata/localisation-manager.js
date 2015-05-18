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
 * For manage localisation block
 * @class LocalisationManager
 * @namespace fr.ina.amalia.player
 * @module player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaPlayer player instance
 */
$.Class( "fr.ina.amalia.player.LocalisationManager",{
},{
    /**
     * Logger instance
     * @property logger
     * @type {Object} HTMLVideoElement
     * @default null
     */
    logger : null,
    /**
     * Instance of Player HTML5
     * @property mediaPlayer
     * @type {Object} HTMLVideoElement
     * @default null
     */
    localisation : null,
    /**
     * in charge to set localisation
     * @param {type} localisation
     * @returns {undefined}
     */
    setLoc : function (localisation)
    {
        this.localisation = localisation;
    },
    /**
     * Return localisation tcin tcout
     * @returns {localisation-managerAnonym$1.getLocTc.localisation-managerAnonym$2}
     */
    getLocTc : function ()
    {
        if (this.localisation !== null && this.localisation.length > 1)
        {
            //sort by tc
            this.localisation.sort( function (obj1,obj2) {
                obj1.tc = (typeof obj1.tc === "number") ? obj1.tc : parseFloat( fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( obj1.tc ) );
                obj2.tc = (typeof obj2.tc === "number") ? obj2.tc : parseFloat( fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( obj2.tc ) );
                delete obj1.firstItem;
                delete obj1.lastItem;
                delete obj1.tcRange;
                return obj1.tc - obj2.tc;
            } );
            var _firstItem = this.localisation[0];
            var _lastItem = this.localisation[this.localisation.length - 1];

            //add range
            for (var i = 0;
                i < this.localisation.length;
                i++)
            {
                var item = this.localisation[i];
                item.tcRange = {
                    min : _firstItem.tc,
                    max : _lastItem.tc
                };
                item.subItem = true;
            }
            if (_firstItem.hasOwnProperty( 'tc' ) && _lastItem.hasOwnProperty( 'tc' ))
            {
                _firstItem.firstItem = true;
                _lastItem.lastItem = true;
                delete _firstItem.range;
                delete _lastItem.range;
                _firstItem.tcRange = {
                    max : _lastItem.tc
                };
                _lastItem.tcRange = {
                    min : _firstItem.tc
                };
                return {
                    tcin : _firstItem.tc,
                    tcout : _lastItem.tc
                };
            }
        }
        return null;
    },
    /**
     * In  charge to updata localisation block for spatial data
     * @method updateSpacialLocBlock
     * @param {Object} localisations
     */
    updateSpacialLocBlock : function (localisations)
    {
        if (localisations !== null && localisations.length > 0)
        {
            for (var i = 0;
                i < localisations.length;
                i++)
            {
                var loc = localisations[i];
                if (loc.hasOwnProperty( 'sublocalisations' ) && typeof loc.sublocalisations === "object")
                {
                    if (loc.sublocalisations.localisation.length > 0)
                    {
                        loc.sublocalisations.localisation.sort( function (obj1,obj2) {
                            return obj1.tc - obj2.tc;
                        } );
                        for (var j = 0;
                            j < loc.sublocalisations.localisation.length;
                            j++)
                        {
                            var item = loc.sublocalisations.localisation[j];
                            if (item.tc === null && item.deleted === true)
                            {
                                loc.sublocalisations.localisation.splice( j,1 );
                            }
                        }
                        loc.sublocalisations.localisation.sort( function (obj1,obj2) {
                            return obj1.tc - obj2.tc;
                        } );
                        if (loc.sublocalisations.localisation.length === 1)
                        {
                            var _tmpItem = loc.sublocalisations.localisation[0];
                            loc.tc = parseFloat( _tmpItem.tc );
                            loc.shape = $.extend( {},_tmpItem.shape );
                            loc.sublocalisations = null;
                            delete (loc.tcin);
                            delete (loc.tcout);
                            return true;
                        }
                        else if (loc.sublocalisations.localisation.length > 1)
                        {
                            var _firstItem = loc.sublocalisations.localisation[0];
                            var _lastItem = loc.sublocalisations.localisation[loc.sublocalisations.localisation.length - 1];
                            if (_firstItem.hasOwnProperty( 'tc' ) && _lastItem.hasOwnProperty( 'tc' ))
                            {
                                loc.tc = parseFloat( _firstItem.tc );
                                loc.tcin = parseFloat( _firstItem.tc );
                                loc.tcout = parseFloat( _lastItem.tc );
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    },
    /**
     * In  charge to shift localisation block with spatial data
     * @method updateSpacialLocBlock
     * @param {Object} localisations
     */
    shiftSpacialLocBlock : function (loc,tcin)
    {
        var shiftTc = tcin - loc.tcin;
        loc.tcout += shiftTc;

        if (loc.hasOwnProperty( 'sublocalisations' ) && typeof loc.sublocalisations === "object")
        {
            if (loc.sublocalisations.localisation.length > 0)
            {
                loc.sublocalisations.localisation.sort( function (obj1,obj2) {
                    return obj1.tc - obj2.tc;
                } );
                for (var j = 0;
                    j < loc.sublocalisations.localisation.length;
                    j++)
                {
                    var item = loc.sublocalisations.localisation[j];
                    item.tc += shiftTc;
                }

            }
            return true;
        }
        return false;
    }
} );
