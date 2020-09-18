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
  setNextShape
} from "../tetromino/tetrominoSlice";
import { selectMovement, selectDrop, selectHeight, selectBottom } from "../tetromino/movementSelectors";
import { selectRotation, selectWallKick } from "../tetromino/rotationSelectors";
import { onPause, reset } from "../playfield/playfieldSlice";
import { RootState } from "../../app/store";

// type Control = "rotateRight" | "softDrop" | "moveLeft" | "moveRight";
// const keyBoard = {
//   'esc': 'pause',
//   'z': 'rotateLeft',
//   'c': 'hold',
//   'space': 'hardDrop',
//   'up': 'rotateRight',
//   'right': 'moveRight',
//   'down': 'softDrop',
//   'left': 'moveLeft'
// }

// 键盘事件 keyCode 别名
// const KeyCodeMap = {
//   esc: 27,
//   z: 90,
//   c: 67,
//   space: 32,
//   up: 38,
//   right: 39,
//   down: 40,
//   left: 37,
// };

const useControl = (allow: boolean, action: any) => {
  const dispatch = useDispatch();

  return useCallback(() => {
    if (allow) {
      dispatch(action)
    }
  }, [allow, action, dispatch])
}

const useClick = (bem: string, handler: EventListenerOrEventListenerObject) => {
  const eles = Array.from(document.getElementsByClassName(bem))

  useEffect(() => {
    eles.forEach((ele) => ele.addEventListener('click', handler))

    return () => {
      eles.forEach((ele) => ele.removeEventListener('click', handler))
    };
  }, [eles, handler]);
}

/* Matrix 模块渲染游戏场地
长10x高20
触发mino的生成和消除
生成方块后，当方块触底时触发useDispatch下一个方块
给记分板输出获取的积分
判断游戏是否结束
*/
export function Joystick() {
  const dispatch = useDispatch();

  // 可以注入x来判断是否派发动作
  const offset = useSelector(selectWallKick);
  useEffect(() => {
    if (offset) {
      dispatch(wallkick(offset));
    }
  }, [offset, dispatch])

  /* 暂停 */
  const paused = useSelector((state: RootState) => state.playfield.pause)
  const offPause = useCallback(() => {
    if (paused) {
      dispatch(onPause(false))
    }
  }, [paused, dispatch])

  /* 降落 */
  const drop = useSelector(selectDrop)
  const height = useSelector(selectHeight)

  // 软降
  const onSoftDrop = useControl(drop && !height, softDrop())
  useClick(styles.down, () => { onSoftDrop(); offPause() })

  // 硬降
  const bottom = useSelector(selectBottom)
  const onHardDrop = useControl(drop && !height, hardDrop(bottom))
  useClick(styles.B, () => { onHardDrop(); offPause() })

  /* 移动 */
  const move = useSelector(selectMovement);
  // 左移
  const onMoveLeft = useControl(move('left'), moveLeft())
  useClick(styles.left, () => { onMoveLeft(); offPause() })
  // 右移
  const onMoveRight = useControl(move('right'), moveRight())
  useClick(styles.right, () => { onMoveRight(); offPause() })

  /* 旋转 */
  const rotate = useSelector(selectRotation)
  // 旋转 逆时针
  const onRotateLeft = useControl(rotate('left'), rotateLeft())
  useClick(styles.A, () => { onRotateLeft(); offPause() })

  // 旋转 顺时针
  const onRotateRight = useControl(rotate('right'), rotateRight())
  useClick(styles.up, () => { onRotateRight(); offPause() })

  // 需要使用useEffect
  useEffect(() => {
    const handlerKeydown: (this: Window, ev: KeyboardEvent) => any = (ev) => {
      switch (ev.key) {
        case "ArrowUp":
          //上
          onRotateRight();
          offPause()
          break;
        case "ArrowDown":
          //下
          onSoftDrop();
          offPause()
          break;
        case "ArrowLeft":
          //左
          onMoveLeft();
          offPause()
          break;

        case "ArrowRight":
          onMoveRight();
          offPause()
          break;
        default:
          break;
      }
    }
    window.addEventListener('keydown', handlerKeydown);
    return () => {
      window.removeEventListener('keydown', handlerKeydown);
    };
  }, [onRotateRight, onSoftDrop, onMoveLeft, onMoveRight, offPause, dispatch])


  return (
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
        <button className={styles.A} type="button" />
        <button className={styles.B} type="button" />
      </div>
      <div className={styles.start}>
        <button className={styles.pause}
          type="button"
          onClick={() => { dispatch(onPause(!paused)) }} />
        <button className={styles.reset}
          type="button"
          onClick={() => {
            dispatch(onPause(true))
            dispatch(reset());
            dispatch(setNextShape());
          }} />
      </div>
    </div>
  );
}
