import React from "react";
import styles from "./Matrix.module.css";
import { Cell } from "../cell/Cell";
import { Blocks } from "../../common/types";

// Matrix 矩阵包含行rows和列columns
export interface Matrix {
  cols: number;
  rows: number;
}

type MatrixProps = {
  filled: Blocks;
} & Matrix;

const toColor = (source: number[][], target: Blocks) => {
  for (let [key, value] of Object.entries(target)) {
    if (Number(key) > -1) {
      value.forEach((ele: number) => (source[Number(key)][ele] = 1));
    }
  }
};

/* Matrix 方块板
模块可以渲染出cols*rows格方块

数据类型：
坐标第4象限，但是y轴的值为正
 */
export const Matrix = ({ cols, rows, filled }: MatrixProps) => {
  const draw: number[][] = Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(0));

  toColor(draw, filled);

  return (
    <div className={styles.matrix}>
      {draw.map((row, index) => (
        <div key={index}>
          {row.map((col, i) => (
            <Cell key={i} color={!!col} />
          ))}
        </div>
      ))}
    </div>
  );
};
