import { useEffect, useState, forwardRef } from "react";
import Modal from "./components/UI/Modal";
import MapChart from "./components/MapChart";
import ButtonGroup from "./components/UI/ButtonGroup";
import RadioButton from "./components/UI/RadioButton";

import states from "./data/states.json";

export default forwardRef(function Guess(props, ref) {
  const timerStart = Date.now();

  const [leftStates, setLeftStates] = useState(states);
  const [guessedStates, setGuessedStates] = useState([]);
  const [currentState, setCurrentState] = useState(getRandomState(leftStates));
  const [tries, setTries] = useState(0);
  const [timer, setTimer] = useState({ time: "00:00:00", completed: false });
  const [timerRef, setTimerRef] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  function getRandomState(newStates) {
    if (newStates.length === 0) return null;
    return newStates[Math.floor(Math.random() * newStates.length)];
  }

  function getPercentage() {
    let points = guessedStates.length;
    if (points === 0) return 0;
    guessedStates.forEach((state) => {
      points -= state.tries === 0 ? 0 : 1 - 1 / (state.tries + 1);
    });
    const result = (100 * points) / guessedStates.length;
    return Math.round(result * 100) / 100;
  }

  function getCorrectGuesses() {
    const correct = guessedStates.filter((state) => state.tries === 0);
    return correct.length;
  }

  function guessState(state) {
    // const speech = new window.SpeechSynthesisUtterance(state);
    // speech.lang = "en";

    // const synth = window.speechSynthesis;
    // synth.speak(speech);

    if (guessedStates.filter((e) => e.name === state).length > 0) return;
    if (currentState !== state) {
      setTries(tries + 1);
      return;
    }
    setGuessedStates([...guessedStates, { name: state, tries: tries }]);
    setLeftStates([...leftStates.filter((s) => s !== state)]);
    setCurrentState(getRandomState(leftStates.filter((s) => s !== state)));
    setTries((prev) => 0);

    checkWin();
  }

  function updateTimer() {
    const now = Date.now();
    const date = new Date(null);
    date.setSeconds(Math.floor((now - timerStart) / 1000));
    date.setHours(0);
    setTimer({ time: date.toLocaleTimeString(), completed: false });
  }

  function checkWin() {
    if (leftStates.length !== 1) return;
    clearInterval(timerRef);
    setTimer({ ...timer, completed: true });
    openResultModal();

    const results = JSON.parse(localStorage.getItem("results")) || [];
    results.push({
      time: timer,
      correct: `${getCorrectGuesses()}/${guessedStates.length}`,
      date: new Date(),
    });
    localStorage.setItem("results", JSON.stringify(results));
  }

  function openResultModal() {
    setModalOpen(true);
  }

  function closeResultModal() {
    setModalOpen(false);
  }

  useEffect(() => {
    const _timer = setInterval(updateTimer, 1000);
    setTimerRef(_timer);
    return () => {
      clearInterval(_timer);
    };
  }, []);

  return (
    <div className="container" ref={ref}>
      <div className="guess">
        <h2>{timer.time}</h2>
        {currentState ? (
          <h2 className="h--stateGuess">{currentState}</h2>
        ) : (
          <h2 className="h--completed">Good Job!</h2>
        )}

        <h2>{getPercentage()}%</h2>
      </div>
      <div className="map">
        <MapChart guessedStates={guessedStates} guessState={guessState} />
        {modalOpen ? (
          <Modal header="Results" close={closeResultModal}>
            <h4>Good Job!</h4>
            <p>Your time: {timer.time}</p>
            <p>Percentage: {getPercentage()}%</p>
            <p>
              Correct guesses: {getCorrectGuesses()}/{guessedStates.length}
            </p>
            <button className="button" onClick={closeResultModal}>
              Close
            </button>
          </Modal>
        ) : null}
      </div>
    </div>
  );
});
