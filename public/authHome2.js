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

    function loadAllReportsForMap() {
        fetch('/reports')
        .then(res => res.json())
        .then(data => {
            
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

    function populateReportsList(filterStatus = 'All Status') {
        fetch('/reports/sorted')
            .then(res => res.json())
            .then(data => {
                const reportsList = document.getElementById('reports-list');
                reportsList.innerHTML = '';
    
                if (!Array.isArray(data) || data.length === 0) {
                    reportsList.innerHTML = '<p>No reports found.</p>';
                    return;
                }
    
                // 🔍 Filter by status
                const filteredReports = data.filter(report => {
                    if (filterStatus === 'All Status') return true;
                    return report.status === filterStatus;
                });
    
                // 🕒 Sort latest first
                filteredReports.sort((a, b) => new Date(b.date) - new Date(a.date));
    
                filteredReports.forEach(report => {
                    const card = document.createElement('div');
                    card.className = 'report-card';
    
                    const statusDropdown = `
                        <select class="status-dropdown" data-id="${report._id}">
                            <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                    `;
    
                    card.innerHTML = `
                        <div class="report-header">
                            <h3>${report.title}</h3>
                            ${statusDropdown}
                        </div>
                        <p><strong>Location:</strong> ${report.location || 'Unknown'}</p>
                        <p><strong>Likes:</strong> ${report.likes || 0} | <strong>Dislikes:</strong> ${report.dislikes || 0}</p>
                        <button class="details-btn" data-id="${report._id}">Details</button>
                    `;
                    reportsList.appendChild(card);
    
                    // Details button listener
                    const detailsBtn = card.querySelector('.details-btn');
                    detailsBtn.addEventListener('click', () => {
                        createReportDetailPanel(report);
                    });
                });
    
                // Status dropdown logic
                document.querySelectorAll('.status-dropdown').forEach(dropdown => {
                    dropdown.addEventListener('change', function () {
                        const reportId = this.getAttribute('data-id');
                        const newStatus = this.value;
    
                        if (newStatus === 'Resolved') {
                            showEvidenceForm(reportId);
                        } else {
                            updateReportStatus(reportId, newStatus);
                        }
                    });
                });
            })
            .catch(err => {
                console.error('Error fetching reports:', err);
            });
    }
    

    //EVIDENCE FORM
    function showEvidenceForm(reportId) {
        // Remove if already open
        const existingForm = document.getElementById('evidence-form');
        if (existingForm) existingForm.remove();
    
        const formContainer = document.createElement('div');
        formContainer.id = 'evidence-form';
        formContainer.className = 'evidence-form-overlay';
    
        formContainer.innerHTML = `
            <div class="evidence-form-panel">
                <h2>Submit Evidence for Resolved Report</h2>
                <form id="evidenceSubmitForm">
                    <label for="measures">Measures Taken:</label>
                    <textarea id="measures" name="measures" required></textarea>
    
                    <label for="evidenceImage">Upload Image:</label>
                    <input type="file" id="evidenceImage" name="evidenceImage" accept="image/*" required />
    
                    <div class="form-actions">
                        <button type="submit">Submit Evidence</button>
                        <button type="button" id="cancelEvidence">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(formContainer);
    
        // Cancel Button
        document.getElementById('cancelEvidence').addEventListener('click', () => {
            formContainer.remove();
        });
    
        // Handle Form Submission
        document.getElementById('evidenceSubmitForm').addEventListener('submit', async (e) => {
            e.preventDefault();
    
            const measures = document.getElementById('measures').value;
            const imageFile = document.getElementById('evidenceImage').files[0];
    
            const formData = new FormData();
            formData.append('reportId', reportId);
            formData.append('measuresTaken', measures);
            formData.append('evidenceImage', imageFile);
    
            try {
                const res = await fetch('/submit-evidence', {
                    method: 'POST',
                    body: formData
                });
    
                const result = await res.json();
                alert('Evidence submitted successfully!');
                formContainer.remove();
                populateReportsList(); // Refresh the list
            } catch (err) {
                console.error('Failed to submit evidence:', err);
                alert('Failed to submit evidence.');
            }
        });
    }
    
    function updateReportStatus(reportId, newStatus) {
        fetch(`/reports/${reportId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        })
        .then(updated => {
            console.log('Status updated:', updated);
            showNotification('Status updated successfully!');
        })
        .catch(err => {
            console.error('Error updating status:', err);
            //showNotification('Failed to update status');
        });
    }
    
    function createReportDetailPanel(report) {
        const existingPanel = document.getElementById('report-detail-panel');
        if (existingPanel) existingPanel.remove();
    
        const panel = document.createElement('div');
        panel.id = 'report-detail-panel';
        panel.className = 'report-panel';
        
        panel.innerHTML = `
            <div class="report-image-section">
                ${report.imageUrl ? `<img src="${report.imageUrl}" alt="${report.title}" style="max-width: 300px; height: 300px; margin-right: 50px; border-radius: 8px;" />` : `<p style="color: grey;">No image provided</p>`}
            </div>        
            <div class="report-info-section">
                <h2>${report.title}</h2>
                <p><strong>Date:</strong> ${report.date}</p>
                <p><strong>Location:</strong> ${report.location}</p>
                <p><strong>Reported By:</strong> ${report.username}</p>
                <p>${report.description}</p>
            </div>
            <span class="close-panel">&times;</span>
        `;
    
        document.body.appendChild(panel);
    
        panel.querySelector('.close-panel').addEventListener('click', () => {
            panel.remove();
        });
    }
    
    populateReportsList();

    async function updateDashboardStats() {
        try {
            const res = await fetch('/stats');
            const stats = await res.json();
    
            console.log('Stats received:', stats);  // For debugging
    
            // Update stat numbers in DOM
            document.querySelectorAll('.stat-card').forEach(card => {
                const title = card.querySelector('h3').textContent.trim().toLowerCase();
                const numberElement = card.querySelector('.stat-number');
    
                if (title === 'total reports') {
                    numberElement.textContent = stats.total;
                } else if (title === 'pending') {
                    numberElement.textContent = stats.pending;
                } else if (title === 'resolved') {
                    numberElement.textContent = stats.resolved;
                }
            });
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
        }
    }
    
        
    
    updateDashboardStats();
    
    // Logout button redirects to /start
    document.getElementById('logOutBtn').addEventListener('click', function () {
        window.location.href = '/start';
    });

    document.querySelector('.status-filter').addEventListener('change', function () {
        const selected = this.value;
        populateReportsList(selected);
    });

    ////////////////////////////
    const socket = io();

    // Tell server this client is an authorized dashboard
    socket.emit("authorizeDashboard");

    // Handle incoming new report
    socket.on("newReport", (report) => {
        console.log("New report received via socket:", report);

        // Optional: Show alert/toast
        alert(`🚨 New report added: ${report.title}`);

        // Optional: Add report dynamically to the top of the list
        prependReportToList(report);  // <-- implement this if needed
    });

    function prependReportToList(report) {
        const reportsList = document.getElementById('reports-list');
        const card = document.createElement('div');
        card.className = 'report-card';
    
        const statusDropdown = `
            <select class="status-dropdown" data-id="${report._id}">
                <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>
        `;
    
        card.innerHTML = `
            <div class="report-header">
                <h3>${report.title}</h3>
                ${statusDropdown}
            </div>
            <p><strong>Location:</strong> ${report.location || 'Unknown'}</p>
            <p><strong>Likes:</strong> ${report.likes || 0} | <strong>Dislikes:</strong> ${report.dislikes || 0}</p>
            <button class="details-btn" data-id="${report._id}">Details</button>
        `;
    
        // Attach event listener for Details button
        card.querySelector('.details-btn').addEventListener('click', () => {
            createReportDetailPanel(report);
        });
    
        // Add to top of the list
        reportsList.prepend(card);
    }
    
    
});

