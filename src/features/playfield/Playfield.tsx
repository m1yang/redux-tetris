import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import "./Playfield.css";
import {
  fillUp,
  disappear,
  reDrop,
  wallkick,
  selectCompletedLines
} from "./playfieldSlice";
import { Matrix } from "../../components/matrix/Matrix";
import { getNextShape } from "../tetromino/tetrominoSlice";
import {
  selectCurrent,
  selectDrop,
  selectOffset,
} from "../tetromino/tetrominoSelectors";
import { grant, completedLines } from "../scoreboard/scoreboardSlice";

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
  console.log(offset)
  useEffect(() => {
      dispatch(wallkick(offset));
  }, [offset, dispatch])


  const current = useSelector(selectCurrent);
  const drop = useSelector(selectDrop);

  // 判断游戏是否结束
  // if (stopDrop === 0) {
  // gameover
  // }

  // 不能继续下落，期望只有当blocks发生改变才执行相关代码
  // 同步派发动作
  useEffect(() => {
    if (!drop) {
      dispatch(fillUp(current));
      // 此时触发下一个方块
      dispatch(getNextShape());
      // 重置定位点
      dispatch(reDrop());
    }
  }, [drop, current, dispatch])


  const lines = useSelector(selectCompletedLines)
  // 判断是否消除，可以异步但没必要
  useEffect(() => {
    if (lines.length > 0) {
      dispatch(disappear(lines));
      dispatch(completedLines(lines.length));
      dispatch(grant());
    }
  }, [lines, dispatch])

  // 游戏的开始和暂停，应该由最终容器控制

  return (
    // 将playfield数据映射成20x10的方格
    <div className="playfield">
      <Matrix cols={10} rows={20} filled={current} />
    </div>
  );
}
