import React, { useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import styles from "./Joystick.module.css";
import { moveLeft, softDrop, moveRight, onPause, reset } from "../playfield/playfieldSlice";
import { rotateRight } from "../tetromino/tetrominoSlice";
import { selectControl } from "../tetromino/tetrominoSelectors";
import { selectSpeed } from "../scoreboard/scoreboardSlice";
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

const useInterval = (callback: () => void, delay: number, pause: boolean) => {
  const timerRef = useRef<() => void>()

  timerRef.current = callback;

  useEffect(() => {
    if (pause === true) return;

    const tick = () => timerRef.current?.()

    const id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay, pause])
}

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

  const speed = useSelector(selectSpeed)
  // 操作的pause和界面的pause统一
  const paused = useSelector((state: RootState) => state.playfield.pause)

  // const [pause, setPause] = useState(true)

  const control = useSelector(selectControl);

  // 控制自动下落
  useInterval(() => {
    if (control('down')) {
      dispatch(softDrop());
    }
  }, speed, paused)

  const offPause = useCallback(() => {
    if (paused) {
      dispatch(onPause(false))
    }
  }, [paused, dispatch])

  // 旋转
  const onRotateRight = useControl(control('up'), rotateRight())
  useClick(styles.up, () => { onRotateRight(); offPause() })

  // 右移
  const onMoveRight = useControl(control('right'), moveRight())
  useClick(styles.right, () => { onMoveRight(); offPause() })

  // 软降
  const onSoftDrop = useControl(control('down'), softDrop())
  useClick(styles.down, () => { onSoftDrop(); offPause() })

  // 左移
  const onMoveLeft = useControl(control('left'), moveLeft())
  useClick(styles.left, () => { onMoveLeft(); offPause() })

  // dom操作，需要使用useEffect
  useEffect(() => {
    const handlerKeydown: (this: Window, ev: KeyboardEvent) => any = (ev) => {
      switch (ev.keyCode) {
        case 38:
          //上
          onRotateRight();
          offPause()
          break;
        case 40:
          //下
          onSoftDrop();
          offPause()
          break;
        case 37:
          //左
          onMoveLeft();
          offPause()
          break;

        case 39:
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
          onClick={() => { dispatch(reset()) }} />
      </div>
    </div>
  );
}
