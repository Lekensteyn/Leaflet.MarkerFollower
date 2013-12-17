/*!
 * Leaflet.MarkerFollower - track markers out of view.
 * Copyright (C) 2013 Peter Wu <lekensteyn@gmail.com>
 * Licensed under the MIT license <http://opensource.org/licenses/MIT>.
 */
(function (L) {
  'use strict';

  L.MarkerFollower = L.Class.extend({

    options: {
      // paddingTop: <Number>,
      // paddingBottom: <Number>,
      // paddingLeft: <Number>,
      // paddingRight: <Number>,
      follower: null
    },

    initialize: function (marker, options) {
      this._marker = marker;
      L.setOptions(this, options);

      /* The marker size depends on the icon of it */
      var iconSize = marker.options.icon.options.iconSize;
      if (!(iconSize instanceof L.Point)) {
        iconSize = new L.Point(iconSize[0], iconSize[1]);
      }
      this._markerWidth = iconSize.x;
      this._markerHeight = iconSize.y;

      var options = this.options;
      var _setOption = function (name, defaultValue) {
        if (typeof options[name] == 'undefined') {
          options[name] = defaultValue;
        }
      };

      // the space inside the map that should still trigger the follower
      _setOption('paddingLeft',   this._markerWidth / 2);
      _setOption('paddingRight',  this._markerWidth / 2);
      _setOption('paddingTop',    this._markerHeight / 2);
      _setOption('paddingBottom', this._markerHeight / 2);
    },

    /* default element if no follower is given */
    _createFollower: function (marker) {
      var follower = L.DomUtil.create('div', 'leaflet-marker-follower'),
          popup = marker.getPopup();
      if (popup) {
        follower.textContent = popup.getContent();
      }
      return follower;
    },

    _focusMarker: function () {
      this._map.panTo(this._marker.getLatLng(), { animate: true });
    },

    onAdd: function (map) {
      this._map = map;

      // this element will be displayed on the map and follow the marker
      if (!this.options.follower) {
        this.options.follower = this._createFollower(this._marker);
      }
      map.getPanes().overlayPane.appendChild(this.options.follower);
      L.DomEvent.addListener(this.options.follower, 'click', this._focusMarker, this);

      map.on('viewreset move popupopen popupclose', this._relocate, this);
      this._relocate();
    },

    onRemove: function (map) {
      map.off('viewreset move popupopen popupclose', this._relocate, this);
      L.DomEvent.removeListener(this.options.follower, 'click', this._focusMarker);
      this.getPanes().overlayPane.removeChild(this.options.follower);
    },

    _limitToRange: function (val, lower, upper) {
      return Math.min(upper, Math.max(lower, val));
    },

    /**
     * Positions and toggle visbility of the follower depending on the
     * marker location.
     */
    _relocate: function () {
      // bottom-right corner of map and position of marker (bottom-center)
      var mapSize = this._map.getSize(),
          markerXY = this._map.latLngToContainerPoint(this._marker.getLatLng());
      // sides of the marker
      var leftSide = markerXY.x - this._markerWidth / 2,
          rightSide = markerXY.x + this._markerWidth / 2,
          topSide = markerXY.y - this._markerHeight,
          bottomSide = markerXY.y;

      // follower must appear above popup and marker
      var popup = this._marker.getPopup();
      if (popup && this._map.hasLayer(popup)) {
        var popup_height = popup._containerBottom + popup._container.offsetHeight,
            popup_left = markerXY.x + popup._containerLeft,
            popup_right = popup_left + popup._container.offsetWidth;
        leftSide = Math.min(leftSide, popup_left);
        rightSide = Math.max(rightSide, popup_right);
        topSide = Math.min(topSide, markerXY.y - popup_height);
      }

      /* Sides on which the follower hits the marker (Bottom,
       * Right, Left or Top). When on the Left/Right borders
       * (or outside), position R/L.
       *           <---> padding (must be smaller than markerWidth)
       * +---+-----+---+ ^
       * R B |  B  | B L | padding (must be smaller than markerHeight)
       * +---+-----+---+ v
       * |   |(hide|   |     +---+  Example for Bottom with Marker,
       * | R | foll| L |     | M +  Follower and its match point (*).
       * |   |ower)|   |     +-*-+
       * +---+-----+---+   +---*---+
       * R T |  T  | T L   |   F   |
       * +---+-----+---+   +-------+
       */
      var paddingLeft = this.options.paddingLeft,
          paddingRight = this.options.paddingRight,
          paddingTop = this.options.paddingTop,
          paddingBottom = this.options.paddingBottom;
      if (rightSide > paddingLeft &&
          leftSide < mapSize.x - paddingRight &&
          bottomSide > paddingTop &&
          topSide < mapSize.y - paddingBottom) {
        // marker is in the middle (hide follower)
        this.options.follower.style.display = 'none';
      } else {
        this.options.follower.style.display = '';

        var followerWidth = this.options.follower.offsetWidth,
            followerHeight = this.options.follower.offsetHeight;
        // the top-left point of the follower
        var x, y;

        var isInside = rightSide > 0 && leftSide < mapSize.x;
        if (isInside && bottomSide <= paddingTop) {
          // marker is in location B
          x = markerXY.x - followerWidth / 2;
          y = bottomSide;
        } else if (isInside && topSide >= mapSize.y - paddingBottom) {
          // marker is in location T
          x = markerXY.x - followerWidth / 2;
          y = topSide - followerHeight;
        } else {
          if (rightSide <= paddingLeft) {
            // marker is in location R
            x = rightSide;
          } else if (leftSide >= mapSize.x - paddingRight) {
            // marker is in location L
            x = leftSide - followerWidth;
          } else {
            // padding is greater than markerWidth (or markerHeight)?
            console.error('unexpected condition: marker is in middle!');
            return;
          }
          y = bottomSide - followerHeight / 2;
        }

        // do not carry the follower outside the map.
        x = this._limitToRange(x, 0, mapSize.x - followerWidth);
        y = this._limitToRange(y, 0, mapSize.y - followerHeight);

        // new position is relative to the layer
        var new_pos = this._map.containerPointToLayerPoint([x, y]);
        L.DomUtil.setPosition(this.options.follower, new_pos);
      }
    },

    /* TODO: remove this for Leaflet 0.7 and when the L.Layer becomes the base */
    addTo: function (map) {
      map.addLayer(this);
    }
  });

  L.markerFollower = function (marker, options) {
    return new L.MarkerFollower(marker, options);
  };
}(L));
