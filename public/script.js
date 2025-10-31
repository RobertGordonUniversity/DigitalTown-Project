const map = L.map("map").setView([56.4907, -4.2026], 6); // центр Шотландии

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
}).addTo(map);

const filterSelect = document.getElementById("filter");

// функция для загрузки данных с сервера
async function loadData() {
  const type = filterSelect.value;
  const url = `/api/customers${type ? `?type=${type}` : ""}`;
  const res = await fetch(url);
  const data = await res.json();

  // удаляем старые маркеры
  map.eachLayer(layer => { if(layer instanceof L.Marker) map.removeLayer(layer); });

  // добавляем новые маркеры
  data.forEach(loc => {
    const marker = L.marker([loc.lat, loc.lng]).addTo(map);
    marker.bindPopup(`<b>${loc.name}</b><br>Type: ${loc.type}`);
  });
}

// загрузка данных при старте
loadData();

// фильтр по типу
filterSelect.addEventListener("change", loadData);
