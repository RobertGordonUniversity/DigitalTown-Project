

const map = L.map("map").setView([56.4907, -4.2026], 6); // центр Шотландии

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
}).addTo(map);

const filterSelect = document.getElementById("filter");

// функция для загрузки данных с сервера
async function loadData() {
  // const type = filterSelect.value;
  // const url = `/api/customers${type ? `?type=${type}` : ""}`;
  //Get functions from an external file
  $.getScript('js/databaseClientSide.js').done(function(script){
    console.log("Worked");
    //Run and wait for the function to work
    $.when(GetCustomer()).done(function(result){
      console.log(result)
      // удаляем старые маркеры
      map.eachLayer(layer => { if(layer instanceof L.Marker) map.removeLayer(layer); });

      // добавляем новые маркеры
      result.forEach(loc => {
        const marker = L.marker([loc.latitude, loc.longitude]).addTo(map);
        marker.bindPopup(`<b>${loc.id}</b>`);
        //<br>Type: ${loc.type}
      });
    })
  }).fail(function(jqxhr,settings,exception){
    console.log('Error with getScript');
  })

}

// загрузка данных при старте
loadData();

// фильтр по типу
filterSelect.addEventListener("change", loadData);
