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
 * Class de parser spatials data and used to draw rectangle and ellipse
 * @class SpatialsDataParser
 * @namespace fr.ina.amalia.player.plugins.overlay
 * @module plugin
 * @submodule plugin-overlay
 * @extends fr.ina.amalia.player.plugins.overlay
 */
$.Class("fr.ina.amalia.player.plugins.overlay.SpatialsDataParser", {}, {
    /**
     * Parsed data
     * @property data
     * @type {Object}
     * @default null
     */
    data: null,
    /**
     * Spatials data
     * @property spatials
     * @type {Object}
     * @default null
     */
    spatials: null,
    /**
     * Defines configuration
     * @property settings
     * @type {Object}
     * @default null
     */
    settings: {},
    /**
     * In charge to render messages in the web console output
     * @property logger
     * @type {Object}
     * @default null
     */
    logger: null,
    /**
     * Localisation manager
     * @property localisationManager
     * @type {Object}
     * @default null
     */
    localisationManager: null,
    /**
     * In charge to inisialize this class
     * @constructor
     * @param {Object} settings
     * @param {Object} data
     */
    init: function (settings) {
        this.spatials = [];
        this.settings = $.extend({
                cuepointMinDuration: 0,
                debug: false
            },
            settings || {});
        this.localisationManager = new fr.ina.amalia.player.LocalisationManager();
        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined") {
            this.logger = new fr.ina.amalia.player.log.LogHandler({
                enabled: this.settings.debug
            });
        }
    },
    /**
     * In charge to parse metadata data
     * @method parserMetadata
     * @param {Object} color
     */
    parserSpacialMetadata: function (data, metadataId, color) {
        this.data = data;
        this.spatials = [];
        var item = null;
        for (var i = 0;
             i < this.data.length;
             i++) {
            item = this.data[i];
            if (item.hasOwnProperty('sublocalisations') && item.sublocalisations !== null && item.sublocalisations.hasOwnProperty('localisation') && item.sublocalisations.localisation.length > 0) {
                this.createSpatialItem(item, metadataId, color);
            }
            else if (item.hasOwnProperty('sublocalisations') && item.sublocalisations === null && item.hasOwnProperty('shape') && item.shape !== null) {
                this.createSpatialItemPoint(item, metadataId, color);
            }
        }
        if (this.logger !== null) {
            this.logger.trace(this.Class.fullName, "parserMetadata");
            this.logger.info(this.data);
        }
        return this.getData();
    },
    /**
     * In charge to parse spatials block
     * @param {Object} metadataId
     * @param {Object} color
     */
    createSpatialItemPoint: function (localisation, metadataId, color) {
        var startPos = localisation;
        var endPos = $.extend(true, [], localisation);
        endPos.tc += this.settings.cuepointMinDuration;
        this.addSpatial(startPos, endPos, localisation, color);

    },
    /**
     * In charge to parse spatials block
     * @param {Object} data
     * @param {Object} metadataId
     * @param {Object} color
     */
    createSpatialItem: function (data, metadataId, color) {
        this.localisationManager.setLoc(data.sublocalisations.localisation);
        var locTc = this.localisationManager.getLocTc();
        if (locTc !== null) {
            //update main tc
            data.tcin = locTc.tcin;
            data.tcout = locTc.tcout;

            var localisations = data.sublocalisations.localisation;
            var startPos = null;
            var endPos = null;
            for (var i = 0;
                 i < localisations.length;
                 i++) {

                if (startPos === null) {
                    startPos = localisations[i];
                }
                else {
                    endPos = localisations[i];
                    this.addSpatial(startPos, endPos, data, metadataId, color);
                    startPos = localisations[i];
                }
            }
        }

    },
    /**
     * In charge to add spacial data
     * @param {Number} startPos
     * @param {Number} endPos
     * @param {Object} item
     * @param {Object} metadataId
     * @param {Object} color
     */
    addSpatial: function (startPos, endPos, item, metadataId, color) {
        if (typeof startPos === "object" && typeof endPos === "object" && startPos.hasOwnProperty('tc') && endPos.hasOwnProperty('tc')) {
            this.spatials.push({
                start: startPos,
                end: endPos,
                type: this.getType(startPos),
                data: item.data,
                label: item.label,
                thumb: item.thumb,
                tcin: (typeof startPos.tc === "string") ? fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde(startPos.tc) : startPos.tc,
                tcout: (typeof endPos.tc === "string") ? fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde(endPos.tc) : endPos.tc,
                refLoc: item,
                metadataId: metadataId,
                color: color
            });
        }
        else {
            if (this.logger !== null) {
                this.logger.warn(this.Class.fullName + ": Error to add spatial");
                this.logger.warn([
                    startPos,
                    endPos
                ]);
            }
        }
    },
    /**
     * Return spatical object type
     * @param {Object} data
     * @return {String} rect/point/ellipse
     */
    getType: function (data) {
        if (data.hasOwnProperty("shape") && data.shape !== null && data.shape.hasOwnProperty('t') && typeof data.shape.t === "string") {
            return data.shape.t.toString();
        }
        else {
            return "rectangle";
        }
    },
    /**
     * Return spacial data with start and end position
     * @returns {Object}
     */
    getData: function () {
        return this.spatials;
    }
});
