'use client'

import { StrictMode, useRef, useEffect, useState } from 'react'
import { Canvas } from "@react-three/fiber"

import * as THREE from 'three'

import { ReactLenis, useLenis } from 'lenis/react'

import CityScene from '@/app/city_camera_animation/components/cityScene'

export default function Main() {
  const lenisRef = useRef<any>();

  const [progress, setProgress] = useState<number>(0);

  const lenis = useLenis(({ progress }) => {
    setProgress(progress);
  })

	return (
		<ReactLenis root ref={lenisRef}>
			<div className='fixed top-0 left-0 w-full h-screen'>
				<StrictMode>
					<Canvas
						shadows
						gl={{
							antialias: true,
							toneMapping: THREE.ACESFilmicToneMapping,
							outputColorSpace: THREE.SRGBColorSpace,
						}}
					>
					<CityScene progress={progress} />
					</Canvas>
				</StrictMode>
			</div>
			<div className='h-[10000px]'></div>
		</ReactLenis>
	)
}