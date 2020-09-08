import React from "react";
// import { useSelector, useDispatch } from "react-redux";

import "./Popup.css";

enum GameStatus {
    over,
    start,
    pause
}

interface GameProps {
    game: GameStatus
    fn: any
}

// 弹窗组件 展示开始和结束两个界面
export const Popup = ({game, fn}:GameProps) => {
    const notice = game ? 'Tetris' : 'Game Over!'
    const message = game ? 'Tap here to start!' : 'Continue...'
    // 点击后隐藏元素，受暂停状态影响，一暂停就展示
    // click事件控制暂停与否
    // document.getElementById("popup").style.visibility = "collapse";
    // 游戏结束，展示弹窗且click事件重置游戏
    const onGameClick = () => {
        fn()
    }
    return (
        <div className='popup' id='popup' >
            <div className='notice'>{notice}</div>
            <div className='message' onClick={onGameClick}>{message}</div>
        </div>
    );
};
