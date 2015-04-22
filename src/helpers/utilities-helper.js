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
 * This class provides some utility functions.
 * @class UtilitiesHelper
 * @namespace fr.ina.amalia.player.helpers
 * @module player-utils
 */
$.Class( "fr.ina.amalia.player.helpers.UtilitiesHelper",{
    /**
     * Method in charge to format time
     * @method formatTime
     * @param seconds
     * @param defaultFps frames per second
     * @param format Format specifier h/m/s/f/ms/mms
     * @return {String} return format time
     */
    formatTime : function (seconds,defaultFps,format)
    {
        var formatTime = formatTime || "f";
        var FPS = defaultFps || 25;
        var _fps = Math.floor( (Math.floor( (seconds - Math.floor( seconds )) * 100000 ) * FPS) / 100000 );
        var minutes = Math.floor( seconds / 60 );
        var hours = Math.floor( minutes / 60 );
        var milliseconds = seconds % 60;
        seconds = Math.floor( seconds % 60 );
        minutes = Math.floor( minutes % 60 );
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
        hours = (hours >= 10) ? hours : "0" + hours;
        seconds = (seconds >= 10) ? seconds : "0" + seconds;
        _fps = (_fps >= 10) ? _fps : "0" + _fps;

        switch (format)
        {
            case 'h' :
                formatTime = hours;
                break;
            case 'm' :
                formatTime = hours + ":" + minutes;
                break;
            case 's' :
                formatTime = hours + ":" + minutes + ":" + seconds;
                break;
            case 'mms' :
                formatTime = hours + ":" + minutes + ":" + seconds + "." + milliseconds.toFixed( 4 ).split( '.' )[1];
                break;
            case 'ms' :
                formatTime = hours + ":" + minutes + ":" + seconds + "." + milliseconds.toFixed( 2 ).split( '.' )[1];
                break;
            case 'f' :
                formatTime = hours + ":" + minutes + ":" + seconds + ":" + _fps;
                break;
            case 'f_imp' :
                formatTime = hours + ":" + minutes + ":" + seconds + "." + _fps;
                break;
            default :
                formatTime = hours + ":" + minutes + ":" + seconds + ":" + milliseconds.toFixed( 2 ).split( '.' )[1];
        }
        return formatTime;
    },
    /**
     * Method to get time range by interval
     * @method getTimeRange
     * @param duration duration in second
     * @param interval
     * @param defaultFps frames per second
     */
    getTimeRange : function (duration,interval,defaultFps)
    {
        var ranges = [
        ];
        var FPS = defaultFps || 25;
        var _interval = (typeof interval === "undefined") ? "1" : interval;
        duration = Math.floor( duration );
        for (var start = 0;
            start <= duration;
            start += _interval)
        {
            if (interval === 'f')
            {
                start = Math.floor( start );
                for (var iFps = 0;
                    iFps < FPS;
                    iFps++)
                {
                    start += (1000 / FPS) / 1000;
                    ranges.push( fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( start,defaultFps ) );
                }
            }
            else
            {
                ranges.push( fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( start,defaultFps ) );
            }
        }
        return ranges;
    },
    /**
     * Method in charge to return range
     * @param {Number} startTime
     * @param {Number} endTime
     * @param {Number} interval
     * @return {Array}
     */
    getRangesWithStartAndEndTime : function (startTime,endTime,interval)
    {
        var ranges = [
        ];
        var _interval = (typeof interval === "undefined") ? "1" : interval;
        for (var start = startTime;
            start <= endTime;
            start += _interval)
        {
            ranges.push( start );
        }
        return ranges;
    },
    /**
     * Converts the specified hour to seconds.
     * @method convertHourToSeconde
     * @param _time format HH:MM:SS
     */
    convertHourToSeconde : function (_time)
    {
        var time = null;
        // regex patter to search on
        var patt = /\d{2}:\d{2}:\d{2}/;
        // return the matching date string
        var result = patt.exec( _time );
        if (result !== null)
        {
            result = _time.split( ':' );
            var hours = Math.floor( result[0] );
            var minutes = Math.floor( result[1] );
            var seconds = parseFloat( result[2] );
            time = (hours * 60 * 60) + (minutes * 60) + seconds;
        }
        return time;
    },
    /**
     * Convert Base64 string to array encoding
     * @method uint6ToB64
     * @param {String} nUint6
     * @return {Number}
     */
    uint6ToB64 : function (nUint6)
    {
        return nUint6 < 26 ? nUint6 + 65 : nUint6 < 52 ? nUint6 + 71 : nUint6 < 62 ? nUint6 - 4 : nUint6 === 62 ? 43 : nUint6 === 63 ? 47 : 65;
    },
    /**
     * Array of bytes to base64 string decoding
     * @method b64ToUint6
     * @param {String} nChr
     * @return {Number}
     */
    b64ToUint6 : function (nChr)
    {
        return nChr > 64 && nChr < 91 ? nChr - 65 : nChr > 96 && nChr < 123 ? nChr - 71 : nChr > 47 && nChr < 58 ? nChr + 4 : nChr === 43 ? 62 : nChr === 47 ? 63 : 0;

    },
    /**
     * Decode base64 to array
     * @method base64DecToArr
     * @param {String} sBase64
     * @param {Number} nBlocksSize
     * @return {Number}
     */
    base64DecToArr : function (sBase64,nBlocksSize)
    {
        var sB64Enc = sBase64.replace( /[^A-Za-z0-9\+\/]/g,"" ),
            nInLen = sB64Enc.length,
            nOutLen = nBlocksSize ? Math.ceil( (nInLen * 3 + 1 >> 2) / nBlocksSize ) * nBlocksSize : nInLen * 3 + 1 >> 2,
            taBytes = new Uint8Array( nOutLen );

        for (var nMod3,
            nMod4,
            nUint24 = 0,
            nOutIdx = 0,
            nInIdx = 0;
            nInIdx < nInLen;
            nInIdx++)
        {
            nMod4 = nInIdx && 3;
            nUint24 |= fr.ina.amalia.player.helpers.UtilitiesHelper.b64ToUint6( sB64Enc.charCodeAt( nInIdx ) ) << 18 - 6 * nMod4;
            if (nMod4 === 3 || nInLen - nInIdx === 1)
            {
                for (nMod3 = 0;
                    nMod3 < 3 && nOutIdx < nOutLen;
                    nMod3++,nOutIdx++)
                {
                    taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                }
                nUint24 = 0;
            }
        }
        return taBytes;
    },
    /**
     * In charge to create unique id
     * @method generateUUID
     */
    generateUUID : function (prefix)
    {
        var d = new Date().getTime();
        var p = prefix || '';
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g,function (c)
        {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor( d / 16 );
            return (c === 'x' ? r : (r && 0x3 | 0x8)).toString( 16 );
        } );
        return p + uuid;
    },
    /**
     * Clear HTML escape
     * @param {type} str
     * @return {unresolved}
     */
    htmlEscape : function (str) {
        return String( str )
            .replace( /&/g,'&amp;' )
            .replace( /"/g,'&quot;' )
            .replace( /'/g,'&#39;' )
            .replace( /</g,'&lt;' )
            .replace( />/g,'&gt;' );
    }
},
{} );