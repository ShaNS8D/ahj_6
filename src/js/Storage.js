export default class Storage {
  getPinCards() {
    return JSON.parse(localStorage.getItem("pinCards")) || [];
  }

  save(data) {
    localStorage.setItem("pinCards", JSON.stringify(data));
  }
}
