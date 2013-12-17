# Leaflet.MarkerFollower

MarkerFollower is a [Leaflet][1] plugin for which allows you to add an
element to track markers that get (slightly) out of view. It is similar
to [Leaflet.EdgeMarker][4] from Gerald Pape, but this version does not
draw just circles. It was written for a business website to track
the main building on the map.

Features:

 - Follow markers when they get out of view using a customizable
   element. By default, an element will be created with class name
   `leaflet-marker-follower` containing the text of the popup.
 - Pan to marker by clicking the follower.
 - Considers the popup for positioning the follower.

[Demo][2].

# Usage
View the source code of [demo.html](demo.html) for an example.

Follow the instructions of [Leaflet's Quick Start Guide][3] to get a
working map first with a map and marker. Include
`Leaflet.MarkerFollower.js` after `leaflet.js`. After placing the marker
on the map, insert the follower using:

    L.markerFollower(mark).addTo(map);

Next, the follower element should be styled using CSS. From the demo:

    .leaflet-marker-follower {
        cursor: pointer;
        background: #fff;
        padding: 3px;
        position: absolute;
        border: 1px solid #ccc;
        box-shadow: 0 0 3px #000;
    }


If the default follower element is insufficient for your purposes, you can
specify your own using the `follower` option:

    var myFollower = document.createElement("div");
    // ... fill in myFollower ...
    L.markerFollower(mark, {
        follower: myFollower
    }).addTo(map);

The follower becomes visible when it gets as close as half the size of
the marker. If this is too low, you can change it using the
`paddingLeft`, `paddingRight`, `paddingTop` and `paddingBottom` options.
Note that these may not exceed the size of the marker or bad things will
happen.

# Bugs
Please report issues to the issue tracker. The following are known
issues which result from a design decision and may not be fixed until
the design changes.

 - Followers may overlap, so do not try to follow a lot of markers.
 - With multiple markers, the markers and popup are shown above the
   follower.

Other:

 - Follower gets under controls, it should probably stuck next to it.

# License
This project ("Leaflet.MarkerFollower") is licensed under the MIT
license. See the LICENSE file for more details.

 [1]: http://leafletjs.com/
 [2]: http://lekensteyn.github.com/Leaflet.MarkerFollower/demo.html
 [3]: http://leafletjs.com/examples/quick-start.html
 [4]: https://github.com/ubergesundheit/Leaflet.EdgeMarker
