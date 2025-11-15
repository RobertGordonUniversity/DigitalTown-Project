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


let simdLayer = null;
const rankFields = {
  General: "Rank",
  Health: "HlthRank",
  Education: "EduRank",
  Income: "IncRank",
  GeographicAccess: "GAccRank"
}



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

async function loadData() {
  const type = filterSelect.value;

  $.getScript('js/databaseClientSide.js').done(function(){
    $.when(GetCustomer()).done(function(result){
      let filtered = searchCustomer(result, type);

      map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.HeatLayer) map.removeLayer(layer);
      });

      const heatPoints = [];

      filtered.forEach(loc => {
        if (isInScotland(loc.latitude, loc.longitude)) {
          // L.marker([loc.latitude, loc.longitude])
          //   .addTo(map)
          //   .bindPopup(`<b>${loc.id}</b><br>${loc.customer}`);

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
          // const decile = simdByDz[dzCode]?.Decile;
          const field = rankFields[type];
          const filterValue = simdByDz[dzCode]?.[field];

          // Color based on SIMD decile (1 = most deprived, 10 = least deprived)
          let color = '#ffffff'; // default
          if (filterValue !== undefined) {
            for(let i = 0; i < bin.length - 1; i++){
              if(filterValue > bin[i] && filterValue < bin[i+1]){
                color = colors[i]; // decile 1 = colors[0]
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