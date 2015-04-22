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
 * Class en charge de gérer le stockage des données local
 * @class localStorageManager
 * @namespace fr.ina.amalia.player.parsers
 * @module player
 * @constructor
 */
$.Class( "fr.ina.amalia.player.LocalStorageManager",{
    storageNamespace : 'ina.media.player'
},
{
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
     * Local storage data
     * @property data
     * @type {Object}
     * @default null
     */
    data : null,
    /**
     * Init this class
     * @constructor
     * @method init
     */
    init : function ()
    {
        this.initializeStorage();
    },
    /**
     * Initialize local storage data
     * @method initialize
     */
    initializeStorage : function ()
    {
        if (typeof localStorage !== 'undefined')
        {
            try
            {
                if (localStorage.hasOwnProperty( this.Class.storageNamespace ) === false)
                {
                    localStorage.setItem( this.Class.storageNamespace,JSON.stringify( {} ) );
                }
                this.data = JSON.parse( localStorage.getItem( this.Class.storageNamespace ) );
            }
            catch (e)
            {
                this.data = null;
            }
        }
        else
        {
            this.data = null;
        }
    },
    /**
     * Update local storage data
     * @method initialize
     */
    updateDataStorage : function ()
    {
        try
        {
            if (typeof localStorage !== 'undefined')
            {
                localStorage.setItem( this.Class.storageNamespace,JSON.stringify( this.data ) );
            }
        }
        catch (e)
        {
            this.data = null;
        }

    },
    /**
     * Method check if has key
     * @method hasItem
     * @param {String} key
     */
    hasItem : function (key)
    {
        return (this.data !== null && this.data.hasOwnProperty( key ) === true);
    },
    /**
     * Return key data
     * @method getItem
     * @param {String} key
     */
    getItem : function (key)
    {
        if (this.data !== null && this.data.hasOwnProperty( key ) === true)
        {
            return this.data[key];
        }
        return null;
    },
    /**
     * Set item with key and value
     * @method setItem
     * @param {String} key
     * @param {String} value
     */
    setItem : function (key,value)
    {
        try
        {
            if (this.data !== null && typeof key !== 'undefined' && typeof value !== 'undefined')
            {
                this.data[key] = value;
                this.updateDataStorage();
            }
        }
        catch (e)
        {
            return null;
        }
        return true;
    },
    /**
     * Remove item with key
     * @method removeItem
     * @param {String} key
     */
    removeItem : function (key)
    {
        if (this.data !== null && typeof key !== 'undefined')
        {
            this.data.splice( key,1 );
            this.updateDataStorage();
        }
    },
    /**
     * Clear all data
     * @method clear
     */
    clear : function ()
    {
        if (typeof localStorage !== 'undefined')
        {
            localStorage.removeItem( this.Class.storageNamespace );
        }
    }
} );
