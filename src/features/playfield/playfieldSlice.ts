import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { Blocks } from "../../common/types";
import { RootState,AppThunk } from "../../app/store";

interface PlayfieldState {
  filled: Blocks;
  pause: boolean
}

const initialState: PlayfieldState = {
  filled: {},
  pause: true
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
        const clear1line = (line: number, filled: Blocks) =>
          Object.keys(filled).reduce((acc, cur) => {
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
    onPause: (state, { payload }: PayloadAction<boolean>) => {
      state.pause = payload
    },
    reset: (state) => {
      state.filled = {};
    },
    fillUp: (state, { payload }: PayloadAction<Blocks>) => {
      state.filled = toFill(payload, state.filled)
    },
  },
});

export const {
  disappear,
  onPause,
  reset,
  fillUp,
} = playfieldSlice.actions;

export default playfieldSlice.reducer;

// 将移动中的方块和已填充的方块放在一起展示
export const toFill = (
  pieces: Blocks,
  filled: Blocks,
) => {
  const result = {...filled}
  for (const key of Object.keys(pieces)) {
    const line = Number(key)
    result[line] = filled[line] ?
      [...pieces[line], ...filled[line]] :
      pieces[line]
  }
  return result
}

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

export const resetAll = (): AppThunk => async dispatch => {
  dispatch(reset())
  dispatch(onPause(true))
}