// Fetch data
// Create header
// Populate cells

let date

function createEntry() {

}

function parseTitle(title) {
    return title.split(RegExp("(?<=[a-z])(?=[A-Z])")).join(" ")
}

let taskDiplayed;

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

function submitCompletion(event) {
    event.preventDefault()
    console.log(event.target)
    let inputs = event.target.getElementsByTagName("input")
    let payload = {}
    for (const entry in Object.keys(inputs)) {
        payload[inputs[entry]["name"]] = inputs[entry]["value"]
    }
    //Date must be in the past or greater than current date
    //Get id, send patch with person and mark complete
    // const date = document.getElementById("lastCompleteDate").value
    // const person = document.getElementById("Person").value
    console.log(payload, JSON.stringify(payload))

    fetch(`/task/${taskDiplayed['id']['S']}/markComplete`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(res => {
            if (res.ok) {
                let modal = document.getElementById("markCompleteModal")
                modal.style.display = "none"
            } else {
                console.error(res)
                throw new Error("Mark complete could not be posted")
            }
        })
        .catch(error => {
            //BANNER
            console.error(error)
        })
        //If successful close popup



    //else display error and keep popup open. User must close it.
}

function markCompleteDateHandler(event) {
    const today = Date.now()
    if (event.target.value) {

    }

}


//TODO beautfiy table
//beautify titles
headerPosition = {}
data = {}
fetch("/task/listAtributeNames", { method: "GET" })
    .then(res => {
        if (res.ok) return res.json()
        else throw new Error("Could not fetch  header data")
    }).then((headerData) => {
        //Create header
        let table = document.getElementById("myTable");
        var header = table.createTHead();
        // Create an empty <tr> element and add it to the first position of <thead>:
        var row = header.insertRow(0);

        // Insert a new cell (<td>) at the first position of the "new" <tr> element:

        headerData.forEach((element, i) => {
            //For each attribute add 
            var cell = row.insertCell(i);
            headerPosition[element] = i
            let normalisedTitle = element.split(RegExp("(?<=[a-z])(?=[A-Z])"))
            normalisedTitle = normalisedTitle.join(" ")
            cell.appendChild(document.createTextNode(normalisedTitle));
        });
        headerPosition["markComplete"] = Object.keys(headerPosition).length
        let markComplete = row.insertCell()
        markComplete.appendChild(document.createTextNode("Mark complete"));
        //Get data 
        fetch("/task/", { method: "GET" }).then((res) => {
            if (res.ok) return res.json()
            else throw new Error("Could not fetch  header data")
        }).then((entryData) => {
            console.log(entryData)
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
            let cells = Object.keys(headerPosition).map(() => editable.insertCell())

            for (const headerName in Object.keys(headerPosition)) {
                //     let cell = editable.insertCell()
                //     // contenteditable='true'
                //     //onclick copy text into input
            }
            let button = document.createElement("button")
            button.textContent = "Add"
            button.classList = "save";
            //TODO Should collect data and do a post to /task -> on save click 
            button.addEventListener("click", function(event) {})
            cells[headerPosition["markComplete"]].appendChild(button);
            document.getElementById("markCompleteForm").addEventListener("submit", submitCompletion)
            date = document.getElementById("lastCompleteDate")
            console.log(date)
            date.max = (new Date()).toISOString().substring(0, 10)
        })
    }).catch(error => {
        //TODO banner
        console.error(error)
    })