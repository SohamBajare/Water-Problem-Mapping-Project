document.addEventListener('DOMContentLoaded', function() {
    // Initialize with sample username
    
    // Variables for map functionality
    let map;
    let currentMarker = null;
    let currentCoordinates = null;
    let infoWindow = null;
    let userReports = [];

    // Initialize Google Map
    function initMap() {
        // Default view: India
        const defaultLocation = { lat: 20.5937, lng: 78.9629 };
        
        map = new google.maps.Map(document.getElementById('map'), {
            center: defaultLocation,
            zoom: 5,
            mapTypeControl: true,
            fullscreenControl: true,
            streetViewControl: true,
            zoomControl: true,
            styles: [
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [
                        { "color": "#e9e9e9" },
                        { "lightness": 17 }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry.fill",
                    "stylers": [
                        { "color": "#bbdefb" }
                    ]
                },
                {
                    "featureType": "landscape",
                    "elementType": "geometry",
                    "stylers": [
                        { "color": "#f5f5f5" },
                        { "lightness": 20 }
                    ]
                }
            ]
        });
        
        // Create info window for markers
        infoWindow = new google.maps.InfoWindow();
        
        // Add click event to the map
        map.addListener('click', function(e) {
            // Get coordinates
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            
            // Update current coordinates
            currentCoordinates = {lat, lng};
            
            // Update marker
            if (currentMarker) {
                currentMarker.setMap(null);
            }
            
            currentMarker = new google.maps.Marker({
                position: {lat, lng},
                map: map,
                animation: google.maps.Animation.DROP
            });
            
            // Show info window with coordinates
            infoWindow.setContent(`Selected Location: [${lat.toFixed(6)}, ${lng.toFixed(6)}]`);
            infoWindow.open(map, currentMarker);
            
            // Create ripple effect at click location (visual only)
            createRippleEffect(e.domEvent.clientX, e.domEvent.clientY);
        });
        
        // Load initial sample data
        //loadSavedReports();

        loadAllReportsForMap();  // ✅ Load all real markers from DB

        

    }
    
    // Search location functionality with Google Places API
    function setupSearchBox() {
        const input = document.getElementById('location-search');
        const searchBtn = document.getElementById('search-button');
        
        // Create the search box and link it to the UI element
        const searchBox = new google.maps.places.SearchBox(input);
        
        // Bias the SearchBox results towards current map's viewport
        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });
        
        // Listen for the event fired when the user selects a prediction
        searchBox.addListener('places_changed', function() {
            const places = searchBox.getPlaces();
            
            if (places.length === 0) {
                return;
            }
            
            // Clear out the old marker
            if (currentMarker) {
                currentMarker.setMap(null);
            }
            
            // For each place, get the icon, name and location
            const bounds = new google.maps.LatLngBounds();
            
            places.forEach(function(place) {
                if (!place.geometry || !place.geometry.location) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                
                // Update current coordinates
                currentCoordinates = {lat, lng};
                
                // Create a marker for the place
                currentMarker = new google.maps.Marker({
                    map: map,
                    title: place.name,
                    position: place.geometry.location,
                    animation: google.maps.Animation.DROP
                });
                
                // Show info window with place name
                infoWindow.setContent(`<strong>${place.name}</strong><br>${place.formatted_address || ''}`);
                infoWindow.open(map, currentMarker);
                
                if (place.geometry.viewport) {
                    // Only geocodes have viewport
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            
            map.fitBounds(bounds);
        });
        
        // Also allow clicking the search button
        searchBtn.addEventListener('click', function() {
            if (input.value.trim() !== '') {
                // Trigger the searchBox places_changed event by simulating an enter key
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true
                });
                input.dispatchEvent(enterEvent);
            }
        });
        
        // Allow Enter key in search box
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchBtn.click();
            }
        });
    }
    
    // Get user's current location
    function getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Update current coordinates
                    currentCoordinates = {lat, lng};
                    
                    // Update marker
                    if (currentMarker) {
                        currentMarker.setMap(null);
                    }
                    
                    // Center map
                    map.setCenter({lat, lng});
                    map.setZoom(15);
                    
                    // Add marker
                    currentMarker = new google.maps.Marker({
                        position: {lat, lng},
                        map: map,
                        animation: google.maps.Animation.DROP
                    });
                    
                    // Show info window
                    infoWindow.setContent("Your current location");
                    infoWindow.open(map, currentMarker);
                    
                    // Show success message
                    showNotification("Location found successfully!");
                },
                (error) => {
                    console.error("Error getting current location:", error);
                    showNotification("Could not determine your location. Please try again or search manually.");
                }
            );
        } else {
            showNotification("Geolocation is not supported by your browser.");
        }
    }
    
    // Load saved reports and add markers to map
    // Load saved reports from MongoDB
    // edited on 5 may
    function loadSavedReports() {
        fetch('/reports')  // Make a GET request to your server to fetch reports
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    userReports = data;
                    // Add markers for each report
                    userReports.forEach(report => {
                        if (report.coordinates && report.coordinates.lat && report.coordinates.lng) {
                            addReportMarker(report);
                        }
                    });
                } else {
                    console.log("No reports found.");
                }
            })
            .catch(err => {
                console.error("Error loading reports:", err);
            });
    }

    
    // Add a marker for a report
    function addReportMarker(report) {
        if (!report.coordinates || !map) return;
        
        const marker = new google.maps.Marker({
            position: {
                lat: report.coordinates.lat,
                lng: report.coordinates.lng
            },
            map: map,
            title: report.title,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#4fc3f7',
                fillOpacity: 0.8,
                scale: 8,
                strokeColor: '#0d47a1',
                strokeWeight: 1
            }
        });
        
        //Add hover event to show small card for report
        marker.addListener('mouseover', function() {
            infoWindow.setContent(`
                <div style="max-width: 200px;">
                    <h3 style="margin: 0 0 5px 0; color: #1a73e8;">${report.title}</h3>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">${report.date}</p>
                    <p style="margin: 8px 0;">${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}</p>
                </div>
            `);
            infoWindow.open(map, marker);
        });

        //Add click event to show detail panel for report
        marker.addListener('click', function() {
            infoWindow.setContent(`<h3>${report.title}</h3>`);
            infoWindow.open(map, marker);
            createReportDetailPanel(report);  // ✅ This shows the panel
        });        

    }
    
    // Initialize Google Maps once API is loaded
    window.initGoogleMaps = function() {
        initMap();
        setupSearchBox();
        
        // Add "Use My Location" button
        const useMyLocationBtn = document.getElementById('use-my-location');
        if (useMyLocationBtn) {
            useMyLocationBtn.addEventListener('click', getCurrentLocation);
        }
    };
    
    // Load Google Maps API
    function loadGoogleMapsAPI() {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBlxbCHd41L5B22iwXQcRjUDJMHrn3LNUY&libraries=places&callback=initGoogleMaps`;
        script.defer = true;
        script.async = true;
        document.head.appendChild(script);
    }
    
    // Call this function to load the API
    loadGoogleMapsAPI();
    

    // Modal functionality
    const modal = document.getElementById('report-modal');
    const addReportBtn = document.getElementById('add-report-btn');
    const closeBtn = document.querySelector('.close');
    const reportForm = document.getElementById('report-form');
    const useMapLocationBtn = document.getElementById('use-map-location');
    const locationCoordinates = document.getElementById('location-coordinates');
    const reportLocation = document.getElementById('report-location');
    const imageInput = document.getElementById('report-image');
    const imagePreview = document.getElementById('image-preview');
    const viewReportsBtn = document.getElementById('view-reports-btn');
    const reportsSection = document.getElementById('reports-section');

    // Show modal
    addReportBtn.addEventListener('click', function() {
        document.getElementById('report-modal').style.display = 'block';
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        document.getElementById('report-modal').style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('report-modal')) {
            document.getElementById('report-modal').style.display = 'none';
        }
    });

    // Use map location in form
    useMapLocationBtn.addEventListener('click', function() {
        if (currentCoordinates) {
            const { lat, lng } = currentCoordinates;
            reportLocation.value = `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
            locationCoordinates.textContent = `Coordinates: [${lat.toFixed(6)}, ${lng.toFixed(6)}]`;
        } else {
            alert('Please select a location on the map first.');
        }
    });

    // Image preview
    imageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            
            reader.readAsDataURL(e.target.files[0]);
        } else {
            imagePreview.innerHTML = 'Image preview will appear here';
        }
    });

    function closeModal() {
        const modal = document.getElementById('report-modal');
        modal.style.display = 'none';
    }

    // Submit report form
    //edited on 4 june
    document.getElementById('report-form').addEventListener('submit', function(e) {
        e.preventDefault();  // Prevent default form submission
    
        // Get values from form fields
        const title = document.getElementById('report-title').value;
        const description = document.getElementById('report-issue').value;
        const location = document.getElementById('report-location').value;
        const coordinates = currentCoordinates;  // Should be defined already
        const imageFile = document.getElementById('report-image').files[0];  // ✅ Get actual file
    
        // Create FormData object
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('location', location);
        formData.append('coordinates', JSON.stringify(coordinates)); // stringified because it's an object
        formData.append('image', imageFile);  // ✅ This is the image file
        formData.append('date', new Date().toISOString());
        formData.append('userId', loggedInUserId);
        formData.append('username', loggedInUsername);
        formData.append('likes', 0);
        formData.append('dislikes', 0);
    
        // Send form data to the server
        fetch('/reports', {
            method: 'POST',
            body: formData  // ✅ No need to set Content-Type manually
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Report saved successfully") {
                alert("Report submitted successfully.");
                loadSavedReports();  // Reload reports
                closeModal();  // Close the modal
            }
        })
        .catch(err => {
            console.error("Error submitting report:", err);
            alert("Failed to submit report.");
        });
    });
    
    

    // View reports button
    //updated on 5 may
    viewReportsBtn.addEventListener('click', function () {
        reportsSection.classList.toggle('hidden');
    
        // ✅ Ensure action buttons stay visible
        const actionButtons = document.querySelector('.action-buttons');
        actionButtons.classList.add('visible');
    
        if (!reportsSection.classList.contains('hidden')) {
            // Scroll to reports section
            reportsSection.scrollIntoView({ behavior: 'smooth' });
    
            // 🚀 Fetch reports from MongoDB instead of localStorage
            fetch(`/reports?userId=${loggedInUserId}`)

                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        userReports = data; // Update the global reports array
                        updateReportsDisplay(); // Display the reports in the UI
                    } else {
                        console.error("Unexpected response format:", data);
                    }
                })
                .catch(error => {
                    console.error("Error fetching reports:", error);
                    alert("Failed to load reports from the server.");
                });
        }
    });
    
    

    // Update reports display
    // edited on 5 may
    function updateReportsDisplay() {
        const reportsContainer = document.getElementById('reports-container');
        
        // Clear previous content
        reportsContainer.innerHTML = '';
    
        if (!userReports || userReports.length === 0) {
            const noReportsMessage = document.createElement('p');
            noReportsMessage.id = 'no-reports-message';
            noReportsMessage.textContent = 'No reports available.';
            reportsContainer.appendChild(noReportsMessage);
            return;
        }
    
        // Render each report from the DB
        userReports.forEach(report => {
            const reportCard = document.createElement('div');
            reportCard.className = 'report-card';
    
            const imageUrl = report.imageUrl || 'default-placeholder.jpg'; // Optional fallback
            const date = new Date(report.date).toLocaleString(); // Format date if needed
    
            reportCard.innerHTML = `
                <img src="${imageUrl}" alt="${report.title}" class="report-image">
                <div class="report-content">
                    <h3 class="report-title">${report.title}</h3>
                    <p class="report-date">${date}</p>
                    <p class="report-description">${report.description}</p>
                    <p class="report-location"><i class="fas fa-map-marker-alt"></i> ${report.location}</p>
                </div>
            `;
    
            // Add click event to focus map on report location
            reportCard.addEventListener('click', function () {
                if (report.coordinates && report.coordinates.lat && report.coordinates.lng) {
                    document.querySelector('.map-section').scrollIntoView({ behavior: 'smooth' });
    
                    map.setCenter({
                        lat: report.coordinates.lat,
                        lng: report.coordinates.lng
                    });
                    map.setZoom(15);
    
                    if (currentMarker) {
                        currentMarker.setMap(null);
                    }
    
                    currentCoordinates = report.coordinates;
                    currentMarker = new google.maps.Marker({
                        position: {
                            lat: report.coordinates.lat,
                            lng: report.coordinates.lng
                        },
                        map: map,
                        animation: google.maps.Animation.DROP
                    });
    
                    infoWindow.setContent(`<strong>${report.title}</strong><br>${report.description}`);
                    infoWindow.open(map, currentMarker);
                }
            });
    
            reportsContainer.appendChild(reportCard);
        });
    }
    

    // Create water ripple effect
    function createRippleEffect(x, y) {
        const mapContainer = document.getElementById('map');
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        mapContainer.appendChild(ripple);
        
        // Remove ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 1500);
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animation to show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Remove from DOM after fade out
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    
    
    // Add CSS for notification
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
    `;
    document.head.appendChild(notificationStyle);
    
    // Add style for location button if not already added in CSS
    if (!document.getElementById('use-my-location')) {
        const locationBtnStyle = document.createElement('style');
        locationBtnStyle.textContent = `
            #use-my-location {
                background-color: var(--accent-color);
                color: white;
                border: none;
                padding: 0.8rem;
                cursor: pointer;
                transition: background-color 0.3s ease;
                margin-left: 5px;
                border-radius: 25px;
            }
            
            #use-my-location:hover {
                background-color: var(--secondary-color);
            }
        `;
        document.head.appendChild(locationBtnStyle);
        
        // Add "Use My Location" button to search container if not already there
        const searchContainer = document.querySelector('.search-container');
        const useMyLocationBtn = document.createElement('button');
        useMyLocationBtn.id = 'use-my-location';
        useMyLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
        useMyLocationBtn.title = "Use my current location";
        searchContainer.appendChild(useMyLocationBtn);
    }

    document.querySelector('.action-buttons').classList.add('visible');



    // changes made 20/5/2025 onwards

    //user profile button click functionality
    document.getElementById('profileIcon').addEventListener('click', function (e) {
        e.preventDefault();
        const dropdown = document.getElementById('dropdownMenu');
        dropdown.classList.toggle('hidden');
    });
    // Logout button redirects to /start
    document.getElementById('logoutBtn').addEventListener('click', function () {
        window.location.href = '/start';
    });
    // Optional: Hide dropdown if clicked outside
    window.addEventListener('click', function(e) {
        const dropdown = document.getElementById('dropdownMenu');
        const profileIcon = document.getElementById('profileIcon');
        if (!dropdown.contains(e.target) && !profileIcon.contains(e.target)) {
        dropdown.classList.add('hidden');
        }
    });
    
    // function to load all the report on the map so that user can see all the reports by marker
    function loadAllReportsForMap() {
        fetch('/reports')
        .then(res => res.json())
        .then(data => {
            console.log('Reports data from server:', data);
            if (Array.isArray(data)) {
                data.forEach(report => {
                    if (report.coordinates && report.coordinates.lat && report.coordinates.lng) {
                        addReportMarker(report);
                    } else {
                        console.warn('Skipping report without valid coordinates:', report);
                    }
                });
            }
        })
        .catch(err => console.error('Failed to load reports:', err));

    }


        // function to create and display the report detail panel
        function createReportDetailPanel(report) {
            // Remove any existing panel first
            const existingPanel = document.getElementById('report-detail-panel');
            if (existingPanel) existingPanel.remove();
        
            // Create a new panel element
            const panel = document.createElement('div');
            panel.id = 'report-detail-panel';
            panel.className = 'report-panel';
        
            // Add "View Evidence" button only if status is Resolved and evidence exists
            let evidenceButtonHTML = '';
            if (report.status === 'Resolved' && report.evidence) {
                evidenceButtonHTML = `<button id="viewEvidenceBtn">View Evidence</button>`;
            }
        
            panel.innerHTML = `
                <div class="report-image-section">
                    ${report.imageUrl ? `<img src="${report.imageUrl}" alt="${report.title}" style="max-width: 100%; border-radius: 8px;" />` : `<p style="color: grey;">No image provided</p>`}
                </div>        
                <div class="report-info-section">
                    <h2>${report.title}</h2>
                    <p><strong>Date:</strong> ${report.date}</p>
                    <p><strong>Location:</strong> ${report.location}</p>
                    <p><strong>Reported By:</strong> ${report.username}</p>
                    <p><strong>Status:</strong> ${report.status}</p>
                    <p>${report.description}</p>
        
                    <div class="like-dislike-container">
                        <button class="like-btn" data-id="${report._id}">
                            👍 <span>${report.likes}</span>
                        </button>
                        <button class="dislike-btn" data-id="${report._id}">
                            👎 <span>${report.dislikes}</span>
                        </button>
                    </div>
        
                    ${evidenceButtonHTML}
                </div>
                <span class="close-panel">&times;</span>
            `;
        
            document.body.appendChild(panel);
        
            // Event listener to close panel
            panel.querySelector('.close-panel').addEventListener('click', () => {
                panel.remove();
            });
        
            // Like button logic
            // panel.querySelector('.like-btn').addEventListener('click', () => {
            //     fetch(`/reports/${report._id}/like`, { method: 'POST' })
            //         .then(res => res.json())
            //         .then(updated => {
            //             panel.querySelector('.like-btn span').textContent = updated.likes;
            //             panel.querySelector('.dislike-btn span').textContent = updated.dislikes;
            //         });
            // });
        
            // // Dislike button logic
            // panel.querySelector('.dislike-btn').addEventListener('click', () => {
            //     fetch(`/reports/${report._id}/dislike`, { method: 'POST' })
            //         .then(res => res.json())
            //         .then(updated => {
            //             panel.querySelector('.like-btn span').textContent = updated.likes;
            //             panel.querySelector('.dislike-btn span').textContent = updated.dislikes;
            //         });
            // });
            // Inside the like/dislike button click listeners:
            panel.querySelector('.like-btn').addEventListener('click', () => {
                fetch(`/reports/${report._id}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUserId }) // Pass current user ID here
                })
                .then(res => res.json())
                .then(updated => {
                    panel.querySelector('.like-btn span').textContent = updated.likes;
                    panel.querySelector('.dislike-btn span').textContent = updated.dislikes;
                });
            });

            panel.querySelector('.dislike-btn').addEventListener('click', () => {
                fetch(`/reports/${report._id}/dislike`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUserId }) // Pass current user ID here
                })
                .then(res => res.json())
                .then(updated => {
                    panel.querySelector('.like-btn span').textContent = updated.likes;
                    panel.querySelector('.dislike-btn span').textContent = updated.dislikes;
                });
            });

        
            // Evidence button logic
            if (report.status === 'Resolved' && report.evidence) {
                const viewEvidenceBtn = document.getElementById('viewEvidenceBtn');
                viewEvidenceBtn.addEventListener('click', () => {
                    showEvidenceDetails(report.evidence);
                });
            }
        }
        
        // Function to show evidence details panel
        function showEvidenceDetails(evidence) {
            // Remove existing evidence detail panel if any
            const existingEvidencePanel = document.getElementById('evidence-detail-panel');
            if (existingEvidencePanel) existingEvidencePanel.remove();
        
            const panel = document.createElement('div');
            panel.id = 'evidence-detail-panel';
            panel.className = 'report-panel'; // you can reuse existing styles or create new CSS for this
        
            panel.innerHTML = `
                <h3>Evidence Report</h3>
                <p><strong>Measures Taken:</strong> ${evidence.measuresTaken || 'Not provided'}</p>
                ${evidence.afterImageUrl ? `<img src="${evidence.afterImageUrl}" alt="Evidence Image" style="max-width: 100%; border-radius: 8px;" />` : '<p>No evidence image provided</p>'}
                <span class="close-panel">&times;</span>
            `;
        
            document.body.appendChild(panel);
        
            panel.querySelector('.close-panel').addEventListener('click', () => {
                panel.remove();
            });
        }
        
        
        

});
