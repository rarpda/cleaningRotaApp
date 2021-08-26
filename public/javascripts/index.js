let date
let taskDiplayed;

function parseTitle(title) {
    return title.split(RegExp("(?<=[a-z])(?=[A-Z])")).join(" ")
}

function rxFetchHandler(res) {
    if (res.ok) {
        return res.json()
    } else {
        //TODO alert!
        throw new Error(res)
    }
}


function addRowToTable(taskData) {

}

function addNewTaskHandler(event) {
    // Collect all inputs from last row in the table
    const payload = getInputsFromForm(document.getElementsByClassName("editable"))
    fetch("/task", { method: "POST", hearders: { "Content-Type": "application/json" }, data: JSON.stringify(payload) })
        .then(rxFetchHandler)
        .then(data => {
            //TODO - Upload table with new entry
            location.reload()
                //BANNER 
        })
        .catch((error) => {
            console.error(error)
        })
}

function markCompleteHandler(event) {
    // event.preventDefault()
    let modal = document.getElementById("markCompleteModal")
    modal.style.display = "block"
    let id = event.target.className

    //Populate modal with task info.
    const taskToDisplay = data[event.target.className]
    console.log(taskToDisplay)
    const taskToDisplayDiv = document.getElementById("completeModal")
    document.getElementById("title").innerText = `${Object.values(taskToDisplay["Name"])[0]}`
    const element = document.getElementById("completeModal")
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
    taskDiplayed = taskToDisplay

    let textElement = document.createElement("p")
    textElement.append(document.createTextNode(`Last completed date: ${Object.values(taskToDisplay["LastCompleteDate"])[0]}`))
    taskToDisplayDiv.append(textElement)
    textElement = document.createElement("p")
    textElement.append(document.createTextNode(`Last person to complete: ${Object.values(taskToDisplay["LastPersonToComplete"]|taskToDisplay["Person"])[0]}`))
    taskToDisplayDiv.append(textElement)
    textElement = document.createElement("p")
    textElement.append(document.createTextNode(`Currently assigned to: ${Object.values(taskToDisplay["PersonAssignedTo"]|taskToDisplay["Person"])[0]}`))
    taskToDisplayDiv.append(textElement)

    let isoDate = taskToDisplay['LastCompleteDate']['S'].split("/").reverse()
    date.min = isoDate.join("-")

}


function getInputsFromForm(parentHTML) {
    let inputs = parentHTML.getElementsByTagName("input")
    let payload = {}
    for (const entry in Object.keys(inputs)) {
        payload[inputs[entry]["name"]] = inputs[entry]["value"]
    }
    return payload
}

function submitCompletion(event) {
    event.preventDefault()
        //Fetch all inputs from form
    payload = getInputsFromForm(event.target)
    const taskId = taskDiplayed['id']['S']
        //MAke patch request
    fetch(`/task/${taskId}/markComplete`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(res => {
            if (res.ok) {
                //Close modal and reset fields
                let modal = document.getElementById("markCompleteModal")
                modal.style.display = "none"
                    //TODO should update underlying instead of reloading

            } else {
                //TODO alert!
                throw new Error(res)
            }
        })
        .catch(error => {
            //BANNER
            console.error("submitCompletion:", res)
            alert(`${taskDiplayed['Name']['S']} could not be marked as complete!`)
        })
}

headerPosition = {}
data = {}


//Get data 
fetch("/task/", { method: "GET" }).then((res) => {
    if (res.ok) return res.json()
    else throw new Error("Could not fetch  header data")
}).then((entryData) => {
    //Create header
    let table = document.getElementById("myTable");
    var header = table.createTHead();
    // Create an empty <tr> element and add it to the first position of <thead>:
    var row = header.insertRow(0);

    //TODO need order to make sense
    let headerPosition = {}
    i = 0
    entryData.forEach(el => {
            Object.keys(el['data']).forEach(prop => {
                if (!(prop in headerPosition)) {
                    headerPosition[prop] = i
                    var cell = row.insertCell(i);
                    let normalisedTitle = prop.split(RegExp("(?<=[a-z])(?=[A-Z])"))
                    normalisedTitle = normalisedTitle.join(" ")
                    cell.appendChild(document.createTextNode(normalisedTitle));
                    i++;
                }
            })
        })
        //Add last col for marking if complete
    headerPosition["markComplete"] = i
    let markComplete = row.insertCell()
    markComplete.appendChild(document.createTextNode("Mark Complete"));

    let body = table.createTBody()
    entryData.forEach(element => {
        data[element['data']['id']['S']] = element['data']

        let row = body.insertRow();
        let cells = Object.keys(headerPosition).map(() => row.insertCell())
        for (const [key, value] of Object.entries(element['data'])) {
            // let cell = row.insertCell(headerPosition[key])
            // Append a text node to the cell
            cells[headerPosition[key]].appendChild(document.createTextNode(Object.values(value)[0]));
            //onhover tooltip -> show meesage click to edit
            //onclick open input
        }
        // let markComplete = row.insertCell()
        let button = document.createElement("button")
        button.classList = element['data']['id']['S']
        button.textContent = "Mark Complete"
            //TODO Onclick show modal with date input, task name, and input to write who did it. Can look to pull from local storage!
        button.addEventListener("click", markCompleteHandler, false)
        cells[headerPosition["markComplete"]].appendChild(button);
    });


    //Insert editable in end - TODO
    let editable = body.insertRow(-1)
    editable.className = "editable"

    // let cells = Object.keys(headerPosition).map(() => editable.insertCell())
    console.log(headerPosition)
    for (const [key, value] of Object.entries(headerPosition)) {
        console.log(key, value)
        let cell = editable.insertCell(value)
        if (key === "markComplete") {
            let button = document.createElement("button")
            button.textContent = "Add"
            button.classList = "save";
            //TODO Should collect data and do a post to /task -> on save click 
            button.addEventListener("click", addNewTaskHandler)
            cell.append(button)
        } else {
            let editableCell = document.createElement("input")
            editableCell.name = key
            cell.append(editableCell)
        }

        // cell.append(document.createTextNode("dsadsads"))
        //     //onclick copy text into input
    }

    document.getElementById("markCompleteForm").addEventListener("submit", submitCompletion)


    date = document.getElementById("lastCompleteDate")
    date.max = (new Date()).toISOString().substring(0, 10)
})


//On hover tooltipp
//On click create intput depending on the type added
//Save button -> post