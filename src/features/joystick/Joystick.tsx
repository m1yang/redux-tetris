import React from "react";
import { useSelector, useDispatch } from "react-redux";

import styles from "./Joystick.module.css";
import { moveLeft, softDrop, moveRight } from "../playfield/playfieldSlice";
import { rotateRight } from "../tetromino/tetrominoSlice";
import { selectLength } from "../tetromino/tetrominoSelectors";

// type Control = "rotateRight" | "softDrop" | "moveLeft" | "moveRight";

/* Matrix 模块渲染游戏场地
长10x高20
触发mino的生成和消除
生成方块后，当方块触底时触发useDispatch下一个方块
给记分板输出获取的积分
判断游戏是否结束
*/
export function Joystick() {
  const dispatch = useDispatch();
  // x取值范围最大是[0,9]，减去方块长度，是当前能移动的范围
  // const offset = 10 - useSelector(selectLength);
  // 事件绑定，先上下左右4个按钮看看
  // 键盘事件、触摸事件、鼠标事件
  const onRotateRight = () => {
    dispatch(rotateRight());
  };

  const onMoveLeft = () => {
    dispatch(moveLeft());
  };

  const onSoftDrop = () => {
    dispatch(softDrop());
  };

  // const onMoveRight = () => {
  //   dispatch(moveRight(offset));
  // };

  document.addEventListener("keydown", function (e) {
    switch (e.keyCode) {
      case 38:
        //上
        dispatch(rotateRight());
        break;
      case 40:
        //下
        dispatch(softDrop());
        break;
      case 37:
        //左
        dispatch(moveLeft());
        break;

      // case 39:
      //   dispatch(moveRight(offset));
      //   break;

      default:
        break;
    }
  });

  return (
    // 绘制摇杆
    <div className={styles.joystick}>
      <div className={styles.direction}>
        <div className={styles.gap} />
        <button className={styles.up} type="button" onClick={onRotateRight} />
        <div className={styles.gap} />

        <button className={styles.left} type="button" onClick={onMoveLeft} />
        <div className={styles.gap} />
        <button className={styles.right} type="button" onClick={onMoveLeft} />

        <div className={styles.gap} />
        <button className={styles.down} type="button" onClick={onSoftDrop}/>
        <div className={styles.gap} />
      </div>
      <div className={styles.AB}>
        <button className={styles.A} type="button" />
        <button className={styles.B} type="button" />
      </div>
      <div className={styles.start}>
        <button className={styles.pause} type="button" />
        <button className={styles.reset} type="button" />
      </div>
    </div>
  );
}
