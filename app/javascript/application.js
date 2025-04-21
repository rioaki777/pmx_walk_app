// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
import * as THREE from 'three';
import { MMDLoader } from 'MMDLoader';
import { GLTFLoader } from 'GLTFLoader';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('three-container');
    
    if (container) {
        const scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(0, 19, 8);
        directionalLight.target.position.set(0, 15, 0);
        scene.add(directionalLight);
        scene.add(directionalLight.target);
    
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
        const renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0X006400, 1.0);
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
    
        const clock = new THREE.Clock();
        let mixer = null; // PMXアニメーション用
        let character = null; // キャラクターオブジェクト
        let moveSpeed = 0.07; // キャラクターの移動速度
    
        // マウス操作用変数
        let rotationX = 0; // 上下回転
        let rotationY = 0; // 左右回転
        let isMousePressed = false; // マウスクリック状態フラグ
        let cameraDistance = 1; // カメラとキャラクターの初期距離
        const minCameraDistance = 1; // 最小距離
        const maxCameraDistance = 5; // 最大距離

        // PMXモデルとVMDモーションを読み込む
        const loader = new MMDLoader();
        const pmxUrl = container.dataset.pmxUrl;
        const vmdUrl = container.dataset.vmdUrl;
        let walkAnimation;
    
        loader.load(pmxUrl, (mesh) => {
            loader.loadAnimation(vmdUrl, mesh, (animation) => {
                mesh.scale.set(0.1, 0.1, 0.1);
                scene.add(mesh);
        
                character = mesh; // キャラクターを格納
                mixer = new THREE.AnimationMixer(mesh);
                mixer.clipAction(animation).play();
        
                // キャラクターの初期向きをカメラの背後に設定
                character.rotation.y = Math.PI; // Y軸を基準に180度回転（カメラに背を向ける）
                walkAnimation = animation;
            });
        });
    
        const raycaster = new THREE.Raycaster();
        const groundObjects = []; // 地形オブジェクトを格納

        // glTFモデルを読み込む（マップ）
        const gltfLoader = new GLTFLoader();
        const gltfUrl = container.dataset.gltfUrl;
        const sakuraUrl = container.dataset.sakuraUrl;
    
        gltfLoader.load(
            gltfUrl,
            (gltf) => {
                const gltfScene = gltf.scene;
                gltfScene.position.set(0, 0, 0); // マップ位置調整
                scene.add(gltfScene);
        
                // 地形オブジェクトをgroundObjectsに追加
                gltfScene.traverse((child) => {
                    if (child.isMesh) {
                        groundObjects.push(child);
                    }
                });
            },
            undefined,
            (error) => {
                console.error("Error loading glTF model:", error);
            }
        );

        gltfLoader.load(
            sakuraUrl,
            (gltf) => {
                const sakuraModel = gltf.scene;
        
                // 桜を複数配置
                const sakuraCount = 20; // 桜の数
                const radius = 25; // 桜を配置する円の半径

                for (let i = 0; i < sakuraCount; i++) {
                    const clone = sakuraModel.clone();

                    const scale = 3;
                    clone.scale.set(scale, scale, scale);

                    // 円周上の位置を計算
                    const angle = (i / sakuraCount) * Math.PI * 2;
                    const x = radius * Math.cos(angle);
                    const z = radius * Math.sin(angle);
                    const y = -8;

                    clone.position.set(x, y, z);
                    scene.add(clone);
                }
            },
            undefined,
            (error) => {
                console.error("Error loading Sakura model:", error);
            }
        );
        

        function adjustCharacterHeight() {
            if (!character || groundObjects.length === 0) return;
        
            // レイキャストをキャラクターの真下に向ける
            raycaster.set(
                character.position.clone().add(new THREE.Vector3(0, 10, 0)), // キャラクターの少し上から開始
                new THREE.Vector3(0, -1, 0) // 下方向
            );
        
            const intersects = raycaster.intersectObjects(groundObjects, true);
            if (intersects.length > 0) {
                const groundHeight = intersects[0].point.y; // 地形の高さを取得
                character.position.y = groundHeight; // キャラクターの高さを地形に合わせる
            }
        }
    
        // キーボードイベントでキャラクターを移動
        const keys = {};
        window.addEventListener("keydown", (event) => {
            keys[event.key] = true;
        });
        window.addEventListener("keyup", (event) => {
            keys[event.key] = false;
        });
    
        window.addEventListener("wheel", (event) => {
            const scrollSpeed = 1; // スクロール速度
            cameraDistance += event.deltaY * 0.01 * scrollSpeed;
        
            // カメラ距離を制限
            cameraDistance = Math.max(minCameraDistance, Math.min(maxCameraDistance, cameraDistance));
        });

        // マウス操作で視点を変更（クリック中のみ）
        window.addEventListener("mousedown", () => {
            isMousePressed = true;
        });
    
        window.addEventListener("mouseup", () => {
            isMousePressed = false;
        });
    
        window.addEventListener("mousemove", (event) => {
            if (!isMousePressed) return; // クリック中でない場合は無視
    
            const sensitivity = 0.002; // マウス感度
            rotationY -= event.movementX * sensitivity; // 左右回転
            rotationX -= event.movementY * sensitivity; // 上下回転
            rotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationX)); // 上下回転の制限
        });
    
        function moveCharacter(delta) {
            if (!character) return;
        
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(character.quaternion);
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(character.quaternion);
            let moved = false;

            if (keys["w"]) character.position.add(forward.clone().multiplyScalar(-moveSpeed));
            if (keys["s"]) character.position.add(forward.clone().multiplyScalar(moveSpeed));
            if (keys["a"]) character.position.add(right.clone().multiplyScalar(moveSpeed));
            if (keys["d"]) character.position.add(right.clone().multiplyScalar(-moveSpeed));
            if (keys["w"] || keys["s"] || keys["a"] || keys["d"]) {
                moved = true;
            }

            if (moved) {
                const action = mixer.clipAction(walkAnimation);
                if (!action.isRunning()) action.play();
            } else {
                const action = mixer.clipAction(walkAnimation);
                if (action.isRunning()) action.stop();
            }

            // キャラクターの初期回転を考慮する
            const initialRotation = Math.PI; // 初期回転（カメラの背後を向く）
            character.rotation.y = initialRotation + rotationY; // 初期回転を加算
        }
    
        function updateCamera() {
            if (!character) return;

            const offset = new THREE.Vector3(0, 2, cameraDistance); // カメラの距離にcameraDistanceを使用
            const characterPosition = character.position.clone();

            // 回転に基づいてカメラ位置を設定
            const rotationQuaternion = new THREE.Quaternion()
                .setFromEuler(new THREE.Euler(rotationX, rotationY, 0, "YXZ")); // 上下・左右回転
            offset.applyQuaternion(rotationQuaternion);
            camera.position.copy(characterPosition.add(offset));
            
            const lookAtPosition = character.position.clone(); // キャラクターの位置そのものを注視点に設定
            lookAtPosition.y += 1.5; // キャラクターの高さを少し上げる
            camera.lookAt(lookAtPosition); // キャラクターのやや上方を注視
        }
    
        // アニメーションループ
        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
    
            if (mixer) mixer.update(delta);
            moveCharacter(delta);
            adjustCharacterHeight();
            updateCamera();
    
            renderer.render(scene, camera);
        }
    
        animate();
    }
});