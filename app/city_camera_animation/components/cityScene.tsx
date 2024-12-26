'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

import * as THREE from 'three'
import { Environment, useGLTF } from '@react-three/drei'
import { useFrame, useThree } from "@react-three/fiber"


type props = {
  progress: number;
}

const gltfModel = '/models/city_camera_animation_continuity_bake.glb';

export default function CityScene(props: props) {
  const { progress } = props;

  return (
    <>
      <color args={['skyBlue']} attach="background" />
      <Model progress={progress} />
      <Environment preset='sunset' />
    </>
  )
}

function Model(props: props) {

  const { progress } = props;


  const { scene, materials, cameras, animations } = useGLTF(gltfModel)

  const set = useRef(useThree((state) => state.set));
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  const [actionsState, setActionsState] = useState<THREE.AnimationAction[] | null>(null);

  const [currentActionIndex, setCurrentActionIndex] = useState<number>(0);

  const setAnimation = useCallback((index: number) => {
    if(!actionsState) return;
    // 前のアクションを止める
    if(index > 0) actionsState[index-1].stop();

    console.log('set animation', index);

    // 次のアクションを再生
    actionsState[index].play();
    // 次のアクションを一時停止状態にする
    actionsState[index].paused = true;

    setCurrentActionIndex(index);
  }, [actionsState]);

  const animationFinished = useCallback(() => {
    console.log('animation finished');
    // アニメーションが終わったら次のアクションに進む
    if (actionsState && currentActionIndex < actionsState.length - 1) {
      setAnimation(currentActionIndex + 1);
      }
  }, [actionsState, currentActionIndex, setAnimation]);

  const mapRange = useCallback((value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
    // 範囲変換
    return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  }, []);

  useEffect(() => {
    if (actionsState) {
      // アクションの再生時間を進捗に合わせて変更

      const maxProgress = 1 / actionsState.length;
      const moveTime = mapRange(progress, maxProgress * currentActionIndex, maxProgress * (currentActionIndex + 1), 0, 1);

      actionsState[currentActionIndex].time = actionsState[currentActionIndex].getClip().duration * moveTime;

      if(actionsState[currentActionIndex].time >= actionsState[currentActionIndex].getClip().duration) {
        // アニメーション終了
        animationFinished();
      }
    }
}, [progress, actionsState, currentActionIndex, animationFinished, mapRange]);


  useEffect(() => {
    setAnimation(0);
  }, [actionsState, setAnimation]);


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
    mixerRef.current = new THREE.AnimationMixer(scene);

    if (animations.length > 0) {

      const animationArr = [];

      // mixerに各アニメーションをセット
      for (let index = 0; index < animations.length; index++) {
        const actionClip = mixerRef.current.clipAction(animations[index]);
        // アニメーション回数 1回 = 0
        actionClip.repetitions = 0;
        // アニメーションの最後のフレームで止めるかどうか
        actionClip.clampWhenFinished = true;

        animationArr.push(actionClip);
      }

      console.log('set actions', animationArr);
      setActionsState(animationArr);
    }
  }, [animations, cameras, scene])

  useFrame((state, delta) => {
    mixerRef.current?.update(delta);
  });

  return <primitive object={scene} />
}
