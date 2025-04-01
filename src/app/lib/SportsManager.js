const { NOT_SELECTED } = require("./constants");
const Provider = require("../Provider");

class SportsManager {
  async getSports(isAdmin = false) {
    if (!this.sports) {
      this.sports = await this.fetchSports();
    }

    return (this.sports ?? [])
      .filter((x) => Boolean(x.admin) === isAdmin)
      .map((x) => x.name);
  }

  static async getSports(isAdmin = false) {
    return manager.getSports(isAdmin);
  }

  async fetchSports() {
    const sports = await Provider.fetchSports();
    return [
      ...sports,
      {
        admin: false,
        name: NOT_SELECTED,
      },
    ];
  }
}

const manager = new SportsManager();

module.exports = SportsManager;
