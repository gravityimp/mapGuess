import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const MapChart = ({ guessedStates, guessState, settings }) => {
  function getStateIndex(state) {
    const idx = guessedStates.findIndex(
      (e) => e.name.toLocaleLowerCase() === state.toLocaleLowerCase()
    );
    return idx;
  }

  function getFillColor(state) {
    const idx = getStateIndex(state);
    if (idx === -1) return "#DDD";
    if (guessedStates[idx].tries === 0) return "#5A5";
    else if (guessedStates[idx].tries > 2) return "#F32";
    else return "#FB0";
  }

  return (
    <ComposableMap projection="geoAlbersUsa">
      <ZoomableGroup
        translateExtent={[
          [0, 0],
          [800, 600],
        ]}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              return (
                <Geography
                  key={geo.rsmKey}
                  stroke="#FFF"
                  geography={geo}
                  fill={settings.difficulty !== "Hard" ? getFillColor(geo.properties.name) : '#DDD'}
                  className={
                    getStateIndex(geo.properties.name) !== -1 &&
                    settings.difficulty === "Hard"
                      ? "piece"
                      : ""
                  }
                  style={{
                    default: {
                      outline: "none",
                      border:
                        getStateIndex(geo.properties.name) !== -1 &&
                        settings.difficulty === "Practice"
                          ? "#F11"
                          : "none",
                    },
                    hover: {
                      fill: getStateIndex(geo.properties.name) === -1 && "#AAA",
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      outline: "none",
                    },
                  }}
                  onClick={settings.mode !== "Type" ? () => guessState(geo.properties.name) : null}
                />
              );
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
};

export default MapChart;
