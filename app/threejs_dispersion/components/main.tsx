'use client'

import { StrictMode } from "react"
import { Canvas } from "@react-three/fiber"

import * as THREE from 'three'

import LoaderGltfDispersion from './loader_gltf_dispersion'

export default function Main() {
    return (
        <div className="w-full h-screen trigger">
            <StrictMode>
                <Canvas
                    flat
                    shadows
                    gl={{
                        antialias: true,
                        toneMapping: THREE.ACESFilmicToneMapping,
                        outputColorSpace: THREE.SRGBColorSpace,
                    }}
                    camera={{
                        fov: 45,
                        near: 0.1,
                        far: 100,
                        position: [3, 5, 15],
                    }}
                >
                    <LoaderGltfDispersion />
                </Canvas>
            </StrictMode>
        </div>
    )
  }