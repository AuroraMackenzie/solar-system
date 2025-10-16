// 创建星星背景
function createStars() {
    const container = document.getElementById('container');
    const starCount = 800;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        const duration = Math.random() * 8 + 4;
        star.style.setProperty('--duration', `${duration}s`);
        container.appendChild(star);
    }
}

// 改进的音频自动播放处理
function enableAudio() {
    const backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.muted = false;
    
    // 尝试播放，处理可能的拒绝
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // 自动播放成功
            console.log("音频自动播放成功");
        }).catch(error => {
            // 自动播放被阻止，需要用户交互
            console.log("自动播放被阻止，等待用户交互");
            document.addEventListener('click', function userInteraction() {
                backgroundMusic.play();
                document.removeEventListener('click', userInteraction);
            });
        });
    }
}

// 主模拟程序
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    
    // 背景音乐控制
    const backgroundMusic = document.getElementById('backgroundMusic');
    const musicControl = document.getElementById('musicControl');
    const musicStatus = document.getElementById('musicStatus');
    let musicPlaying = false;

    // 用户第一次点击页面任意地方后自动播放音乐（仅执行一次）
    document.addEventListener('click', function enableAudio() {
        backgroundMusic.muted = false;   // 解除静音
        backgroundMusic.play().catch(e => console.log("播放被阻止：", e));
        document.removeEventListener('click', enableAudio); // 只执行一次
    });

    // "Music" 按钮控制播放 / 暂停（带淡入效果）
    musicControl.addEventListener('click', function() {
        // 如果音频仍是静音状态，则先解除静音
        if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
        }

        if (musicPlaying) {
            backgroundMusic.pause();
            musicStatus.textContent = '🔇';
            musicPlaying = false;
        } else {
            backgroundMusic.volume = 0; // 从 0 音量开始
            backgroundMusic.play().then(() => {
                // 使用定时器实现平滑淡入
                let fadeIn = setInterval(() => {
                    if (backgroundMusic.volume < 0.5) { // 可调目标音量
                        backgroundMusic.volume += 0.02; // 每次提升幅度
                    } else {
                        backgroundMusic.volume = 0.5; // 最终音量
                        clearInterval(fadeIn);
                    }
                }, 250); // 每 250 毫秒提升一次音量
            }).catch(e => console.log("播放被阻止：", e));

            musicStatus.textContent = '🔊';
            musicPlaying = true;
        }
    });

    // 隐藏加载屏幕
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 1000);
    }, 2000);
    
    const container = document.getElementById('container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050a15);
    
    // 创建相机 - 使用扩展范围
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1e9);
    camera.position.set(0, 280, 620);
    
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    const labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);
    
    // 使用扩展控制范围
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 30000000;
    controls.minDistance = 60;
    controls.target.set(0, 0, 0);
    
    const ambientLight = new THREE.AmbientLight(0x333344);
    scene.add(ambientLight);
    
    const sunLight = new THREE.PointLight(0xffdd99, 3.5, 0, 0.5);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    // 使用太阳光晕效果
    const sunGlowGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa33,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    sunGlow.scale.set(40, 40, 40);
    scene.add(sunGlow);
    
    // 使用行星数据（更详细）
    const AU = 150;
    const bodies = [
        {
            key: 'sun',
            name: 'Sun',
            color: '#FFB84D',
            radius: 30,
            distance: 0,
            orbitalDays: Infinity,
            rotationHours: 609.12,
            tilt: 7.25,
            type: 'G2V Yellow Dwarf',
            info: {
                Diameter: '1.3927 million km',
                Mass: '1.989 × 10³⁰ kg',
                'Surface Temp': '5,778 K',
                Composition: 'Hydrogen (74%), Helium (24%)',
                Age: '4.6 billion years'
            },
            description: 'The Sun is the star at the center of our Solar System. It accounts for 99.86% of the total mass of the Solar System and is the primary source of energy for life on Earth.'
        },
        {
            key: 'mercury',
            name: 'Mercury',
            color: '#B1B1B1',
            radius: 4.8,
            distance: 0.39,
            orbitalDays: 88,
            rotationHours: 1407.6,
            tilt: 0.03,
            type: 'Terrestrial Planet',
            info: {
                Diameter: '4,879 km',
                'Orbital Period': '88 days',
                'Rotation Period': '58.6 days',
                Temperature: '-173°C to 427°C',
                Moons: '0'
            },
            description: 'Mercury is the smallest and innermost planet in the Solar System. It has no atmosphere to retain heat, leading to extreme temperature variations between day and night.'
        },
        {
            key: 'venus',
            name: 'Venus',
            color: '#F6D7A8',
            radius: 11.9,
            distance: 0.72,
            orbitalDays: 224.7,
            rotationHours: -5832.5,
            tilt: 177.4,
            type: 'Terrestrial Planet',
            info: {
                Diameter: '12,104 km',
                'Orbital Period': '225 days',
                'Rotation Period': '243 days (retrograde)',
                Temperature: '462°C',
                Atmosphere: '96.5% CO₂'
            },
            description: 'Venus is the second planet from the Sun and is similar in size to Earth. It has the densest atmosphere of the terrestrial planets, consisting mostly of carbon dioxide, and experiences a runaway greenhouse effect.'
        },
        {
            key: 'earth',
            name: 'Earth',
            color: '#5DBBFF',
            radius: 12.6,
            distance: 1.00,
            orbitalDays: 365.25,
            rotationHours: 23.93,
            tilt: 23.44,
            type: 'Terrestrial Planet',
            info: {
                Diameter: '12,742 km',
                'Orbital Period': '365.25 days',
                'Rotation Period': '23h 56m',
                Temperature: '−89°C to 58°C',
                Moons: '1 (Luna)'
            },
            description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 29% of Earth\'s surface is land, with the remaining 71% covered by water.'
        },
        {
            key: 'mars',
            name: 'Mars',
            color: '#FF7B55',
            radius: 6.7,
            distance: 1.52,
            orbitalDays: 687,
            rotationHours: 24.6,
            tilt: 25.19,
            type: 'Terrestrial Planet',
            info: {
                Diameter: '6,779 km',
                'Orbital Period': '687 days',
                'Rotation Period': '24.6 hours',
                Temperature: '−125°C to 20°C',
                Moons: '2 (Phobos, Deimos)'
            },
            description: 'Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. It has a thin atmosphere and surface features reminiscent of impact craters, valleys, dunes, and polar ice caps.'
        },
        {
            key: 'jupiter',
            name: 'Jupiter',
            color: '#E3C9A6',
            radius: 45.4,
            distance: 5.20,
            orbitalDays: 4331,
            rotationHours: 9.93,
            tilt: 3.13,
            type: 'Gas Giant',
            info: {
                Diameter: '139,820 km',
                'Orbital Period': '11.86 years',
                'Rotation Period': '9.93 hours',
                'Great Red Spot': 'Anticyclone storm',
                Moons: '79+'
            },
            description: 'Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all the other planets combined.'
        },
        {
            key: 'saturn',
            name: 'Saturn',
            color: '#E2E2A0',
            radius: 38.2,
            distance: 9.58,
            orbitalDays: 10747,
            rotationHours: 10.7,
            tilt: 26.73,
            type: 'Gas Giant',
            info: {
                Diameter: '116,460 km',
                'Orbital Period': '29.4 years',
                'Rotation Period': '10.7 hours',
                Rings: 'Ice and rock particles',
                Moons: '82+ (Titan, Enceladus)'
            },
            description: 'Saturn is the sixth planet from the Sun and the second-largest in the Solar System. It is known for its prominent ring system, which consists of nine continuous main rings and three discontinuous arcs.'
        },
        {
            key: 'uranus',
            name: 'Uranus',
            color: '#A6F1F5',
            radius: 16.3,
            distance: 19.22,
            orbitalDays: 30589,
            rotationHours: -17.24,
            tilt: 97.77,
            type: 'Ice Giant',
            info: {
                Diameter: '50,724 km',
                'Orbital Period': '84 years',
                'Rotation Period': '17.2 hours (retrograde)',
                Tilt: '98° (sideways rotation)',
                Moons: '27'
            },
            description: 'Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest mass in the Solar System. Uranus rotates on its side, with an axial tilt of 98 degrees.'
        },
        {
            key: 'neptune',
            name: 'Neptune',
            color: '#5B7FFF',
            radius: 15.8,
            distance: 30.05,
            orbitalDays: 59800,
            rotationHours: 16.11,
            tilt: 28.32,
            type: 'Ice Giant',
            info: {
                Diameter: '49,244 km',
                'Orbital Period': '165 years',
                'Rotation Period': '16.1 hours',
                Atmosphere: 'Hydrogen, helium, methane',
                Moons: '14 (Triton)'
            },
            description: 'Neptune is the eighth and farthest known planet from the Sun. It is the fourth-largest planet by diameter and the third-largest by mass. Neptune has the strongest winds of any planet in the Solar System.'
        },
        {
            key: 'pluto',
            name: 'Pluto',
            color: '#C2B280',
            radius: 2.4,
            distance: 39.48,
            orbitalDays: 90560,
            rotationHours: 153.29,
            tilt: 122.53,
            type: 'Dwarf Planet',
            info: {
                Diameter: '2,376 km',
                'Orbital Period': '248 years',
                'Rotation Period': '6.4 days',
                Moons: '5 (Charon)',
                Classification: 'Kuiper Belt Object'
            },
            description: 'Pluto is a dwarf planet in the Kuiper belt, a ring of bodies beyond the orbit of Neptune. It was the first Kuiper belt object to be discovered and is the largest known dwarf planet.'
        }
    ];
    
    const planets = {};
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);
    
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    
    const asteroidGroup = new THREE.Group();
    scene.add(asteroidGroup);
    const asteroidGeometry = new THREE.SphereGeometry(0.3, 6, 6);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    
    // 使用太阳材质
    const sunGeometry = new THREE.SphereGeometry(bodies[0].radius, 128, 128);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(bodies[0].color),
        emissive: new THREE.Color('#FF8C1A'),
        emissiveIntensity: 1.8
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = bodies[0];
    planetGroup.add(sun);
    
    const sunCoreGlow = new THREE.Mesh(
        new THREE.SphereGeometry(bodies[0].radius * 1.4, 64, 64),
        new THREE.MeshBasicMaterial({
            color: new THREE.Color('#FFA53A'),
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        })
    );
    sun.add(sunCoreGlow);
    
    for (let i = 1; i < bodies.length; i++) {
        const body = bodies[i];
        const orbitGeometry = new THREE.RingGeometry(body.distance * AU - 1, body.distance * AU + 1, 256);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0x4b5563),
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        orbitGroup.add(orbit);
        
        // 使用行星材质
        const planetGeometry = new THREE.SphereGeometry(body.radius, 64, 64);
        const planetMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(body.color),
            shininess: 30,
            specular: new THREE.Color(0x333333)
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.castShadow = true;
        planet.receiveShadow = true;
        planet.position.x = body.distance * AU;
        planet.userData = body;
        planetGroup.add(planet);
        planets[body.key] = planet;
        
        // 使用标签绑定方式
        const labelDiv = document.createElement('div');
        labelDiv.className = 'planet-label';
        labelDiv.textContent = body.name;
        labelDiv.style.color = body.color;
        labelDiv.style.fontSize = '16px';
        labelDiv.style.fontWeight = 'bold';
        labelDiv.style.textShadow = '0 0 8px rgba(0,0,0,0.7)';
        labelDiv.style.pointerEvents = 'none';
        
        const label = new THREE.CSS2DObject(labelDiv);
        label.position.set(0, body.radius + 8, 0);
        planet.add(label); // 标签绑定到行星
        
        // 创建小行星带
        if (body.key === 'mars') {
            const asteroidCount = 2000;
            const innerRadius = (bodies[4].distance * AU) + 30;
            const outerRadius = (bodies[5].distance * AU) - 30;
            
            for (let i = 0; i < asteroidCount; i++) {
                const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
                
                // 在小行星带中定位
                const angle = Math.random() * Math.PI * 2;
                const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
                const height = (Math.random() - 0.5) * 20;
                
                asteroid.position.x = Math.cos(angle) * distance;
                asteroid.position.z = Math.sin(angle) * distance;
                asteroid.position.y = height;
                
                // 随机旋转
                asteroid.rotation.x = Math.random() * Math.PI;
                asteroid.rotation.y = Math.random() * Math.PI;
                asteroid.rotation.z = Math.random() * Math.PI;
                
                asteroidGroup.add(asteroid);
            }
        }
    }
    
    // 创建地球的月球
    const earthPlanet = planets.earth;
    if (earthPlanet) {
        const moonBody = {
            key: 'moon',
            name: 'Moon',
            color: '#cfd6ff',
            radius: 3.4,
            distance: 20,
            orbitalDays: 27.3,
            rotationHours: 655.7,
            tilt: 6.68,
            type: 'Natural Satellite',
            info: {
                Diameter: '3,474 km',
                'Orbital Period': '27.3 days',
                'Rotation Period': '27.3 days',
                Temperature: '-173°C to 127°C',
                Gravity: '16.6% of Earth'
            },
            description: 'The Moon is Earth\'s only natural satellite. It is the fifth largest satellite in the Solar System and the largest relative to its parent planet. The Moon is tidally locked to Earth, always showing the same face.'
        };
        
        const moonGeometry = new THREE.SphereGeometry(moonBody.radius, 32, 32);
        const moonMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(moonBody.color),
            shininess: 20
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.castShadow = true;
        moon.receiveShadow = true;
        moon.position.x = moonBody.distance;
        moon.userData = moonBody;
        
        // 为月球轨道创建枢轴
        const moonPivot = new THREE.Object3D();
        earthPlanet.add(moonPivot);
        moonPivot.add(moon);
        
        planets.moon = moon;
    }
    
    // 时间控制变量
    let timeScale = 1.0;
    let playing = true;
    let elapsedTime = 0;
    
    // UI元素
    const timeSlider = document.getElementById('timeSlider');
    const timeValue = document.getElementById('timeValue');
    const playPauseBtn = document.getElementById('playPause');
    const slowerBtn = document.getElementById('slower');
    const fasterBtn = document.getElementById('faster');
    const resetCamBtn = document.getElementById('resetCam');
    const toggleOrbitsBtn = document.getElementById('toggleOrbits');
    const toggleLabelsBtn = document.getElementById('toggleLabels');
    const toggleAsteroidsBtn = document.getElementById('toggleAsteroids');
    const closePanelBtn = document.getElementById('closePanel');
    const infoPanel = document.getElementById('infoPanel');
    
    // UI事件处理
    timeSlider.addEventListener('input', function() {
        timeScale = this.value / 10;
        timeValue.textContent = timeScale.toFixed(1);
    });
    
    playPauseBtn.addEventListener('click', function() {
        playing = !playing;
        this.textContent = playing ? '⏸️' : '▶️';
    });
    
    slowerBtn.addEventListener('click', function() {
        timeScale = Math.max(0.1, timeScale - 0.5);
        timeSlider.value = timeScale * 10;
        timeValue.textContent = timeScale.toFixed(1);
    });
    
    fasterBtn.addEventListener('click', function() {
        timeScale = Math.min(20, timeScale + 0.5);
        timeSlider.value = timeScale * 10;
        timeValue.textContent = timeScale.toFixed(1);
    });
    
    resetCamBtn.addEventListener('click', function() {
        controls.reset();
        camera.position.set(0, 280, 620);
        controls.target.set(0, 0, 0);
    });
    
    toggleOrbitsBtn.addEventListener('click', function() {
        orbitGroup.visible = !orbitGroup.visible;
    });
    
    // 使用标签切换方式
    toggleLabelsBtn.addEventListener('click', function() {
        const labels = document.querySelectorAll('.planet-label');
        labels.forEach(label => {
            label.style.visibility = label.style.visibility === 'hidden' ? 'visible' : 'hidden';
        });
    });
    
    toggleAsteroidsBtn.addEventListener('click', function() {
        asteroidGroup.visible = !asteroidGroup.visible;
    });
    
    closePanelBtn.addEventListener('click', function() {
        infoPanel.classList.remove('active');
    });
    
    // 行星选择的射线投射器
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseClick(event) {
        // 计算标准化设备坐标中的鼠标位置
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // 使用相机和鼠标位置更新拾取射线
        raycaster.setFromCamera(mouse, camera);
        
        // 计算与拾取射线相交的对象
        const intersects = raycaster.intersectObjects(planetGroup.children);
        
        if (intersects.length > 0) {
            const planet = intersects[0].object;
            showPlanetInfo(planet.userData);
        }
    }
    
    window.addEventListener('click', onMouseClick, false);
    
    // 显示行星信息
    function showPlanetInfo(planetData) {
        document.getElementById('planetName').textContent = planetData.name;
        document.getElementById('planetType').textContent = planetData.type;
        document.getElementById('planetColor').style.backgroundColor = planetData.color;
        document.getElementById('planetColor').style.boxShadow = `0 0 15px ${planetData.color}`;
        document.getElementById('planetDescription').textContent = planetData.description;
        
        // 填充事实
        const factsGrid = document.getElementById('factsGrid');
        factsGrid.innerHTML = '';
        
        for (const [key, value] of Object.entries(planetData.info)) {
            const factItem = document.createElement('div');
            factItem.className = 'fact-item';
            
            const factLabel = document.createElement('div');
            factLabel.className = 'fact-label';
            factLabel.textContent = key;
            
            const factValue = document.createElement('div');
            factValue.className = 'fact-value';
            factValue.textContent = value;
            
            factItem.appendChild(factLabel);
            factItem.appendChild(factValue);
            factsGrid.appendChild(factItem);
        }
        
        infoPanel.classList.add('active');
    }
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        const delta = 0.016; // 固定增量时间以实现一致的动画
        
        // 如果正在播放，更新行星
        if (playing) {
            elapsedTime += delta * timeScale;
            
            // 更新行星位置
            for (let i = 1; i < bodies.length; i++) {
                const body = bodies[i];
                const planet = planets[body.key];
                
                if (planet) {
                    const angle = (elapsedTime / body.orbitalDays) * Math.PI * 2;
                    planet.position.x = Math.cos(angle) * body.distance * AU;
                    planet.position.z = Math.sin(angle) * body.distance * AU;
                    
                    // 旋转行星
                    planet.rotation.y += delta * (24 / body.rotationHours) * timeScale;
                }
            }
            
            // 更新月球位置
            const moon = planets.moon;
            if (moon) {
                const moonAngle = (elapsedTime / moon.userData.orbitalDays) * Math.PI * 2;
                moon.position.x = Math.cos(moonAngle) * moon.userData.distance;
                moon.position.z = Math.sin(moonAngle) * moon.userData.distance;
                
                // 旋转月球
                moon.rotation.y += delta * (24 / moon.userData.rotationHours) * timeScale;
            }
            
            // 动画太阳光晕
            sunGlow.scale.x = 40 + Math.sin(elapsedTime * 0.5) * 5;
            sunGlow.scale.y = 40 + Math.cos(elapsedTime * 0.5) * 5;
            sunGlow.scale.z = 40 + Math.sin(elapsedTime * 0.3) * 5;
        }
        
        // 更新控制
        controls.update();
        
        // 渲染场景
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }
    
    // 处理窗口调整大小
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    window.addEventListener('resize', onWindowResize, false);
    
    // 开始动画
    animate();
});
