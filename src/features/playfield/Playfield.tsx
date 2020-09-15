import React, { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import "./Playfield.css";
import {
  fillUp,
  disappear,
  reDrop,
  wallkick,
  onPause,
  reset,
  selectCompletedLines,
  setNextShape
} from "./playfieldSlice";
import { Matrix } from "../../components/matrix/Matrix";
import { getNextShape } from "../tetromino/tetrominoSlice";
import {
  selectCurrent,
  selectDrop,
  selectOffset,
} from "../tetromino/tetrominoSelectors";
import { selectDelay, grant, completedLines } from "../scoreboard/scoreboardSlice";
import { Popup } from "./Popup";
import { RootState } from "../../app/store";

/* Playfield 模块渲染游戏场地
长10x高20
触发mino的生成和消除
生成方块后，当方块触底时触发useDispatch下一个方块
给记分板输出获取的积分
判断游戏是否结束
*/
export function Playfield() {
  const dispatch = useDispatch();

  // 可以注入x来判断是否派发动作
  const offset = useSelector(selectOffset);
  useEffect(() => {
    if (offset) {
      dispatch(wallkick(offset));
    }
  }, [offset, dispatch])

  const current = useSelector(selectCurrent);
  const drop = useSelector(selectDrop);
  const delay = useSelector(selectDelay)
  const curLine = useSelector((state: RootState) => state.playfield.point.y)

  let overflow = curLine < 0

  // 判断游戏是否结束
  useEffect(() => {
    if (!drop && overflow) {
      dispatch(onPause(true))
      setStart(false)
    }
  }, [drop, overflow, dispatch])

  // 不能继续下落，期望只有当blocks发生改变才执行相关代码
  const next = useCallback(() => {
    if (!drop && !overflow) {
      dispatch(fillUp(current));
      // // 此时触发下一个方块
      // dispatch(getNextShape());
      // // 重置定位点
      // dispatch(reDrop());
      dispatch(setNextShape())
    }
  }, [drop, current, overflow, dispatch])

  useEffect(() => {
    const id = setTimeout(next, delay);
    return () => clearTimeout(id)
  }, [next, delay])

  const lines = useSelector(selectCompletedLines)
  // 判断是否消除，可以异步但没必要
  useEffect(() => {
    if (lines.length > 0) {
      dispatch(disappear(lines));
      dispatch(completedLines(lines.length));
      dispatch(grant());
    }
  }, [lines, dispatch])

  // 重置 考虑做成Thunk
  const resetAll = () => {
    dispatch(reset())
    dispatch(getNextShape())
    dispatch(reDrop())
    dispatch(onPause(false))
  }
  // 只需要一种状态pause:boolen，游戏结束也是暂停
  // setState来控制展示开始和结束界面
  const [start, setStart] = useState(true)
  const pause = useSelector((state: RootState) => state.playfield.pause)
  const fn = start ? () => dispatch(onPause(false)) : resetAll

  return (
    // 将playfield数据映射成20x10的方格
    <div className="playfield">
      <Matrix cols={10} rows={20} filled={current} />
      <Popup start={start} pause={pause} fn={fn} />
    </div>
  );
}
