import Card from "./Card";
import Storage from "./Storage";

export default class CardController {
  constructor(board) {
    this.board = board;
    this.state = [];
    this.eventListeners = [];
    this.storage = new Storage();
    this.dragEl = null;
    this.placeholder = null;
    this.initialPosition = null;
    this.coordX = 0;
    this.coordY = 0;
  }

  init() {
    this.board.getBoard();
    this.container = document.querySelector(".container");
    this.onClickAddCard();
    this.state = this.storage.getPinCards();
    this.loadState(this.state);
    this.setupEventListeners();
  }

  destroy() {
    this.eventListeners.forEach((listener) => {
      if (listener) {
        listener.remove();
      }
    });

    this.container = null;
    this.eventListeners = [];
  }

  setupEventListeners() {
    this.eventListeners.push(
      this.container.addEventListener("click", this.onClickDeleteCard.bind(this),),
      this.container.addEventListener("click", this.onClickPinCard.bind(this)),
      this.container.addEventListener("click", this.deletePinnedCard.bind(this),),
      this.container.addEventListener("mouseover", (e) => this.onMouseOver(e)),
      this.container.addEventListener("mouseout", (e) => this.onMouseOut(e)),
      this.container.addEventListener("mousedown", (e) => this.dragDown(e)),
      this.container.addEventListener("mousemove", (e) => this.dragMove(e)),
      this.container.addEventListener("mouseup", (e) => this.dragUp(e)),
      this.container.addEventListener("mouseleave", (e) => this.dragLeave(e)),
    );
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

  onClickAddCard() {
    this.addCardBtn = document.querySelectorAll(".button_add");
    this.addCardBtn.forEach((item) => {
      item.addEventListener("click", () => {
        const cardsContainer =
          item.parentElement.querySelector(".cards-container");
        if (!cardsContainer) return;

        cardsContainer.insertAdjacentHTML(
          "beforeend",
          this.constructor.creatingCard,
        );
        item.classList.add("hidden");
      });
    });
  }

  onClickDeleteCard(e) {
    if (!e.target.classList.contains("form-button__del")) return;
    const content = e.target.closest(".content");
    if (content) content.remove();
    document.querySelectorAll(".button_add").forEach((item) => {
      item.classList.remove("hidden");
    });
  }

  onClickPinCard(e) {
    if (!e.target.classList.contains("form-button__add")) return;
    const formArea = e.target.closest(".content")?.querySelector(".form-text");
    if (!formArea || formArea.value.trim() === "") return;
    const task = formArea.value.trim();
    const targetCell = e.target.closest(".cell");
    const cardsContainer = targetCell.querySelector(".cards-container");
    const type = cardsContainer.dataset.cell;
    const newCard = new Card(task);
    const cardHTML = newCard.addTask(task);

    if (cardHTML) {
      cardsContainer.insertAdjacentHTML("beforeend", cardHTML);
      const groupIndex = this.state.findIndex((group) => group.type === type);
      if (groupIndex !== -1) {
        this.state[groupIndex].cards.push({ description: task });
      } else {
        this.state.push({ type, cards: [{ description: task }] });
      }
      this.storage.save(this.state);
    }

    e.target.closest(".content").remove();
    document.querySelectorAll(".button_add").forEach((item) => {
      item.classList.remove("hidden");
    });
  }

  deletePinnedCard(e) {
    if (!e.target.classList.contains("task__del")) return;
    const pin = e.target.previousElementSibling.textContent;
    const type = e.target.closest(".cards-container").dataset.cell;
    const group = this.state.find(
      (item) =>
        item.type === type &&
        item.cards.some((card) => card.description === pin),
    );
    if (group) {
      const indexInGroup = group.cards.findIndex(
        (card) => card.description === pin,
      );
      if (indexInGroup !== -1) {
        group.cards.splice(indexInGroup, 1);
        if (group.cards.length === 0) {
          const groupIndex = this.state.indexOf(group);
          this.state.splice(groupIndex, 1);
        }
        this.storage.save(this.state);
      }
    }
    const cardElement = e.target.closest(".pinned__card");
    if (cardElement) {
      cardElement.remove();
    }
  }

  onMouseOver(e) {
    const target = e.target.closest(".pinned__card");
    if (!target) return;
    const btn = target.querySelector(".task__del");
    if (btn) btn.classList.remove("hidden");
  }

  onMouseOut(e) {
    const target = e.target.closest(".pinned__card");
    if (!target) return;
    const btn = target.querySelector(".task__del");
    if (btn) btn.classList.add("hidden");
  }

  dragDown(e) {
    if (e.target.classList.contains("task__del")) return;
    const dragElement = e.target.closest(".pinned__card");
    if (!dragElement) return;

    e.preventDefault();
    document.body.style.cursor = "grabbing";
    this.dragEl = dragElement;
    this.initialPosition = {
      parent: dragElement.parentElement,
      index: Array.from(dragElement.parentElement.children).indexOf(
        dragElement,
      ),
    };
    const { width, height, left, top } = dragElement.getBoundingClientRect();
    this.coordX = e.clientX - left;
    this.coordY = e.clientY - top;
    if (!this.placeholder) {
      this.placeholder = document.createElement("div");
      this.placeholder.className = "placeholder";
      this.placeholder.style.width = `${width}px`;
      this.placeholder.style.height = `${height}px`;
      this.dragEl.before(this.placeholder);
    }
    this.dragEl.classList.add("dragged");
    this.dragEl.style.position = "fixed";
    this.dragEl.style.width = `${width}px`;
    this.dragEl.style.height = `${height}px`;
    this.dragEl.style.top = `${e.clientY - this.coordY}px`;
    this.dragEl.style.left = `${e.clientX - this.coordX}px`;
  }

  dragMove(e) {
    if (!this.dragEl || !this.placeholder) return;
    this.dragEl.style.top = `${e.clientY - this.coordY}px`;
    this.dragEl.style.left = `${e.clientX - this.coordX}px`;
    const targetCell = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest(".cell");
    if (!targetCell) return;
    const targetCardsContainer = targetCell.querySelector(".cards-container");
    if (!targetCardsContainer) return;
    const siblings = Array.from(targetCardsContainer.querySelectorAll(".pinned__card:not(.dragged)"));
    let insertBeforeElement = null;
    for (const sibling of siblings) {
      const rect = sibling.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      if (offsetY < rect.height / 2) {
        insertBeforeElement = sibling;
        break;
      }
    }
    if (
      insertBeforeElement &&
      !insertBeforeElement.classList.contains("dragged")
    ) {
      targetCardsContainer.insertBefore(this.placeholder, insertBeforeElement);
    } else {
      targetCardsContainer.appendChild(this.placeholder);
    }
  }

  dragUp(e) {
    if (!this.dragEl || !this.placeholder) return;
    const targetCardCell = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest(".cards-container");
    if (!targetCardCell) {
      this.returnToInitialPosition();
      return;
    }
    targetCardCell.insertBefore(this.dragEl, this.placeholder);
    this.dragEl.style.position = "";
    this.dragEl.style.top = "";
    this.dragEl.style.left = "";
    this.dragEl.style.width = "";
    this.dragEl.style.height = "";
    this.dragEl.classList.remove("dragged");
    this.placeholder.remove();
    this.placeholder = null;
    this.dragEl = null;
    document.body.style.cursor = "auto";
    this.updateState();
    this.cleanupEmptyTextNodes(targetCardCell);
  }

  dragLeave(e) {
    if (!this.dragEl || !this.placeholder) return;
    if (!this.container.contains(e.relatedTarget)) {
      this.returnToInitialPosition();
    }
  }

  cleanupEmptyTextNodes(container) {
    Array.from(container.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
        node.remove();
      }
    });
  }

  returnToInitialPosition() {
    if (!this.dragEl || !this.initialPosition) return;
    this.initialPosition.parent.insertBefore(
      this.dragEl,
      this.initialPosition.parent.children[this.initialPosition.index],
    );
    this.dragEl.style.position = "";
    this.dragEl.style.top = "";
    this.dragEl.style.left = "";
    this.dragEl.style.width = "";
    this.dragEl.style.height = "";
    this.dragEl.classList.remove("dragged");
    if (this.placeholder) {
      this.placeholder.remove();
      this.placeholder = null;
    }
    this.dragEl = null;
    document.body.style.cursor = "auto";
  }

  updateState() {
    const columns = document.querySelectorAll(".cards-container");
    const newState = [];
    columns.forEach((column) => {
      const type = column.dataset.cell;
      const cards = Array.from(column.querySelectorAll(".pinned__card")).map(
        (card) => ({
          description: card.textContent.trim(),
        }),
      );
      if (cards.length > 0) {
        newState.push({ type, cards });
      }
    });
    this.state = newState;
    this.storage.save(newState);
  }

  loadState(pinCards) {
    const cells = document.querySelectorAll(".cards-container");
    pinCards.forEach((group) => {
      const type = group.type;
      const cards = group.cards;
      cards.forEach((cardObj, index) => {
        const template = Card.template(cardObj.description, index, type);
        cells.forEach((cell) => {
          if (cell.dataset.cell === type) {
            cell.insertAdjacentHTML("beforeend", template);
          }
        });
      });
    });
  }
}
