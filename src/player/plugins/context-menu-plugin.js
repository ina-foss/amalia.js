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
 * Context menu plugin
 * @class ContextMenuPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-context-menu
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBase.extend( "fr.ina.amalia.player.plugins.ContextMenuPlugin",{
    classCss : "plugin-context-menu dropdown-menu lg",
    style : "",
    copyrightText : _PlayerAmaliaVersion_,
    copyrightHomepage : _PlayerAmaliaHomepage_
},
{
    /**
     * Dom element property
     * @property container
     * @type {Object}
     * @default null
     */
    container : null,
    /**
     * Context menu configuration
     * @property menuConfiguration
     * @type {Object}
     * @default {}
     */
    menuConfiguration : {
        "position" : {
            my : "left top",
            at : "right top"
        }
    },
    /**
     * Initialize the component
     * @method initialize
     */
    initialize : function ()
    {
        this.initContextMenu();
    },
    /**
     * In charge to create context menu
     * @method initContextMenu
     */
    initContextMenu : function ()
    {
        this.container = $( '<ul/>',{
            'class' : this.Class.classCss,
            'style' : this.Class.style,
            'role' : 'menu',
            'aria-labelledby' : 'dLabel'
        } ).menu( {
            disabled : false
        } ).css( {
            position : "fixed",
            left : 0,
            top : 0
        } ).hide();
        this.addItemWithLink( this.Class.copyrightText,null,null,'ajs-icon  ajs-icon-amalia-js' );
        this.addItemWithLink( fr.ina.amalia.player.PlayerMessage.PLAYER_OPENSOURCE_LINK,this.Class.copyrightHomepage,'homepage','ajs-icon ajs-icon-github' );
        this.pluginContainer.append( this.container );
        // events
        this.container.on( 'mouseleave',{
            self : this
        },
        this.onMouseleave );

        this.pluginContainer.parent().on( 'contextmenu',{
            self : this
        },
        this.onContextmenu );
    },
    /**
     * Add menu item with link
     * @param {String} text
     * @param {String} link
     * @param {String} className
     * @returns {Object}
     */
    addItemWithLink : function (text,link,className,icon)
    {
        link = (link) ? link : '#';
        icon = (typeof icon === 'string') ? icon : null;
        className = (className) ? className : 'disabled';
        var item = $( '<li>',{
            'class' : className
        } );
        var linkElement = $( '<a>',{
            text : text,
            target : '_blank',
            href : link
        } );

        ///Add icon
        if (icon !== null) {
            linkElement.append( $( '<span>',{
                'class' : icon
            } ) );
        }
        //disabled
        if (link === '#')
        {
            linkElement.on( 'click',function (e) {
                e.preventDefault();
            } );
        }
        item.append( linkElement );
        this.container.append( item );
        return item;
    },
    /**
     * Fired on context menu event
     * @method onContextmenu
     * @param {Object} e
     */
    onContextmenu : function (e)
    {
        var offset = 10;

        e.data.self.container.show().css( {
            left : e.clientX - offset,
            top : e.clientY - offset
        } );
        e.preventDefault();
    },
    /**
     * Fired on mouse leave event
     * @method onMouseleave
     * @param {Object} e
     */
    onMouseleave : function (e)
    {
        e.preventDefault();
        e.data.self.container.hide();
    }
} );
