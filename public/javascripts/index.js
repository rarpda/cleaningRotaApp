let date
let taskDiplayed;
let headerPosition = {}
let data = {}
const optionsName = "options"

fetch("/task/", { method: "GET" }).then((res) => {
    if (res.ok) {
        return res.json()
    } else {
        throw new Error("Could not fetch data")
    }
}).then((entryData) => {
    //Create header
    let table = document.getElementById("myTable");
    var header = table.createTHead();
    // Create an empty <tr> element and add it to the first position of <thead>:
    var row = header.insertRow(0);

    //TODO need order to make sense
    let i = 0

    entryData.forEach(el => {
        Object.keys(el['data']).forEach(prop => {
            if (prop !== "id" && !(prop in headerPosition)) {
                headerPosition[prop] = [i, el['data'][prop].type]
                var cell = row.insertCell(i);
                let normalisedTitle = prop.split(RegExp("(?<=[a-z])(?=[A-Z])"))
                normalisedTitle = normalisedTitle.join(" ")
                cell.appendChild(document.createTextNode(normalisedTitle));
                i++;
            }
        })
    })

    //Add last col for marking if complete
    headerPosition[optionsName] = [i, null]
    let markComplete = row.insertCell()
    markComplete.appendChild(document.createTextNode("Mark Complete"));

    let body = table.createTBody()
    entryData.forEach(element => {
        insertTask(body, element)
    });


    //Insert editable in end - TODO
    let editable = body.insertRow(-1)
    editable.className = "editable"

    for (const [key, value] of Object.entries(headerPosition)) {
        let cell = editable.insertCell(value[0])
        if (key === optionsName) {
            let button = document.createElement("button")
            button.textContent = "Add"
            button.classList = "save";
            //TODO Should collect data and do a post to /task -> on save click 
            button.addEventListener("click", addNewTaskHandler)
            cell.append(button)
        } else {
            let editableCell = document.createElement("input")
            editableCell.type = value[1]
            editableCell.name = key
            cell.append(editableCell)
        }
    }

    document.getElementById("markCompleteForm").addEventListener("submit", submitCompletion)
    date = document.getElementById("lastCompleteDate")
    date.max = (new Date()).toISOString().substring(0, 10)
}).catch(error => console.error(error))

function parseTitle(title) {
    return title.split(RegExp("(?<=[a-z])(?=[A-Z])")).join(" ")
}




function insertTask(body, task, index = -1) {
    let row = body.insertRow(index)
    data[task['data']['id'].value] = task['data']
    row.id = task['data']['id'].value
    let cells = Object.keys(headerPosition).map((el) => {
        let cell = row.insertCell()
        cell.className = el
        return cell
    })
    for (const [key, value] of Object.entries(task['data'])) {
        // Append a text node to the cell
        if (key in headerPosition) {
            cells[headerPosition[key][0]].appendChild(document.createTextNode(value["value"]));
        }
    }
    // let button = document.createElement("button")

    let dropdown = document.createElement("select")
    dropdown.className = task['data']['id'].value
        // Option group for different options
    const options = { "Mark Complete": markCompleteHandler, "Edit": editTaskHandler, "Delete": deleteTaskHandler }
    for (const title in options) {
        // Explore option group - 
        let option = document.createElement("option")
        option.addEventListener('click', options[title])
        option.textContent = title
        dropdown.appendChild(option)
    }
    cells[headerPosition[optionsName][0]].appendChild(dropdown);
}


function addNewTaskHandler(event) {
    // Collect all inputs from last row in the table
    const payload = getInputsFromForm(document.getElementsByClassName("editable")[0])
    fetch("/task", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then((res) => {
            if (res.ok) {
                console.log(res)
                return res.json()
            } else {
                //TODO alert!
                throw new Error(res)
            }
        })
        .then(newTask => {
            //Clear inputs 
            document.querySelectorAll(".editable td > input").forEach(el => { el.value = "" })
                //Add new row
            const totalRowCount = document.getElementsByTagName("tr").length
            let table = document.getElementById("myTable");
            insertTask(table, newTask, totalRowCount - 1)
        })
        .catch((error) => {
            console.error(error)
        })
}


function deleteTaskHandler(event) {
    const selectedRow = event.target.closest("tr")
    let id = selectedRow.id
    if (confirm("You are about to delete Task: " + data[id]['TaskName'].value, id)) {
        fetch(`/task/${id}`, { method: "DELETE" }).then((res) => {
            if (res.ok) {
                //Remove entry
                delete data[id];
                selectedRow.remove()
            } else {
                //TODO banner

            }
        })
    } else {
        //Reset option
    }

}


function editTaskHandler(event) {
    const id = event.target.className

}



function markCompleteHandler(event) {
    let modal = document.getElementById("markCompleteModal")
    modal.style.display = "block"
        //Populate modal with task info.
    const taskToDisplay = data[event.target.className]

    const taskToDisplayDiv = document.getElementById("completeModal")
    const element = document.getElementById("completeModal")
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
    taskDiplayed = taskToDisplay
    if (taskToDisplay['LastCompleteDate']) {
        date.min = taskToDisplay['LastCompleteDate'].value
    }

    const labelsToDisplay = ["LastPersonToComplete", "LastCompleteDate", "PersonAssigned"]
    labelsToDisplay.forEach((title) => {
        let textElement = document.createElement("p")
        let entry = parseTitle(title) + ": " + (title in taskToDisplay ? taskToDisplay[title].value : "N/A")
        textElement.append(document.createTextNode(entry))
        taskToDisplayDiv.append(textElement)
    })
}


function getInputsFromForm(element) {
    let inputs = element.getElementsByTagName("input")
    let payload = {}
    for (const entry in Object.keys(inputs)) {
        if (inputs[entry]["value"]) {
            payload[inputs[entry]["name"]] = inputs[entry]["value"]
        }
    }
    return payload
}

function submitCompletion(event) {
    event.preventDefault()

    //Fetch all inputs from form
    let payload = getInputsFromForm(event.target.parentNode)
    const taskId = taskDiplayed['id'].value
        //MAke patch request
    fetch(`/task/${taskId}/markComplete`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(res => {
            console.log(res)
            if (res.ok) {
                return res.json()
            } else {
                //TODO alert!
                throw new Error(res)
            }
        })
        .then((editedTask) => {
            console.log(editedTask)
                //Close modal and reset fields
            let modal = document.getElementById("markCompleteModal")
            modal.style.display = "none"
                //Update values in cells
            for (let [key, value] of Object.entries(payload)) {
                document.querySelector(`#${taskId} > .${key}`).textContent = value
            }
            data[editedTask['id'].value] = editedTask
            taskDiplayed = null;
        })
        .catch(error => {
            console.error("submitCompletion:", error)
            alert(`${taskDiplayed['Name'].value} could not be marked as completed!`)
        })
}





//On hover tooltipp
//On click create intput depending on the type added
//Save button -> post