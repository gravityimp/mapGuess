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
    return this.leftRegions[
      Math.floor(Math.random() * this.leftRegions.length)
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

  guessState(region) {
    const cRegion = region;

    // Check for Settings specifics
    if (this.settings.difficulty === "Practice") {
      const speech = new window.SpeechSynthesisUtterance(region);
      speech.lang = "en";
      const synth = window.speechSynthesis;
      synth.speak(speech);

      this.currentRegion = `${region} [ABBR]`;
      this.guessedRegions = [{ name: region, tries: 0 }];

      return;
    }

    if (this.settings.mode === "Abbreviation") {
      region = states.filter((reg) => reg.name === region)[0].abbr;
    }
    if (this.settings.mode !== "Type" && this.currentRegion !== region) {
      this.tries++;
      return;
    }

    // Control checks
    if (!this.leftRegions.includes(region)) return;
    if (this.guessedRegions.filter((reg) => reg.name === region).length > 0)
      return;

    // Effects
    this.guessedRegions.push({ name: cRegion, tries: this.tries });
    this.leftRegions = this.leftRegions.filter((reg) => reg.name !== region);
    this.tries = 0;

    if (this.settings.mode !== "Type") {
      this.currentRegion = this.getRandomRegion();
    } else {
      this.currentRegion = "";
    }
  }

  checkWin() {
    return this.leftRegions.length === 0;
  }

  saveResult(timer) {
    const results = JSON.parse(localStorage.getItem("results"));
    results.push({
      time: timer.time,
      correct: `${this.getCorrectGuesses()}/${this.guessedRegions.length}`,
      percentage: this.getPercentage(),
      date: new Date(),
      settings: this.settings,
    });
    localStorage.setItem("results", JSON.stringify(results));
  }
}
