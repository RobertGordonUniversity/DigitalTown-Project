const map = L.map("map", {
    minZoom: 6,
    maxZoom: 12,
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


const filterSelect = document.getElementById("filter");



function isInScotland(lat, lng) {
    return lat >= 54.5 && lat <= 60.9 && lng >= -7.5 && lng <= -0.8;
}



function searchCustomer(values, searchTerm){
  return values.filter(v => v.customer && (searchTerm === "" || v.customer === searchTerm));
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
                    L.marker([loc.latitude, loc.longitude])
                     .addTo(map)
                     .bindPopup(`<b>${loc.id}</b><br>${loc.customer}`);

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

    console.log(geoData.features[0].properties);
    console.log(simdByDz['S01013482']); 

    // Add GeoJSON to the map
    simdLayer = L.geoJSON(geoData, {
      style: feature => {
        const dzCode = feature.properties.DataZone; // Or DZ_CODE
        const decile = simdByDz[dzCode]?.Decile;
        
        // Color based on SIMD decile (1 = most deprived, 10 = least deprived)
        let color = '#ffffff'; // default
        if (decile !== undefined) {
          const colors = ['#800026','#BD0026','#E31A1C','#FC4E2A','#FD8D3C','#FEB24C','#FED976','#FFEDA0','#FFFFCC','#F0FFF0'];
          color = colors[decile - 1]; // decile 1 = colors[0]
        }
  
        return {
          fillColor: color,
          weight: 1,
          color: '#555',
          fillOpacity: 0.7
        };
      },
      onEachFeature: (feature, layer) => {
        const dzCode = feature.properties.DataZone;
        const simd = simdByDz[dzCode];
        const rank = simd?.Rank ?? 'Unknown';
        const decile = simd?.Decile ?? 'Unknown';
        layer.bindPopup(`
          <strong>Data Zone:</strong> ${dzCode}<br>
          <strong>SIMD Rank:</strong> ${rank}<br>
          <strong>SIMD Decile:</strong> ${decile}
        `);
      }
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