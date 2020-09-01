import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { AppThunk, RootState } from "../../app/store";

const speeds = [800, 650, 500, 370, 250, 160];

// const delays = [50, 60, 70, 80, 90, 100];

// bonus points 额外奖励
// const clearPoints = [100, 300, 700, 1500];

const maxPoint = 999999;

// const eachLines = 10; // 每消除eachLines行, 增加速度

interface BoardState {
  score: number;
  level: number;
  lines: number;
}

const initialState: BoardState = {
  score: 0,
  level: 0,
  lines: 0,
};

export const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    // grant 获取分数
    grant: (state) => {
      state.score = state.score < maxPoint ? state.score + 100 : state.score;
    },
    // 难度等级提升,最高为5
    levelUp: (state) => {
      state.level = state.level > speeds.length ? state.level : state.level + 1;
    },
    // 记录清除行数
    completedLines: (state, { payload }: PayloadAction<number>) => {
      state.lines += payload;
    },
  },
});

export const { grant, levelUp, completedLines } = boardSlice.actions;

export default boardSlice.reducer;
