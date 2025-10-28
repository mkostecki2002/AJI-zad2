"use strict";
let todoList = window.localStorage.getItem("todos")
  ? JSON.parse(window.localStorage.getItem("todos"))
  : [];

let todoListFiltered = [];

let initList = function () {
  let req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
      todoList = JSON.parse(req.responseText).record;
      updateTodoList();
    } else {
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
  let todoListView = document.getElementById("todoListView");

  todoListView = todoListView.lastElementChild;

  if (todoListView != null) {
    while (todoListView.firstChild) {
      todoListView.removeChild(todoListView.firstChild);
    }
  }

  let filterByDateBegin = document.getElementById("filterByDateBegin").value;
  let filterByDateEnd = document.getElementById("filterByDateEnd").value;

  if (filterByDateBegin !== "" && filterByDateEnd !== "") {
    filterByDateBegin = new Date(filterByDateBegin);
    filterByDateEnd = new Date(filterByDateEnd);
    todoListFiltered = todoList.filter(data => {
      let tempDataDueDate = new Date(data.dueDate);
      console.log(filterByDateBegin, filterByDateEnd, tempDataDueDate);
      if (
        tempDataDueDate > filterByDateBegin &&
        tempDataDueDate < filterByDateEnd
      ) {
        return data;
      }
    });
    console.log(todoListFiltered);
  } else {
    todoListFiltered = todoList;
  }

  let filterInput = document.getElementById("inputSearch").value;
  if (filterInput != null) {
    for (let todo in todoListFiltered) {
      if (
        todoListFiltered[todo].title
          .toLowerCase()
          .includes(filterInput.toLowerCase()) ||
        todoListFiltered[todo].description
          .toLowerCase()
          .includes(filterInput.toLowerCase())
      ) {
        let deleteButton = document.createElement("button");
        deleteButton.appendChild(document.createTextNode("Delete"));
        deleteButton.addEventListener("click", () => {
          deleteTodo(todo);
        });

        let todoRow = document.createElement("tr");
        let deleteCell = document.createElement("td");
        deleteCell.appendChild(deleteButton);
        let titleCell = document.createElement("td");
        titleCell.appendChild(
          document.createTextNode(todoListFiltered[todo].title)
        );
        let descCell = document.createElement("td");
        descCell.appendChild(
          document.createTextNode(todoListFiltered[todo].description)
        );
        let placeCell = document.createElement("td");
        placeCell.appendChild(
          document.createTextNode(todoListFiltered[todo].place)
        );
        let dateCell = document.createElement("td");
        dateCell.appendChild(
          document.createTextNode(
            todoListFiltered[todo].dueDate
              ? new Date(todoListFiltered[todo].dueDate).toLocaleDateString()
              : ""
          )
        );

        todoRow.appendChild(deleteCell);
        todoRow.appendChild(titleCell);
        todoRow.appendChild(descCell);
        todoRow.appendChild(placeCell);
        todoRow.appendChild(dateCell);

        todoListView.appendChild(todoRow);
      }
    }
  }
};

let deleteTodo = function (index) {
  todoList.splice(index, 1);
  updateJSONbin();
  updateTodoList();
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
  const inputSearch = document.getElementById("inputSearch");
  if (inputSearch != null) {
    inputSearch.addEventListener("input", updateTodoList);
    inputSearch.addEventListener("change", updateTodoList);
  }

  const filterByDateBegin = document.getElementById("filterByDateBegin");
  const filterByDateEnd = document.getElementById("filterByDateEnd");

  if (filterByDateBegin != null && filterByDateEnd != null) {
    filterByDateBegin.addEventListener("input", updateTodoList);
    filterByDateEnd.addEventListener("input", updateTodoList);
  }
});
