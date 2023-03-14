export default class Game {
  constructor(regions, settings) {
    this.settings = settings;
    this.leftRegions = regions;
    this.guessedRegions = [];

    this.currentRegion = "";
    this.tries = 0;
  }

  getCopyGame() {
    const game = new Game(this.regions, this.settings);
    game.leftRegions = this.leftRegions;
    game.guessedRegions = this.guessedRegions;
    game.currentRegion = this.currentRegion;
    game.tries = this.tries;
    return game;
  }

  getRandomRegion() {
    if (this.leftRegions === 0) return null;
    this.currentRegion =
      this.leftRegions[Math.floor(Math.random() * this.leftRegions.length)][
        this.settings.field
      ];
  }

  getPercentage() {
    let points = this.guessedRegions.length;
    if (points === 0) return 0;

    this.guessedRegions.forEach((region) => {
      points -= region.tries === 0 ? 0 : 1 - 1 / (region.tries + 1);
    });
    const result = (100 * points) / this.guessedRegions.length;
    return Math.round(result * 100) / 100;
  }

  getCorrectGuesses() {
    const correct = this.guessedRegions.filter((reg) => reg.tries === 0);
    return correct.length;
  }

  makeGuess(region) {
    // Helper constant to hold region name | case: abbreviations
    const cRegion = region;

    // Sould be guessed?
    if (
      this.leftRegions.filter(
        (reg) => reg.name === this.transformTypeRegion(region)
      ).length === 0
    ) {
      return;
    }

    // Check for Settings specifics
    if (this.settings.difficulty === "Practice") {
      const speech = new window.SpeechSynthesisUtterance(region);
      speech.lang = "en";
      const synth = window.speechSynthesis;
      synth.speak(speech);

      this.currentRegion = `${region} [${
        this.leftRegions.filter((reg) => reg.name === region)[0].abbr
      }]`;
      this.guessedRegions = [{ name: region, tries: 0 }];

      return;
    }

    if (this.settings.mode === "Abbreviation") {
      region = this.leftRegions.filter(
        (reg) => reg.name.toLocaleLowerCase() === region.toLocaleLowerCase()
      )[0].abbr;
    } // Alaska => AL
    if (
      this.settings.mode !== "Type" &&
      this.currentRegion.toLocaleLowerCase() !== region.toLocaleLowerCase()
    ) {
      this.tries++;
      return;
    } // Check for correct region

    // Effects
    this.guessedRegions.push({ name: cRegion, tries: this.tries });
    this.leftRegions = this.leftRegions.filter((reg) => reg.name !== cRegion);
    this.tries = 0;

    if (this.settings.mode !== "Type" && this.leftRegions.length > 0) {
      this.getRandomRegion();
    } else {
      this.currentRegion = "";
    }
  }

  checkWin() {
    return this.leftRegions.length === 0;
  }

  saveResult(timer) {
    const results = JSON.parse(localStorage.getItem("results")) || [];
    results.push({
      time: timer,
      correct: `${this.getCorrectGuesses()}/${this.guessedRegions.length}`,
      percentage: this.getPercentage(),
      date: new Date(),
      settings: this.settings,
    });
    localStorage.setItem("results", JSON.stringify(results));
  }

  transformTypeRegion(region) {
    if (region.length === 0) return "";
    return region[0].toLocaleUpperCase() + region.slice(1, region.length);
  }
}
