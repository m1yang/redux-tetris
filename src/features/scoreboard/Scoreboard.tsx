import React from "react";
import { useSelector } from "react-redux";
import styles from "./Scoreboard.module.css";
import { RootState } from "../../app/store";
import { Next } from "../next/Next";

/* Scoreboard 模块渲染游戏信息
展示最高积分、当前获取积分、游戏难度、下一个方块
控制游戏的开始与暂停、游戏声音的开关
*/
export function Scoreboard() {
  const { score, level, lines } = useSelector(
    (state: RootState) => state.board
  );

  return (
    <div className={styles.board}>
      <div className="score">
        <p>Score</p>
        <div className="number">{score}</div>
      </div>

      <div className="level">
        <p>Level</p>
        <div className="number">{level}</div>
      </div>

      <div className="lines">
        <p>Lines</p>
        <div className="number">{lines}</div>
      </div>

      <div className="next">
        <p>Next</p>
        <Next />
      </div>
    </div>
  );
}
