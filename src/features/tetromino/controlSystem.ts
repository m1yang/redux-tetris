import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { Blocks } from "../../common/types";
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

/* 不知道是否应该用这种定参的方法来统一方块操作预测 */
export const selectForecast = (
    next: string,
    step: number,
) => createSelector(
    selectTetrominoCreator,
    (state: RootState) => state.tetromino.direct,
    (state: RootState) => state.tetromino.point,
    (state: RootState) => state.playfield.filled,
    (tetrads, direct, point, filled) => {
        switch (next) {
            case 'move':
                point.x += step
                break;
            case 'drop':
                point.y += step
                break;
            case 'rotate':
                direct += step
                break;
            default:
                throw new Error(`only have move,drop,rotate to control`);
        }
        const tetrad = tetrads(direct, point)
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

const selectBeyondLeft = createSelector(
    selectCurrent,
    (piece) => 0 - Math.min(...flatten(piece))
)

const selectBeyondRight = createSelector(
    selectCurrent,
    (piece) => Math.max(...flatten(piece)) - 9
)

export const selectReachingLeft = createSelector(
    selectBeyondLeft,
    (left) => left < 0
)

export const selectReachingRight = createSelector(
    selectBeyondRight,
    (beyond) => beyond < 0
)

// 踢墙功能，纠正方块位置 
export const selectWallKick = createSelector(
    selectBeyondLeft,
    selectBeyondRight,
    (left, right) => {
        if (left > 0) {
            return left
        }
        if (right > 0) {
            return right
        }
    }
);

// 下边框最大为20，当前方块会超出多少
const beyondBottom = (
    blocks: Blocks,
    drop = 0,
    height = 20,
) => Math.max(...Object.keys(blocks).map(v => Number(v) + drop)) - height + 1

// 是否正在接近下边框
export const selectReachingBottom = createSelector(
    selectCurrent,
    (piece) => beyondBottom(piece) < 0
)

// 触底反弹 
export const selectRebound = createSelector(
    selectCurrent,
    (piece) => {
        const ch = beyondBottom(piece)
        if (ch > 0) {
            return ch
        }
    }
);

// 硬降功能和方块的y没有关系，和已填充方块的y有关
const selectDropDown = createSelector(
    selectTetrominoCreator,
    (state: RootState) => state.tetromino.direct,
    (state: RootState) => state.tetromino.point.x,
    (tetrads, direct, x) => (y: number) => tetrads(direct, { x: x, y: y })
)

// 计算下降到底，踏踏实实一步一步判断，避免出bug
// 如果状态需要关联，则加减，如果不需要则直接赋值
const selectLanding = createSelector(
    selectDropDown,
    (state: RootState) => state.playfield.filled,
    (dropDown, filled) => {
        if (filled === {}) {
            return
        }
        // 遍历filled，判断是否会被改行阻塞
        for (const key of Object.keys(filled)) {
            const line = Number(key)
            const tetrad = dropDown(line)
            if (isBlocked(tetrad, filled)) {
                // 降落在被阻塞的上一行
                return line - 1
            }
        }
    }
)

const selectSink = createSelector(
    selectDropDown,
    (dropDown) => {
        for (let i = 19; ; i--) {
            const tetrad = dropDown(i)
            if (beyondBottom(tetrad) === 0) {
                return i
            }
        }
    }
)

export const selectHardDrop = createSelector(
    selectLanding,
    selectSink,
    (land, down) => {
        return !!land ? land : down
    }
)
