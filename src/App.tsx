import React, {useEffect} from "react";
// import logo from './logo.svg';
import "./App.css";
import { Playfield } from "./features/playfield/Playfield";
import { Scoreboard } from "./features/scoreboard/Scoreboard";
import { Joystick } from "./features/joystick/Joystick";

function App() {
  // 兼容mobile高度
  useEffect(()=> {
    const setHight = () => {
      document.documentElement.style
        .setProperty('--vh', `${window.innerHeight/100}px`);
    }

    window.addEventListener('resize', setHight)
    return () => window.removeEventListener('resize', setHight)
  })

  // window.onload = function () {
  //   // Prevent double click to enlarge
  //   var lastTouchEnd = 0;
  //   document.addEventListener('touchstart', function (event) {
  //     if (event.touches.length > 1) {
  //       event.preventDefault();
  //     }
  //   });
  //   document.addEventListener('touchend', function (event) {
  //     var now = (new Date()).getTime();
  //     if (now - lastTouchEnd <= 300) {
  //       event.preventDefault();
  //     }
  //     lastTouchEnd = now;
  //   }, false);

  //   // Prevent two fingers from zooming in
  //   document.addEventListener('gesturestart', function (event) {
  //     event.preventDefault();
  //   });
  // }

  return (
    <div className="App">
      <div className="gameboy">
        <div className="screen">
          <Playfield />
          <Scoreboard />
        </div>
        <Joystick />
      </div>
    </div>
  );
}

export default App;
