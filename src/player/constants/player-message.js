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
 * Constant message class
 * @class PlayerMessage
 * @namespace fr.ina.amalia.player
 * @module player
 * @submodule player-constants
 */
$.Class( "fr.ina.amalia.player.PlayerMessage",{
    /**
     * @constant
     * @property PLAYER_OPENSOURCE_LINK
     * @type {String}
     */
    PLAYER_OPENSOURCE_LINK : 'Disponibles en open source.',
    /**
     * @constant
     * @property PLUGIN_OVERLAY_CONTEXT_MENU_ENABLED_DISABLED_PLUGIN
     * @type {String}
     */
    PLUGIN_OVERLAY_CONTEXT_MENU_ENABLED_DISABLED_PLUGIN : 'Activer/désactiver le plugin overlay.',
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_ELEMENTS
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_ELEMENTS : "éléments.",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_ZOOM_IN
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_ZOOM_IN : "Zoom avant",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_ZOOM_OUT
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_ZOOM_OUT : "Zoom arrière",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_CHANGE_DISPLAY
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_CHANGE_DISPLAY : "Changer la hauteur des lignes.",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_SLIDE_LEFT
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_SLIDE_LEFT : "Faire défiler vers la gauche",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_SLIDE_RIGHT
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_SLIDE_RIGHT : "Faire défiler vers la droit",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_SCROLL_UP
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_SCROLL_UP : "Faire défiler vers le haut",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_SCROLL_DOWN
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_SCROLL_DOWN : "Faire défiler vers le bas",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_SHOW_HIDE_TOOTIP
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_SHOW_HIDE_TOOTIP : "Activer/désactiver les infobulles",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_EXPAND
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_EXPAND : "Maximiser",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_SORT
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_SORT : "Trier",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_NAV_POINT_PREV
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_NAV_POINT_PREV : "Aller au marqueur précédent",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_NAV_POINT_NEXT
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_NAV_POINT_NEXT : "Aller au marqueur suivant",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_TIMEAXE
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_TIMEAXE : "Axe temporel",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_FOCUS
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_FOCUS : "Zoom",
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_CLOSE
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_CLOSE : "Fermer",
    /**
     * @constant
     * @property PLUGIN_METADATA_LIST_EDITOR_LABEL_HEADER
     * @type {String}
     */
    PLUGIN_METADATA_LIST_EDITOR_LABEL_HEADER : "Metadata list editor",
    /**
     * @constant
     * @property PLUGIN_METADATA_BLOCK_EDITOR_LABEL_HEADER
     * @type {String}
     */
    PLUGIN_METADATA_BLOCK_EDITOR_LABEL_HEADER : "Metadata block editor",
    /**
     * @constant
     * @property PLUGIN_METADATA_BLOCK_EDITOR_LABEL_HEADER
     * @type {String}
     */
    PLUGIN_METADATA_ITEMS_EDITOR_LABEL_HEADER : "Metadata items editor",
    /**
     * @constant
     * @property PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_ID
     * @type {String}
     */
    PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_ID : "ID",
    /**
     * @constant
     * @property PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_LABAL
     * @type {String}
     */
    PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_LABAL : 'Etiquette',
    /**
     * @constant
     * @property PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_TYPE
     * @type {String}
     */
    PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_TYPE : 'Type',
    /**
     * @constant
     * @property PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_TYPE
     * @type {String}
     */
    PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_DESCRIPTION : 'Description',
    /**
     * @constant
     * @property PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_TYPE
     * @type {String}
     */
    PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_REFERENCE : 'Référence',
    /**
     * @constant
     * @property PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_AUTHOR
     * @type {String}
     */
    PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_AUTHOR : 'Auteur',
    /**
     * @constant
     * @property PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_SHAPE
     * @type {String}
     */
    PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_SHAPE : 'Forme',
    /**
     * @constant
     * @property PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_COLOR
     * @type {String}
     */
    PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_COLOR : 'Couleur',
    /**
     * @constant
     * @property PLUGIN_METADATA_ITEMS_EDITOR_NEED_METADTA
     * @type {String}
     */
    PLUGIN_METADATA_ITEMS_EDITOR_NEED_METADTA : 'Vous devez sélectionner au moins un élément dans la liste des métadonnées avant de l\'ajouter élément.',
    /**
     * @constant
     * @property PLUGIN_METADATA_ITEMS_EDITOR_NEED_METADTA_ITEM_TYPE
     * @type {String}
     */
    PLUGIN_METADATA_ITEMS_EDITOR_NEED_METADTA_ITEM_TYPE : 'Vous devez définir le type élément.',
    /**
     * @constant
     * @property PLUGIN_TIMELINE_LABEL_BIND
     * @type {String}
     */
    PLUGIN_TIMELINE_LABEL_BIND : "Attacher/Detacher"
},
{} );
