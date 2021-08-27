const mocha = require("mocha")
const axios = require('axios');

describe('api', function() {
    describe('GET /api/users groupA', function() {
        it('respond with an array of users', function() {
            // ...
        });
    });
    describe('GET /api/users', function() {
        it('respond with an array of users', function() {
            // ...
        });
    });
    describe('DELETE /api/users', function() {
        it('respond with an array of users', function() {
            // ...
        });
    });
    describe('DELETE /api/users', function() {
        it('respond with an array of users', function() {
            // ...
        });
    });
    describe('PATCH /api/users', function() {
        it('respond with an array of users', function() {
            // ...
        });
    });
    describe('PATCH /api/users', function() {
        it('respond with an array of users', function() {
            // ...
        });
    });
    describe('GET /api/users', function() {
        it('respond with an array of users', function() {
            // ...
        });
    });
    describe('GET /api/users', function() {
        it('respond with an array of users', function() {
            // ...
        });
    });
    describe('POST /task/', function() {
        it('create new item', function() {
            axios.post('/task/', {
                    firstName: 'Fred',
                    lastName: 'Flintstone'
                })
                .then(function(response) {
                    console.log(response);
                })
                .catch(function(error) {
                    console.log(error);
                });
        });
    });
    describe('POST /api/users', function() {
        it('respond with an array of users', function() {
            // ...
        });
    });
});