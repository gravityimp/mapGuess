import { useState } from "react";
import MapChart from "./components/MapChart";

import states from "./data/states.json";

export default function App() {
  const [leftStates, setLeftStates] = useState(states);
  const [guessedStates, setGuessedStates] = useState([]);
  const [currentState, setCurrentState] = useState(getRandomState(leftStates));
  const [tries, setTries] = useState(0);

  function getRandomState(newStates) {
    if(newStates.length === 0) return null;
    return newStates[Math.floor(Math.random() * newStates.length)];
  }

  function getPercentage() {
    let points = guessedStates.length;
    if (points === 0) return 0;
    guessedStates.forEach((state) => {
      points -= state.tries === 0 ? 0 : 1 / (state.tries + 1);
    });
    const result = (100 * points) / guessedStates.length;
    return Math.round(result * 100) / 100;
  }

  function guessState(state) {
    if (guessedStates.filter((e) => e.name === state).length > 0) return;
    if (currentState !== state) {
      setTries(tries + 1);
      return;
    }
    setGuessedStates([...guessedStates, { name: state, tries: tries }]);
    setLeftStates([...leftStates.filter(s => s !== state)]);
    setCurrentState(getRandomState(leftStates.filter(s => s !== state)));
    setTries(prev => 0);
  }

  return (
    <div style={{ width: "70%", height: "70%" }}>
      <h2>State: {currentState}</h2>
      <h2>Tries: {tries}</h2>
      <h2>Percentage: {getPercentage()}%</h2>
      <MapChart guessedStates={guessedStates} guessState={guessState} />
    </div>
  );
}
