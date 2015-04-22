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
 * Collected of player error code
 * @class PlayerErrorCode
 * @namespace fr.ina.amalia.player
 * @module player
 * @submodule player-constants
 */
$.Class( "fr.ina.amalia.player.PlayerErrorCode",{
    /**
     * @constant
     * @property ACCESS_DENIED
     * @type {Number}
     */
    ACCESS_DENIED : 1001,
    /**
     * @constant
     * @property MEDIA_FILE_NOT_FOUND
     * @type {Number}
     */
    MEDIA_FILE_NOT_FOUND : 2001,
    /**
     * @constant
     * @property CUSTOM_ERROR
     * @type {Number}
     */
    CUSTOM_ERROR : 3001,
    /**
     * @constant
     * @property EXCEPTION
     * @type {Number}
     */
    EXCEPTION : 4001,
    /**
     * @constant
     * @property HTTP_ERROR
     * @type {Number}
     */
    HTTP_ERROR : 5001,
    /**
     * @constant
     * @property ABORT
     * @type {Number}
     */
    ABORT : 6001,
    /**
     * @constant
     * @property TIMEOUT
     * @type {Number}
     */
    TIMEOUT : 7008,
    /**
     * @constant
     * @property ERROR
     * @type {Number}
     */
    ERROR : 8008,
    /**
     * @constant
     * @property ERROR_HTML5_SUPPORT
     * @type {Number}
     */
    ERROR_HTML5_SUPPORT : 8000,
    /**
     * @constant
     * @property ERROR_LOAD_PLUGIN
     * @type {Number}
     */
    ERROR_LOAD_PLUGIN : 9001,
    /**
     * Return message by code error
     * @param {Number} errorCode
     * @returns {String} Return message
     */
    getMessage : function (errorCode)
    {
        var CodeClass = fr.ina.amalia.player.PlayerErrorCode;
        var MessageClass = fr.ina.amalia.player.PlayerErrorMessage;
        switch (errorCode)
        {
            case CodeClass.ACCESS_DENIED :
                return MessageClass.ACCESS_DENIED;
            case CodeClass.MEDIA_FILE_NOT_FOUND :
                return MessageClass.MEDIA_FILE_NOT_FOUND;
            case CodeClass.EXCEPTION :
                return MessageClass.EXCEPTION;
            case CodeClass.HTTP_ERROR :
                return MessageClass.HTTP_ERROR;
            case CodeClass.ABORT :
                return MessageClass.ABORT;
            case CodeClass.TIMEOUT :
                return MessageClass.TIMEOUT;
            case CodeClass.ERROR_LOAD_PLUGIN :
                return MessageClass.ERROR_LOAD_PLUGIN;
            case CodeClass.CUSTOM_ERROR :
                return MessageClass.CUSTOM_ERROR;
            case CodeClass.ERROR :
                return MessageClass.ERROR;
            case CodeClass.ERROR_HTML5_SUPPORT :
                return MessageClass.ERROR_HTML5_SUPPORT;
            default :
                return MessageClass.DEFAULT;
        }
    }
},
{} );

/**
 * Constant class for error message
 * @class PlayerErrorMessage:
 * @namespace fr.ina.amalia.player
 * @module player
 * @submodule player-constants
 */
$.Class( "fr.ina.amalia.player.PlayerErrorMessage",{
    ACCESS_DENIED : 'Accès refusé.',
    MEDIA_FILE_NOT_FOUND : 'Erreur lors du chargement du média.',
    EXCEPTION : 'An exception occurred.',
    HTTP_ERROR : 'Http response at 400 or 500 level.',
    ABORT : 'Votre requête a été interrompue.',
    TIMEOUT : 'Demande dépassé.',
    ERROR_LOAD_PLUGIN : 'Erreur inattendue lors de l\'initialisation du plug-in.',
    CUSTOM_ERROR : 'Une erreur s\'est produite sur votre lecteur.',
    ERROR : 'Une erreur s\'est produite sur votre lecteur.',
    DEFAULT : 'Une erreur s\'est produite sur votre lecteur.',
    ERROR_HTML5_SUPPORT : 'Une erreur s\'est produite sur votre lecteur: Votre navigateur ne gère pas les balises HTML5.'
},
{} );
