document.addEventListener('DOMContentLoaded', () => {
    const userList = document.getElementById('user-list');
    const emergencyList = document.getElementById('emergency-list');
    const firefighterEmergencyList = document.getElementById('firefighter-emergency-list');
    const emergencyForm = document.getElementById('emergency-form');

    // Mock data
    const users = ['User1', 'User2', 'User3'];
    const emergencies = [
        { id: 1, location: 'Location1', description: 'Description1', status: 'Pending' },
        { id: 2, location: 'Location2', description: 'Description2', status: 'Pending' }
    ];

    // Display users in Admin Dashboard
    if (userList) {
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;
            userList.appendChild(li);
        });
    }

    // Display emergencies in Admin Dashboard
    if (emergencyList) {
        emergencies.forEach(emergency => {
            const li = document.createElement('li');
            li.textContent = `${emergency.location} - ${emergency.description} - ${emergency.status}`;
            emergencyList.appendChild(li);
        });
    }

    // Display emergencies in Firefighter Dashboard
    if (firefighterEmergencyList) {
        emergencies.forEach(emergency => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${emergency.location} - ${emergency.description}
                <button onclick="updateStatus(${emergency.id}, 'In Progress')">In Progress</button>
                <button onclick="updateStatus(${emergency.id}, 'Resolved')">Resolved</button>
            `;
            firefighterEmergencyList.appendChild(li);
        });
    }

    // Handle emergency form submission
    if (emergencyForm) {
        emergencyForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const location = document.getElementById('location').value;
            const description = document.getElementById('description').value;
            const newEmergency = { id: emergencies.length + 1, location, description, status: 'Pending' };
            emergencies.push(newEmergency);
            alert('Emergency reported successfully!');
        });
    }
});

// Function to update emergency status
function updateStatus(id, status) {
    const emergency = emergencies.find(emergency => emergency.id === id);
    if (emergency) {
        emergency.status = status;
        alert(`Emergency status updated to ${status}`);
    }
}

// Function to show different sections
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}
