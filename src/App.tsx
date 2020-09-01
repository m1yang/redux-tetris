import React from "react";
// import logo from './logo.svg';
import "./App.css";
import { Playfield } from "./features/playfield/Playfield";
import { Scoreboard } from "./features/scoreboard/Scoreboard";
import { Joystick } from "./features/joystick/Joystick";

function App() {
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
