import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Guess from "./Guess";
import ButtonBlock from "./components/UI/ButtonBlock";
import ButtonGroup from "./components/UI/ButtonGroup";
import "./styles.css";

import settings from "./data/settings.json";

export default function App() {
  const [mode, setMode] = useState("Pin");
  const [difficulty, setDifficulty] = useState("Easy");
  const [active, setActive] = useState(false);
  const [results, setResults] = useState([]);

  const guessRef = useRef(null);

  function activate() {
    setActive(true);
    setTimeout(() => {
      if (guessRef.current) {
        guessRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 1);
  }

  function deactivate() {
    setActive(false);
  }

  useEffect(() => {
    setResults(JSON.parse(localStorage.getItem('results')) || []);
  }, [active]);

  return (
    <>
      <Header />
      <div className="container">
        <form
          className={`form__settings ${active && "form__settings--hidden"}`}
        >
          <h2 className="form__header">Settings</h2>
          <fieldset className="field field__mode">
            <legend className="field__legened" align="center">
              Mode
            </legend>
            <ButtonBlock>
              <button
                type="button"
                className={`button button-block__item--1 ${
                  mode === "Pin" && "button--active"
                }`}
                onClick={() => {
                  setMode("Pin");
                  setDifficulty("Easy");
                }}
              >
                Pin
              </button>
              <button
                type="button"
                className={`button button-block__item--2 ${
                  mode === "Type" && "button--active"
                }`}
                onClick={() => {
                  setMode("Type");
                  setDifficulty("Easy");
                }}
              >
                Type
              </button>
              <button
                type="button"
                className={`button button-block__item--3 ${
                  mode === "Abbreviation" && "button--active"
                }`}
                onClick={() => {
                  setMode("Abbreviation");
                  setDifficulty("Normal");
                }}
              >
                Abbreviation
              </button>
            </ButtonBlock>
          </fieldset>
          <fieldset className="field field__difficulty">
            <legend className="field__legened" align="center">
              Difficulty
            </legend>
            <ButtonGroup active={difficulty}>
              {settings[`mode${mode}`].difficulties.map((diff, index) => {
                return (
                  <button
                    type="button"
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                  >
                    {diff}
                  </button>
                );
              })}
            </ButtonGroup>
          </fieldset>
          <button
            type="button"
            className="button button__play"
            onClick={activate}
          >
            Play
          </button>
        </form>
        <div className={`settings ${!active && "settings--hidden"}`}>
          <h1>USA: States</h1>
          <button className="button button--giveup" onClick={deactivate}>
            Back
          </button>
        </div>
      </div>
      {active ? (
        <div className="container game">
          <Guess
            ref={guessRef}
            settings={{ mode: mode, difficulty: difficulty }}
          />
        </div>
      ) : results.length > 0 ? (
        <div className="container--result">
          {
            results.map((res) => {
              return (
                <div key={res.date} className="result">
                  <h2>{new Date(res.date).toLocaleDateString()}</h2>
                  <p>Time: {res.time}</p>
                  <p>Guessed: {res.correct} ({res.percentage || 100}%)</p>
                  <h3>Settings</h3>
                  <p>Mode: {res.settings.mode}</p>
                  <p>Difficulty: {res.settings.difficulty}</p>
                </div>
              )
            })
          }
        </div>
      ) : null
      }
    </>
  );
}
