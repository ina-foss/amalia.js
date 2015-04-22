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
 * Base class for caption plugins
 * @class CaptionsBase
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-captions
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBase.extend( "fr.ina.amalia.player.plugins.captions.CaptionsBase",{},{
    /**
     * Dom element
     * @property container
     * @type {Object}
     * @default null
     */
    container : null,
    /**
     * Dom element
     * @property container
     * @type {Array}
     * @default []
     */
    listOfData : [
    ],
    /**
     * Set player events listner
     * @method definePlayerListeners
     */
    definePlayerListeners : function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();
        // Player events
        player.on( fr.ina.amalia.player.PlayerEventType.TIME_CHANGE,{
            self : this
        },
        this.onTimeupdate );

        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"definePlayerListeners" );
        }
    },
    /**
     * Update metadata
     * @param {String} metadataId
     * @param {Number} level
     * @param {Number} tcin
     * @param {Number} tcout
     * @param {Boolean} withMainLevel
     */
    updateMetadata : function (metadataId,level,tcin,tcout,withMainLevel)
    {
        //Clear old data
        this.listOfData = [
        ];
        var localisations = null;
        var listOfObject = null;
        withMainLevel = withMainLevel || false;

        listOfObject = this.mediaPlayer.getMetadataWithRange( metadataId,tcin,tcout );

        for (var i = 0;
            i < listOfObject.length;
            i++)
        {
            localisations = listOfObject[i];
            if (localisations.hasOwnProperty( 'sublocalisations' ) === true && localisations.sublocalisations !== null)
            {
                this._parseSubLocalisations( localisations.sublocalisations,level,withMainLevel );
            }
            else if (localisations !== null)
            {
                this._parseLocalisation( localisations,level,withMainLevel );
            }
            else
            {
                if (this.logger !== null)
                {
                    this.logger.trace( this.Class.fullName,"Error to set data, index: " + i );
                }
            }
        }
    },
    /**
     * Parse localisations blocks
     * @method _parseLocalisation
     * @param {Object} localisation
     * @param {Number} level
     * @param withMainLevel
     */
    _parseLocalisation : function (localisation,level,withMainLevel)
    {
        var data = null;
        if (localisation.tclevel <= level)
        {
            if ((localisation.tclevel === level && withMainLevel === false) || (localisation.tclevel <= level && withMainLevel === true))
            {
                var text = this._getText( localisation.data );
                if (text !== '')
                {
                    data = {
                        tcin : (typeof localisation.tcin === "number") ? localisation.tcin : fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( localisation.tcin ),
                        tcout : (typeof localisation.tcout === "number") ? localisation.tcout : fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( localisation.tcout ),
                        text : text,
                        label : localisation.label,
                        thumb : localisation.thumb,
                        level : localisation.tclevel
                    };
                    this.listOfData.push( data );
                }
            }

            if (localisation.hasOwnProperty( 'sublocalisations' ) === true && localisation.sublocalisations !== null && localisation.sublocalisations.hasOwnProperty( 'localisation' ) === true && $.isArray( localisation.sublocalisations.localisation ))
            {
                this._parseSubLocalisations( localisation.sublocalisations,level,withMainLevel );
            }
        }
    },
    /**
     * Parse sub localisations blocks
     * @method _parseSubLocalisations
     * @param {Object} sublocalisations
     * @param {Object} level
     * @param {Boolean} withMainLevel
     * @returns {sublocalisations.localisation}
     */
    _parseSubLocalisations : function (sublocalisations,level,withMainLevel)
    {
        var localisation = null;
        if (sublocalisations !== null && typeof sublocalisations !== 'undefined' && sublocalisations.hasOwnProperty( 'localisation' ) === true && $.isArray( sublocalisations.localisation ))
        {
            for (var i = 0;
                i < sublocalisations.localisation.length;
                i++)
            {
                localisation = sublocalisations.localisation[i];
                this._parseLocalisation( localisation,level,withMainLevel );
            }
        }
        return localisation;
    },
    /**
     * Return text with data.text block
     * @method _getText
     * @param {Object} data
     * @returns {String}
     */
    _getText : function (data)
    {
        var text = '';
        if (data !== null && typeof data !== 'undefined' && data.hasOwnProperty( 'text' ) === true && data.text !== null && $.isArray( data.text ))
        {
            for (var i = 0;
                i < data.text.length;
                i++)
            {
                if (data.text[i] !== null)
                {
                    text += data.text[i].toString();
                }
            }
        }
        return text;
    },
    /**
     * Update current time pos
     * @method updatePos
     * @param {Object} currentTime
     */
    updatePos : function (currentTime)
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"updatePos : " + currentTime );
        }
    },
    // /**Player events**/
    /**
     * Fired when time change event
     * @method onTimeupdate
     * @param {Object} event
     * @param {Object} data
     */
    onTimeupdate : function (event,data)
    {
        event.data.self.updatePos( parseFloat( data.currentTime ) );
    }
} );
