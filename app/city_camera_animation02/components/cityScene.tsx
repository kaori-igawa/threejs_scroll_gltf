'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

import { useAtom, useAtomValue } from 'jotai'
import { isCityCameraAnimation02AnimatingAtom, cityCameraAnimation02ScrollDirAtom, cityCameraAnimation02ProgressAtom } from '@/app/libs/atom';

import * as THREE from 'three'
import { Environment, useGLTF } from '@react-three/drei'
import { useFrame, useThree } from "@react-three/fiber"

const gltfModel = '/models/city_camera_animation_bake.glb';

const SCROLL_THRESHOLD = 0.05;

export default function CityScene() {
  return (
    <>
      <color args={['skyBlue']} attach="background" />
      <Model />
      <Environment preset='sunset' />
    </>
  )
}

function Model() {
  const progress = useAtomValue(cityCameraAnimation02ProgressAtom);
  const scrollDir = useAtomValue(cityCameraAnimation02ScrollDirAtom);
  const [isAnimating, setIsAnimating] = useAtom(isCityCameraAnimation02AnimatingAtom);

  const { scene, cameras, animations } = useGLTF(gltfModel);

  const set = useRef(useThree((state) => state.set));
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  const [actionsState, setActionsState] = useState<THREE.AnimationAction[] | null>(null);

  const [currentActionIndex, setCurrentActionIndex] = useState<number>(-1);

  const [isAnimationReverse, setIsAnimationReverse] = useState<boolean>(false);

  const playAnimation = useCallback((index: number) => {
    console.log('currentActionIndex', currentActionIndex);

    if(!actionsState || index > actionsState.length - 1 || index < 0) return;
    // 前のアクションを止める
    if(currentActionIndex > -1) actionsState[currentActionIndex].stop();

    console.log('set animation', index);

    // 一旦次のアニメーションをリセット
    actionsState[index].reset();

    // 次のアニメーションの再生方向を設定
    if(scrollDir === 1) {
      // 順方向
      actionsState[index].timeScale = 1;
      actionsState[index].time = 0;
      setIsAnimationReverse(false);
    } else if (scrollDir === -1) {
      // 逆方向
      actionsState[index].timeScale = -1;
      actionsState[index].time = actionsState[index].getClip().duration;
      setIsAnimationReverse(true);
    }

    // 次のアクションを再生
    actionsState[index].play();

    setCurrentActionIndex(index);
    setIsAnimating(true);
  }, [actionsState, currentActionIndex, scrollDir, setIsAnimating]);

  const animationFinished = useCallback((e: { action: THREE.AnimationAction }) => {
    const playedActionName = e.action.getClip().name;

    actionsState?.forEach((action, index) => {
      if(action.getClip().name === playedActionName) {
        console.log('animation finished', index);
        setIsAnimating(false);
      }
    });
  },[actionsState, setIsAnimating]);

  useEffect(() => {
    console.log('progress', progress);
    if(!actionsState || isAnimating || progress < SCROLL_THRESHOLD * 0.5) return;

    const range = 1 / actionsState.length;

    for (let index = 0; index < actionsState.length; index++) {
      const minRange = range * index;

      if(progress < minRange + SCROLL_THRESHOLD && progress > minRange - SCROLL_THRESHOLD) {
        console.log('scrollDir', scrollDir);
        
        if (scrollDir === 1) {
          // 下にスクロールしたとき
          if(isAnimationReverse) {
            playAnimation(currentActionIndex);
          } else {
            if(currentActionIndex !== index) playAnimation(index);
          }
        } else if (scrollDir === -1) {
          // 上にスクロールしたとき
          if(isAnimationReverse) {
            if(currentActionIndex !== index) playAnimation(index);
          } else {
            playAnimation(currentActionIndex);
          }
        }
      }
    }
  }, [progress, scrollDir, isAnimating, isAnimationReverse, actionsState, playAnimation, currentActionIndex]);

  useEffect(() => {
    if(!actionsState) return;
    console.log('set actionsState', actionsState);

    // アニメーション終わったら
    mixerRef.current?.addEventListener('finished', animationFinished);

    // 最初のアクションを設定
    actionsState[0].play();
    // アクションを一時停止状態にする
    actionsState[0].paused = true;

  }, [actionsState, mixerRef, animationFinished]);


  useEffect(() => {
    scene.traverse((obj) => {
      const o = obj as THREE.Mesh;

      if(!o.isMesh) return;

      // shadow設定
      o.receiveShadow = o.castShadow = true;
    });

    // camera設定
    set.current({
      camera: cameras[0] as THREE.PerspectiveCamera,
    });

    // アニメーション設定
    const mixer = new THREE.AnimationMixer(scene);

    if (animations.length > 0) {

      const animationArr = [];

      // mixerに各アニメーションをセット
      for (let index = 0; index < animations.length; index++) {
        const actionClip = mixer.clipAction(animations[index]);
        // アニメーション回数 1回 = 0
        actionClip.repetitions = 0;
        // アニメーションの最後のフレームで止めるかどうか
        actionClip.clampWhenFinished = true;

        animationArr.push(actionClip);
      }

      setActionsState(animationArr);
      mixerRef.current = mixer;
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, delta) => {
    mixerRef.current?.update(delta);
  });

  return <primitive object={scene} />
}
