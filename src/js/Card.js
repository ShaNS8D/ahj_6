export default class Card {
  constructor(task) {
    this.task = task;
  }

  init(container) {
    this.bindToDOM(container);
  }

  static template(task, id, type) {
    return `
      <div class="pinned__card" data-id="${id}_${type}">
        <span class="task__title">${task}</span>
        <button class="task__del hidden"></button>
      </div>
    `;
  }

  bindToDOM(container) {
    if (!container) {
      console.error("Контейнер для карточки не найден!");
      return;
    }

    const cardHTML = this.addTask(this.task);
    if (cardHTML) {
      container.insertAdjacentHTML("beforeend", cardHTML);
    }
  }

  addTask(task) {
    if (!task) {
      console.error("Задача не может быть пустой!");
      return false;
    }

    const id = Date.now();
    const type = "default";
    return this.constructor.template(task, id, type);
  }
}
