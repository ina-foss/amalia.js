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
 * Desh-mpeg streaming
 * @class DashMpeg
 * @namespace fr.ina.amalia.player.media.type
 * @module player
 * @constructor
 * @param {Object} settings
 * @param {Object} mediaPlayer player instance
 */
fr.ina.amalia.player.mediaTypeManager.extend("fr.ina.amalia.player.media.type.DashMpeg", {}, {
    /**
     * Dash context
     * @property context
     * @type {Object}
     * @default null
     */
    context: null,
    /**
     * Dash player instance
     * @property context
     * @type {Object}
     * @default null
     */
    dashPlayer: null,
    /**
     * Initialize dash context
     * @method initialize
     */
    initialize: function () {
        this.context = new Dash.di.DashContext();
        this.dashPlayer = new MediaPlayer(this.context);
    },
    /**
     * Set media source file (mdp file)
     * @param {String} url
     * @method setSrc
     */
    setSrc: function (url) {
        this.dashPlayer.setAutoPlay(this.settings.autoplay);
        this.dashPlayer.startup();
        this.dashPlayer.attachView(this.mediaPlayer.get(0));
        // Fetches and parses the manifest - WARNING the callback is non-standard "error-last" style
        this.dashPlayer.retrieveManifest(url, $.proxy(this.initializeDashJS, this));
        this.dashPlayer.videoElementExt = this.mediaPlayer.get(0);
        if (this.logger !== null) {
            this.logger.trace(this.Class.fullName, "set dash src :" + this.url);
        }
    },
    initializeDashJS: function (manifest, err) {
        if (typeof err === "object") {
            this.mainObj.setErrorCode(fr.ina.amalia.player.PlayerErrorCode.ERROR_MANIFEST_DASH);
        }
        else {
            // Attach the source with any protection data
            this.dashPlayer.attachSource(manifest);
        }
    }

});
