import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { Tetromino, Direction, Point, Blocks } from "../../common/types";
import {
    selectCurrent,
    selectTetrominoCreator
} from "./tetrominoSelectors";

/* 
大幅使用了createSelector，甚至可以说是滥用
因为每次移动，state都会改变，缓存计算结果基本无用
只是单纯把selector当作计算衍生数据的手段
正确的实现应该是selector使用少有变化的参数
*/

// 需要可以针对direct获取方块2维数组形状，方便实现预测下一次旋转功能
//  const selectTetrominos = createSelector(
//     (state: RootState) => state.tetromino.currentShape,
//     (shape) => (direct: Direction) => getTetrad(shape, direct)
// );

// 当前方向下的方块2维数组形状，方便预测下一次降落或平移
//  const selectTetromino = createSelector(
//     selectTetrominos,
//     (state: RootState) => state.tetromino.direct,
//     (tetrads, direct) => tetrads(direct)
// )

// 定位当前方块的中点
//  const selectMidpoint = createSelector(
//     (state: RootState) => state.tetromino.currentShape,
//     (state: RootState) => state.tetromino.point,
//     (shape, point) => getOffset(point, midPoint[shape])
// )

// const isBlocked = (
//     tetrads: Tetromino,
//     { x, y }: Point,
//     blocks: Blocks,
// ) => {
//     for (let index = 0; index < tetrads.length; index++) {
//         const currLine = y + index;
//         const value = tetrads[index];

//         if (blocks[currLine] &&
//             value.some((v, i) => v !== 0 && blocks[currLine].includes(i + x))
//         ) {
//             return true;
//         }
//     }
//     return false;
// }

export const isBlocked = (
    pieces: Blocks,
    filled: Blocks,
) => {
    for (const key of Object.keys(pieces)) {
        const line = Number(key)
        if (filled[line] &&
            pieces[line].some(v => filled[line].includes(v))
        ) {
            return true
        }
    }
    // pieces的边界较为固定，遍历完后可以确定没有交点
    return false
}

const selectControl = createSelector(
    selectTetrominoCreator,
    (state: RootState) => state.tetromino.direct,
    (state: RootState) => state.tetromino.point,
    (state: RootState) => state.playfield.filled,
    (tetrads, direct, point, filled) => (
        nextDirect: number,
        nextMove: number,
        nextDrop: number,
    ) => {
        const tetrad = tetrads(
            direct + nextDirect,
            {
                x: point.x + nextMove,
                y: point.y + nextDrop
            })
        return isBlocked(tetrad, filled)
    }
)

/* 方块降落 没有阻塞没有限制的情况下返回true */
const selectFallen = createSelector(
    selectTetrominoCreator,
    (state: RootState) => state.tetromino.direct,
    (state: RootState) => state.tetromino.point,
    (state: RootState) => state.playfield.filled,
    (tetrads, direct, point, filled) => (
        next: number,
    ) => {
        const tetrad = tetrads(direct, { x: point.x, y: point.y + next })
        return isBlocked(tetrad, filled)
    }
)

export const selectSoftDrop = createSelector(
    selectFallen,
    (fall) => fall(1)
)

/* 方块平移 没有阻塞没有限制的情况下返回true */
export const selectMovement = createSelector(
    selectTetrominoCreator,
    (state: RootState) => state.tetromino.direct,
    (state: RootState) => state.tetromino.point,
    (state: RootState) => state.playfield.filled,
    (tetrads, direct, point, filled) => (
        next: number,
    ) => {
        const tetrad = tetrads(direct, { x: point.x + next, y: point.y })
        return isBlocked(tetrad, filled)
    }
)

/* 旋转系统 下次旋转与filled有交点就不能旋转 */
export const selectRotation = createSelector(
    selectTetrominoCreator,
    (state: RootState) => state.tetromino.direct,
    (state: RootState) => state.tetromino.point,
    (state: RootState) => state.playfield.filled,
    (tetrads, direct, point, filled) => (next: number) => {
        const tetrad = tetrads(direct + next, { x: point.x, y: point.y })

        return isBlocked(tetrad, filled)
    }
)

/* 上面是预测方块下一步是否阻塞 下面是当前方块是否处于边界 */
const flatten = (blocks: Blocks) => {
    let result: number[] = []
    for (const key of Object.keys(blocks)) {
        result.push(...blocks[Number(key)])
    }
    return result
}

export const leftmost = createSelector(
    selectCurrent,
    (piece) => Math.min(...flatten(piece)) - 0
)

export const rightmost = createSelector(
    selectCurrent,
    (piece) => 9 - Math.max(...flatten(piece))
)

// 踢墙功能，纠正方块位置 
export const selectWallKick = createSelector(
    leftmost,
    rightmost,
    (left, right) => {
        if (left < 0) {
            return left
        }
        if (right < 0) {
            return right
        }
    }
);

// blocks数据类型的key最大只能为19
const overHeight = (
    blocks: Blocks,
    drop = 0,
    height = 19,
) => Object.keys(blocks).some(v => Number(v) + drop === height)

// 一旦触底就返回
export const selectOverHeight = createSelector(
    selectCurrent,
    (piece) => overHeight(piece)
)

// 触底反弹 
export const selectRebound = createSelector(
    selectCurrent,
    (piece) => {
        if (overHeight(piece)) {
            return Math.max(...Object.keys(piece).map(v => Number(v))) - 19
        }
    }
);

// 计算下降到底，踏踏实实一步一步判断，避免出bug
// 如果状态需要关联，则加减，如果不需要则直接赋值
const selectLanding = createSelector(
    selectTetrominoCreator,
    (state: RootState) => state.tetromino.direct,
    (state: RootState) => state.tetromino.point.x,
    (state: RootState) => state.playfield.filled,
    (tetrads, direct, x, filled) => {
        if (filled === {}) {
            return
        }
        // 遍历filled，判断是否会被改行阻塞
        for (const key of Object.keys(filled)) {
            const line = Number(key)
            const tetrad = tetrads(direct, { x: x, y: line })
            if (isBlocked(tetrad, filled)) {
                // 降落在被阻塞的上一行
                return line - 1
            }
        }
    }
)

const selectDropDown = createSelector(
    selectCurrent,
    (piece) => {
        for (let i = 16; i < 19; i++) {
            if (overHeight(piece, i)) {
                return i
            }
        }
        return 19
    }
)

export const selectHardDrop = createSelector(
    selectLanding,
    selectDropDown,
    (land, down) => {
        console.log(`渲染`, land)
        return !!land ? land : down
    }
)
