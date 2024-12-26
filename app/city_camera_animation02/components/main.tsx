'use client'

import { StrictMode, useRef, useEffect, useState } from 'react'

import { useSetAtom, useAtomValue } from 'jotai'
import { isCityCameraAnimation02AnimatingAtom, cityCameraAnimation02ScrollDirAtom, cityCameraAnimation02ProgressAtom } from '@/app/libs/atom';

import { Canvas } from "@react-three/fiber"

import * as THREE from 'three'

import { ReactLenis, useLenis } from 'lenis/react'

import CityScene from '@/app/city_camera_animation02/components/cityScene'

export default function Main() {
	const isAnimating = useAtomValue(isCityCameraAnimation02AnimatingAtom);

  const lenisRef = useRef<any>()

  const setProgress = useSetAtom(cityCameraAnimation02ProgressAtom);

	const setScrollDir = useSetAtom(cityCameraAnimation02ScrollDirAtom);

  const lenis = useLenis(({ progress }) => {
		if(lenisRef?.current?.lenis) {
			setScrollDir(lenisRef?.current?.lenis.direction);
			setProgress(progress);
		}
  })

	useEffect(() => {
		if(!lenis) return;

		if(!isAnimating) {
			lenis.start();
		} else {
			lenis.stop();
		}
	}, [isAnimating, lenis, setProgress]);

	useEffect(() => {
		if(!lenis) return;
		lenis.scrollTo(0);
	}, [lenis]);

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
					<CityScene />
					</Canvas>
				</StrictMode>
			</div>
			<div className='h-[2000px]'></div>
		</ReactLenis>
	)
}