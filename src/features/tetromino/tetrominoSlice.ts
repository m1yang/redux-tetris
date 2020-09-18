import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../../app/store";

type Shape = "I" | "O" | "T" | "L" | "J" | "Z" | "S";

// 顺时针方向
enum Direction {
  Up = 0,
  Right,
  Down,
  Left,
}

// 游戏场地上移动的点
type Point = {
  x: number,
  y: number
}

interface TetrominoState {
  currentShape: Shape;
  direct: Direction;
  point: Point
  nextShape: Shape[];
}

// 随机生成下一个方块类型
const randomizer = () => {
  let names: Shape[] = ["I", "O", "T", "L", "J", "Z", "S"];
  return names[Math.floor(Math.random() * names.length)];
};

const origin = { x: 4, y: -1 }

const initialState: TetrominoState = {
  currentShape: randomizer(),
  direct: 0,
  point: origin,
  nextShape: [randomizer()],
};

export const tetrominoSlice = createSlice({
  name: "tetromino",
  initialState,
  reducers: {
    // 边界问题，能否直接硬编码，要灵活的话，就传入边界值
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
      // // 最小值是0
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
    reDrop: (state) => {
      state.point = origin
    },
    getNextShape: {
      reducer: (state, { payload }: PayloadAction<Shape>) => {
        // 理论上来说，除了初始值外，一定是从下个形状获取到当前形状，而不是随机数
        // 但是TS要求类型一致，所以不得以加上了随机数
        state.currentShape = state.nextShape.shift() || randomizer();
        state.nextShape.push(payload);
        state.direct = 0;
      },
      prepare: () => {
        return { payload: randomizer() };
      },
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
  reDrop,
  getNextShape,
} = tetrominoSlice.actions;

export default tetrominoSlice.reducer;

// 延时代码也可以通过这样的方式添加
export const setNextShape = (): AppThunk => async dispatch => {
  // 重置定位点
  dispatch(reDrop());
  // 触发下一个方块
  dispatch(getNextShape());
}