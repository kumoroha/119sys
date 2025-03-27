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
    const commonReportBtn = document.getElementById('common-report');
    const emergencies = [];
    let currentMarker;

    const emergencyTypes = ["建物火災", "車両火災", "森林火災", "救急", "救助", "事故", "その他"];

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
            assistanceItem.textContent = `他局への応援要請: ${assistanceRequest} (${assistanceType || '部隊の種類未指定'}) を ${latestEmergency.location} に出動させました (${latestEmergency.type})`;
            dispatchList.appendChild(assistanceItem);
            alert(`他局への応援要請: ${assistanceRequest} (${assistanceType || '部隊の種類未指定'}) を ${latestEmergency.location} に出動させました (${latestEmergency.type})`);

            // 応援車両のピンを現場の周囲に表示し、移動させる
            setTimeout(() => {
                const emergencyLat = latestEmergency.lat;
                const emergencyLon = latestEmergency.lon;
                const initialLat = emergencyLat + (Math.random() * 0.02 - 0.01); // 1km以内のランダムな初期位置
                const initialLon = emergencyLon + (Math.random() * 0.02 - 0.01);
                const endLat = emergencyLat + (Math.random() * 0.001 - 0.0005); // 50m以内のランダムな到着位置
                const endLon = emergencyLon + (Math.random() * 0.001 - 0.0005);
                const assistanceMarker = L.marker([initialLat, initialLon], { icon: createVehicleMarkerIcon(assistanceType) }).addTo(map)
                    .bindPopup(`<b>${assistanceType} (${assistanceRequest})</b><br>移動中...`).openPopup();

                // 60秒間で車両を移動させる
                const moveVehicle = (startLat, startLon, endLat, endLon, duration) => {
                    const startTime = new Date().getTime();
                    const animate = () => {
                        const currentTime = new Date().getTime();
                        const elapsedTime = currentTime - startTime;
                        const progress = elapsedTime / duration;
                        if (progress < 1) {
                            const currentLat = startLat + (endLat - startLat) * progress;
                            const currentLon = startLon + (endLon - startLon) * progress;
                            assistanceMarker.setLatLng([currentLat, currentLon]);
                            requestAnimationFrame(animate);
                        } else {
                            assistanceMarker.setLatLng([endLat, endLon]);
                            assistanceMarker.bindPopup(`<b>${assistanceType} (${assistanceRequest})</b><br>作業中...`).openPopup();

                            // 作業中表示後、数秒後にピンを消す
                            setTimeout(() => {
                                map.removeLayer(assistanceMarker);
                            }, Math.random() * 5000 + 10000); // 10秒から15秒の間でピンを消す
                        }
                    };
                    animate();
                };

                moveVehicle(initialLat, initialLon, endLat, endLon, 60000); // 60秒間で移動
            }, Math.random() * 5000 + 2000); // 2秒から7秒後に車両のピンを表示
        }

        // 車両のピンを現場の周囲に表示し、移動させる
        setTimeout(() => {
            const emergencyLat = latestEmergency.lat;
            const emergencyLon = latestEmergency.lon;
            const initialLat = emergencyLat + (Math.random() * 0.02 - 0.01); // 1km以内のランダムな初期位置
            const initialLon = emergencyLon + (Math.random() * 0.02 - 0.01);
            const endLat = emergencyLat + (Math.random() * 0.001 - 0.0005); // 50m以内のランダムな到着位置
            const endLon = emergencyLon + (Math.random() * 0.001 - 0.0005);
            const vehicleMarker = L.marker([initialLat, initialLon], { icon: createVehicleMarkerIcon(vehicleType) }).addTo(map)
                .bindPopup(`<b>${vehicleType} (${vehicleName})</b><br>移動中...`).openPopup();

            // 60秒間で車両を移動させる
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

            moveVehicle(initialLat, initialLon, endLat, endLon, 60000); // 60秒間で移動
        }, Math.random() * 5000 + 2000); // 2秒から7秒後に車両のピンを表示
    });

    commonReportBtn.addEventListener('click', () => {
        // 日本の陸地範囲内からランダムな緯度と経度を選択
        const latLonPairs = [
            {lat: 43.06417, lon: 141.34694}, // 札幌
            {lat: 35.6895, lon: 139.69171},  // 東京
            {lat: 34.69374, lon: 135.50218}, // 大阪
            {lat: 35.18147, lon: 136.90641}, // 名古屋
            {lat: 33.59035, lon: 130.40171}, // 福岡
            {lat: 37.90222, lon: 139.02361}, // 新潟
            {lat: 26.2125, lon: 127.68111},  // 那覇
            {lat: 32.75028, lon: 129.8775},  // 長崎
            {lat: 31.91111, lon: 131.42389}, // 宮崎
            {lat: 34.68528, lon: 135.805},   // 奈良
            {lat: 34.2275, lon: 135.1675},   // 和歌山
            {lat: 35.02139, lon: 135.75556}, // 京都
            {lat: 34.39639, lon: 132.45944}, // 広島
            {lat: 36.65139, lon: 138.18111}, // 長野
            {lat: 36.56583, lon: 139.88361}, // 宇都宮
            {lat: 34.06667, lon: 131.8},     // 山口
            {lat: 38.26889, lon: 140.87222}, // 仙台
            {lat: 35.44333, lon: 139.63806}, // 横浜
            {lat: 43.80306, lon: 142.8525},  // 旭川
            {lat: 35.18028, lon: 136.90667}, // 名古屋
            {lat: 33.24944, lon: 130.29889}, // 熊本
            {lat: 33.60639, lon: 130.41806}, // 北九州
            {lat: 34.69389, lon: 135.50222}, // 大阪
            {lat: 43.06417, lon: 141.34694}, // 札幌
            {lat: 35.6895, lon: 139.69171},  // 東京
            {lat: 34.69374, lon: 135.50218}, // 大阪
            {lat: 33.59035, lon: 130.40171}, // 福岡
            {lat: 35.01167, lon: 135.76833}, // 京都
            {lat: 35.18147, lon: 136.90641}, // 名古屋
            {lat: 34.22611, lon: 135.1675},  // 和歌山
            {lat: 34.2275, lon: 135.1675},   // 和歌山
            {lat: 35.02139, lon: 135.75556}, // 京都
            {lat: 34.39639, lon: 132.45944}, // 広島
            {lat: 36.65139, lon: 138.18111}, // 長野
            {lat: 36.56583, lon: 139.88361}, // 宇都宮
            {lat: 34.06667, lon: 131.8},     // 山口
            {lat: 38.26889, lon: 140.87222}, // 仙台
            {lat: 35.44333, lon: 139.63806}, // 横浜
            {lat: 43.80306, lon: 142.8525},  // 旭川
            {lat: 35.18028, lon: 136.90667}, // 名古屋
            {lat: 33.24944, lon: 130.29889}, // 熊本
            {lat: 33.60639, lon: 130.41806}, // 北九州
            {lat: 34.69389, lon: 135.50222}, // 大阪
            {lat: 43.06417, lon: 141.34694}, // 札幌
            {lat: 35.6895, lon: 139.69171},  // 東京
            {lat: 35.658581, lon: 139.745433}, // 東京タワー
            {lat: 35.710063, lon: 139.8107}, // 浅草寺
            {lat: 34.96714, lon: 138.3831}, // 富士山
            {lat: 36.204824, lon: 138.252924}, // 長野
            {lat: 35.011636, lon: 135.768029}, // 京都
            {lat: 34.693737, lon: 135.502165}, // 大阪
            {lat: 33.60639, lon: 130.41806}, // 博多
            {lat: 31.596553, lon: 130.557115}, // 鹿児島
        ];
        const randomLocation = latLonPairs[Math.floor(Math.random() * latLonPairs.length)];
        const randomType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];

        const locationTextBox = document.getElementById('location');
        const typeDropdown = document.getElementById('type');

        locationTextBox.value = `${randomLocation.lat.toFixed(6)}, ${randomLocation.lon.toFixed(6)}`;
        typeDropdown.value = randomType;

        // 地図をリセット
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        const newEmergency = { id: emergencies.length + 1, location: locationTextBox.value, type: randomType, lat: randomLocation.lat, lon: randomLocation.lon, status: '保留' };
        emergencies.push(newEmergency);

        currentMarker = L.marker([randomLocation.lat, randomLocation.lon], { icon: createReportIcon() }).addTo(map)
            .bindPopup(`<b>${locationTextBox.value}</b><br>${randomType}`).openPopup();
        map.setView([randomLocation.lat, randomLocation.lon], 17); // ピンが表示された時のズーム度を17に設定

        // 確認のセクションを表示
        confirmationSection.classList.remove('hidden');
    });

    function createMarkerIcon(color) {
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [8, 20],
            popupAnchor: [0, -20]
        });
    }

    function createReportIcon() {
        return L.divIcon({
            className: 'report-marker',
            html: `<div style="border: 3px solid yellow; width: 20px; height: 20px; border-radius: 50%; font-size: 1.3em; display: flex; align-items: center; justify-content: center; font-weight: bold; color: yellow;">通</div>`,
            iconSize: [20, 20],
            iconAnchor: [8, 20],
            popupAnchor: [0, -20]
        });
    }

    function createDisasterIcon() {
        return L.divIcon({
            className: 'disaster-marker',
            html: `<div style="border: 3px solid red; width: 20px; height: 20px; border-radius: 50%; font-size: 1.3em; display: flex; align-items: center; justify-content: center; font-weight: bold; color: red;">災</div>`,
            iconSize: [20, 20],
            iconAnchor: [8, 20],
            popupAnchor: [0, -20]
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
                color = 'pink';
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
            className: 'vehicle-marker',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${textColor};">${text}</div>`,
            iconSize: [20, 20],
            iconAnchor: [8, 20],
            popupAnchor: [0, -20]
        });
    }
});
