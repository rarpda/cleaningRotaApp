//ADd aws wrapper late
var AWS = require("aws-sdk")

const baseParams = {
    TableName: "Task"
}

if (process.env.name !== "PRODUCTION") {
    AWS.config.update({
        region: "eu-west-2",
        endpoint: "http://localhost:8000"
    });
} else {

}

var dynamodb = new AWS.DynamoDB({ accessKeyId: "fakeid", secretAccessKey: "fakekey", endpoint: "http://localhost:8000" });

/**
 * @private
 *  */
function prepareDataForDynamo(objectData) {
    const awsToJSMapping = { "date": "S", "string": "S", "number": "N" }
    let itemData = {}
    console.log(objectData)
    for (property in objectData) {
        let awsType = awsToJSMapping[objectData[property].type]
        itemData[property] = {
            [awsType]: String(objectData[property].value)
        }
    }
    return itemData;
}




function updateExistingTask(id, newTask, callback) {
    const params = {
        ...baseParams,
        Key: {
            "id": {
                S: id
            }
        }
    }
    let itemData = prepareDataForDynamo(newTask.data)

    const writeParams = {
        ...baseParams,
        Item: itemData
    }

    return dynamodb.getItem(params, function(err, data) {
        if (err) {
            callback(err)
        } else {
            return dynamodb.putItem(writeParams, callback)
        }
    })
}



function createNewTask(newTask, callback) {
    let itemData = prepareDataForDynamo(newTask.data)
    const params = {
        ...baseParams,
        Item: itemData
    }
    return dynamodb.putItem(params, callback)
}


function getAllTasks(callback) {
    return dynamodb.scan(baseParams, callback)
}


function getTask(id, callback) {
    var params = {
        ...baseParams,
        Key: {
            "id": {
                S: id
            }
        }
    }
    return dynamodb.getItem(params, callback);
}

function deleteTask(id, callback) {
    var params = {
        ...baseParams,
        Key: {
            "id": {
                S: id
            }
        }
    }
    return dynamodb.deleteItem(params, callback)
}


function markComplete(id, inputs, callback) {
    console.log(inputs)
        //Prepare request
    const params = {
        ...baseParams,
        Key: {
            "id": {
                S: id
            },
        },
        ExpressionAttributeNames: {
            "#LC": "LastCompleteDate",
            "#P": "LastPersonToComplete"
        },
        ExpressionAttributeValues: {
            ":lc": {
                S: inputs['LastCompleteDate']
            },
            ":p": {
                S: inputs['LastPersonToComplete']
            }
        },
        UpdateExpression: "SET #P = :p, #LC = :lc",
        ReturnValues: "ALL_NEW"
    }

    //Update item with request
    return dynamodb.updateItem(params, callback)
}

module.exports = { markComplete, updateExistingTask, createNewTask, getTask, deleteTask, getAllTasks }