function createElement(tag, attributes, children, eventListeners) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      if (key === 'value' && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
        element.value = attributes[key];
      } else if (key === 'checked' && element.tagName === 'INPUT' && attributes.type === 'checkbox') {
        element.checked = attributes[key]; // Для чекбоксов
      }
      else {
        element.setAttribute(key, attributes[key]);
      }
    });
  }

  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
          element.appendChild(child);
        }
      });
    } else if (typeof children === "string") {
      element.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement) {
      element.appendChild(children);
    }
  }

  if (Array.isArray(eventListeners)) {
    eventListeners.forEach(listenerObj => {
      if (listenerObj && typeof listenerObj.event === 'string' && typeof listenerObj.handler === 'function') {
        element.addEventListener(listenerObj.event, listenerObj.handler);
      }
    });
  }

  return element;
}

class Component {
  constructor() {
    if (this.constructor === Component) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this._domNode = null;
  }

  getDomNode() {
    if (!this._domNode) {
      this._domNode = this.render();
    }
    return this._domNode;
  }

  _updateDOM() {
    const oldNode = this._domNode;
    const newNode = this.render();

    if (oldNode && oldNode.parentNode) {
      oldNode.parentNode.replaceChild(newNode, oldNode);
    }
    this._domNode = newNode;
  }

  render() {
    throw new Error("Render method must be implemented by subclasses.");
  }
}

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      tasks: [ // Изначальные задачи для примера
        { id: 1, text: "Сделать домашку", completed: false },
        { id: 2, text: "Сделать практику", completed: true },
        { id: 3, text: "Пойти домой", completed: false },
      ],
      newTodoText: "",
    };

    this.onAddTask = this.onAddTask.bind(this);
    this.onAddInputChange = this.onAddInputChange.bind(this);
    this.toggleTask = this.toggleTask.bind(this); // Пример
    this.deleteTask = this.deleteTask.bind(this); // Пример
  }

  onAddInputChange(event) {
    this.state.newTodoText = event.target.value;
  }

  onAddTask() {
    const trimmedText = this.state.newTodoText.trim();
    if (trimmedText === "") {
      return;
    }

    const newTask = {
      id: Date.now(),
      text: trimmedText,
      completed: false,
    };

    this.state.tasks.push(newTask);
    this.state.newTodoText = "";

    this._updateDOM();
  }

  toggleTask(taskId) {
    this.state.tasks = this.state.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    this._updateDOM();
  }

  deleteTask(taskId) {
    this.state.tasks = this.state.tasks.filter(task => task.id !== taskId);
    this._updateDOM();
  }


  render() {
    const todoItems = this.state.tasks.map((task) =>
        createElement("li", { class: task.completed ? 'completed' : '' }, [
            createElement("input", { type: "checkbox", checked: task.completed }, null, [
            { event: 'change', handler: () => this.toggleTask(task.id) }
          ]),
          createElement("label", {}, task.text),
          createElement("button", {}, "🗑️", [
            { event: 'click', handler: () => this.deleteTask(task.id) }
          ])
        ])
    );

    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement("input", {
              id: "new-todo",
              type: "text",
              placeholder: "Задание",
              value: this.state.newTodoText,
            },
            null,
            [
              { event: "input", handler: this.onAddInputChange }
            ]),
        createElement("button", { id: "add-btn" }, "+", [
          { event: "click", handler: this.onAddTask }
        ]),
      ]),
      createElement("ul", { id: "todos" }, todoItems), // Передаем созданные элементы задач
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const todoApp = new TodoList();
  document.body.appendChild(todoApp.getDomNode());
});