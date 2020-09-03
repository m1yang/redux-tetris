import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import "./Playfield.css";
import { fillUp, disappear, reDrop, wallkick } from "./playfieldSlice";
import { Matrix } from "../../components/matrix/Matrix";
import { getNextShape } from "../tetromino/tetrominoSlice";
import {
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

  const offset = useSelector(selectOffset);
  if (offset > 0) {
    dispatch(wallkick(offset));
  }

  const current = useSelector(selectCurrent);
  const drop = useSelector(selectBlocks);

  // 判断游戏是否结束
  // if (stopDrop === 0) {
  // gameover
  // }

  // 不能继续下落，期望只有当blocks发生改变才执行相关代码
  useEffect(() => {
    if (!drop) {
      dispatch(fillUp(current));
      // 此时触发下一个方块
      dispatch(getNextShape());
      // 重置定位点
      dispatch(reDrop());
    }
  }, [drop, current, dispatch])


  // 判断是否消除
  // TODO：消除需要优化
  for (let [key, value] of Object.entries(current)) {
    if (value.length === 10) {
      dispatch(disappear(Number(key)));
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
