var express = require('express');
var router = express.Router();
const { nanoid } = require('nanoid')
const Task = require("../public/model/node_task")

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

/* GET list of tasks*/
router.get('/', function(req, res) {
    res.set('Cache-Control', "max-age=0")
    dynamodb.scan(baseParams, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(500).send("Data could not be fetched!")
        } else {
            res.status(200).send(data['Items'].map(element => new Task(element)))
        }
    });
});

// GEt task id
router.get('/:id', function(req, res) {
    const taskId = req.params.id
    var params = {
        ...baseParams,
        Key: {
            "id": {
                S: taskId
            }
        }
    }
    dynamodb.getItem(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(500).send("Could not get item for id:" + taskId)
        } else {
            console.log(data); // successful response
            res.status(200).send(new Task(data))
        }
    });
})

// DELETE 
router.delete('/:id', function(req, res, next) {
    const id = req.params.id
    var params = {
        ...baseParams,
        Key: {
            "id": {
                S: id
            }
        }
    }
    dynamodb.deleteItem(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(400).send("Failed to delete task!")
        } else {
            console.log(data); // successful response
            res.status(201).send("Deleted task!")
        }
    });
});



// Requires body parsing -> Form data
router.post('/', function(req, res) {

    // Require nano id to generate unique ids
    const newId = nanoid(10)
        //Check form data in the model
    let newTask = new Task({...req.body, "id": newId }, false)

    var params = {
        ...baseParams,
        Item: newTask.prepareAWSwrite()
    }

    dynamodb.putItem(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(400).send("Failed to create task!")
        } else {
            console.log(data); // successful response
            res.status(201).send("Created task!")
        }
    });
})

router.put('/:id', function(req, res) {
    //Check form data in the model
    let newTask = new Task(req.body, false)
    const id = req.params.id;
    if (id !== newTask['id'].value) {
        return res.status(400).send("ID and payload do not match")
    }
    //Check if table has item - if yes then put
    const params = {
        ...baseParams,
        Key: {
            "id": {
                S: id
            }
        }
    }
    dynamodb.getItem(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(500).send("Task does not exist")
        } else {
            const writeParams = {
                ...baseParams,
                Item: newTask.prepareAWSwrite()
            }
            dynamodb.putItem(writeParams, function(err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    res.status(400).send("Failed to update task!")
                } else {
                    console.log(data); // successful response
                    res.status(201).send("Updated task!")
                }
            });
        }
    });

})

//PATCH
router.patch("/:id/markComplete", function(req, res) {
    //query
    const id = req.params.id
    var params = {
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
                S: req.body['LastCompleteDate']
            },
            ":p": {
                S: req.body['LastPersonToComplete']
            }
        },
        UpdateExpression: "SET #P = :p, #LC = :lc",
        ReturnValues: "ALL_NEW"
    }
    dynamodb.updateItem(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(400).send("Failed to mark last complete!")
        } else {
            console.log(data); // successful response
            res.status(201).send("Marked as complete!")
        }
    })
})


module.exports = router;