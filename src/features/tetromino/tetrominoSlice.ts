import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Shape, Direction, Point } from "../../common/types";

interface TetrominoState {
  currentShape: Shape;
  direct: Direction;
  point: Point
  nextShape: Shape[];
}

// 随机生成下一个方块类型
const randomGenerator = () => {
  let bag = 'OISZLJT'.split('') as Shape[];
  let tmp: number[] = []
  return function () {
    if (tmp.length === 0) {
      tmp = Array.from({ length: bag.length }, (_, i) => i)
    };
    const result = tmp.splice(Math.floor(Math.random() * tmp.length), 1)[0]
    return bag[result];
  }
}

let bag = randomGenerator()

const origin = { x: 4, y: -1 }

const initialState: TetrominoState = {
  currentShape: bag(),
  direct: 0,
  point: origin,
  nextShape: [bag()],
};

export const tetrominoSlice = createSlice({
  name: "tetromino",
  initialState,
  reducers: {
    softDrop: (state) => {
      // let y = state.point.y;
      // state.point.y = y > 20 ? 20 : y + 1;
      state.point.y += 1
    },
    hardDrop: (state, { payload }: PayloadAction<number>) => {
      state.point.y += payload;
    },
    moveLeft: (state) => {
      // let x = state.point.x;
      // state.point.x = x > 0 ? x - 1 : 0;
      state.point.x -= 1
    },
    moveRight: (state) => {
      // let x = state.point.x;
      // state.point.x = x < payload ? x + 1 : payload;
      state.point.x += 1
    },
    rotateLeft: (state) => {
      const direct = state.direct;
      state.direct = direct < 3 ? direct + 1 : 0;
      // state.direction += 1; // 不重置进度
    },
    rotateRight: (state) => {
      const direct = state.direct;
      // 上下左右只有4个方位,增长到最大值后重置当前进度
      state.direct = direct > 0 ? direct - 1 : 3;
    },
    wallkick: (state, { payload }: PayloadAction<number>) => {
      state.point.x -= payload
    },
    resetShape: state => {
      bag = randomGenerator()
      state.direct = 0
      state.point = origin
      state.currentShape = bag()
      state.nextShape= [bag()]
    },
    getNextShape:  (state) => {
        state.point = origin
        // current一定会从next中取到值
        state.currentShape = state.nextShape.shift()!
        state.nextShape.push(bag());
        state.direct = 0;
      },
  },
});

export const {
  softDrop,
  hardDrop,
  moveLeft,
  moveRight,
  rotateLeft,
  rotateRight,
  wallkick,
  resetShape,
  getNextShape,
} = tetrominoSlice.actions;

export default tetrominoSlice.reducer;