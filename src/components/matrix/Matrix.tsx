import React from "react";
import styles from "./Matrix.module.css";
import { Cell } from "../cell/Cell";
import { Blocks } from "../../common/types";

// Matrix 矩阵包含行rows和列columns
type Matrix = number[][]

interface MatrixProps {
  cols: number;
  rows: number;
  filled: Blocks;
}

// 将压缩的blocks数据展示到2维数组里
const toColor = (source: Matrix, target: Blocks, color = 1) => {
  for (let key of Object.keys(target)) {
    const line = Number(key)
    // 超出边界的不绘制
    if (!!source[line]) {
      target[line].forEach((ele: number) => (source[line][ele] = color));
    }
  }
};

/* 
Matrix 方块板
模块可以渲染出cols*rows格方块
 */
export const Matrix = ({ cols, rows, filled }: MatrixProps) => {
  const matrix: Matrix = Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(0));

  toColor(matrix, filled);

  return (
    <div className={styles.matrix}>
      {matrix.map((row, index) => (
        <div key={index}>
          {row.map((col, i) => (
            <Cell key={i} color={!!col} />
          ))}
        </div>
      ))}
    </div>
  );
};
