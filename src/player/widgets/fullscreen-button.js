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
 * Full screen button for control bar
 * @class FullscreenButton
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend( "fr.ina.amalia.player.plugins.controlBar.widgets.FullscreenButton",{
    classCss : "player-fullscreen-button",
    classCssFullscreenOn : "ajs-icon ajs-icon-expand",
    classCssFullscreenOff : "ajs-icon ajs-icon-compress",
    style : "",
    eventTypes : {
        CLICK : "fr.ina.amalia.player.plugins.widgets.FullscreenButton.event.click"
    }
},
{
    /**
     * Initialize the component
     * @method initialize
     */
    initialize : function ()
    {
        // Create component
        this.component = $( '<div>',{
            class : this.Class.classCss,
            style : this.Class.style
        } );
        var icon = $( '<span>',{
            class : this.Class.classCssFullscreenOn
        } );
        this.component.append( icon );

        // set events
        this.component.on( 'click',{
            self : this,
            component : this.component
        },
        this.onClick );
        // Add to container
        this.container.append( this.component );
        this.setFullscreenMode( false );
        // Logger
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initialize" );
        }
        this.definePlayerEvents();
    },
    /**
     * Add player evnet listener
     * @method definePlayerEvents
     */
    definePlayerEvents : function ()
    {
        this.mediaPlayer.mediaContainer.on( fr.ina.amalia.player.PlayerEventType.FULLSCREEN_CHANGE,{
            self : this
        },
        this.onFullscreenModeChange );

    },
    /**
     * Set full-screen mode
     * @method setFullscreenMode
     * @param {Boolean} state true pour le mode plein ecran
     */
    setFullscreenMode : function (state)
    {
        if (state === true)
        {
            this.component.find( 'span' ).removeClass( this.Class.classCssFullscreenOn ).addClass( this.Class.classCssFullscreenOff );
        }
        else
        {
            this.component.find( 'span' ).removeClass( this.Class.classCssFullscreenOff ).addClass( this.Class.classCssFullscreenOn );
        }
    },
    /**
     * On click event call toggle full-screen function
     * @method onClick
     * @param {Boolean} state true if in full screen state
     */
    onClick : function (event)
    {
        event.data.self.mediaPlayer.toggleFullScreen();
    },
    /**
     * Fired on full-screen mode change
     * @method onFullscreenModeChange
     * @param {Object} event
     */
    onFullscreenModeChange : function (event,data)
    {
        event.data.self.setFullscreenMode( data.inFullScreen );
    }

} );
