// Sample data - replace with actual data from your backend
// const reportData = [
//     {
//         id: 1,
//         title: "Chemical Pollution in River Thames",
//         type: "pollution",
//         location: { lat: 51.5074, lng: -0.1278 }, // London coordinates
//         address: "Near London Bridge, London, UK",
//         reporter: "John Smith",
//         reportDate: "2025-04-28T09:30:00",
//         status: "pending",
//         description: "Observed unusual coloration and odor in the water. Several dead fish floating nearby. Possible chemical contamination from nearby industrial facility.",
//         images: [1, 2, 3],
//         severity: "high"
//     },
//     {
//         id: 2,
//         title: "Water Shortage in Suburban Area",
//         type: "scarcity",
//         location: { lat: 51.4545, lng: -0.9865 }, // Reading coordinates
//         address: "Caversham Heights, Reading, UK",
//         reporter: "Sarah Johnson",
//         reportDate: "2025-04-27T14:15:00",
//         status: "in-progress",
//         description: "Residents experiencing low water pressure for over 72 hours. Affects approximately 150 households. Local water utility has been notified but no resolution yet.",
//         images: [4, 5],
//         severity: "medium"
//     },
//     {
//         id: 3,
//         title: "Broken Water Main",
//         type: "infrastructure",
//         location: { lat: 51.4816, lng: -0.5917 }, // Slough coordinates
//         address: "High Street, Slough, UK",
//         reporter: "Mike Taylor",
//         reportDate: "2025-04-26T08:45:00",
//         status: "in-progress",
//         description: "Major water main break causing flooding on High Street. Water service disrupted to multiple businesses. Emergency repair crews are on site.",
//         images: [6, 7, 8],
//         severity: "high"
//     },
//     {
//         id: 4,
//         title: "Algal Bloom in Lake",
//         type: "pollution",
//         location: { lat: 51.6295, lng: -1.1256 }, // Didcot coordinates
//         address: "Ladygrove Lake, Didcot, UK",
//         reporter: "Emma Wilson",
//         reportDate: "2025-04-25T16:20:00",
//         status: "pending",
//         description: "Extensive algal bloom covering approximately 40% of the lake surface. Concerns about toxicity and impact on wildlife and recreational activities.",
//         images: [9, 10],
//         severity: "medium"
//     },
//     {
//         id: 5,
//         title: "Well Contamination",
//         type: "pollution",
//         location: { lat: 51.5363, lng: -1.3289 }, // Wantage coordinates
//         address: "Rural area outside Wantage, UK",
//         reporter: "Robert Brown",
//         reportDate: "2025-04-24T11:10:00",
//         status: "resolved",
//         description: "Private well serving 5 households tested positive for E. coli contamination. Source identified as agricultural runoff. Treatment system installed.",
//         images: [11],
//         severity: "high"
//     },
//     {
//         id: 6,
//         title: "Drought Affecting Agricultural Area",
//         type: "scarcity",
//         location: { lat: 51.3348, lng: -0.7416 }, // Camberley coordinates
//         address: "Farmland near Camberley, UK",
//         reporter: "James Wilson",
//         reportDate: "2025-04-23T09:00:00",
//         status: "pending",
//         description: "Extended period without rainfall causing drought conditions. Crop yield expected to be reduced by 30%. Irrigation systems unable to compensate.",
//         images: [12, 13],
//         severity: "high"
//     },
//     {
//         id: 7,
//         title: "Sewage Overflow",
//         type: "infrastructure",
//         location: { lat: 51.4839, lng: -0.6044 }, // Windsor coordinates
//         address: "Riverside area, Windsor, UK",
//         reporter: "Lisa Chen",
//         reportDate: "2025-04-22T15:40:00",
//         status: "resolved",
//         description: "Sewage system overflow following heavy rainfall. Contamination of local stream. Issue resolved after repair of faulty pumping station.",
//         images: [14, 15, 16],
//         severity: "high"
//     }
// ];

// DOM elements
const reportsList = document.getElementById('reports-list');
const reportModal = document.getElementById('report-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.querySelector('.close-modal');
const closeReportBtn = document.getElementById('close-report-btn');
const markSolvedBtn = document.getElementById('mark-solved-btn');

// Map variables
let map;
let markers = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    populateReportsList();
    setupEventListeners();
    // The map will be initialized by the Google Maps API callback
});

// Initialize Google Maps
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
    loadSavedReports();
}

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

// function initMap() {
//     // Create a map centered on UK
//     map = new google.maps.Map(document.getElementById('map'), {
//         center: { lat: 51.509865, lng: -0.118092 }, // London center
//         zoom: 7,
//         styles: mapStyles // Custom map styles defined below
//     });
    
//     // Add markers for all reports
//     addReportMarkers();
// }

// Populate the reports list
function populateReportsList() {
    reportsList.innerHTML = '';
    
    reportData.forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.dataset.id = report.id;
        
        const statusClass = report.status.replace(' ', '-');
        const dateObj = new Date(report.reportDate);
        const formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        reportItem.innerHTML = `
            <div class="report-icon ${report.type}">
                <i class="fas ${getIconForType(report.type)}"></i>
            </div>
            <div class="report-info">
                <div class="report-title">${report.title}</div>
                <div class="report-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${report.address}</span>
                    <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                </div>
            </div>
            <div class="report-status ${statusClass}">${capitalizeFirstLetter(report.status)}</div>
            <div class="report-actions">
                <button class="view-report-btn">View Details</button>
            </div>
        `;
        
        reportsList.appendChild(reportItem);
    });
}

// Add markers to the map
function addReportMarkers() {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    // Add new markers
    reportData.forEach(report => {
        const marker = new google.maps.Marker({
            position: report.location,
            map: map,
            title: report.title,
            icon: getMarkerIcon(report.type, report.status)
        });
        
        // Add click event to marker
        marker.addListener('click', () => {
            showReportDetails(report.id);
        });
        
        markers.push(marker);
    });
}

// Show report details in modal
function showReportDetails(reportId) {
    const report = reportData.find(r => r.id === reportId);
    if (!report) return;
    
    const dateObj = new Date(report.reportDate);
    const formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    // Update modal content
    modalBody.innerHTML = `
        <div class="report-detail-header">
            <div class="report-detail-icon ${report.type}">
                <i class="fas ${getIconForType(report.type)}"></i>
            </div>
            <div class="report-detail-title">
                <h3>${report.title}</h3>
                <div class="report-detail-status ${report.status}">${capitalizeFirstLetter(report.status)}</div>
            </div>
        </div>
        
        <div class="report-detail-info">
            <div class="info-item">
                <h4>Reporter</h4>
                <p>${report.reporter}</p>
            </div>
            <div class="info-item">
                <h4>Report Date</h4>
                <p>${formattedDate}</p>
            </div>
            <div class="info-item">
                <h4>Location</h4>
                <p>${report.address}</p>
            </div>
            <div class="info-item">
                <h4>Severity</h4>
                <p>${capitalizeFirstLetter(report.severity)}</p>
            </div>
        </div>
        
        <div class="report-detail-description">
            <h4>Description</h4>
            <p>${report.description}</p>
        </div>
        
        <div class="report-detail-images">
            <h4>Images</h4>
            <div class="images-grid">
                ${report.images.map(imgId => `
                    <div class="image-item">
                        <img src="/api/placeholder/300/200" alt="Report image ${imgId}">
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="report-detail-map" id="detail-map"></div>
    `;
    
    // Update Mark as Solved button state
    if (report.status === 'resolved') {
        markSolvedBtn.disabled = true;
        markSolvedBtn.classList.add('disabled');
    } else {
        markSolvedBtn.disabled = false;
        markSolvedBtn.classList.remove('disabled');
    }
    
    // Show the modal
    reportModal.classList.add('show');
    
    // Initialize the detail map
    setTimeout(() => {
        const detailMap = new google.maps.Map(document.getElementById('detail-map'), {
            center: report.location,
            zoom: 14,
            styles: mapStyles
        });
        
        new google.maps.Marker({
            position: report.location,
            map: detailMap,
            title: report.title,
            icon: getMarkerIcon(report.type, report.status)
        });
    }, 100);
}

// Set up event listeners
function setupEventListeners() {
    // View report details
    reportsList.addEventListener('click', (e) => {
        const viewButton = e.target.closest('.view-report-btn');
        if (viewButton) {
            const reportItem = viewButton.closest('.report-item');
            const reportId = parseInt(reportItem.dataset.id);
            showReportDetails(reportId);
        }
    });
    
    // Close modal
    closeModalBtn.addEventListener('click', () => {
        reportModal.classList.remove('show');
    });
    
    closeReportBtn.addEventListener('click', () => {
        reportModal.classList.remove('show');
    });
    
    // Mark as solved
    markSolvedBtn.addEventListener('click', () => {
        const reportId = parseInt(modalBody.querySelector('.report-detail-header').dataset.reportId);
        markReportAsSolved(reportId);
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            reportModal.classList.remove('show');
        }
    });
}

// Mark report as solved
function markReportAsSolved(reportId) {
    // Find the report in the data
    const reportIndex = reportData.findIndex(r => r.id === reportId);
    if (reportIndex === -1) return;
    
    // Update status
    reportData[reportIndex].status = 'resolved';
    
    // Update UI
    populateReportsList();
    addReportMarkers();
    
    // Close modal
    reportModal.classList.remove('show');
    
    // Show success message
    showNotification('Report marked as solved successfully');
}

// Helper function to get icon for report type
function getIconForType(type) {
    switch (type) {
        case 'pollution':
            return 'fa-skull-crossbones';
        case 'scarcity':
            return 'fa-tint-slash';
        case 'infrastructure':
            return 'fa-tools';
        default:
            return 'fa-exclamation-circle';
    }
}

// Helper function to get marker icon for map
function getMarkerIcon(type, status) {
    let color;
    
    if (status === 'resolved') {
        color = '#4CAF50'; // Green for resolved
    } else {
        switch (type) {
            case 'pollution':
                color = '#F44336'; // Red
                break;
            case 'scarcity':
                color = '#2196F3'; // Blue
                break;
            case 'infrastructure':
                color = '#FF9800'; // Orange
                break;
            default:
                color = '#9C27B0'; // Purple
        }
    }
    
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.9,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        scale: 10
    };
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Custom map styles for better visibility
const mapStyles = [
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e9e9e9"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 29
            },
            {
                "weight": 0.2
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 18
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            },
            {
                "lightness": 21
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dedede"
            },
            {
                "lightness": 21
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#fefefe"
            },
            {
                "lightness": 17
            },
            {
                "weight": 1.2
            }
        ]
    }
];

// Add CSS for notification toast
const style = document.createElement('style');
style.textContent = `
    .notification-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1100;
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s, opacity 0.3s;
    }
    
    .notification-toast.show {
        transform: translateY(0);
        opacity: 1;
    }
`;
document.head.appendChild(style);

// edits on 20/5/2025
