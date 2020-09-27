import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { isBlocked,overHeight } from "./movementSelectors";
import { Shape, Tetromino, Point, Blocks } from "../../common/types";

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

type Offset = [number, number]

const midPoint: { [shape in Shape]: Offset } = {
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

// 通过Point和Tetromino计算出方块在矩阵中的位置
const convertToBlocks = (
    tetrads: Tetromino,
    { x, y }: Point,
) => tetrads.reduce((acc, value, index) => {
    acc[index + y] = value.flatMap((v, i) => v === 0 ? [] : [i + x])
    return acc
}, {} as Blocks)

/* joystick */
// 计算当前方块所有方向的数据
const selectTetrominos = createSelector(
    (state: RootState) => state.tetromino.currentShape,
    (shape) => rotateCache(shapes[shape])
);

// 旋转系统 下次旋转与filled有交点就不能旋转
export const selectRotation = createSelector(
    selectTetrominos,
    (state: RootState) => state.tetromino.direct,
    (state: RootState) => state.tetromino.point,
    (state: RootState) => state.playfield.filled,
    (tetrads, direct, point, filled) => (action: string) => {
        const length = tetrads.length
        const next:{[key:string]:number} = {
            'right':1,
            'left': -1,
        }
        
        direct = (length + direct + next[action]) % length
        const piece = convertToBlocks(tetrads[direct], point)
        return !isBlocked(piece, filled) && !overHeight(piece)
    }
)

/* next */
// 计算下一个填充方块，方向和位置是固定的
export const selectNext = createSelector(
    (state: RootState) => state.tetromino.nextShape,
    (shape) => {
        const next = shape[0]
        const startLocations: Point = getOffset({ x: 1, y: 1 }, midPoint[next])
        return convertToBlocks(shapes[next], startLocations);
    }
);

// 将方块定位到矩阵上
export const selectCurrent = createSelector(
    selectTetrominos,
    (state: RootState) => state.tetromino.currentShape,
    (state: RootState) => state.tetromino.direct,
    (state: RootState) => state.tetromino.point,
    (tetrads,shape, direct, point) => {
        direct = direct % tetrads.length;
        point = getOffset(point, midPoint[shape])
        return convertToBlocks(tetrads[direct], point)
    }
)

// 旋转系统，贴墙时并不限制旋转，而是使用踢墙功能，纠正方块位置 
export const selectWallKick = createSelector(
    selectCurrent,
    (pieces) => {
        for (const key of Object.keys(pieces)) {
            const line = Number(key)
            const minoes = pieces[line]
            if (minoes.some(v => v > 9)) {
                return Math.max(...minoes) -9
            } else if (minoes.some(v => v < 0)) {
                return Math.min(...minoes)
            }
        }
        return 0
    }
);