import React, { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import styles from "./Joystick.module.css";
import {
  softDrop,
  hardDrop,
  moveLeft,
  moveRight,
  rotateLeft,
  rotateRight,
  wallkick,
  rebound,
} from "../tetromino/tetrominoSlice";
import {
  selectForecast,
  selectReachedBottom,
  selectReachingBottom,
  selectReachingLeft,
  selectReachingRight,
  selectWallKick,
  selectRebound
} from "../tetromino/controlSystem";
import { onPause, resetAll } from "../playfield/playfieldSlice";
import { RootState } from "../../app/store";

const useControl = (allow: boolean, action: any) => {
  const dispatch = useDispatch();

  return useCallback(() => {
    if (allow) {
      dispatch(action)
    }
  }, [allow, action, dispatch])
}

const useClick = (
  bem: string,
  handler: EventListenerOrEventListenerObject,
  pause: boolean) => {
  const eles = Array.from(document.getElementsByClassName(bem))

  useEffect(() => {
    if (pause === true) return;

    eles.forEach((ele) => ele.addEventListener('click', handler))

    return () => {
      eles.forEach((ele) => ele.removeEventListener('click', handler))
    };
  }, [eles, handler, pause]);
}

/* 
Joystick 
操作按钮，结合control system完成游戏的各种操作
*/
export function Joystick() {
  const dispatch = useDispatch();

  /* 暂停 */
  const paused = useSelector((state: RootState) => state.playfield.pause)

  /* 降落 */
  const next = useSelector(selectForecast)
  const reachingBottom = useSelector(selectReachingBottom)

  // 软降
  const onSoftDrop = useControl(next('drop', 1) && reachingBottom, softDrop())
  useClick(styles.down, () => { onSoftDrop() }, paused)
  // 硬降
  const bottom = useSelector(selectReachedBottom)
  const onHardDrop = useControl(next('drop', 1) && reachingBottom, hardDrop(bottom))
  useClick(styles.B, () => { onHardDrop() }, paused)

  /* 移动 */
  // 按条件添加事件，按条件触发动作
  const reachingLeft = useSelector(selectReachingLeft)
  const reachingRight = useSelector(selectReachingRight)

  // 左移
  const onMoveLeft = useControl(next('move', -1) && reachingLeft, moveLeft())
  useClick(styles.left, () => { onMoveLeft() }, paused)
  // 右移
  const onMoveRight = useControl(next('move', 1) && reachingRight, moveRight())
  useClick(styles.right, () => { onMoveRight() }, paused)

  /* 旋转 */
  const onRotateLeft = useCallback(() => {
    if (next('rotate', -1)) {
      dispatch(rotateLeft())
    }
  }, [next, dispatch])

  // 旋转 逆时针
  // const onRotateLeft = useControl(rotate(left), rotateLeft())
  useClick(styles.A, () => { onRotateLeft() }, paused)

  const onRotateRight = useCallback(() => {
    if (next('rotate', 1)) {
      dispatch(rotateRight())
    }
  }, [next, dispatch])
  // 旋转 顺时针
  // const onRotateRight = useControl(rotate(right), rotateRight())
  useClick(styles.up, () => { onRotateRight() }, paused)

  const kick = useSelector(selectWallKick);
  const bound = useSelector(selectRebound)
  useEffect(() => {
    if (!!kick) {
      dispatch(wallkick(kick))
    }
    if (!!bound) {
      dispatch(rebound(bound))
    }
  })

  const keyReset = useCallback(() => {
    dispatch(resetAll());
    dispatch(onPause(true))
  }, [dispatch])

  const keyPause = useCallback(() => {
    dispatch(onPause(!paused))
  }, [dispatch, paused])

  useEffect(() => {
    // if (paused === true) return;
    const handlerKeydown: (this: Window, ev: KeyboardEvent) => any = (ev) => {
      switch (ev.key) {
        case 'Escape': keyPause(); break;
        default:
          break;
      }
    }
    window.addEventListener('keydown', handlerKeydown);
    return () => {
      window.removeEventListener('keydown', handlerKeydown);
    };
  }, [
    keyPause])

  // TODO 暂停会取消事件
  useEffect(() => {
    if (paused === true) return;
    const handlerKeydown: (this: Window, ev: KeyboardEvent) => any = (ev) => {
      switch (ev.key) {
        case "ArrowUp": onRotateRight(); break;
        case "ArrowDown": onSoftDrop(); break;
        case "ArrowLeft": onMoveLeft(); break;
        case "ArrowRight": onMoveRight(); break;
        case 'z': onRotateLeft(); break;
        case 'c': keyReset(); break;
        case ' ': onHardDrop(); break;
        default:
          break;
      }
    }
    window.addEventListener('keydown', handlerKeydown);
    return () => {
      window.removeEventListener('keydown', handlerKeydown);
    };
  }, [
    paused,
    keyReset,
    onHardDrop,
    onMoveLeft,
    onMoveRight,
    onRotateLeft,
    onRotateRight,
    onSoftDrop])

  return (
    // TODO: 摇杆样式
    // 绘制摇杆 用icon会更好看些
    <div className={styles.joystick}>
      <div className={styles.direction}>
        <div className={styles.gap} />
        <button className={styles.up} type="button" />
        <div className={styles.gap} />

        <button className={styles.left} type="button" />
        <div className={styles.gap} />
        <button className={styles.right} type="button" />

        <div className={styles.gap} />
        <button className={styles.down} type="button" />
        <div className={styles.gap} />
      </div>
      <div className={styles.AB}>
        <button className={styles.A} type="button" >A</button>
        <button className={styles.B} type="button" >B</button>
      </div>
      <div className={styles.start}>
        <button className={styles.pause}
          type="button"
          onClick={() => { dispatch(onPause(!paused)) }} />
        <button className={styles.reset}
          type="button"
          onClick={() => {
            dispatch(resetAll());
            dispatch(onPause(true))
          }} />
      </div>
    </div>
  );
}
