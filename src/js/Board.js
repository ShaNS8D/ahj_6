export default class Board {
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
	<div class="cell cell-todo" data-cell="todo">
		<h3 class="title">todo</h3>
		<button class="button button_add">And another card</button>
	</div>
	<div class="cell cell-in-progress" data-cell="in-progress">
		<h3 class="title">in-progress</h3>
		<button class="button button_add">And another card</button>
	</div>
	<div class="cell cell-done" data-cell="done">
		<h3 class="title">done</h3>
		<button class="button button_add">And another card</button>
<div class="pin__list"></div>
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
