import React from "react";
import { geoCentroid } from "d3-geo";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const MapChart = ({ guessedStates, guessState }) => {
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
      <Geographies geography={geoUrl}>
        {({ geographies }) => (
          <>
            {geographies.map((geo) => {
              return (
                <Geography
                  key={geo.rsmKey}
                  stroke="#FFF"
                  geography={geo}
                  fill={getFillColor(geo.properties.name)}
                  style={{
                    hover: {
                      fill: getStateIndex(geo.properties.name) === -1 && "#555",
                    }
                  }}
                  onClick={() => guessState(geo.properties.name)}
                />
              );
            })}
          </>
        )}
      </Geographies>
    </ComposableMap>
  );
};

export default MapChart;
