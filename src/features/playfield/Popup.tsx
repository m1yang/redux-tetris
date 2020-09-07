import React from "react";
// import { useSelector, useDispatch } from "react-redux";

// 弹窗组件 展示开始和结束两个界面
export const Popup = (start: number) => {
    const notice = start ? 'Tetris' : 'Game Over'
    const message = start ? 'Tap here to start' : 'Continue...'
    // 增加display属性控制弹窗展示 
    return (
        <div className='popup'>
            <div className='notice'>{notice}</div>
            <div className='message'>{message}</div>
        </div>
    );
};
