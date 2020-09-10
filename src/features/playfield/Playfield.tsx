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
  const curLine = useSelector((state: RootState) => state.playfield.axis.y)

  // 判断游戏是否结束
  useEffect(() => {
    if (!drop && curLine < 0) {
      dispatch(onPause(true))
      setStart(false)
    }
  }, [drop, curLine, dispatch])

  // 不能继续下落，期望只有当blocks发生改变才执行相关代码
  // TODO:curLine>=0可以优化，直接返回true or false，这样记忆功能才能生效
  const next = useCallback(() => {
    if (!drop && curLine >= 0) {
      dispatch(fillUp(current));
      // // 此时触发下一个方块
      // dispatch(getNextShape());
      // // 重置定位点
      // dispatch(reDrop());
      dispatch(setNextShape())
    }
  }, [drop, current, curLine, dispatch])

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

  // TODO:每10行升一级

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
