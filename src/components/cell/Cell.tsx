import React from "react";
import "./Cell.css";

// color 灰黑两种颜色
interface CellProps {
  color: boolean;
}

// Cell 一个小方块,目前只支持2种色彩，需要支持的颜色为7种
// 需要考虑css in js方案
// TODO: 支持多种配色
export const Cell = ({ color }: CellProps) => (
  <div className={`${color ? "black" : "grey"}`} />
);
