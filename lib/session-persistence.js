const SeedData = require("./seed-data");
const deepCopy = require("./deep-copy");
const { sortTodoLists, sortTodos } = require("./sort");
const nextId = require("./next-id");

module.exports = class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    session.todoLists = this._todoLists;
  }

  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  hasUndoneTodos(todoList) {
    return todoList.todos.some(todo => !todo.done);
  }

  sortedTodoLists() {
    let todoLists = deepCopy(this._todoLists);
    let undone = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
    let done = todoLists.filter(todoList => this.isDoneTodoList(todoList));
    return sortTodoLists(undone, done);
  }

  //return a sorted list of todos. will operate on copy passed in as arg, 
  //  not affecting this._todoLists
  sortedTodos(todoList) {
    let todos = todoList.todos;
    let undone = todos.filter(todo => !todo.done);
    let done = todos.filter(todo => todo.done);
    return deepCopy(sortTodos(undone, done));
  };
  
  // Find a todo list with the indicated ID. Returns `undefined` if not found.
  // Note that `todoListId` must be numeric.
  loadTodoList = (todoListId) => {
    let todoList = this._findTodoList(todoListId);
    return deepCopy(todoList);
  };

  // my solution
  // loadTodo(todoListId, todoId) {
  //   let todoList = this.loadTodoList(todoListId);
  //   if (todoList) {
  //     let todo = todoList.todos.find(todo => todo.id === todoId);
  //     if (todo) {
  //       return deepCopy(todo);
  //     }
  //   }  
  // };
  
  //LS solution
  loadTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    return deepCopy(todo);
  };

  //private method. search database for particular todoList, return reference
  _findTodoList(todoListId) {
    return this._todoLists.find(todoList => todoList.id === todoListId);
  };
  //private method. search database for particular todo, return reference
  _findTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return undefined;
    return todoList.todos.find(todo => todo.id === todoId);
  };

  // my solutions
  // markTodoDone(todoListId, todoId) {
  //   let todo = this._findTodo(todoListId, todoId);
  //   todo.done = true;
  // };

  // markTodoUndone(todoListId, todoId) {
  //   let todo = this._findTodo(todoListId, todoId);
  //   todo.done = false;
  // };

  // LS solution
  toggleDoneTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    if (!todo) return false;

    todo.done = !todo.done;
    return true;
  };
  
  //Remove todo at index passed as arg
  deleteTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    let todoIndex = todoList.todos.findIndex(todo => todo.id === todoId);
    if (todoIndex === -1) return false; 
   
    todoList.todos.splice(todoIndex, 1);
    return true;
  };

  //only changing local version, not affecting actual check mark in box for completed on list view
  markAllDone(todoListId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;
    
    todoList.todos.forEach(todo => todo.done = true);
    return true;
  };

  //create new todo
  createTodo(todoListId, title) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.todos.push({
      id: nextId(),
      title,
      done: false
    });

    return true;
  };

  deleteTodoList(todoListId) {
    let todoListIndex = this._todoLists.findIndex(todoList => todoList.id === todoListId);
    if (todoListIndex === -1) return false;

    this._todoLists.splice(todoListIndex, 1);
    return true;
  };

  setTodoListTitle(todoListId, title) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.title = title;
    return true;
  };

  existsTodoListTitle(title) {
    return this._todoLists.some(todoList => todoList.title === title);
  };

  createTodoList(title) {
    this._todoLists.push({
      id: nextId(),
      title,
      todos: [],
    })

    return true;
  };

  isUniqueConstraintViolation(_error) {
    return false;
  }
};