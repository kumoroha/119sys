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
        
        // ジオコーディングを使用して場所を取得
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    const newEmergency = { id: emergencies.length + 1, location, type, lat, lon, status: '保留' };
                    emergencies.push(newEmergency);
                    alert('緊急通報が正常に送信されました！');

                    const marker = L.marker([lat, lon]).addTo(map)
                        .bindPopup(`<b>${location}</b><br>${type}`).openPopup();
                    map.setView([lat, lon], 13);

                    // 指令の欄を表示
                    dispatchSection.classList.remove('hidden');
                } else {
                    alert('場所が見つかりませんでした。');
                }
            });
    });

    dispatchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const vehicleType = document.getElementById('vehicle-type').value;
        const vehicleName = document.getElementById('vehicle-name').value;
        const latestEmergency = emergencies[emergencies.length - 1];
        if (!latestEmergency) {
            alert('緊急通報がありません。');
            return;
        }
        const dispatchItem = document.createElement('li');
        dispatchItem.textContent = `${vehicleType} (${vehicleName}) を ${latestEmergency.location} に出動させました (${latestEmergency.type})`;
        dispatchList.appendChild(dispatchItem);
        alert(`${vehicleType} (${vehicleName}) を ${latestEmergency.location} に出動させました (${latestEmergency.type})`);

        // 車両のピンを現場の周囲に表示し、移動させる
        setTimeout(() => {
            const emergencyLat = latestEmergency.lat;
            const emergencyLon = latestEmergency.lon;
            const initialLat = emergencyLat + (Math.random() * 0.02 - 0.01); // 1km以内のランダムな初期位置
            const initialLon = emergencyLon + (Math.random() * 0.02 - 0.01);
            const vehicleMarker = L.marker([initialLat, initialLon], { title: vehicleName }).addTo(map)
                .bindPopup(`<b>${vehicleType} (${vehicleName})</b><br>移動中...`).openPopup();

            // 16秒間で車両を移動させる
            const moveVehicle = (startLat, startLon, endLat, endLon, duration) => {
                const startTime = new Date().getTime();
                const animate = () => {
                    const currentTime = new Date().getTime();
                    const elapsedTime = currentTime - startTime;
                    const progress = elapsedTime / duration;
                    if (progress < 1) {
                        const currentLat = startLat + (endLat - startLat) * progress;
                        const currentLon = startLon + (endLon - startLon) * progress;
                        vehicleMarker.setLatLng([currentLat, currentLon]);
                        requestAnimationFrame(animate);
                    } else {
                        vehicleMarker.setLatLng([endLat, endLon]);
                        vehicleMarker.bindPopup(`<b>${vehicleType} (${vehicleName})</b><br>作業中...`).openPopup();

                        // 作業中表示後、数秒後にピンを消す
                        setTimeout(() => {
                            map.removeLayer(vehicleMarker);
                        }, Math.random() * 5000 + 10000); // 10秒から15秒の間でピンを消す
                    }
                };
                animate();
            };

            moveVehicle(initialLat, initialLon, emergencyLat, emergencyLon, 16000); // 16秒間で移動
        }, Math.random() * 5000 + 2000); // 2秒から7秒後に車両のピンを表示
    });
});
