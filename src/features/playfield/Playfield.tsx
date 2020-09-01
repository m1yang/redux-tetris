import React from "react";
import { useSelector, useDispatch } from "react-redux";

import "./Playfield.css";
import { fillUp, disappear, reDrop, wallkick } from "./playfieldSlice";
import { Matrix } from "../../components/matrix/Matrix";
import { getNextShape } from "../tetromino/tetrominoSlice";
import {
  selectOrigin,
  selectCurrent,
  selectBlocks,
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

  // 计算方块原点
  const origin = useSelector(selectOrigin);

  const offset = useSelector(selectOffset);
  if (offset>0) {
    dispatch(wallkick(offset));
  }

  const current = useSelector(selectCurrent);
  const blocks = useSelector(selectBlocks);

  // 判断游戏是否结束
  // if (stopDrop === 0) {
  // gameover
  // }
  // 不能继续下落
  if (blocks) {
    dispatch(fillUp(current));
    // 此时触发下一个方块
    dispatch(getNextShape());
    // 重置定位点
    dispatch(reDrop({ x: origin[0], y: origin[1] }));
  }

  // 判断是否消除
  for (let [key, value] of current.entries()) {
    if (value.length === 10) {
      dispatch(disappear(key));
      dispatch(completedLines(1));
      dispatch(grant());
    }
  }

  // 游戏的开始和暂停，应该由最终容器控制

  return (
    // 将playfield数据映射成20x10的方格
    <div className="playfield">
      <Matrix cols={10} rows={20} filled={current} />
    </div>
  );
}
