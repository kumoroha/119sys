document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([35.6895, 139.6917], 13); // 初期表示を東京に設定

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
        const newEmergency = { id: emergencies.length + 1, location, description, status: '保留' };
        emergencies.push(newEmergency);
        alert('緊急通報が正常に送信されました！');

        // 地図にマーカーを追加
        const marker = L.marker([35.6895, 139.6917]).addTo(map)
            .bindPopup(`<b>${location}</b><br>${description}`).openPopup();

        // 指令の欄を表示
        dispatchSection.classList.remove('hidden');
    });

    window.dispatchUnit = function(unitType) {
        const latestEmergency = emergencies[emergencies.length - 1];
        const dispatchItem = document.createElement('li');
        dispatchItem.textContent = `${unitType}を${latestEmergency.location}に出動させました`;
        dispatchList.appendChild(dispatchItem);
        alert(`${unitType}を${latestEmergency.location}に出動させました`);
    }
});
