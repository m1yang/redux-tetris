import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Blocks, Position } from "../../common/types";

/* 
共有3个功能区和方块有交互：joystick、next、playfield
设置好基础数据后，最后使用的衍生数据需要计算出来
joystick模块：
计算：方块长度
参数：方块、坐标

next模块：
计算：方块样式
参数：方块

playfield模块：
计算：方块样式
参数：方块、方向、坐标
---
计算：方块填充
参数：方块样式、已填充方块
---
计算：方块出发点
参数：方块
---
计算：墙踢条件
参数：方块长度、坐标
*/

// 俄罗斯方块的基础模板
export const shapes = {
  I: [[1, 1, 1, 1]],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
};

// 方块旋转功能
const rotate = (pieces: number[][]) => {
  return pieces
    .reduce((acc, item) => {
      item.forEach((v, k) => {
        if (acc[k] === undefined) {
          acc[k] = [];
        }
        acc[k].push(v);
      });
      return acc;
    }, [] as number[][])
    .reverse();
};

// 缓存旋转结果
const rotateCache = (item: number[][]) => {
  let items = [item];

  for (
    let i = rotate(item);
    items[0].length !== i.length ||
    // 判断2维数组是否相等
    items[0].some((x, y) => x.some((m, n) => i[y][n] !== m));
    i = rotate(i)
  ) {
    items.push(i);
  }
  return items;
};

// 通过2维数组和坐标，返回一个新的blocks
const toFill = (
  blocks: Blocks,
  pieces: number[][],
  { x, y }: Position
) => {
  // 只有定位在playfield内才渲染，所以x，y均为正
  // TODO: 需要判断方块的每一行
  if (x < 0 || y < 0) {
    return blocks
  }

  return {
    ...blocks, ...pieces.reduce((acc, value, index) => {
      const rows = index + y;
      const cols: number[] = [];
      const filled = blocks[rows] || [];

      value.forEach((v, i) => {
        if (v !== 0) {
          cols.push(i + x);
        }
      });

      acc[rows] = [...cols, ...filled]
      return acc
    }, {} as Blocks)
  }
};

// type Moving = (blocks: Blocks,pieces: number[][],{ x, y }: Position) => boolean
// 判断方块左右是否有已填充方块
const canMove = (
  blocks: Blocks,
  pieces: number[][],
  { x, y }: Position
) => {
  for (let index = 0; index < pieces.length; index++) {
    const currLine = y + index;
    const value = pieces[index];

    if (
      (blocks[currLine] &&
        value.some((v, i) => v !== 0 && blocks[currLine].includes(i + x))) ||
      currLine === 20
    ) {
      return false;
    }
  }
  return true;
}

const canControl = (
  blocks: Blocks,
  pieces: number[][],
  { x, y }: Position
) => (
  action: string,
  ) => {
    const move2next: { [action: string]: boolean } = {
      'up': canMove(blocks, rotate(pieces), { x, y }),
      'right': canMove(blocks, pieces, { x: x + 1, y }),
      'down': canMove(blocks, pieces, { x, y: y + 1 }),
      'left': canMove(blocks, pieces, { x: x - 1, y }),
    }
    return move2next[action]
  }

/* next */
// 计算下一个填充方块，方向和位置是固定的
export const selectNext = createSelector(
  (state: RootState) => state.tetromino.nextShape,
  (shape) => {
    const next = shape[0]
    const filled: Blocks = {};
    const position: Position = { x: 0, y: 0 }
    const result = toFill(filled, shapes[next], { ...position });
    return result;
  }
);

/* joystick */
// 计算当前方向的方块
const selectRotation = createSelector(
  (state: RootState) => state.tetromino.currentShape,
  (state: RootState) => state.tetromino.direction,
  (shape, direction) => {
    const results = rotateCache(shapes[shape]);
    // 对获取的direction取余，避免受边界大小影响
    direction = direction % results.length;
    return results[direction];
  }
);
/* joystick */
// 位置会受方块大小影响，计算超出多少列
export const selectBorder = createSelector(
  selectRotation,
  (shape) => {
    return 10 - shape[0].length;
  }
)

export const selectControl = createSelector(
  selectRotation,
  (state: RootState) => state.playfield.axis,
  (state: RootState) => state.playfield.filled,
  (shape, axis, filled) => canControl(filled, shape, axis)
)

/* playfield */
// 计算当前填充方块
export const selectCurrent = createSelector(
  selectRotation,
  (state: RootState) => state.playfield.axis,
  (state: RootState) => state.playfield.filled,
  (shape, axis, filled) => {
    const result = toFill(filled, shape, { ...axis });
    return result;
  }
);

// 计算下一行是否有已填充方块，没有则return false，有则return 具体哪一行
// 需要关注判断的顺序
export const selectBlocks = createSelector(
  selectRotation,
  (state: RootState) => state.playfield.axis,
  (state: RootState) => state.playfield.filled,
  (shape, axis, filled) =>
    canControl(filled, shape, axis)('down')
);

// 踢墙
export const selectOffset = createSelector(
  selectRotation,
  (state: RootState) => state.playfield.axis,
  (shape, axis) => {
    return shape.length + axis.x - 10;
  }
);
