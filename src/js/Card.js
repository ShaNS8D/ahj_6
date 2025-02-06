export default class Card {
  constructor(task) {
    this.task = task;
  }

  init() {
    this.bindToDOM();
  }

  static template(task, id, type) {
    return `
			<div class="pinned__card " data-id=${id}_${type}>
				<span class="task__title">${task}</span>
				<button class="task__del hidden"></button>
			</div>
    `;
  }

  bindToDOM() {
    this.cell = document.querySelector(".cards-container");
    this.pin = this.addTask(this.task);
    this.cell.insertAdjacentHTML("beforeend", this.pin);
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
