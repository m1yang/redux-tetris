import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

// Time = (0.8-((Level-1)*0.007))^(Level-1)

// const speeds = [800, 650, 500, 370, 250, 160];
// const delays = [50, 60, 70, 80, 90, 100];

const config = {
  topScore: 999999,
  pass: 10,
  // bonus points 额外奖励
  bonus: [100, 300, 500, 800],
  hardest: 5
}

interface BoardState {
  score: number;
  level: number;
  lines: number;
}

const initialState: BoardState = {
  score: 0,
  level: 1,
  lines: 0,
};

export const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    // 额外奖励 grant 获取分数
    grant: (state, { payload }: PayloadAction<number>) => {
      const score = state.score + config.bonus[payload]
      state.score = Math.min(score, config.topScore)
    },
    // 难度等级提升,最高为5
    levelUp: (state, { payload }: PayloadAction<number>) => {
      state.level = payload;
    },
    // 记录清除行数
    completedLines: (state, { payload }: PayloadAction<number>) => {
      state.lines += payload;
    },
    clearRecords: state => initialState,
  },
});

export const {
  grant,
  levelUp,
  completedLines,
  clearRecords } = boardSlice.actions;

export default boardSlice.reducer;

export const selectSpeed = createSelector(
  (state: RootState) => state.board.level,
  (level) => (0.8 - ((level - 1) * 0.007)) ** (level - 1) * 1000
);

// const gain = level + Math.floor(lines / 10)
// const levelMax = gain < 5 ? gain : 5
export const selectLevel = createSelector(
  (state: RootState) => state.board.level,
  (state: RootState) => state.board.lines,
  (level, lines) => {
    level += Math.floor(lines / config.pass)
    return Math.min(level, config.hardest)
  }
)

// export const selectDelay = createSelector(
//   (state: RootState) => state.board.level,
//   (level) => delays[level]
// );
