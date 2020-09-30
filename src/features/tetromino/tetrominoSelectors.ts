import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { Shape, Tetromino, Direction, Point, Blocks } from "../../common/types";

/* 
旋转系统，只修改direct状态
shape + direct --> tetrads
tetrads + point --> pieces
*/

// 俄罗斯方块的基础模板
const shapes: { [shape in Shape]: Tetromino } = {
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
        }, [] as Tetromino)
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


type Offset = [number, number]

// 让point变成中点
const midPoint: { [shape in Shape]: Offset } = {
    I: [-1, 0],
    L: [-1, -1],
    J: [-1, -1],
    Z: [-1, -1],
    S: [-1, -1],
    O: [0, -1],
    T: [-1, -1],
}

// 给矩阵上的点增加一个偏移量，在Point不变的情况下，改变方块的相对位置
const getOffset = (
    { x, y }: Point,
    offset: Offset,
) => {
    return {
        x: x + offset[0],
        y: y + offset[1],
    } as Point
}

// 根据方块形状标识符和方向，获取方块旋转后的2维数组
const getTetrad = (
    shape: Shape,
    direct: Direction,
) => {
    const tetrads = rotateCache(shapes[shape])
    const length = tetrads.length
    // 保证direct的取值区间
    direct = (length + direct) % length
    return tetrads[direct]
}

// 通过Point和Tetromino计算出方块在矩阵中的位置
const convertToBlocks = (
    tetrads: Tetromino,
    { x, y }: Point,
) => tetrads.reduce((acc, value, index) => {
    acc[index + y] = value.flatMap((v, i) => v === 0 ? [] : [i + x])
    return acc
}, {} as Blocks)

/* next 计算下一个填充方块，方向和位置是固定的 */
export const selectNext = createSelector(
    (state: RootState) => state.tetromino.nextShape,
    (shape) => {
        // TODO 渲染整个数组
        const next = shape[0]
        const startLocations: Point = getOffset({ x: 1, y: 1 }, midPoint[next])
        return convertToBlocks(shapes[next], startLocations);
    }
);

export const selectTetrominoCreator = createSelector(
    (state: RootState) => state.tetromino.currentShape,
    (shape) => (direct: Direction, point: Point) => {
        const tetrad = getTetrad(shape, direct)
        point = getOffset(point, midPoint[shape])
        return convertToBlocks(tetrad, point)
    }
)

export const selectCurrent = createSelector(
    selectTetrominoCreator,
    (state: RootState) => state.tetromino.direct,
    (state: RootState) => state.tetromino.point,
    (tetrads, direct, point) => tetrads(direct, point)
)