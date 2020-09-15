import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { Blocks, Point } from "../../common/types";
import { RootState, AppThunk } from "../../app/store";
import { getNextShape } from "../tetromino/tetrominoSlice";

interface PlayfieldState {
  point: Point;
  filled: Blocks;
  pause: boolean
}

const initialState: PlayfieldState = {
  point: { x: 4, y: -2 },
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
    // TODO: 是否可以不接收参数，直接state.pause = !state.pause
    onPause: (state, { payload }: PayloadAction<boolean>) => {
      state.pause = payload
    },
    reset: (state) => {
      state.filled = {};
    },
    // 边界问题，能否直接硬编码，要灵活的话，就传入边界值
    softDrop: (state) => {
      // let y = state.point.y;
      // state.point.y = y > 20 ? 20 : y + 1;
      state.point.y += 1
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
    hardDrop: (state, { payload }: PayloadAction<number>) => {
      state.point.y = payload;
    },
    fillUp: (state, { payload }: PayloadAction<Blocks>) => {
      state.filled = payload;
    },
    reDrop: (state) => {
      state.point.x = 4;
      state.point.y = -2;
    },
    wallkick: (state, { payload }: PayloadAction<number>) => {
      state.point.x -= payload
    },
  },
});

export const {
  disappear,
  onPause,
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

// 延时代码也可以通过这样的方式添加
export const setNextShape = (): AppThunk => async dispatch => {
  // 重置定位点
  dispatch(reDrop());
  // 触发下一个方块
  dispatch(getNextShape());
}

export const resetAll = (): AppThunk => async dispatch => {
  dispatch(reset())
  dispatch(getNextShape())
  dispatch(reDrop())
  dispatch(onPause(true))
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