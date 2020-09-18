import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { Blocks, Point } from "../../common/types";
import { selectCurrent } from "./rotationSelectors";

// 设置移动的边界，宽和高
// const [width, height] = [10, 20]

// 对Blocks类型数据的value都加上x
const toMove = (
  blocks: Blocks,
  x: Point['x'] = 1
) => Object.keys(blocks).reduce((acc, cur) => {
  const line = Number(cur)
  return {
    ...acc,
    [line]: blocks[line].map(v => v + x)
  }
}, {} as Blocks)

// 对Blocks类型数据的key都加上y
const toDrop = (
  blocks: Blocks,
  y: Point['y'] = 1
) => Object.keys(blocks).reduce((acc, cur) => {
  const line = Number(cur)
  return {
    ...acc,
    [line + y]: blocks[line]
  }
}, {} as Blocks)

// 判断两个blocks类型数据key相同时是否有交点
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

// blocks数据类型的key最大只能为19
export const overHeight = (
  blocks: Blocks,
  height = 19,
) => Object.keys(blocks).some(v=>Number(v)>=height)

// 当前方块降落是否会导致相交
export const selectDrop = createSelector(
  selectCurrent,
  (state: RootState) => state.playfield.filled,
  (piece, filled) => !isBlocked(toDrop(piece), filled)
)

// blocks数据类型的key最小只能为0
export const selectOverflow = createSelector(
  selectCurrent,
  (piece) => Object.keys(piece).some(v=>Number(v)<0)
)

// 当前方块降落是否会导致相交
export const selectHeight = createSelector(
  selectCurrent,
  (piece) => overHeight(piece)
)

// 压扁方块，便于获取最大最小值，因为左右移动的时候不用考虑高度
const flatten = (blocks: Blocks) => {
  let result: number[] = []
  for (const key of Object.keys(blocks)) {
    result.push(...blocks[Number(key)])
  }
  return result
}

// 方块的移动 没有阻塞没有限制的情况下返回true
export const selectMovement = createSelector(
  selectCurrent,
  (state: RootState) => state.playfield.filled,
  (piece, filled) => (
    action: string,
  ) => {
    // 预测是否能执行下一步操作
    const location: { [action: string]: number } = {
      'right': +1,
      'left': -1,
    }

    const flattened = flatten(piece)
    const allowed: { [action: string]: boolean } = {
      'right': Math.max(...flattened) < 9,
      'left': Math.min(...flattened) > 0,
    }

    const next = toMove(piece,location[action])
    // 没有交点且没有碰到边界才能移动
    return (!isBlocked(next, filled) &&
      allowed[action])
  }
)

// 计算下降到底，踏踏实实一步一步判断，避免出bug
export const selectBottom = createSelector(
  selectCurrent,
  (state: RootState) => state.playfield.filled,
  (piece, filled) => {
    for (let i = 0; i < 20; i++) {
      // 掉落i的距离
      const drop = toDrop(piece, i)
      // 判断是否阻塞了或是超出高度了
      if (isBlocked(drop, filled)) {
        return i - 1
      } else if (overHeight(drop)) {
        return i
      }
    }
    return 19
  }
)

