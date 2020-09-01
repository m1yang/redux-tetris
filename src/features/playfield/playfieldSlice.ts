import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Blocks } from "../../components/matrix/Matrix";

type Axis = {
  x: number;
  y: number;
};

interface PlayfieldState {
  axis: Axis;
  filled: Blocks;
}

const initialState: PlayfieldState = {
  axis: { x: 4, y: -2 },
  filled: new Map(),
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
        let tmp: Blocks = new Map();
        for (const [key, value] of state.filled) {
          if (key < payload) {
            tmp.set(key + 1, value);
          }
          if (key > payload) {
            tmp.set(key, value);
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
      state.filled.clear();
    },
    // 边界问题，能否直接硬编码，要灵活的话，就传入边界值
    softDrop: (state) => {
      let y = state.axis.y;
      state.axis.y = y > 20 ? y : y + 1;
    },
    moveLeft: (state) => {
      let x = state.axis.x;
      // 最小值是0
      state.axis.x = x > 0 ? x - 1 : x;
    },
    moveRight: (state, { payload }: PayloadAction<number>) => {
      let x = state.axis.x;
      state.axis.x = x > payload ? x : x + 1;
    },
    hardDrop: (state, { payload }: PayloadAction<number>) => {
      state.axis.y = payload;
    },
    fillUp: (state, { payload }: PayloadAction<Blocks>) => {
      state.filled = payload;
    },
    reDrop: (state, { payload }: PayloadAction<Axis>) => {
      state.axis.x = payload.x;
      state.axis.y = payload.y;
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
