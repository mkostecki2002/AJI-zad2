let todoList = [];

let initList = function () {
  let req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
      todoList = JSON.parse(req.responseText).record;
      updateTodoList();
    }
  };

  req.open("GET", "https://api.jsonbin.io/v3/b/68f7b2c8ae596e708f21fd9b", true);
  req.setRequestHeader(
    "X-Master-Key",
    "$2a$10$tUMLX607puUKjRYwk.faoOgt0laACW2FmXHJk6znqyjphstAicBv."
  );
  req.send();
};

let updateTodoList = function () {
  let todoListDiv = document.getElementById("todoListView");
  if (todoListDiv != null) {
    while (todoListDiv.firstChild) {
      todoListDiv.removeChild(todoListDiv.firstChild);
    }
  }

  console.log(todoList);

  let filterInput = document.getElementById("inputSearch");
  if (filterInput != null) {
    for (let todo in todoList) {
      if (todoList[todo].title && todoList[todo].description)
        if (
          todoList[todo].title
            .toLowerCase()
            .includes(filterInput.value.toLowerCase()) ||
          todoList[todo].description
            .toLowerCase()
            .includes(filterInput.value.toLowerCase())
        ) {
          let newElement = document.createElement("p");
          let newContent = document.createTextNode(
            todoList[todo].title + " " + todoList[todo].description
          );
          newElement.appendChild(newContent);
          todoListDiv.appendChild(newElement);
        }
    }
  }
};

let deleteTodo = function (index) {
  todoList.splice(index, 1);
};

let addTodo = function () {
  //get the elements in the form
  let newTitle = document.getElementById("inputTitle").value;
  let newDescription = document.getElementById("inputDescription").value;
  let newPlace = document.getElementById("inputPlace").value;
  let newDate = new Date(document.getElementById("inputDate").value);

  //create new item
  let newTodo = {
    title: newTitle,
    description: newDescription,
    place: newPlace,
    category: "",
    dueDate: newDate,
  };
  //add item to the list
  todoList.push(newTodo);
  updateJSONbin();
  updateTodoList();
  //store the updated list in local storage
  window.localStorage.setItem("todos", JSON.stringify(todoList));
};

let updateJSONbin = function () {
  let req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
      console.log(req.responseText);
    }
  };

  req.open("PUT", "https://api.jsonbin.io/v3/b/68f7b2c8ae596e708f21fd9b", true);
  req.setRequestHeader("Content-Type", "application/json");
  req.setRequestHeader(
    "X-Master-Key",
    "$2a$10$tUMLX607puUKjRYwk.faoOgt0laACW2FmXHJk6znqyjphstAicBv."
  );
  req.send(JSON.stringify(todoList));
};

document.addEventListener("DOMContentLoaded", () => {
  initList();
});

let inputSearch = document.getElementById("inputSearch");
if (inputSearch != null) {
  inputSearch.addEventListener("input", updateTodoList);
  inputSearch.addEventListener("change", updateTodoList);
}
