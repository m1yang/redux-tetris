export type Shape = "I" | "O" | "T" | "L" | "J" | "Z" | "S";

// 顺时针方向
export enum Direction {
  Up = 0,
  Right,
  Down,
  Left,
}

// shape和direct 来描述方块
export interface TetrominoProps {
    shape: Shape
    direct: Direction
}

// 用1维数组来表示每个小方块的相对位置
type Minoes = number[]
// 用2维数组来表示整个方块
export type Tetromino = Minoes[]
// 用key-value的格式来表示在哪一行上有哪些方块 
// e.g.{7:[3,4,5]} 第7行上3、4、5格上有方块
export type Blocks = {[line: number]: Minoes;}

// 游戏场地上移动的点
export type Point = {
    x: number,
    y: number
}