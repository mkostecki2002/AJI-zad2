("use strict");
let todoList = window.localStorage.getItem("todos")
  ? JSON.parse(window.localStorage.getItem("todos"))
  : [];

let todoListFiltered = [];

const getCategoryFromGroq = async (title, description) => {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer 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",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content:
              "You are a classifier. You only have to return the name of category from provided list. List of categories is [personal, study, lifestyle, sport, job]. User will give you a title and description of task.",
          },
          {
            role: "user",
            content: "Title: Learn Python \nDescription: Create app.",
          },
          {
            role: "assistant",
            content: "study",
          },
          {
            role: "user",
            content: `Title: ${title} \nDescription: ${description}`,
          },
        ],
      }),
    }
  );
  const data = await response.json();
  return data.choices[0].message.content.trim();
};

const initList = () => {
  const req = new XMLHttpRequest();

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

const updateTodoList = () => {
  let todoListView = document.getElementById("todoListView");

  todoListView = todoListView.lastElementChild;

  if (todoListView != null) {
    while (todoListView.firstChild) {
      todoListView.removeChild(todoListView.firstChild);
    }
  }

  let filterByDateBegin = document.getElementById("filterByDateBegin").value;
  let filterByDateEnd = document.getElementById("filterByDateEnd").value;

  if (filterByDateBegin !== "" || filterByDateEnd !== "") {
    if (filterByDateBegin !== "")
      filterByDateBegin = new Date(filterByDateBegin);
    if (filterByDateEnd !== "") filterByDateEnd = new Date(filterByDateEnd);

    todoListFiltered = todoList.filter(data => {
      const tempDataDueDate = new Date(data.dueDate);
      if (tempDataDueDate > filterByDateBegin && filterByDateEnd === "") {
        return data;
      }
      if (tempDataDueDate < filterByDateEnd && filterByDateBegin === "") {
        return data;
      }
      if (
        tempDataDueDate < filterByDateEnd &&
        tempDataDueDate > filterByDateBegin
      ) {
        return data;
      }
    });
    console.log(todoListFiltered);
  } else {
    todoListFiltered = todoList;
  }

  const filterInput = document.getElementById("inputSearch").value;
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
        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-delete w-100";
        deleteButton.appendChild(document.createTextNode("Delete"));
        deleteButton.addEventListener("click", () => {
          deleteTodo(todo);
        });

        const todoRow = document.createElement("tr");
        const deleteCell = document.createElement("td");
        deleteCell.appendChild(deleteButton);
        const titleCell = document.createElement("td");
        titleCell.appendChild(
          document.createTextNode(todoListFiltered[todo].title)
        );
        const descCell = document.createElement("td");
        descCell.appendChild(
          document.createTextNode(todoListFiltered[todo].description)
        );
        const placeCell = document.createElement("td");
        placeCell.appendChild(
          document.createTextNode(todoListFiltered[todo].place)
        );
        const categoryCell = document.createElement("td");
        categoryCell.appendChild(
          document.createTextNode(todoListFiltered[todo].category)
        );
        const dateCell = document.createElement("td");
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
        todoRow.appendChild(categoryCell);
        todoRow.appendChild(dateCell);

        todoListView.appendChild(todoRow);
      }
    }
  }
};

const deleteTodo = index => {
  todoList.splice(index, 1);
  updateJSONbin();
  updateTodoList();
};

const addTodo = () => {
  const newTitle = document.getElementById("inputTitle").value;
  const newDescription = document.getElementById("inputDescription").value;
  const newPlace = document.getElementById("inputPlace").value;
  const newDate = new Date(document.getElementById("inputDate").value);

  getCategoryFromGroq(newTitle, newDescription).then(newCategory => {
    const newTodo = {
      title: newTitle,
      description: newDescription,
      place: newPlace,
      category: newCategory,
      dueDate: newDate,
    };

    todoList.push(newTodo);
    updateJSONbin();
    updateTodoList();
    window.localStorage.setItem("todos", JSON.stringify(todoList));
  });
};

const updateJSONbin = () => {
  const req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
      const records = JSON.parse(req.responseText).record;
      todoList = records;
      console.log(records);
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
