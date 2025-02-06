/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/Board.js
class Board {
  constructor(container) {
    this.container = container;
    this.board = null;
  }
  createBoard() {
    this.board = document.createElement("div");
    this.board.classList.add("board");
    this.bindToDOM();
  }
  static get markup() {
    return `
	<div class="cell cell-todo" >
		<h3 class="title">todo</h3>		
    <div class="cards-container" data-cell="todo"></div>
    <button class="button button_add">And another card</button>
	</div>
	<div class="cell cell-in-progress" >
		<h3 class="title">in-progress</h3>
		
    <div class="cards-container" data-cell="in-progress"></div>
    <button class="button button_add">And another card</button>
	</div>
	<div class="cell cell-done" >
		<h3 class="title">done</h3>
		
    <div class="cards-container" data-cell="done"></div>
    <button class="button button_add">And another card</button>
	</div>
`;
  }
  bindToDOM() {
    this.container.insertAdjacentHTML("afterbegin", this.constructor.markup);
  }
  getBoard() {
    this.createBoard();
    return this.board;
  }
}
;// CONCATENATED MODULE: ./src/js/Card.js
class Card {
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
;// CONCATENATED MODULE: ./src/js/Storage.js
class Storage {
  getPinCards() {
    return JSON.parse(localStorage.getItem("pinCards")) || [];
  }
  save(data) {
    localStorage.setItem("pinCards", JSON.stringify(data));
  }
}
;// CONCATENATED MODULE: ./src/js/CardController.js
/* eslint-disable prettier/prettier */


class CardController {
  constructor(board) {
    this.board = board;
    this.state = [];
    this.placeholder = null;
    // this.dragEl = null;
  }
  init() {
    this.board.getBoard();
    this.container = document.querySelector(".container");
    this.onClickAddCard();
    this.container.addEventListener("click", this.onClickDeleteCard.bind(this));
    this.container.addEventListener("click", this.onClickPinCard.bind(this));
    this.container.addEventListener("click", this.deletePinnedCard.bind(this));
    this.container.addEventListener("mouseover", e => this.onMouseOver(e));
    this.container.addEventListener("mouseout", e => this.onMouseOut(e));
    this.container.addEventListener("mousedown", e => this.dragDown(e));
    this.container.addEventListener("mousemove", e => this.dragMove(e));
    this.container.addEventListener("mouseup", e => this.dragUp(e));
    this.container.addEventListener("mouseleave", e => this.dragLeave(e));
    this.storage = new Storage();
    this.state = this.storage.getPinCards();
    this.loadState(this.state);
  }
  static get creatingCard() {
    return `
      <div class="content">       
        <div class="form">
          <form class="form-area">
            <textarea class="form-text" rows="5" placeholder="---"></textarea>
          </form>
        </div>
        <div class="block__button">
          <button class="form-button__add">add</button>
          <button class="form-button__del">X</button>
        </div>
      </div>
    `;
  }
  getMargin(drag) {
    if (drag) {
      return window.getComputedStyle(drag)["margin-top"];
    }
  }
  onClickAddCard() {
    this.addCardBtn = document.querySelectorAll(".button_add");
    this.addCardBtn.forEach(item => {
      item.addEventListener("click", () => {
        const cardsContainer = item.parentElement.querySelector('.cards-container');
        cardsContainer.insertAdjacentHTML("beforeend", this.constructor.creatingCard);
        item.classList.add("hidden");
      });
    });
  }
  onClickDeleteCard(e) {
    e.preventDefault();
    if (!e.target.classList.contains("form-button__del")) {
      return;
    }
    if (e.target.classList.contains("form-button__del")) {
      e.target.parentElement.closest(".content").remove();
    }
    document.querySelectorAll(".button_add").forEach(item => {
      item.classList.remove("hidden");
    });
  }
  onClickPinCard(e) {
    e.preventDefault();
    this.card = new Card();
    const formArea = document.querySelector(".form-text");
    if (!e.target.classList.contains("form-button__add") || formArea.value === "") {
      return;
    }
    const cardsContainer = e.currentTarget.querySelector('.cards-container');
    const type = cardsContainer.dataset.cell;
    this.card.init();
    const pinLoad = {
      description: this.card.task,
      type
    };
    this.state.push(pinLoad);
    this.storage.save(this.state);
    e.target.parentElement.closest(".content").remove();
    document.querySelectorAll(".button_add").forEach(item => {
      item.classList.contains("hidden");
      item.classList.remove("hidden");
    });
  }
  deletePinnedCard(e) {
    e.preventDefault();
    if (!e.target.classList.contains("task__del")) {
      return;
    }
    const pin = e.target.previousElementSibling.textContent;
    const pinItem = this.state.findIndex(item => item.description === pin);
    this.state.splice(pinItem, 1);
    this.storage.save(this.state);
    e.target.parentElement.remove();
  }
  onMouseOver(e) {
    const target = e.target.closest(".pinned__card");
    if (!target) {
      return;
    }
    const btn = target.querySelector(".task__del");
    btn.classList.toggle("hidden");
  }
  onMouseOut(e) {
    const btn = e.target.querySelector(".task__del");
    if (!btn) {
      return;
    }
    btn.classList.add("hidden");
  }
  dragDown(e) {
    if (e.target.classList.contains('task__del')) {
      return;
    }
    const dragElement = e.target.closest('.pinned__card');
    // const margin = this.getMargin(dragElement);
    // const marginNumber = +margin.replace(/[^0-9]/g, '');

    if (!dragElement) return;
    e.preventDefault();
    document.body.style.cursor = 'grabbing';
    this.dragEl = dragElement;
    const {
      width,
      height,
      left,
      top
    } = dragElement.getBoundingClientRect();
    //координаты курсора мыши на объекте в момент перетаскивания
    this.coordX = e.clientX - left;
    this.coordY = e.clientY - top;
    if (!this.placeholder) {
      this.placeholder = document.createElement('div');
      this.placeholder.className = 'placeholder';
      this.placeholder.style.width = `${width}px`;
      this.placeholder.style.height = `${height}px`;
      this.dragEl.before(this.placeholder);
    }
    this.dragEl.classList.add('dragged');
    this.dragEl.style.top = `${top - 5}px`;
    this.dragEl.style.left = `${left}px`;
    // задаем размеры такие же
    this.dragEl.style.width = `${width}px`;
    this.dragEl.style.height = `${height}px`;
  }
  dragMove(e) {
    e.preventDefault();
    if (!this.dragEl) {
      return;
    }
    document.body.style.cursor = 'grabbing';
    this.dragEl.style.left = `${e.pageX - this.coordX}px`;
    this.dragEl.style.top = `${e.pageY - this.coordY}px`;
    const targetCard = document.elementFromPoint(e.clientX, e.clientY).closest(".cell");
    const cell1 = targetCard && targetCard.querySelector(".cards-container");
    const sibling = document.elementFromPoint(e.clientX, e.clientY).closest('.pinned__card');
    if (!cell1) {
      return;
    }
    if (cell1 && cell1.children.length > 0) {
      if (sibling) {
        const rect = sibling.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const halfHeight = rect.height / 2;
        if (offsetY < halfHeight) {
          cell1.insertBefore(this.placeholder, sibling);
        } else {
          cell1.insertBefore(this.placeholder, sibling.nextElementSibling);
        }
      }
    } else {
      cell1.prepend(this.placeholder);
    }
  }
  dragUp(e) {
    if (!this.dragEl || !this.placeholder) {
      return;
    }
    e.preventDefault();
    document.body.style.cursor = 'auto';
    const targetCard = document.elementFromPoint(e.clientX, e.clientY).closest(".cell");
    const cell1 = targetCard && targetCard.querySelector(".cards-container");
    const sibling = document.elementFromPoint(e.clientX, e.clientY).closest('.pinned__card');
    if (!cell1) {
      return;
    }
    if (cell1.children.length > 0) {
      if (sibling) {
        const rect = sibling.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const halfHeight = rect.height / 2;
        if (offsetY < halfHeight) {
          cell1.insertBefore(this.dragEl, sibling);
        } else {
          cell1.insertBefore(this.dragEl, sibling.nextElementSibling);
        }
      }
    } else {
      cell1.prepend(this.dragEl);
    }
    // console.log(this.dragEl);
    // console.log('cell1',cell1);

    this.dragEl.classList.remove('dragged');
    this.dragEl.setAttribute('style', '');
    const currentDragEl = this.dragEl.querySelector('.task__title').textContent;
    const pinIndex = this.state.findIndex(item => item.description === currentDragEl);
    if (pinIndex !== -1) {
      this.state.splice(pinIndex, 1);
    }
    const pinLoad = {
      description: currentDragEl,
      type: cell1.dataset.cell
    };
    this.state.push(pinLoad);
    this.storage.save(this.state);
    if (this.placeholder) {
      this.placeholder.remove();
      this.placeholder = null;
    }
    this.dragLeave();
  }
  dragLeave() {
    if (!this.dragEl) {
      return;
    }
    this.dragEl.classList.remove('dragged');
    // this.dragEl.remove();
    this.dragEl = null;
  }
  loadState(pinCards) {
    const card = new Card();
    const cells = document.querySelectorAll(".cards-container");
    const boxCell = this.searchCell(cells);
    const boxPin = this.searchPin(pinCards);
    boxPin.forEach(objectEl => {
      objectEl[Symbol.iterator] = this.generatorMethod.bind(null, objectEl);
      for (const value of objectEl) {
        if (boxCell.includes(value)) {
          const template = card.constructor.template(objectEl.description);
          cells.forEach(elem => {
            const cell = objectEl.type.includes(elem.dataset.cell);
            if (cell) {
              elem.insertAdjacentHTML("beforeend", template);
            }
          });
        }
      }
    });
  }
  *generatorMethod(o) {
    const keys = Object.keys(o);
    for (let i = 0; i < keys.length; i += 1) {
      yield o[keys[i]];
    }
  }
  searchCell(element) {
    const boxCell = [];
    element.forEach(item => boxCell.push(item.dataset.cell));
    return boxCell;
  }
  searchPin(element) {
    const boxCell = [];
    element.forEach(item => boxCell.push(item));
    return boxCell;
  }
}
;// CONCATENATED MODULE: ./src/js/app.js


const container = document.querySelector(".container");
const board = new Board(container);
const controller = new CardController(board);
controller.init();
;// CONCATENATED MODULE: ./src/index.js


/******/ })()
;