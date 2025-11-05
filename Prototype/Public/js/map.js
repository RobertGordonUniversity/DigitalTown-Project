const map = L.map("map").setView([56.4907, -4.2026], 6); // центр Шотландии

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
}).addTo(map);

const filterSelect = document.getElementById("filter");

function searchCustomer(values, searchTerm){
  let valuesFound = [];
  
  values.forEach(search => {
    try{
      if(search.customer != undefined && search.customer == searchTerm){
          valuesFound.push(search);
      }
    }
    catch(error){
      console.log(error);
    } 
  })
  return valuesFound;
}
// функция для загрузки данных с сервера
async function loadData() {
  const type = filterSelect.value;
  console.log(type);
  //Get functions from an external file
  $.getScript('js/databaseClientSide.js').done(function(script){
    console.log("Worked");
    //Run and wait for the function to work
    $.when(GetCustomer()).done(function(result){
      //Main displaying code
      console.log(result)
      let searchedResult = []
      //Searches
      if(type != ""){
        searchedResult = searchCustomer(result,type)
      }else{
        searchedResult = result;
      }
      console.log(searchedResult);
      // удаляем старые маркеры
      map.eachLayer(layer => { if(layer instanceof L.Marker) map.removeLayer(layer); });

      // добавляем новые маркеры
      searchedResult.forEach(loc => {
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
