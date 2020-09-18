import React from "react";
import { useSelector } from "react-redux";
import { Matrix } from "../../components/matrix/Matrix";
import { selectNext } from "../tetromino/rotationSelectors";

/* Next 下一个方块
功能都放在了tetromino内，这里只接收方块类型做展示
 */
export const Next = () => {
  // TODO：渲染后续3个方块
  const filled = useSelector(selectNext)

  return <Matrix cols={4} rows={2} filled={filled} />;
};
