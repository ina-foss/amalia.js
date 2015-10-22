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
 * In charge to load data
 * @class BaseFramePositionCalculator
 * @namespace fr.ina.amalia.player
 * @module player
 * @constructor
 * @param {Object} parameter
 * @param {Object} mediaContainer
 * @param {Object} handlerData
 */
$.Class("fr.ina.amalia.player.BaseFramePositionCalculator", {

    getFrameByTc: function (tc, duration, col, row, framePreviewHeight, framePreviewWidth) {
        var line = Math.round(Math.max(1, Math.round((tc * row * col) / duration) / col));
        return {
            x: -Math.min(framePreviewWidth * ( Math.round(tc) % col), framePreviewWidth * (col - 1)),
            y: -line * framePreviewHeight + framePreviewHeight
        };
    }
}, {});
