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
// 填充的数据范围受矩阵行和列影响
const toFill = (
  blocks: Blocks,
  pieces: number[][],
  { x, y }: Position
) => {
  return {
    ...blocks, ...pieces.reduce((acc, value, index) => {
      const rows = index + y;
      if (rows < 0) {
        return acc
      }
      const cols: number[] = [];
      const filled = blocks[rows] || [];

      value.forEach((v, i) => {
        // 判断有方块，且方块位置<10
        if (v !== 0 && i + x < 10) {
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

    if (blocks[currLine] &&
      value.some((v, i) => v !== 0 && blocks[currLine].includes(i + x))
    ) {
      return false;
    }
  }
  return true;
}

// 计算方块可移动范围 horizontal
// 将方块压扁，计入坐标后，遍历矩阵，查看比y轴大的每一行是否有相同的值
// 如果没有就返回y轴最大值19。如果有，就返回这一行，
// 因为对象会自动排序，所以有结果就直接返回
// TODO：压扁还是会有bug，所以得改成1行是否有，再遍历多行
const getLimitedY = (
  pieces: number[][],
  { x, y }: Position,
  blocks: Blocks,
) => {
  // 如果方块的原始结构变动，pieces[0]这里可能会有bug
  const flatten = Array.from({ length: pieces[0].length }, (_, i) => i + x)
  const flat = pieces.length

  for (const key of Object.keys(blocks)) {
    const row = Number(key)
    if (row > y && blocks[row].some(v => flatten.includes(v))) {
      return row - flat
    }
  }
  return 20 - flat
}

const getAllPoint = (
  { x, y }: Position,
  pieces: number[][]
) => {
  let points: Array<Position> = []
  pieces.forEach((v, row) => {
    v.forEach((val, col) => {
      if (val) {
        points.push({ x: x + col, y: y + row })
      }
    })
  })
  return points
}

const isFilled = (
  { x, y }: Position,
  bloks: Blocks
) => {
  // if (Object.prototype.hasOwnProperty.call(bloks, y)) {
  //   return bloks[y].includes(x)
  // }
  // return false
  if (bloks[y].includes(x)) {
    return { x, y }
  }
  return false
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

export const selectControl = createSelector(
  selectRotation,
  (state: RootState) => state.playfield.axis,
  (state: RootState) => state.playfield.filled,
  (shape, axis, filled) => (
    action: string,
  ) => {
    const x = axis.x
    const y = axis.y
    // 预测是否能执行下一步操作
    const move2next: { [action: string]: boolean } = {
      'up': canMove(filled, rotate(shape), { x, y }),
      'right': canMove(filled, shape, { x: x + 1, y }),
      'down': canMove(filled, shape, { x, y: y + 1 }),
      'left': canMove(filled, shape, { x: x - 1, y }),
    }
    // 限制移动边界
    const move2boundary: { [action: string]: boolean } = {
      'up': true,
      'right': x + shape[0].length < 10,
      'down': shape.length + y < 20,
      'left': x > 0,
    }
    return move2next[action] && move2boundary[action]
  }
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

// 计算是否能继续下落
export const selectDrop = createSelector(
  selectControl,
  (control) => control('down')
);

// 计算下落到底
export const selectBottom = createSelector(
  selectRotation,
  (state: RootState) => state.playfield.axis,
  (state: RootState) => state.playfield.filled,
  (shape, axis, filled) => getLimitedY(shape, axis, filled)
)

// 踢墙 x的取值范围为[0~10-length] 
// 田园Go风格，有超出范围就返回该范围，没有就返回false
export const selectOffset = createSelector(
  selectRotation,
  (state: RootState) => state.playfield.axis,
  (shape, axis) => {
    const offset = shape[0].length + axis.x - 10
    return offset > 0 ? offset : false;
  }
);
