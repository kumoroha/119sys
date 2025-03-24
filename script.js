document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([35.6895, 139.6917], 13); // Initial view set to Tokyo

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    const emergencyForm = document.getElementById('emergency-form');
    const dispatchSection = document.getElementById('dispatch');
    const dispatchList = document.getElementById('dispatch-list');
    const emergencies = [];

    emergencyForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const location = document.getElementById('location').value;
        const description = document.getElementById('description').value;
        const newEmergency = { id: emergencies.length + 1, location, description, status: 'Pending' };
        emergencies.push(newEmergency);
        alert('Emergency reported successfully!');

        // Add marker to map
        const marker = L.marker([35.6895, 139.6917]).addTo(map)
            .bindPopup(`<b>${location}</b><br>${description}`).openPopup();

        // Show dispatch section
        dispatchSection.classList.remove('hidden');
    });

    window.dispatchUnit = function(unitType) {
        const latestEmergency = emergencies[emergencies.length - 1];
        const dispatchItem = document.createElement('li');
        dispatchItem.textContent = `${unitType} dispatched to ${latestEmergency.location}`;
        dispatchList.appendChild(dispatchItem);
        alert(`${unitType} dispatched to ${latestEmergency.location}`);
    }
});
