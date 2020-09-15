import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Shape, Tetromino, Blocks, Point } from "../../common/types";

// 俄罗斯方块的基础模板
export const shapes: { [shape in Shape]: Tetromino } = {
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

const midPoint ={
  I: [-1, 0],
  L: [-1, -1],
  J: [-1, -1],
  Z: [-1, -1],
  S: [-1, -1],
  O: [0, -1],
  T: [-1, -1],
}

// 方块旋转功能
const rotate = (tetrads: Tetromino) => {
  return tetrads
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
const rotateCache = (item: Tetromino) => {
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
  tetrads: Tetromino,
  { x, y }: Point
) => {
  return {
    ...blocks, ...tetrads.reduce((acc, value, index) => {
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

// 判断方块左右是否有已填充方块
const canMove = (
  blocks: Blocks,
  tetrads: Tetromino,
  { x, y }: Point
) => {
  for (let index = 0; index < tetrads.length; index++) {
    const currLine = y + index;
    const value = tetrads[index];

    if (blocks[currLine] &&
      value.some((v, i) => v !== 0 && blocks[currLine].includes(i + x))
    ) {
      return false;
    }
  }
  return true;
}

const getAllPoint = (
  { x, y }: Point,
  tetrads: Tetromino
) => {
  let points: Array<Point> = []
  tetrads.forEach((v, row) => {
    v.forEach((val, col) => {
      if (val) {
        points.push({ x: x + col, y: y + row })
      }
    })
  })
  return points
}

// 通过Point和Tetromino计算出方块在矩阵中的位置
const convertToBlocks = (
  tetrads: Tetromino,
  { x, y }: Point,
) => tetrads.reduce((acc, value, index) => {
  acc[index + y] = value.flatMap((v, i) => v === 0 ? [] : [i + x])
  return acc
}, {} as Blocks)

// 在Point不变的情况下，通过设置一个中心点，改变方块的相对位置
const getMidPoint = (
  shape: Shape,
  { x, y }: Point,
) => {
  return {
    x: x + midPoint[shape][0],
    y: y + midPoint[shape][1],
  } as Point
}

const isFilled = (
  { x, y }: Point,
  blocks: Blocks
) => {
  for (const key of Object.keys(blocks)) {
    const row = Number(key)
    if (row > y && blocks[row].includes(x)) {
      return row
    }
  }
  return 20
}

/* next */
// 计算下一个填充方块，方向和位置是固定的
export const selectNext = createSelector(
  (state: RootState) => state.tetromino.nextShape,
  (shape) => {
    const next = shape[0]
    const filled: Blocks = {};
    const startLocations: Point = getMidPoint(next, { x: 1, y: 1 })
    const result = toFill(filled, shapes[next], { ...startLocations });
    return result;
  }
);

/* joystick */
// 计算当前方向的方块
export const selectRotation = createSelector(
  (state: RootState) => state.tetromino.currentShape,
  (state: RootState) => state.tetromino.direct,
  (shape, direction) => {
    const results = rotateCache(shapes[shape]);
    // 对获取的direction取余，避免受边界大小影响
    direction = direction % results.length;
    return results[direction];
  }
);

export const selectControl = createSelector(
  selectRotation,
  (state: RootState) => state.playfield.point,
  (state: RootState) => state.playfield.filled,
  (shape, point, filled) => (
    action: string,
  ) => {
    const x = point.x
    const y = point.y
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
  (state: RootState) => state.playfield.point,
  (state: RootState) => state.playfield.filled,
  (shape, point, filled) => {
    const result = toFill(filled, shape, { ...point });
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
  (state: RootState) => state.playfield.point,
  (state: RootState) => state.playfield.filled,
  (shape, point, filled) => {
    const points = getAllPoint(point, shape)
    // 默认值y轴最大值
    let high = 20
    // 循环4个点来判断方块可以硬降的位置
    points.forEach(v => {
      const tmp = isFilled(v, filled) - v.y
      high = tmp < high ? tmp : high
    })
    return { x: point.x, y: point.y + high - 1 }
  }
)

// 踢墙 x的取值范围为[0~10-length] 
// 田园Go风格，有超出范围就返回该范围，没有就返回false
export const selectOffset = createSelector(
  selectRotation,
  (state: RootState) => state.playfield.point,
  (shape, point) => {
    const offset = shape[0].length + point.x - 10
    return offset > 0 ? offset : false;
  }
);
