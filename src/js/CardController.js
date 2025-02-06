/* eslint-disable prettier/prettier */
import Card from "./Card";
import Storage from "./Storage";

export default class CardController {
  constructor(board) {
    this.board = board;
    this.state = [];
    // this.placeholder = null;
    // this.dragEl = null;
  }

  init() {
    this.board.getBoard();
    this.container = document.querySelector(".container");

    this.onClickAddCard();
    this.container.addEventListener("click", this.onClickDeleteCard.bind(this));
    this.container.addEventListener("click", this.onClickPinCard.bind(this));
    this.container.addEventListener("click", this.deletePinnedCard.bind(this));
    this.container.addEventListener("mouseover", (e) => this.onMouseOver(e));
    this.container.addEventListener("mouseout", (e) => this.onMouseOut(e));
    this.container.addEventListener("mousedown", (e) => this.dragDown(e));
    this.container.addEventListener("mousemove", (e) => this.dragMove(e));
    this.container.addEventListener("mouseup", (e) => this.dragUp(e));
    this.container.addEventListener("mouseleave", (e) => this.dragLeave(e));
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
    this.addCardBtn.forEach((item) => {
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

    document.querySelectorAll(".button_add").forEach((item) => {
      item.classList.remove("hidden");
    });
  }

  onClickPinCard(e) {
    e.preventDefault();
    this.card = new Card();
    const formArea = document.querySelector(".form-text");
    
    if (
      !e.target.classList.contains("form-button__add") ||
      formArea.value === ""
    ) {
      return;
    }   
    const targetCell = e.target.closest(".cell");    
    const cardsContainer = targetCell.querySelector('.cards-container');
    const type = cardsContainer.dataset.cell;
    this.card.init();
    
    // const pinLoad = {
    //   description: this.card.task,
    //   type,
    // };
    //  this.state.push(pinLoad);

    // Найти группу с соответствующим типом
    const groupIndex = this.state.findIndex(group => group.type === type);

    if (groupIndex !== -1) {
      // Если группа найдена, добавляем карточку в массив cards
      this.state[groupIndex].cards.push({
        description: this.card.task
      });
    } else {
      // Если группа не найдена, создаем новую группу
      this.state.push({
        type,
        cards: [{
          description: this.card.task
        }]
      });
    }
    this.storage.save(this.state);

    e.target.parentElement.closest(".content").remove();

    document.querySelectorAll(".button_add").forEach((item) => {
      item.classList.contains("hidden");
      item.classList.remove("hidden");
    });
    // this.loadState(this.state);
  }

  deletePinnedCard(e) {
    e.preventDefault();
    if (!e.target.classList.contains("task__del")) {
      return;
    }    
    const pin = e.target.previousElementSibling.textContent;
    const type = e.target.closest(".cards-container").dataset.cell;
    const group = this.state.find((item) => item.type === type && item.cards.some((card) => card.description === pin));
    if (group) {
      const indexInGroup = group.cards.findIndex((card) => card.description === pin);
      group.cards.splice(indexInGroup, 1);
      if (group.cards.length === 0) {
        const groupIndex = this.state.indexOf(group);
        this.state.splice(groupIndex, 1);
      }
      this.storage.save(this.state);
    }
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
    if (e.target.classList.contains('task__del')) {return;}
    const dragElement = e.target.closest('.pinned__card');
    // const margin = this.getMargin(dragElement);
    // const marginNumber = +margin.replace(/[^0-9]/g, '');
    
    if (!dragElement) return;
    e.preventDefault();
    document.body.style.cursor = 'grabbing';
    this.dragEl = dragElement;
    const { width, height, left, top } = dragElement.getBoundingClientRect();
    //координаты курсора мыши на объекте в момент перетаскивания
    this.coordX = e.clientX - left;
    this.coordY = e.clientY - top;
   
    if (!this.placeholder) {
      this.placeholder = document.createElement('div');
      this.placeholder.className = 'placeholder';
      this.placeholder.setAttribute('data-id', dragElement.dataset.id);
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
    if (!this.dragEl) { return; }    
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
    if (!this.dragEl || !this.placeholder) { return; }
    e.preventDefault();
    document.body.style.cursor = 'auto';

    const cellTarget = document.elementFromPoint(e.clientX, e.clientY).closest(".cell");
    const targetCardCell = cellTarget && cellTarget.querySelector(".cards-container");  
    
    this.placeholder.classList.add('pinned__card');
    this.placeholder.classList.remove('placeholder');

    const content = this.dragEl.innerHTML;
    this.placeholder.innerHTML = content;
  
    const columns = document.querySelectorAll('.cards-container');    
    const result = [];    
    columns.forEach(column => {
      const type = column.getAttribute('data-cell');
      const arr = Array.from(column.querySelectorAll('.pinned__card'));
      const cards = arr.map(card => ({
        description: card.textContent.trim()
      }));    
      result.push({ type, cards });
    });    
    this.storage.save(result);
    this.dragLeave();
  }
  
  dragLeave() {
    if (!this.dragEl) { return; }  
    // this.dragEl.classList.remove('dragged');
    this.dragEl.remove();
    this.dragEl = null;
  }

  loadState(pinCards) {
    const card = new Card();
    const cells = document.querySelectorAll(".cards-container");  
    pinCards.forEach((group) => {
      const type = group.type;
      const cards = group.cards;
      cards.forEach((cardObj, index) => {
        const template = card.constructor.template(cardObj.description, index, type);
        const matchingCells = Array.from(cells).filter(cell => cell.dataset.cell === type);
        matchingCells.forEach(cell => {
          cell.insertAdjacentHTML("beforeend", template);
        });
      });
    });
  }

}
