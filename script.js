document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([35.6895, 139.6917], 13); // 初期表示を東京に設定

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    const emergencyForm = document.getElementById('emergency-form');
    const dispatchSection = document.getElementById('dispatch');
    const dispatchList = document.getElementById('dispatch-list');
    const dispatchForm = document.getElementById('dispatch-form');
    const emergencies = [];

    emergencyForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const location = document.getElementById('location').value;
        const type = document.getElementById('type').value;
        const newEmergency = { id: emergencies.length + 1, location, type, status: '保留' };
        emergencies.push(newEmergency);
        alert('緊急通報が正常に送信されました！');

        // ジオコーディングを使用して場所を取得し、地図にピンを追加
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const lat = data[0].lat;
                    const lon = data[0].lon;
                    const marker = L.marker([lat, lon]).addTo(map)
                        .bindPopup(`<b>${location}</b><br>${type}`).openPopup();
                    map.setView([lat, lon], 13);
                } else {
                    alert('場所が見つかりませんでした。');
                }
            });

        // 指令の欄を表示
        dispatchSection.classList.remove('hidden');
    });

    dispatchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const vehicleType = document.getElementById('vehicle-type').value;
        const vehicleName = document.getElementById('vehicle-name').value;
        const latestEmergency = emergencies[emergencies.length - 1];
        const dispatchItem = document.createElement('li');
        dispatchItem.textContent = `${vehicleType} (${vehicleName}) を ${latestEmergency.location} に出動させました (${latestEmergency.type})`;
        dispatchList.appendChild(dispatchItem);
        alert(`${vehicleType} (${vehicleName}) を ${latestEmergency.location} に出動させました (${latestEmergency.type})`);
    });
});
