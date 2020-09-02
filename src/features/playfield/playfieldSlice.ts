import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Blocks, Position } from "../../common/types";

interface PlayfieldState {
  axis: Position;
  filled: Blocks;
}

const initialState: PlayfieldState = {
  axis: { x: 4, y: -2 },
  filled: {},
};

// var omit = (obj, ukey) => Object.keys(obj).reduce((acc, key) =>
//      ukey.includes(key) ? acc : {...acc, [key]: obj[key]}, {}
//     );

export const playfieldSlice = createSlice({
  name: "playfield",
  initialState,
  reducers: {
    // Playfield组件不应该修改state，所以消除的重头还是放在了slice里
    // 组件只负责判断是否触发消除，并向action传入被消除的行
    // 这里考虑的另一点是该不该在动作中加入这么繁重的数据处理
    disappear: {
      reducer: (state, { payload }: PayloadAction<number>) => {
        // 通过比较和消除的行比较，filled数据依次覆盖下一行数据
        let tmp: Blocks = state.filled;
        for (const [key, value] of Object.entries(state.filled)) {
          const row = Number(key)
          if (row < payload) {
            tmp[row + 1] = value;
          }
          if (row > payload) {
            tmp[row] = value;
          }
        }
        state.filled = tmp;
      },
      prepare: (line: number) => {
        return { payload: line };
      },
    },

    stop: (state, action: PayloadAction<number>) => {
      // 暂停是否需要做持久化,如果不做会导致刷新后读取初始值自动开始或暂停
    },
    reset: (state) => {
      state.filled = {};
    },
    // 边界问题，能否直接硬编码，要灵活的话，就传入边界值
    softDrop: (state) => {
      let y = state.axis.y;
      state.axis.y = y > 20 ? 20 : y + 1;
    },
    moveLeft: (state) => {
      let x = state.axis.x;
      // 最小值是0
      state.axis.x = x > 0 ? x - 1 : 0;
    },
    moveRight: (state, { payload }: PayloadAction<number>) => {
      let x = state.axis.x;
      state.axis.x = x < payload ? x + 1 : payload;
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
      state.axis.x -= payload;
    },
  },
});

export const {
  disappear,
  softDrop,
  moveLeft,
  moveRight,
  fillUp,
  hardDrop,
  reDrop,
  wallkick,
} = playfieldSlice.actions;

export default playfieldSlice.reducer;
