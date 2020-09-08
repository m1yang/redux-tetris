import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { Blocks, Position } from "../../common/types";
import { RootState } from "../../app/store";

type GameState = 'over'|'start'| 'pause'

interface PlayfieldState {
  axis: Position;
  filled: Blocks;
  game: GameState
}

const initialState: PlayfieldState = {
  axis: { x: 4, y: -2 },
  filled: {},
  game: 'pause'
};

// var omit = (obj, ukey) => Object.keys(obj).reduce((acc, key) =>
//      ukey.includes(key) ? acc : {...acc, [key]: obj[key]}, {}
//     );

export const playfieldSlice = createSlice({
  name: "playfield",
  initialState,
  reducers: {
    // 考虑过是否应该在selector中处理这样复杂的数据，但是这里并不是衍生数据，
    // 重点是这里并不需要缓存数据
    disappear: {
      reducer: (state, { payload }: PayloadAction<number[]>) => {
        // 通过比较和消除的行比较，filled数据依次覆盖下一行数据
        const clear1line = (line: number, filled: Blocks) => Object.keys(filled).reduce((acc, cur) => {
          const row = Number(cur)
          return row === line ?
            acc : {
              ...acc,
              [row < line ? row + 1 : row]: filled[row]
            }
        }, {} as Blocks)

        state.filled = payload.reduce((acc, v) => clear1line(v, acc)
          , state.filled)
      },
      prepare: (line: number[]) => {
        return { payload: line };
      },
    },

    gameState: (state, {payload}: PayloadAction<GameState>) => {
      state.game = payload
    },
    reset: (state) => {
      state.filled = {};
    },
    // 边界问题，能否直接硬编码，要灵活的话，就传入边界值
    softDrop: (state) => {
      // let y = state.axis.y;
      // state.axis.y = y > 20 ? 20 : y + 1;
      state.axis.y += 1
    },
    moveLeft: (state) => {
      // let x = state.axis.x;
      // // 最小值是0
      // state.axis.x = x > 0 ? x - 1 : 0;
      state.axis.x -= 1
    },
    moveRight: (state) => {
      // let x = state.axis.x;
      // state.axis.x = x < payload ? x + 1 : payload;
      state.axis.x += 1
    },
    hardDrop: (state, { payload }: PayloadAction<number>) => {
      state.axis.y = payload;
    },
    fillUp: (state, { payload }: PayloadAction<Blocks>) => {
      state.filled = payload;
    },
    reDrop: (state) => {
      state.axis.x = 4;
      state.axis.y = -2;
    },
    wallkick: (state, { payload }: PayloadAction<number>) => {
      state.axis.x -= payload
    },
  },
});

export const {
  disappear,
  gameState,
  reset,
  softDrop,
  moveLeft,
  moveRight,
  fillUp,
  hardDrop,
  reDrop,
  wallkick,
} = playfieldSlice.actions;

export default playfieldSlice.reducer;

// playfield组件判断当前数据是否存在长度满格的，存在就调用该计算
export const selectCompletedLines = createSelector(
  (state: RootState) => state.playfield.filled,
  (filled) => {
    let rows: number[] = [];
    for (let [key, value] of Object.entries(filled)) {
      if (value.length === 10) {
        rows.push(Number(key));
      }
    }
    return rows
  }
)

export const selectCurrentLine = createSelector(
  (state: RootState) => state.playfield.axis.y,
  (y) => y
)

export const selectGameState = createSelector(
  (state: RootState) => state.playfield.game,
  (game) => game
)