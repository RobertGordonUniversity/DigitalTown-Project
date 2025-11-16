const map = L.map("map", {
    minZoom: 6,
    maxZoom: 16,
    maxBounds: [
        [54.5, -7.5],
        [60.9, -0.8] 
    ],
    maxBoundsViscosity: 1.0
}).setView([56.4907, -4.2026], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
}).addTo(map);

// Search marker
let searchMarker = null;

let simdLayer = null;
const rankFields = {
  General: "Rank",
  Health: "HlthRank",
  Education: "EduRank",
  Income: "IncRank",
  GeographicAccess: "GAccRank"
}

let heatPoints = L.layerGroup();
let zoneLabels = L.layerGroup();

const filterSelect = document.getElementById("filter");

function isInScotland(lat, lng) {
    return lat >= 54.5 && lat <= 60.9 && lng >= -7.5 && lng <= -0.8;
}

function searchCustomer(values, searchTerm){
  return values.filter(v => v.customer && (searchTerm === "" || v.customer === searchTerm));
}

function defineBins(bin,bands,values){
  
  let startValue = "06506";

  let amount = Object.keys(values).length;

  let max = values["S010"+startValue];
  let min = values["S010"+startValue];

  //Find the max and min of a search value
  for(let i = 0; i < amount; i++){
    let changeValue = parseInt(startValue) + i
    if(changeValue < 10000){
      changeValue = "0" +changeValue
    }
    if(max.Rank < values["S010"+changeValue].Rank){
      max = values["S010"+changeValue]
    }
    if(min.Rank > values["S010"+changeValue].Rank){
      min = values["S010"+changeValue]
    }
  }
  //Set Max and Min values
  bin[0] = min.Rank;
  bin[bands] = max.Rank;
  //
  for(let i = bands-1; i > 0; i--){
      bin[i] = Math.floor(amount * (0.1 * i));
  }
  console.log(bin);
  return bin;
}

// Address search function
async function searchAddress() {
  const searchInput = document.getElementById("addressSearch");
  const searchButton = document.getElementById("searchButton");
  const searchResults = document.getElementById("searchResults");
  const query = searchInput.value.trim();

  if (!query) {
    searchResults.textContent = "Please enter a postcode or address";
    searchResults.style.color = "red";
    return;
  }

  searchButton.disabled = true;
  searchResults.textContent = "Searching...";
  searchResults.style.color = "black";

  try {
    const response = await fetch(`https://api.positionstack.com/v1/forward?access_key=9da08de773e2835da22540b8340bb74a&query=${encodeURIComponent(query)}&country=GB&limit=1`);
    
    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const result = data.data[0];
      const lat = result.latitude;
      const lng = result.longitude;

      // Check if location is in Scotland
      if (isInScotland(lat, lng)) {
        // Remove previous search marker if exists
        if (searchMarker) {
          map.removeLayer(searchMarker);
        }

        // Add new marker
        searchMarker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        })
        .addTo(map)
        .bindPopup(`<b>${result.label || query}</b><br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`)
        .openPopup();

        // Pan and zoom to the location
        map.setView([lat, lng], 13);

        searchResults.textContent = `Found: ${result.label || query}`;
        searchResults.style.color = "green";
      } else {
        searchResults.textContent = "Location is outside Scotland";
        searchResults.style.color = "orange";
      }
    } else {
      searchResults.textContent = "No results found";
      searchResults.style.color = "red";
    }
  } catch (error) {
    console.error('Search error:', error);
    searchResults.textContent = "Search error. Please try again.";
    searchResults.style.color = "red";
  } finally {
    searchButton.disabled = false;
  }
}

// Add event listeners for search
document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("addressSearch");

  if (searchButton) {
    searchButton.addEventListener("click", searchAddress);
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchAddress();
      }
    });
  }
});

async function loadData() {
  const type = filterSelect.value;

  $.getScript('js/databaseClientSide.js').done(function(){
    $.when(GetCustomer()).done(function(result){
      let filtered = searchCustomer(result, type);

      map.eachLayer(layer => {
        if (layer instanceof L.HeatLayer) map.removeLayer(layer);
      });

      const heatPoints = [];

      filtered.forEach(loc => {
        if (isInScotland(loc.latitude, loc.longitude)) {
          heatPoints.push([loc.latitude, loc.longitude, 2.0]);
        }
      });

      if (heatPoints.length) {
        L.heatLayer(heatPoints, { 
          radius: 25,          
          blur: 15,             
          max: 2.0,             
          minOpacity: 0.5,    
          gradient: {           
              0.0: 'rgba(0, 0, 255, 0)',
              0.2: 'rgba(0, 0, 255, 1)',
              0.4: 'rgba(0, 255, 0, 1)',
              0.6: 'rgba(255, 255, 0, 1)',
              0.8: 'rgba(255, 128, 0, 1)',
              1.0: 'rgba(255, 0, 0, 1)'
          }
        }).addTo(map);
      }
    });
  }).fail(() => console.log('Error loading databaseClientSide.js'));
}

async function loadSIMD(){
  //Gets data from the slider
  const rankSlider = document.getElementById("rankThreshold");
  const rankValueDisplay = document.getElementById("rankValue");

  const filter = document.getElementById("filterSIMD");

  // Load both GeoJSON and SIMD JSON
  Promise.all([
    fetch('data/map/datazones.geojson').then(res => res.json()),
    fetch('data/map/SIMDdata.json').then(res => res.json())
  ])
  .then(([geoData, simdData]) => {
    
    const simdByDz = {};
    simdData.forEach(item => {
        simdByDz[item.DataZone] = item;
    });
    console.log(geoData);

    let bands = 9;
    let bin = [] ;

    //This uses health ranks do base the bands
    bin = defineBins(bin,bands,simdByDz)

    const colors = ['#800026','#BD0026','#E31A1C','#FC4E2A','#FD8D3C','#FEB24C','#FED976','#FFEDA0','#FFFFCC','#F0FFF0']
    // Add GeoJSON to the map
    function drawSIMDLayer(threshold, type){
      //Removes the old layer
      if (simdLayer) {
        map.removeLayer(simdLayer);
      }

      map.eachLayer(layer => {
          if (layer instanceof L.Marker && layer !== searchMarker) map.removeLayer(layer);
      });

      simdLayer = L.geoJSON(geoData, {
        //Filters to anything higher than rank
        filter: feature => {
          const dzCode = feature.properties.DataZone;
          const simd = simdByDz[dzCode];
          const field = rankFields[type];
          const filterValue = simdByDz[dzCode]?.[field];
          
          return simd && filterValue <= threshold;
        },
        style: feature => {
          const dzCode = feature.properties.DataZone;
          const field = rankFields[type];
          const filterValue = simdByDz[dzCode]?.[field];

          // Color based on SIMD decile (1 = most deprived, 10 = least deprived)
          let color = '#ffffff'; // default
          if (filterValue !== undefined) {
            for(let i = 0; i < bin.length - 1; i++){
              if(filterValue > bin[i] && filterValue < bin[i+1]){
                color = colors[i]; // decile 1 = colors[0]
                valueLabel = i + 1;
              }
            }
          }
  
          return {
            fillColor: color,
            weight: 1,
            color: '#555',
            fillOpacity: 0.3,
          };
        },
        onEachFeature: (feature, layer) => {
          const dzCode = feature.properties.DataZone;
          const simd = simdByDz[dzCode];
          const field = rankFields[type];
          const filterValue = simdByDz[dzCode]?.[field];
          
          layer.bindPopup(`
            <strong>Data Zone:</strong> ${dzCode}<br>
            <strong>SIMD ${type}:</strong> ${filterValue}
          `);
          let centroid = turf.center(feature)
          let icontext = '<p>' + valueLabel +'</p>'
          L.marker([centroid.geometry.coordinates[1],centroid.geometry.coordinates[0]],{
            icon: L.divIcon({
              className: 'text-labels',   // Set class for CSS styling
              html: icontext
            }),
            zIndexOffset: 1000     // Make appear above other map features
          }).addTo(map);
        }
      }).addTo(map);
    }

    drawSIMDLayer(6976,filter.value);
    map.removeLayer(simdLayer);
    if (simdVisible) {
      simdLayer.addTo(map);
    }

    // Update map when slider moves
    rankSlider.addEventListener("input", e => {
      const newThreshold = parseInt(e.target.value);
      rankValueDisplay.textContent = newThreshold;
      simdVisible = true;
    });

    rankSlider.addEventListener("change", e => {
      const newThreshold = parseInt(e.target.value);
      drawSIMDLayer(newThreshold,filter.value);
      simdVisible = true;
    });

    filter.addEventListener("change", () => {
      const currentThreshold = parseInt(document.getElementById("rankThreshold").value);
      drawSIMDLayer(currentThreshold,filter.value)
      simdVisible = true;
    });
  
  })
  .catch(err => console.error('Error loading data:', err));
}

loadData();
loadSIMD();

const toggleBtn = document.getElementById("toggleSIMD");
let simdVisible = false;

toggleBtn.addEventListener("click", () => {
    if (simdLayer) {
        if (simdVisible) {
            map.removeLayer(simdLayer);
        } else {
            map.addLayer(simdLayer);
        }
        simdVisible = !simdVisible;
    }
});

filterSelect.addEventListener("change", loadData);