import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Shape = "I" | "O" | "T" | "L" | "J" | "Z" | "S";

// 逆时针方向
enum Direction {
  Up = 0,
  Left,
  Down,
  Right,
}

interface TetrominoState {
  currentShape: Shape;
  direction: Direction;
  nextShape: Shape[];
}

// 随机生成下一个方块类型
const randomizer = () => {
  let names: Shape[] = ["I", "O", "T", "L", "J", "Z", "S"];
  return names[Math.floor(Math.random() * names.length)];
};

const initialState: TetrominoState = {
  currentShape: randomizer(),
  direction: 0,
  nextShape: [randomizer()],
};

export const tetrominoSlice = createSlice({
  name: "tetromino",
  initialState,
  reducers: {
    rotateRight: (state) => {
      const direct = state.direction;
      // 上下左右只有4个方位,增长到最大值后重置当前进度
      // state.direction = direction < 4 ? direction + 1 : 1;
      state.direction = direct > 0 ? direct - 1 : 3; // 也可以不重置以记录旋转的次数
      // state.direction = direction + 1;
    },
    rotateLeft: (state) => {
      // 上下左右只有4个方位,减小到最小值后重置当前进度
      // state.direction = direction > 1 ? direction - 1 : 4;
      state.direction += 1;
    },
    getNextShape: {
      reducer: (state, { payload }: PayloadAction<Shape>) => {
        // 理论上来说，除了初始值外，一定是从下个形状获取到当前形状，而不是随机数
        // 但是TS要求类型一致，所以不得以加上了随机数
        state.currentShape = state.nextShape.shift() || randomizer();
        state.nextShape.push(payload);
        state.direction = 0;
      },
      prepare: () => {
        return { payload: randomizer() };
      },
    },
  },
});

export const { rotateRight, getNextShape } = tetrominoSlice.actions;

export default tetrominoSlice.reducer;