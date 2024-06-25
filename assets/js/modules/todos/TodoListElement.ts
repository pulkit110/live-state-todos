import { html, css, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import LiveState, { connectElement } from 'phx-live-state';

type Todo = {
  id: number,
  title: string,
  completed: boolean,
};

@customElement('todo-list')
export class TodoListElement extends LitElement {
  static styles = css`p { color: blue }`;

  @property({ type: String })
  url: string = '';

  @state()
  todos: Array<Todo> = [];

  @query('input[name="title"]')
  titleInput: HTMLInputElement | undefined;

  constructor() {
    super();
    this.addEventListener('todo_created', (e) => { console.log(e); this.clearNewTodo(); });
  }

  connectedCallback() {
    super.connectedCallback();
    console.log(`connecting to ${this.url}`);
    const liveState = new LiveState({
      url: this.url,
      topic: `todos:${window.location.href}`,
    });

    connectElement(liveState, this, {
      properties: ['todos'],
      events: {
        send: ['add_todo', 'toggle_todo'],
        receive: ['todo_created']
      }
    });
  }

  addTodo(e: Event) {
    this.dispatchEvent(new CustomEvent('add_todo', {
      detail: {
        title: this.titleInput?.value
      }
    }));
    e.preventDefault();
  }

  toggleTodo(e: Event) {
    this.dispatchEvent(new CustomEvent('toggle_todo', {
      detail: {
        id: (e.currentTarget as HTMLElement)?.dataset.id
      }
    }));
    e.preventDefault();
  }

  clearNewTodo() {
    if (this.titleInput === undefined) return;
    this.titleInput.value = '';
  }

  render() {
    return html`
      <ul style="list-style-type: none">
        ${this.todos?.map(todo => html`
          <li>
            <input type="checkbox" id=${`todo-${todo.id}`} @change=${this.toggleTodo} data-id=${todo.id} ?checked=${todo.completed}>
            <label for=${`todo-${todo.id}`}>${todo.title}</label>
          </li>
        `)}
      </ul>
      <div>
        <form @submit=${this.addTodo}>
          <div>
            <label for="todo">Todo</label>
            <input id="todo" name="title" required>
          </div>
          <button>Add Todo</button>
        </form>
      </div>
    `;
  }
}
