// Google Maps Initialization
// let map;

// function initMap() {
//   map = new google.maps.Map(document.getElementById("map"), {
//     center: { lat: 20.5937, lng: 78.9629 }, // Default to India
//     zoom: 5,
//   });
// }

// Modal Handling
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const closeButtons = document.querySelectorAll(".close");

loginBtn.addEventListener("click", () => {
  loginModal.hidden = false;  
  loginModal.style.display = "flex";
});

signupBtn.addEventListener("click", () => {
  signupModal.hidden = false;   
  signupModal.style.display = "flex";
});

closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    loginModal.style.display = "none";
    signupModal.style.display = "none";
  });
});

window.addEventListener("click", (event) => {
  if (event.target === loginModal || event.target === signupModal) {
    loginModal.style.display = "none";
    signupModal.style.display = "none";
  }
});

// Form Handling
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const reportForm = document.getElementById("reportForm");
const reportsList = document.getElementById("reports");
const cardsContainer = document.getElementById("cardsContainer");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Login functionality to be implemented.");
  loginModal.style.display = "none";
});

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Signup functionality to be implemented.");
  signupModal.style.display = "none";
});

// Function to create a detailed report card
function createReportCard(title, description, imageUrl) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <img src="${imageUrl}" alt="Report Image">
    <h3>${title}</h3>
    <p>${description}</p>
  `;
  cardsContainer.appendChild(card);
}

// Modify the report submission logic to make each report clickable
reportForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("reportTitle").value;
  const description = document.getElementById("reportDescription").value;
  const image = document.getElementById("reportImage").files[0];

  if (title && description && image) {
    const reportItem = document.createElement("li");
    reportItem.innerHTML = `
      <h3>${title}</h3>
      <p>${description.substring(0, 50)}...</p>
      <img src="${URL.createObjectURL(image)}" alt="Report Image" width="100">
    `;

    // Add click event to show detailed information
    reportItem.addEventListener("click", () => {
    reportCards.hidden = false;
      createReportCard(title, description, URL.createObjectURL(image));
    });

    reportsList.appendChild(reportItem);
    alert("Report submitted successfully!");
    reportForm.reset();
  } else {
    alert("Please fill out all fields.");
  }
});