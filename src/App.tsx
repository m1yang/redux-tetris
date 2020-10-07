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
