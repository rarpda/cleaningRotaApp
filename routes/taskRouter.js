var express = require('express');
var router = express.Router();
const { nanoid } = require('nanoid')
const Task = require("../public/model/node_task")
const databaseHandler = require("../database/databaseHandler")

/* GET list of tasks*/
router.get('/', function(req, res) {
    res.set('Cache-Control', "max-age=10000")
    databaseHandler.getAllTasks(function(error, data) {
        if (error) {
            console.error(error)
            res.status(500).send("Data could not be fetched!")
        } else {
            res.status(200).send(data['Items'].map(element => new Task(element)))
        }
    })
})

// GEt task id
router.get('/:id', function(req, res) {
    const taskId = req.params.id
    databaseHandler.getTask(id, function(error, data) {
        if (error) {
            console.error(error)
            res.status(404).send("Could not get item for id:" + taskId)
        } else {
            res.status(200).send(new Task(data['Items']))
        }
    })
})

// DELETE 
router.delete('/:id', function(req, res) {
    const id = req.params.id
    databaseHandler.deleteTask(id, function(error) {
        if (error) {
            console.error(error)
            res.status(400).send("Failed to delete task!")
        } else {
            res.status(200).send("Deleted!")
        }
    })
})


// Requires body parsing -> Form data
router.post('/', function(req, res) {
    // Require nano id to generate unique ids
    const newId = nanoid(10)
        //Check form data in the model
    let newTask = new Task({...req.body, "id": newId }, false)
    databaseHandler.createNewTask(newTask, function(error, data) {
        if (error) {
            console.error(error)
            res.status(400).send("Failed to update task!")
        } else {
            res.status(201).send(newTask)
        }
    })
})

router.put('/:id', function(req, res) {
    //Check form data in the model   
    const id = req.params.id;
    if (id !== req.body.id) {
        return res.status(400).send("ID and payload do not match")
    } else {
        let newTask = new Task(req.body, false)
        databaseHandler.updateExistingTask(id, newTask, function(error, data) {
            if (error) {
                console.error(error)
                res.status(400).send("Failed to update task!")
            } else {
                res.status(201).send(newTask)
            }
        })
    }
})

//PATCH
router.patch("/:id/markComplete", function(req, res) {
    const id = req.params.id
    let validInputs = Task.checkMarkComplete(req.body);
    databaseHandler.markComplete(id, validInputs, function(error, data) {
        if (error) {
            console.error(error)
            res.status(400).send("Failed to mark last complete!")
        } else {
            res.status(200).send(new Task(data['Attributes']))
        }
    })
})




module.exports = router;