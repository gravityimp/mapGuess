import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const MapChart = ({ guessedRegions, makeGuess, settings }) => {
  function getGuessIndex(region) {
    const idx = guessedRegions.findIndex(
      (e) => e.name.toLocaleLowerCase() === region.toLocaleLowerCase()
    );
    return idx;
  }

  function getFillColor(region) {
    const idx = getGuessIndex(region);
    if (idx === -1) return "#DDD";
    if (guessedRegions[idx].tries === 0) return "#5A5";
    else if (guessedRegions[idx].tries > 2) return "#F32";
    else return "#FB0";
  }

  /*
    For map variety:
    - Json map: { projection, geoUrl }
    - App -> Guess -> MapChart
  */

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
                  fill={
                    settings.difficulty !== "Hard"
                      ? getFillColor(geo.properties.name)
                      : "#DDD"
                  }
                  className={
                    getGuessIndex(geo.properties.name) !== -1 &&
                    settings.difficulty === "Hard"
                      ? "piece"
                      : ""
                  }
                  style={{
                    default: {
                      outline: "none",
                      border:
                        getGuessIndex(geo.properties.name) !== -1 &&
                        settings.difficulty === "Practice"
                          ? "#F11"
                          : "none",
                    },
                    hover: {
                      fill: getGuessIndex(geo.properties.name) === -1 && "#AAA",
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      outline: "none",
                    },
                  }}
                  onClick={
                    settings.mode !== "Type"
                      ? () => makeGuess(geo.properties.name)
                      : null
                  }
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
