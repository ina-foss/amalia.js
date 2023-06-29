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
 * jQuery plugin for ina media player
 * @function mediaPlayer
 * @description jQuery media player plugin
 * @param Object settings settings
 * @module player
 */
(function ($) {
    $.fn.mediaPlayer = function (settings) {
        return this.each(function () {
            // The element to display media.
            var containerElement = $(this);
            var dataId = 'fr.ina.amalia.player';
            // Return early if this element already has a plugin
            // instance
            if (containerElement.data(dataId)) {
                return null;
            }
            settings = $.extend({
                    player: 'default',
                    plugins: {},
                    src: null,
                    framerate: 25,
                    autoplay: true,
                    controlBarClassName: "fr.ina.amalia.player.plugins.CustomControlBarPlugin",
                    controlBar: {},
                    tcOffset: 0,
                    mediaType: '',
                    thumbRootDirectory: '',
                    duration: null,
                    togglePlayPause: false,
                    debug: false
                },
                settings || {});

            var mediaFactory = new fr.ina.amalia.player.MediaFactory(this, settings);
            // Store plugin object in this element's data
            containerElement.data(dataId, mediaFactory);
            containerElement.addClass('ajs');
            containerElement.attr('style', 'width: 100%; height:100%;');
            containerElement.parent().css('position', 'relative');
        });
    };
})(jQuery);