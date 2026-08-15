import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const ASSET_ROOT = "/assets/";

const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
const audioLoader = new THREE.AudioLoader();

const textureCache = new Map();
const modelCache = new Map();
const audioCache = new Map();


// ============================================================
// TEXTURES
// ============================================================

export function loadTexture(path) {

    if (textureCache.has(path)) {
        return textureCache.get(path);
    }

    const texture = textureLoader.load(
        ASSET_ROOT + path
    );

    texture.colorSpace =
        THREE.SRGBColorSpace;

    textureCache.set(
        path,
        texture
    );

    return texture;
}


// ============================================================
// 3D MODELS
// ============================================================

export function loadModel(path) {

    if (modelCache.has(path)) {
        return modelCache.get(path);
    }

    const promise =
        new Promise((resolve, reject) => {

            gltfLoader.load(
                ASSET_ROOT + path,

                gltf => {

                    const model =
                        gltf.scene;

                    model.traverse(
                        object => {

                            if (
                                object.isMesh
                            ) {

                                object.castShadow =
                                    true;

                                object.receiveShadow =
                                    true;
                            }
                        }
                    );

                    resolve(model);
                },

                undefined,

                error => {
                    console.error(
                        `Failed to load model: ${path}`,
                        error
                    );

                    reject(error);
                }
            );
        });

    modelCache.set(
        path,
        promise
    );

    return promise;
}


// ============================================================
// AUDIO
// ============================================================

export function loadAudio(path) {

    if (audioCache.has(path)) {
        return audioCache.get(path);
    }

    const promise =
        new Promise((resolve, reject) => {

            audioLoader.load(
                ASSET_ROOT + path,

                buffer => {
                    resolve(buffer);
                },

                undefined,

                error => {

                    console.error(
                        `Failed to load audio: ${path}`,
                        error
                    );

                    reject(error);
                }
            );
        });

    audioCache.set(
        path,
        promise
    );

    return promise;
}


// ============================================================
// IMAGE
// ============================================================

export function loadImage(path) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();

            image.onload = () => {
                resolve(image);
            };

            image.onerror = error => {

                console.error(
                    `Failed to load image: ${path}`,
                    error
                );

                reject(error);
            };

            image.src =
                ASSET_ROOT + path;
        }
    );
}


// ============================================================
// PRELOAD
// ============================================================

export async function preloadAssets(
    assets,
    onProgress = () => {}
) {

    const total =
        assets.length;

    let completed = 0;

    const updateProgress = () => {

        completed++;

        onProgress(
            completed / total
        );
    };


    const promises =
        assets.map(
            async asset => {

                try {

                    switch (
                        asset.type
                    ) {

                        case "texture":

                            await Promise.resolve(
                                loadTexture(
                                    asset.path
                                )
                            );

                            break;


                        case "model":

                            await loadModel(
                                asset.path
                            );

                            break;


                        case "audio":

                            await loadAudio(
                                asset.path
                            );

                            break;


                        case "image":

                            await loadImage(
                                asset.path
                            );

                            break;
                    }

                } finally {

                    updateProgress();
                }
            }
        );


    await Promise.all(
        promises
    );
}


// ============================================================
// CACHE MANAGEMENT
// ============================================================

export function clearAssetCache() {

    textureCache.clear();

    modelCache.clear();

    audioCache.clear();
}


// ============================================================
// ASSET PATH HELPER
// ============================================================

export function assetPath(path) {

    return ASSET_ROOT + path;
}