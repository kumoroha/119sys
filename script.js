document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([34.6937, 135.5023], 11); // 初期表示を大阪に設定し、ズーム度を11に設定

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    const emergencyForm = document.getElementById('emergency-form');
    const confirmationSection = document.getElementById('confirmation');
    const dispatchSection = document.getElementById('dispatch');
    const dispatchList = document.getElementById('dispatch-list');
    const dispatchForm = document.getElementById('dispatch-form');
    const confirmDisasterBtn = document.getElementById('confirm-disaster');
    const cancelReportBtn = document.getElementById('cancel-report');
    const emergencies = [];
    let currentMarker;

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

                    currentMarker = L.marker([lat, lon], { icon: createReportIcon() }).addTo(map)
                        .bindPopup(`<b>${location}</b><br>${type}`).openPopup();
                    map.setView([lat, lon], 17); // ピンが表示された時のズーム度を17に設定

                    // 確認のセクションを表示
                    confirmationSection.classList.remove('hidden');
                } else {
                    alert('場所が見つかりませんでした。');
                }
            });
    });

    confirmDisasterBtn.addEventListener('click', () => {
        if (currentMarker) {
            currentMarker.setIcon(createDisasterIcon());
            confirmationSection.classList.add('hidden');
            dispatchSection.classList.remove('hidden');
        }
    });

    cancelReportBtn.addEventListener('click', () => {
        if (currentMarker) {
            map.removeLayer(currentMarker);
            confirmationSection.classList.add('hidden');
        }
    });

    dispatchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const vehicleType = document.getElementById('vehicle-type').value;
        const vehicleName = document.getElementById('vehicle-name').value;
        const assistanceRequest = document.getElementById('assistance-request').value;
        const assistanceType = document.getElementById('assistance-type').value;
        const latestEmergency = emergencies[emergencies.length - 1];
        if (!latestEmergency) {
            alert('緊急通報がありません。');
            return;
        }
        const dispatchItem = document.createElement('li');
        dispatchItem.textContent = `${vehicleType} (${vehicleName}) を ${latestEmergency.location} に出動させました (${latestEmergency.type})`;
        dispatchList.appendChild(dispatchItem);
        alert(`${vehicleType} (${vehicleName}) を ${latestEmergency.location} に出動させました (${latestEmergency.type})`);

        if (assistanceRequest) {
            const assistanceItem = document.createElement('li');
            assistanceItem.textContent = `他局への応援要請: ${assistanceRequest} (${assistanceType || '部隊の種類未指定'}) を ${latestEmergency.location} に出動させました (${最新の緊急.type})`;
            dispatchList.appendChild(assistanceItem);
            alert(`他局への応援要請: ${assistanceRequest} (${assistanceType || '部隊の種類未指定'}) を ${最新の緊急.location} に出動させました (${最新の緊急.type})`);
        }

        // 車両のピンを現場の周囲に表示し、移動させる
        setTimeout(() => {
            const emergencyLat = 最新の緊急.lat;
            const emergencyLon = 最新の緊急.lon;
            const initialLat = emergencyLat + (Math.random() * 0.02 - 0.01); // 1km以内のランダムな初期位置
            const initialLon = emergencyLon + (Math.random() * 0.02 - 0.01);
            const endLat = emergencyLat + (Math.random() * 0.001 - 0.0005); // 50m以内のランダムな到着位置
            const endLon = emergencyLon + (Math.random() * 0.001 - 0.0005);
            const vehicleMarker = L.marker([initialLat, initialLon], { icon: createVehicleMarkerIcon(vehicleType) }).addTo(map)
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

            moveVehicle(initialLat, initialLon, endLat, endLon, 16000); // 16秒間で移動
        }, Math.random() * 5000 + 2000); // 2秒から7秒後に車両のピンを表示
    });

    function createMarkerIcon(color) {
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 16],
            popupAnchor: [0, -16]
        });
    }

    function createReportIcon() {
        return L.divIcon({
            className: 'report-marker',
            html: `<div style="border: 3px solid yellow; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: yellow;">通</div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 16],
            popupAnchor: [0, -16]
        });
    }

    function createDisasterIcon() {
        return L.divIcon({
            className: 'disaster-marker',
            html: `<div style="border: 3px solid red; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: red;">災</div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 16],
            popupAnchor: [0, -16]
        });
    }

    function createVehicleMarkerIcon(vehicleType) {
        let color, text, textColor = 'black';
        switch (vehicleType) {
            case '消防車':
                color = 'red';
                text = '消';
                textColor = 'white';
                break;
            case '救急車':
                color = 'white';
                text = '救';
                break;
            case '救助工作車':
                color = 'orange';
                text = 'レ';
                break;
            case 'ヘリコプター':
                color = 'skyblue';
                text = 'ヘ';
                break;
            default:
                color = 'lightgray';
                text = '他';
                break;
        }
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${textColor};">${text}</div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 16],
            popupAnchor: [0, -16]
        });
    }
});
