// Fetch data
// Create header
// Populate cells
fetch("/task/listAtributeNames", {method:"GET"})
.then(res=>{
    if (res.ok) return res.json()
    else throw new Error("Could not fetch  header data")
}).then((headerData)=>{
    //Create header
    let table = document.getElementById("myTable");
    var header = table.createTHead();
    // Create an empty <tr> element and add it to the first position of <thead>:
    var row = header.insertRow(0);    

    // Insert a new cell (<td>) at the first position of the "new" <tr> element:
    headerPosition = {} 
    headerData.forEach((element,i) => {
        //For each attribute add 
        var cell = row.insertCell(i);
        headerPosition[element]=i
        cell.appendChild(document.createTextNode(element));
    });
    let markComplete = row.insertCell()
    markComplete.appendChild(document.createTextNode("Mark complete"));
    //Get data 
    fetch("/task/", {method:"GET"}).then((res)=>{
        if (res.ok) return res.json()
        else throw new Error("Could not fetch  header data")
    }).then((entryData)=>{
        console.log(entryData)
        entryData.forEach(element => {
            let row  = table.insertRow();
            let cells = headerData.map(()=>row.insertCell())
            console.log(cells)
            for(const [key,value] of Object.entries(element['data'])){
                console.log(key,headerPosition[key])
                // let cell = row.insertCell(headerPosition[key])
                  // Append a text node to the cell
                cells[headerPosition[key]].appendChild(document.createTextNode(Object.values(value)[0]));
                //onhover tooltip -> show meesage click to edit
                //onclick open input
            }
            // let markComplete = row.insertCell()
            let button = document.createElement("button")
            button.classList=element;
            //TODO Onclick show modal with date input, task name, and input to write who did it. Can look to pull from local storage!
            button.addEventListener("onClick",()=>console.log("clicked"))
            cells[cells.length-1].appendChild(button);
        });
        //Insert editable in end - TODO
        let editable = table.insertRow(-1)
        for(const headerName in Object.keys(headerPosition)){
            let cell = editable.insertCell()
            // contenteditable='true'
            //onclick copy text into input
        }
        let markComplete = editable.insertCell()
        let button = document.createElement("button")
        button.classList="save";
        //TODO Should collect data and do a post to /task -> on save click 
        button.addEventListener("onClick",()=>console.log("clicked save!"))
        markComplete.appendChild(button);
        
    })
}).catch(error=>{
    //TODO banner
    console.error(error)
})