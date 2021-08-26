var express = require('express');
var router = express.Router();
const { nanoid } = require('nanoid')
const Task = require("../model/Task")

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

router.get('/listAtributeNames', function(req, res) {
    dynamodb.describeTable(baseParams, (error, data) => {
        if (error) {
            console.error(error)
            res.status(500).send("Header could not be found")
        } else {
            if (data['Table']['ItemCount'] == 0) {
                res.status(200).send([])
            } else {
                res.status(200).send(['id', 'Name', 'Time', 'Frequency', 'LastCompleteDate', 'Person'])
                    // res.status(200).send(data['Table']['AttributeDefinitions'].map(attribute => attribute['AttributeName']))
            }
        }
    })
})

/* GET list of tasks*/
router.get('/', function(req, res) {
    /* This example scans the entire Music table, and then narrows the results to songs by the artist "No One You Know". For each item, only the album title and song title are returned. */
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

router.put('/:id', function(req, res, next) {
    const id = req.query.param
        //Check form data in the model
    let newTask = new task(req.body, false)
    task["id"] = newId
    var params = {
        ...baseParams,
        ...newTask
    }
    dynamodb.putItem(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(400).send("Failed to update task!")
        } else {
            console.log(data); // successful response
            res.status(201).send("Updated task!")
        }
        res.send('respond with a resource');
    });
})

// Requires body parsing -> Form data
router.post('/', function(req, res, next) {

    // Require nano id to generate unique ids
    const newId = nanoid(10)
        //Check form data in the model
    let newTask = new task(req.body, false)
    task["id"] = newId
    var params = {
        ...baseParams,
        ...newTask
    }

    dynamodb.putItem(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(400).send("Failed to create task!")
        } else {
            console.log(data); // successful response
            res.status(201).send("Created task!")
        }
        res.send('respond with a resource');
    });
})

//PATCH
router.patch("/:id/markComplete", function(req, res) {
    //query
    const id = req.params.id
    console.log(id, req.body)
    var params = {
        ...baseParams,
        Key: {
            "id": {
                S: id
            },
        },
        ExpressionAttributeNames: {
            "#LC": "LastComplete",
            "#P": "Person"
        },
        ExpressionAttributeValues: {
            ":lc": {
                S: req.body['lastCompleteDate']
            },
            ":p": {
                S: req.body['person']
            }
        },
        UpdateExpression: "SET #P = :p, #LC = :lc"
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