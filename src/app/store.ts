import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import tetrominoReducer from '../features/tetromino/tetrominoSlice';
import playfieldReducer from '../features/playfield/playfieldSlice';
import boardReducer from '../features/scoreboard/scoreboardSlice';

export const store = configureStore({
  reducer: {
    tetromino: tetrominoReducer,
    playfield: playfieldReducer,
    board: boardReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
