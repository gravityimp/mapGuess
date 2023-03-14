import { useEffect, useState, forwardRef } from "react";
import Modal from "./components/UI/Modal";
import MapChart from "./components/MapChart";

import states from "./data/states.json";
const stateNames = states.map((state) => state.name);

export default forwardRef(function Guess({ settings }, ref) {
  const timerStart = Date.now();

  const [leftRegions, setLeftRegions] = useState(stateNames);
  const [guessedRegions, setGuessedRegions] = useState([]);
  const [currentRegion, setCurrentRegion] = useState("");
  const [tries, setTries] = useState(0);
  const [timer, setTimer] = useState({
    time: "00:00:00",
    completed: false,
    ref: null,
  });

  const [modalOpen, setModalOpen] = useState(false);

  function getRandomRegion(newRegions) {
    if (newRegions.length === 0) return null;
    return newRegions[Math.floor(Math.random() * newRegions.length)];
  }

  function getPercentage() {
    let points = guessedRegions.length;
    if (points === 0) return 0;

    guessedRegions.forEach((region) => {
      points -= region.tries === 0 ? 0 : 1 - 1 / (region.tries + 1);
    });
    const result = (100 * points) / guessedRegions.length;

    return Math.round(result * 100) / 100;
  }

  function getCorrectGuesses() {
    const correct = guessedRegions.filter((reg) => reg.tries === 0);
    return correct.length;
  }

  function guessState(region) {
    const cRegion = region;
    if (settings.difficulty === "Practice") {
      const speech = new window.SpeechSynthesisUtterance(region);
      speech.lang = "en";
      const synth = window.speechSynthesis;
      synth.speak(speech);

      setCurrentRegion(
        `${region} (${states.filter((reg) => reg.name === region)[0].abbr})`
      );
      setGuessedRegions([{ name: region, tries: 0 }]);

      return;
    }
    if (settings.mode === "Abbreviation") {
      region = states.filter((reg) => reg.name === region)[0].abbr;
    }

    if (guessedRegions.filter((reg) => reg.name === region).length > 0) return;
    if (!leftRegions.includes(region)) return;
    if (currentRegion !== region && settings.mode !== "Type") {
      setTries(tries + 1);
      return;
    }

    setGuessedRegions((prev) => [
      ...guessedRegions,
      { name: cRegion, tries: tries },
    ]);
    setLeftRegions((prev) => [...leftRegions.filter((reg) => reg !== region)]);
    if (settings.mode !== "Type") {
      setCurrentRegion(getRandomRegion(leftRegions.filter((reg) => reg !== region)));
    } else {
      setCurrentRegion("");
    }
    setTries((prev) => 0);

    checkWin();
  }

  function updateTimer() {
    const now = Date.now();
    const date = new Date(null);
    date.setSeconds(Math.floor((now - timerStart) / 1000));
    date.setHours(0);
    setTimer({ ...timer, time: date.toLocaleTimeString() });
  }

  function checkWin() {
    if (leftRegions.length !== 1) return;
    
    clearInterval(timer.ref);
    setTimer({ ...timer, completed: true });
    openResultModal();

    const results = JSON.parse(localStorage.getItem("results")) || [];
    const correct = tries === 0 ? 1 : 0;
    results.push({
      time: timer.time,
      correct: `${getCorrectGuesses() + correct}/${guessedRegions.length + 1}`,
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
    setCurrentRegion(e.target.value);
    guessState(e.target.value);
  }

  function getMiddleAnchor() {
    if (settings.mode === "Type") {
      return (
        <input
          value={currentRegion}
          onChange={handleInputChange}
          className="input--type"
        />
      );
    }
    if (currentRegion) {
      return <h2 className="h--stateGuess">{currentRegion}</h2>;
    }
    return <h2 className="h--completed">Good Job!</h2>;
  }

  function getRightAnchor() {
    if (settings.mode === "Type") {
      return `${getCorrectGuesses()}/${
        guessedRegions.length + leftRegions.length
      }`;
    }
    if (settings.difficulty === "Practice") {
      return "Practice";
    }
    return `${getPercentage()}%`;
  }

  useEffect(() => {
    if (settings.mode === "Abbreviation") {
      setLeftRegions(states.map((s) => s.abbr));
      setCurrentRegion(getRandomRegion(states.map((s) => s.abbr)));
    } else if (settings.mode !== "Type" && settings.difficulty !== "Practice") {
      setCurrentRegion(getRandomRegion(leftRegions));
    }

    const _timer = setInterval(updateTimer, 1000);
    setTimer({ ...timer, ref: _timer });
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
          guessedRegions={guessedRegions}
          makeGuess={guessState}
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
              Correct guesses: {getCorrectGuesses()}/{guessedRegions.length}
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
