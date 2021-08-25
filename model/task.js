class Task {
    data = {};

    constructor(object, originAWS = true) {
        if (originAWS) {
            // for (const [key, value] of Object.entries(object)) {
            //     console.log(key, value)
            //     this.data[key] = value
            // }
            this.data = object
        } else {
            //Store without validation
            this.data = object
        }
    }
}

module.exports = Task;