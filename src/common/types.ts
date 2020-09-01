// Blocks 每一行上固定的方块
export interface Blocks {
    [line: number]: number[];
}

// Position 方块的位置
export interface Position {
    x: number;
    y: number;
}