const { NOT_SELECTED } = require("./constants");
const Provider = require("../Provider");

const DEFAULT_SPORTS_AVAILABLE = [
  "Basketball",
  "Badminton",
  "Volleyball",
  "Netball",
  NOT_SELECTED,
];

class SportsManager {
  async getSports(isAdmin = false) {
    if (!this.sports) {
      this.sports = await this.fetchSports();
    }

    return (this.sports ?? []).filter((x) => Boolean(x.admin) === isAdmin);
  }

  static async getSports(isAdmin = false) {
    return manager.getSports(isAdmin);
  }

  async fetchSports() {
    const sports = await Provider.fetchSports();
    return [...sports.map((x) => x.name), NOT_SELECTED];
  }
}

const manager = new SportsManager();

module.exports = SportsManager;
