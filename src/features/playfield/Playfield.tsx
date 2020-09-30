import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import "./Playfield.css";
import {
  fillUp,
  disappear,
  onPause,
  selectCompletedLines,
  toFill,
  resetAll
} from "./playfieldSlice";
import { Matrix } from "../../components/matrix/Matrix";
import { softDrop, getNextShape } from "../tetromino/tetrominoSlice";
import {
  selectForecast,
  selectReachingBottom,
} from "../tetromino/controlSystem";
import { selectCurrent } from "../tetromino/tetrominoSelectors";
import {
  selectSpeed,
  grant,
  completedLines
} from "../scoreboard/scoreboardSlice";
import { Popup } from "./Popup";
import { RootState } from "../../app/store";

const useInterval = (callback: () => void, delay: number, pause: boolean) => {
  const timerRef = useRef<() => void>()

  timerRef.current = callback;

  useEffect(() => {
    if (pause === true) return;

    const tick = () => timerRef.current?.()

    const timerID = setInterval(tick, delay)
    return () => clearInterval(timerID)
  }, [delay, pause])
}

/* 
Playfield 模块渲染游戏场地
方块的展示与消除
*/
export function Playfield() {
  const dispatch = useDispatch();

  /* 
  一开始是默认的游戏开始画面
  当新的方块无法再进入游戏场地时，游戏就结束了
  开始是该组件的属性（props），结束可以通过计算得出，属于衍生属性
  暂停作为state，来控制游戏进程
  暂停为true时，判断游戏是否结束，来展示对应的界面
  暂停为false时，游戏正常进行
  */
  const [start, setStart] = useState(true)
  const pause = useSelector((state: RootState) => state.playfield.pause)

  // 判断游戏是否结束，给出界面按钮功能
  // 未结束，按钮只有解除暂停一个功能
  // 已结束，按钮设置为继续游戏
  // 清空filled数据，在原点重新生成方块，并开始游戏
  const fn = start ? () => dispatch(onPause(false))
    : () => {
      dispatch(resetAll());
      setStart(true);
      dispatch(onPause(false))
    }

  /* 
  方块降落过程中，先判断是否阻塞 
  是-->再判断方块是否溢出  是-->游戏结束
                        否-->方块填充
  否-->再判断方块是否触底  是-->方块填充
                        否-->继续降落 ==>判断有无交点
  */
  // 获取当前方块和已填充方块
  const current = useSelector(selectCurrent);
  const filled = useSelector((state: RootState) => state.playfield.filled)

  /* 对方块状态进行判断，主要判断是否触发下一个方块还是游戏结束 */
  // const drop = useSelector(selectSoftDrop)
  const drop = useSelector(selectForecast)('drop', 1)
  const overflow = useSelector((state: RootState) => state.tetromino.point.y)
  const reaching = useSelector(selectReachingBottom);

  const speed = useSelector(selectSpeed)

  // 控制自动下落
  useInterval(() => {
    if (drop && reaching) {
      dispatch(softDrop());
    }
  }, speed, pause)

  // 方块填充
  const next = useCallback(() => {
    if ((!drop && overflow>0) || !reaching) {
      dispatch(fillUp(current));
      dispatch(getNextShape())
    }
  }, [drop, overflow, reaching, current, dispatch])

  useEffect(() => {
    const id = setTimeout(next, 500)
    return () => clearTimeout(id)
  })

  // 判断游戏是否结束
  // 下一步阻塞，并且栈溢出
  useEffect(() => {
    if (!drop && overflow<0) {
      dispatch(onPause(true))
      setStart(false)
    }
  }, [drop, overflow, dispatch])

  /* 
  消除发生在填充之后；
  当一行被填满，消除该行；
  消除是单次行为，所以多行的情况下也是同时触发；
  触发消除后，计算当次消除的行数及对应得分。
  */
  const lines = useSelector(selectCompletedLines)
  // 判断是否消除，可以异步但没必要
  useEffect(() => {
    const numberOfLines = lines.length
    if (numberOfLines > 0) {
      dispatch(disappear(lines));
      dispatch(completedLines(numberOfLines));
      dispatch(grant(numberOfLines));
    }
  }, [lines, dispatch])

  return (
    // 将playfield数据映射成20x10的方格
    <div className="playfield">
      <Matrix cols={10} rows={20} filled={toFill(current, filled)} />
      <Popup start={start} pause={pause} fn={fn} />
    </div>
  );
}
