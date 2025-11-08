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

loadData();

filterSelect.addEventListener("change", loadData);