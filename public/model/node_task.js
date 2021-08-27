class Attribute {
    supportedTypes = { "date": "S", "string": "S", "number": "N" }

    constructor(type, value) {
        this.value = value
        this.type = type
        this.awsType = this.supportedTypes[type]
    }
}

class Task {
    data = {}
    attributes = {
        "id": "string",
        "TaskName": "string",
        "Duration": "number",
        "Frequency": "number",
        "LastCompleteDate": "date",
        "PersonAssigned": "string",
        "LastPersonToComplete": "string"
    }

    prepareAWSwrite() {
            let itemData = {}
            for (const property in this.data) {
                let myKey = {}
                myKey[this.data[property].awsType] = String(this.data[property].value)
                itemData[property] = myKey
            }
            return itemData
        }
        //Expected attributes

    constructor(object, originAWS = true) {
        if (originAWS) {
            for (const [key, type] of Object.entries(this.attributes)) {
                //Get object
                if (object[key]) {
                    this.data[key] = new Attribute(type, Object.values(object[key])[0])
                } else {
                    console.error("Does not have " + key)
                }
            }
        } else {
            //JSON 
            for (const [key, expectedType] of Object.entries(this.attributes)) {
                //Get object
                if (key in object) {
                    //Try to cast
                    let objectValue = object[key]
                    if (expectedType === "number") {
                        objectValue = parseInt(objectValue)
                    } else if (expectedType === "date") {
                        objectValue = Date.parse(objectValue)
                    } else if (expectedType === "string") {
                        objectValue = objectValue;
                    } else {
                        objectValue = null;
                    }
                    if (objectValue) {
                        this.data[key] = new Attribute(expectedType, objectValue)
                    } else {
                        //Throw an error
                        console.error(`${key} is ${typeof(objectValue)} but should be ${expectedType}.`)
                    }
                } else {
                    console.error(`${key} is not in payload.`)
                }
            }
        }
    }
}

module.exports = Task;