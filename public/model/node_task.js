class Attribute {

    constructor(type, value) {
        let castValue;
        if (type === "number") {
            castValue = parseInt(value)
            if (!Number.isInteger(castValue)) throw new Error(`${value} is not a number`)

        } else if (type === "date") {
            castValue = Date.parse(value)
            if (!Number.isInteger(castValue)) throw new Error(`${value} is not a date`)
        } else if (type === "string") {
            castValue = value;
        } else {
            throw new Error(`${type} is not supported!`)
        }
        this.value = value
        this.type = type
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


    static checkMarkComplete(payload) {
        let date = new Attribute("date", payload['LastCompleteDate']),
            person = new Attribute("string", payload['LastPersonToComplete'])
        return {
            'LastCompleteDate': date.value,
            'LastPersonToComplete': person.value
        }
    }

    // Throws error
    constructor(object, originAWS = true) {
        console.log(object)
        for (const [attributeName, type] of Object.entries(this.attributes)) {
            if (attributeName in object) {
                let value;
                if (originAWS) {
                    value = Object.values(object[attributeName])[0]
                } else {
                    value = object[attributeName]
                }
                this.data[attributeName] = new Attribute(type, value)
            } else {
                // console.error("Does not have " + attributeName)
            }
        }
    }
}

module.exports = Task;