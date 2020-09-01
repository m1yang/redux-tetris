import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Shape = "I" | "O" | "T" | "L" | "J" | "Z" | "S";

interface NextState {
  shape: Shape;
}

// 随机生成下一个方块类型
const Randomizer = () => {
  let shapes: Shape[] = ["I", "O", "T", "L", "J", "Z", "S"];
  return shapes[Math.floor(Math.random() * shapes.length)];
};

const initialState: NextState = {
  shape: Randomizer(),
};

export const nextSlice = createSlice({
  name: "next",
  initialState,
  reducers: {
    nextTetromino: {
      reducer: (state, { payload }: PayloadAction<Shape>) => {
        state.shape = payload;
      },
      prepare: () => {
        return { payload: Randomizer() };
      },
    },
  },
});

export const { nextTetromino } = nextSlice.actions;

export default nextSlice.reducer;


// 根据类型生成方块
const getShape = (shape: Shape) => {
  const shapes = {
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

  return shapes[shape];
};

// 接收一个初始位置和一个方块，计算出最终样式
const getTetromino = (shape: Shape, { x = 0, y = 0 }: Axis) => {
  const piece = getShape(shape);
  let result: Blocks = {};

  piece.forEach((m, i) =>
    m.forEach((n, k) => {
      const row = i + y;
      const col = k + x;
      if (result[row] === undefined) {
        result[row] = [];
      } else if (k !== 0) {
        result[row].push(col);
      }
    })
  );

  return result;
};