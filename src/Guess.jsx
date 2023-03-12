import { useEffect, useState, forwardRef } from "react";
import Modal from "./components/UI/Modal";
import MapChart from "./components/MapChart";

import states from "./data/states.json";
const stateNames = states.map((state) => state.name);

export default forwardRef(function Guess({ settings }, ref) {
  const timerStart = Date.now();

  const [leftStates, setLeftStates] = useState(stateNames);
  const [guessedStates, setGuessedStates] = useState([]);
  const [currentState, setCurrentState] = useState("");
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
    const cState = state;
    if (settings.difficulty === "Practice") {
      const speech = new window.SpeechSynthesisUtterance(state);
      speech.lang = "en";
      const synth = window.speechSynthesis;
      synth.speak(speech);

      setCurrentState(state);
      setGuessedStates([{ name: state, tries: 0 }]);

      return;
    }
    if (settings.mode === "Abbreviation") {
      state = states.filter((s) => s.name === state)[0].abbr;
    }

    if (guessedStates.filter((e) => e.name === state).length > 0) return;
    if (!leftStates.includes(state)) return;
    if (currentState !== state && settings.mode !== "Type") {
      setTries(tries + 1);
      return;
    }

    setGuessedStates((prev) => [
      ...guessedStates,
      { name: cState, tries: tries },
    ]);
    setLeftStates((prev) => [...leftStates.filter((s) => s !== state)]);
    if (settings.mode !== "Type") {
      setCurrentState(getRandomState(leftStates.filter((s) => s !== state)));
    } else {
      setCurrentState("");
    }
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
    const correct = tries === 0 ? 1 : 0;
    results.push({
      time: timer,
      correct: `${getCorrectGuesses() + correct}/${guessedStates.length + 1}`,
      percentage: getPercentage(),
      date: new Date(),
      settings: settings,
    });
    localStorage.setItem("results", JSON.stringify(results));
  }

  function openResultModal() {
    setModalOpen(true);
  }

  function closeResultModal() {
    setModalOpen(false);
  }

  function handleInputChange(e) {
    setCurrentState(e.target.value);
    guessState(e.target.value);
  }

  function getMiddleAnchor() {
    if (settings.mode === "Type") {
      return (
        <input
          value={currentState}
          onChange={handleInputChange}
          className="input--type"
        />
      );
    }
    if (currentState) {
      return <h2 className="h--stateGuess">{currentState}</h2>;
    }
    return <h2 className="h--completed">Good Job!</h2>;
  }

  function getRightAnchor() {
    if (settings.mode === "Type") {
      return `${getCorrectGuesses()}/${
        guessedStates.length + leftStates.length
      }`;
    }
    if (settings.difficulty === "Practice") {
      return "Practice";
    }
    return `${getPercentage()}%`;
  }

  useEffect(() => {
    if (settings.mode === "Abbreviation") {
      setLeftStates(states.map((s) => s.abbr));
      setCurrentState(getRandomState(states.map((s) => s.abbr)));
    } else if (settings.mode !== "Type" && settings.difficulty !== "Practice") {
      setCurrentState(getRandomState(leftStates));
    }

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
        {getMiddleAnchor()}
        <h2>{getRightAnchor()}</h2>
      </div>
      <div className="map">
        <MapChart
          guessedStates={guessedStates}
          guessState={guessState}
          settings={settings}
        />
        {modalOpen ? (
          <Modal header="Results" close={closeResultModal}>
            <h4>Good Job!</h4>

            <p>Mode: {settings.mode}</p>
            <p>Difficulty: {settings.difficulty}</p>

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
