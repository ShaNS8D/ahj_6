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
