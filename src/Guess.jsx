import { useEffect, useState, forwardRef } from "react";
import Modal from "./components/UI/Modal";
import MapChart from "./components/MapChart";
import Game from "./models/Game";

import states from "./data/states.json";

export default forwardRef(function Guess({ settings }, ref) {
  const timerStart = Date.now();

  const [game, setGame] = useState(new Game(states, settings));
  const [timer, setTimer] = useState("00:00:00");
  const [timerRef, setTimerRef] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  function makeGuess(region) {
    game.makeGuess(region);
    setGame(game.getCopyGame());

    if (game.checkWin()) {
      clearInterval(timerRef);
      game.saveResult(timer);
      openResultModal();
    }
  }

  function updateTimer() {
    const now = Date.now();
    const date = new Date(null);
    date.setSeconds(Math.floor((now - timerStart) / 1000));
    date.setHours(0);
    setTimer(date.toLocaleTimeString());
  }

  function openResultModal() {
    setModalOpen(true);
  }

  function closeResultModal() {
    setModalOpen(false);
  }

  function handleInputChange(e) {
    game.currentRegion = e.target.value;
    makeGuess(e.target.value);
  }

  function getMiddleAnchor() {
    if (settings.mode === "Type") {
      return (
        <input
          value={game.currentRegion}
          onChange={handleInputChange}
          className="input--type"
        />
      );
    }
    if (game.currentRegion) {
      return <h2 className="h--stateGuess">{game.currentRegion}</h2>;
    }
    return <h2 className="h--completed">Good Job!</h2>;
  }

  function getRightAnchor() {
    if (settings.mode === "Type") {
      return `${game.getCorrectGuesses()}/${
        game.guessedRegions.length + game.leftRegions.length
      }`;
    }
    if (settings.difficulty === "Practice") {
      return "Practice";
    }
    return `${game.getPercentage()}%`;
  }

  useEffect(() => {
    if (settings.mode !== "Type" && settings.difficulty !== "Practice") {
      game.getRandomRegion(settings.field);
      setGame(game.getCopyGame());
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
        <h2>{timer}</h2>
        {getMiddleAnchor()}
        <h2>{getRightAnchor()}</h2>
      </div>
      <div className="map">
        <MapChart
          guessedRegions={game.guessedRegions}
          makeGuess={makeGuess}
          settings={settings}
        />
        {modalOpen ? (
          <Modal header="Results" close={closeResultModal}>
            <h4>Good Job!</h4>

            <p>Mode: {settings.mode}</p>
            <p>Difficulty: {settings.difficulty}</p>

            <p>Your time: {timer}</p>
            <p>Percentage: {game.getPercentage()}%</p>
            <p>
              Correct guesses: {game.getCorrectGuesses()}/
              {game.guessedRegions.length}
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
