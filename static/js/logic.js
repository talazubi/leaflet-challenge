// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});

// Create the map object with center and zoom options.
let myMap = L.map("map", {
  center: [20, 0], // Center the map around the equator
  zoom: 2
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(myMap);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(function (data) {

  // This function returns the style data for each earthquake.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth > 90) return "#ff3333";
    if (depth > 70) return "#ff6633";
    if (depth > 50) return "#ff9933";
    if (depth > 30) return "#ffcc33";
    if (depth > 10) return "#ffff33";
    return "#ccff33";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude ? magnitude * 4 : 1;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake.
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<h3>Magnitude: " + feature.properties.mag + "</h3>" +
        "<h3>Location: " + feature.properties.place + "</h3>"
      );
    }
  }).addTo(myMap);

  // Create a legend control object.
  let legend = L.control({ position: "bottomright" });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["#ccff33", "#ffff33", "#ffcc33", "#ff9933", "#ff6633", "#ff3333"];

    // Loop through depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        "<i style='background: " + colors[i] + "; width: 18px; height: 18px; display: inline-block; margin-right: 5px;'></i> " +
        depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(myMap);
});