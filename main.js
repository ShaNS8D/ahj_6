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
		<button class="button button_add">And another card</button>
    <div class="cards-container" data-cell="todo"></div>
	</div>
	<div class="cell cell-in-progress" >
		<h3 class="title">in-progress</h3>
		<button class="button button_add">And another card</button>
    <div class="cards-container" data-cell="in-progress"></div>
	</div>
	<div class="cell cell-done" >
		<h3 class="title">done</h3>
		<button class="button button_add">And another card</button>
    <div class="cards-container" data-cell="done"></div>
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
        <div class="block__button">
          <button class="form-button__add">add</button>
          <button class="form-button__del">X</button>
        </div>
        <div class="form">
          <form class="form-area">
            <textarea class="form-text" rows="5" placeholder="---"></textarea>
          </form>
        </div>
      </div>
    `;
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
    if (e.target.classList.contains('task__del')) return;
    const dragElement = e.target.closest('.pinned__card');
    if (!dragElement) return;
    e.preventDefault();
    document.body.style.cursor = 'grabbing';
    this.placeholder = document.createElement('div');
    this.placeholder.className = 'placeholder';
    this.placeholder.style.height = `${dragElement.offsetHeight}px`;
    this.dropEl = dragElement.cloneNode(true);
    const {
      width,
      height,
      left,
      top
    } = dragElement.getBoundingClientRect();
    this.coordX = e.clientX - left;
    this.coordY = e.clientY - top;
    this.dropEl.classList.add('dragged');
    this.dropEl.style.width = `${width}px`;
    this.dropEl.style.height = `${height}px`;
    document.body.appendChild(this.dropEl);
    this.dropEl.style.top = `${top}px`;
    this.dropEl.style.left = `${left}px`;
    this.dragEl = dragElement;
    this.dragEl.classList.add('hidden');
  }
  dragMove(e) {
    e.preventDefault();
    if (!this.dropEl) {
      return;
    }
    document.body.style.cursor = 'grabbing';
    this.dropEl.style.left = `${e.pageX - this.coordX}px`;
    this.dropEl.style.top = `${e.pageY - this.coordY}px`;
    const cell = document.elementFromPoint(e.clientX, e.clientY).closest('.cards-container');
    if (!cell) {
      return;
    }
    const sibling = document.elementFromPoint(e.clientX, e.clientY).closest('.pinned__card');
    if (sibling) {
      const rect = sibling.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const halfHeight = rect.height / 2;
      if (offsetY < halfHeight) {
        cell.insertBefore(this.placeholder, sibling);
      } else {
        cell.insertBefore(this.placeholder, sibling.nextElementSibling);
      }
    } else {
      cell.prepend(this.placeholder);
    }
  }
  dragUp(e) {
    if (!this.dragEl || !this.dropEl) {
      return;
    }
    e.preventDefault();
    document.body.style.cursor = 'auto';
    if (this.placeholder) {
      this.placeholder.remove();
      this.placeholder = null;
    }
    let trappingCell = e.target.closest('.cards-container') || e.target.closest('.cell');
    if (!trappingCell) {
      this.dropEl.remove();
      return;
    }
    if (trappingCell.classList.contains('cell')) {
      trappingCell = trappingCell.querySelector('.cards-container');
    }
    const closestCard = document.elementFromPoint(e.clientX, e.clientY).closest('.pinned__card');
    if (!closestCard) {
      trappingCell.appendChild(this.dragEl);
    } else {
      let rect = closestCard.getBoundingClientRect();
      let offsetY = e.clientY - rect.top;
      let halfHeight = rect.height / 2;
      if (offsetY < halfHeight) {
        trappingCell.insertBefore(this.dragEl, closestCard);
      } else if (closestCard.nextElementSibling) {
        trappingCell.insertBefore(this.dragEl, closestCard.nextElementSibling);
      } else {
        trappingCell.appendChild(this.dragEl);
      }
    }
    const currentDragEl = this.dragEl.querySelector('.task__title').textContent;
    const pinIndex = this.state.findIndex(item => item.description === currentDragEl);
    if (pinIndex !== -1) {
      this.state.splice(pinIndex, 1);
    }
    const pinLoad = {
      description: currentDragEl,
      type: trappingCell.dataset.cell
    };
    this.state.push(pinLoad);
    this.storage.save(this.state);
    this.dragLeave();
  }
  dragLeave() {
    if (!this.dropEl) {
      return;
    }
    this.dragEl.classList.remove("hidden");
    this.dropEl.remove();
    this.dropEl = null;
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