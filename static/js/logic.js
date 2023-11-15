// Identify url data is being pulled from
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Initialize Map
const myMap = L.map("map", {
 center: [39.82, -98.58],
 zoom: 4
});

// Set up the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

function getColor(depth) {
  return depth > 90 ? '#8B0000' : // Dark Red (Deepest)
         depth > 80 ? '#B22222' : // Firebrick
         depth > 70 ? '#4169E1' : // Royal Blue
         depth >  60 ? '#0000FF' : // Blue
         depth >  40 ? '#9400D3' : // Dark Violet
         depth >  25 ? '#8A2BE2' : // Blue Violet
         depth >  15 ? '#BA55D3' : // Medium Orchid
         depth >  5 ? '#DA70D6' : // Orchid
         depth > -10 ? '#EE82EE' : // Violet
                       '#FFC0CB';  // Light Pink (Shallowest)
}

// Add Legend
const legend = L.control({ position: 'bottomleft' });

legend.onAdd = function (myMap) {
    const div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 5, 15, 25, 40, 60, 70, 80, 90],
        labels = [];

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

// Add CSS for Legend
const legendStyle = document.createElement('style');
legendStyle.innerHTML = `
    .info.legend {
        background: white;
        padding: 10px;
        border: 2px solid red;  /* Add a border to make the legend more visible */
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }

    .info.legend i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.7;
    }
`;

document.head.appendChild(legendStyle);

// Get Earthquake Data
d3.json(url).then(function(data) {
  const features = data.features;

  // Create circle markers
  for (let i = 0; i < features.length; i++) {
    // check for a null or naan magnitude
    if (features[i].properties.mag === null || isNaN(features[i].properties.mag) || features[i].properties.mag < 0.001) {
      continue;
    }
    const geometry = features[i].geometry;
    const properties = features[i].properties;
    const depth = geometry.coordinates[2];
    const magnitude = properties.mag;
    // Convert unix timestamp to date
    const date = new Date(properties.time).toLocaleDateString("en-US");
    const eventURL = properties.url;

    // Add circles to the map.
    L.circle([geometry.coordinates[1], geometry.coordinates[0]], {
      fillOpacity: 0.2,
      color: "black",
      weight: 0.5,
      fillColor: getColor(depth),
      radius: magnitude * 15000 * 0.5
    }).bindPopup(`<h1>${properties.place}</h1> <hr> <h3>Magnitude: ${magnitude}</h3> <h4>Date: ${date}</h4> <h5>Depth: ${depth}</h5> <a href="${eventURL}" target="_blank">Event Details</a>`).addTo(myMap);
  }

    

});