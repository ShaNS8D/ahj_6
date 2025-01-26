export default class Card {
  constructor(task) {
    this.task = task;
  }

  init() {
    this.bindToDOM();
  }

  static template(task) {
    return `
			<div class="pinned__card ">
				<span class="task__title">${task}</span>
				<button class="task__del hidden"></button>
			</div>
`;
  }

  bindToDOM() {
    this.cell = document.querySelector(".cell__active");
    this.pin = this.addTask(this.task);
    this.cell.insertAdjacentHTML("beforeend", this.pin);
    this.cell.classList.remove("cell__active");
  }

  addTask() {
    const formArea = document.querySelector(".form-text");
    this.task = formArea.value.trim();

    if (this.task) {
      const text = this.constructor.template(this.task);
      return text;
    }
    return false;
  }
}
