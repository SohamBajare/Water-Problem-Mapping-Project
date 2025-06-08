let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 19.0760, lng: 72.8777 },
    zoom: 8,
  });

  document.getElementById("mapSearchBtn").addEventListener("click", async () => {
    const location = document.getElementById("mapInp").value;
    const coords = await getCoordinates(location);
    if (coords) {
      map.setCenter(coords);
      addMarker(coords, "Searched Location");
    }
  });
}

async function getCoordinates(address) {
  const apiKey = "YOUR_API_KEY";
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status === "OK") {
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  } else {
    alert("Location not found.");
    return null;
  }
}

function addMarker(coords, title) {
  const marker = new google.maps.Marker({
    position: coords,
    map: map,
    title: title,
  });
  markers.push(marker);
}

document.addEventListener("DOMContentLoaded", () => {
  const addReportBtn = document.getElementById("addReportBtn");
  const viewReportsBtn = document.getElementById("viewReportsBtn");
  const reportPopup = document.getElementById("reportPopup");
  const reportForm = document.getElementById("reportForm");
  const reportCards = document.getElementById("reportCards");
  const noReportsMsg = document.getElementById("noReportsMsg");
  const cardsContainer = document.getElementById("cardsContainer");

  addReportBtn.addEventListener("click", () => {
    reportPopup.classList.remove("hidden");
  });

  viewReportsBtn.addEventListener("click", () => {
    reportCards.classList.toggle("hidden");
  });

  reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("reportTitle").value;
    const desc = document.getElementById("reportDescription").value;
    const image = document.getElementById("reportImage").files[0];
    const locationText = document.getElementById("locationInput").value;
    const coords = await getCoordinates(locationText);

    if (coords) {
      addMarker(coords, title);
      reportPopup.classList.add("hidden");

      // For demo only: Add the report to cards visually
      noReportsMsg.style.display = "none";
      const card = document.createElement("div");
      card.className = "report-card";
      card.innerHTML = `<h4>${title}</h4><p>${desc}</p><small>${locationText}</small>`;
      cardsContainer.appendChild(card);
    }
  });
});
