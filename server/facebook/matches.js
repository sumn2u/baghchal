var crypto = require('crypto-js');

module.exports = function (app) {
    const db = app.db;

    /**
     * POST /save-match
     * 
     * Inserts or updates database match information for the specified context
     * after validating that the data sent is actually from a valid client
     * 
     */
    app.post('/save-match', function (request, response) {
        var contextId = request.body.contextId;
        var signature = request.body.signature;
        var socketId = request.body.socketId;
        var player = request.body.player;
        var friendSocketId = request.body.friendSocketId;

        // Validate request data (see FBInstant.player.getSignedPlayerInfo documentation)
        var isValid = validate(signature);

        if (isValid) {
            // Retrieves data payload from the signed info
            var data = getEncodedData(signature);
            // Saves data specified in the payload, for the specified context 
            saveMatchData(contextId, socketId, friendSocketId, data)
                // Returns a json with sucess:true if data was successfully saved to the database
                .then(function (result) {
                    response.json({
                        'success': true
                    });
                })
                // Returns a json with success:false and error information if information was not saved
                .catch(function (err) {
                    console.log(err);
                    response.json({
                        'success': false,
                        'error': err
                    });
                });
        } else {
            // Returns a json with success:false and invalid signature in case signature couldn't be verified
            // Invalid signature errors can happen for many reasons, like:
            //  - APP_SECRET not specified on .env (see template.env for more information)
            //  - Request being sent from the mock SDK which doesn't send a valid signature 
            //   (set USE_SECURE_COMMUNICATION on .env to use the mock SDK, otherwise use the embedded player)
            response.json({
                'success': false,
                'error': {
                    message: 'invalid signature'
                }
            });
        }
    })

    /**
     * POST /delete-match
     * 
     * Delete's database match information for the specified socketId and friendSocketId
     * 
     */
    app.post('/delete-match', function (request, response) {
        var friendSocketId = request.body.friendSocketId;
        var socketId = request.body.socketId;
        deleteMatch(friendSocketId, socketId).then(function (result) {
            response.json({
                'success': true
            })
        })
    });
    /**
     * POST /clear-match
     * 
     * Delete's database match information for the specified socketId and friendSocketId
     * 
     */
    app.post('/clear-match', function (request, response) {
        var contextId = request.body.contextId;
        clearMatch(contextId).then(function (result) {
            response.json({
                'success': true
            })
        })
    });

    /**
     * GET /get-match
     * 
     * Returns match information stored in the database for the specified context 
     * after validating that the request is from a valid client
     */
    app.post('/get-match', function (request, response) {
        var signature = request.body.signature;
        // Validate request data (see FBInstant.player.getSignedPlayerInfo documentation)         
        var isValid = validate(signature);

        if (isValid) {
            // Retrieves the context Id from encoded signature payload
            var contextId = getEncodedData(signature);
            // Tries to load data from the database respective to this context 
            loadMatchData(contextId).then(function (result) {
                    // Returns a json with data and success:true if data was found
                    if (result) {
                        response.json({
                            'success': true,
                            'contextId': contextId,
                            'empty': false,
                            'data': result.data,
                            'socketId': result.socketId
                        });
                        // Returns a json with empty:true and success:true if all operations were successful, but no data was found
                    } else {
                        response.json({
                            'success': true,
                            'contextId': contextId,
                            'empty': true
                        });
                    }
                })
                // Returns a json with success:false in case of any errors
                .catch(function (err) {
                    console.log(err);
                    response.json({
                        'success': false,
                        'error': err
                    });
                });
        } else {
            // Returns a json with success:false and invalid signature in case signature couldn't be verified
            // Invalid signature errors can happen for many reasons, like:
            //  - APP_SECRET not specified on .env (see template.env for more information)
            //  - Request being sent from the mock SDK which doesn't send a valid signature 
            //   (set USE_SECURE_COMMUNICATION on .env to use the mock SDK, otherwise use the embedded player)
            response.json({
                'success': false,
                'error': {
                    message: 'invalid signature'
                }
            });
        }
    })

    /**
     * saveMatchData(contextId, socketId, friendSocketId, data)
     * 
     * Updates or inserts information in the database for the specified context
     */
    var saveMatchData = function (contextId, socketId, friendSocketId, data) {
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.all('SELECT context, data, socketId, friendSocketId FROM Matches WHERE context=?', [contextId], function (err, rows) {
                    if (err) {
                        reject(err);
                    }
                    // Update existing record for the context
                    else if (rows.length > 0) {
                        db.run('UPDATE Matches SET data=?, socketId=?, friendSocketId=? WHERE context=?', [data, socketId, friendSocketId, contextId], function (err) {
                            if (err) {
                                reject(err);
                            }
                            resolve();
                        });
                        // Row doesn't exist, create one
                    } else {
                        db.run('INSERT INTO Matches (context, socketId, friendSocketId, data) VALUES (?,?,?,?)', [contextId, socketId, friendSocketId, data], function (err) {
                            if (err) {
                                reject(err);
                            }
                            resolve();
                        })
                    }
                });
            });
        });
    };
    /**
     * deleteMatch(friendSocketId, socketId)
     * 
     * Deletes data from the database for the specified friendSocketId
     */
    var deleteMatch = function (friendSocketId, socketId) {
        console.log(friendSocketId, socketId)
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.run('DELETE from Matches WHERE friendSocketId=?', [friendSocketId], function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                })
            });
        });
    };

    /**
     * clearMatch(contextId)
     * 
     * Deletes data from the database for the specified contextId
     */
    var clearMatch = function (contextId) {
        console.log(contextId)
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.run('DELETE from Matches WHERE context=?', [contextId], function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                })
            });
        });
    };

    /**
     * loadMatchData(contextId)
     * 
     * Retrieves data from the database for the specified context
     */
    var loadMatchData = function (contextId) {
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.all('SELECT data, socketId FROM Matches WHERE context=?', [contextId], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else if (rows.length > 0) {
                        resolve(rows[0])
                    } else {
                        resolve("")
                    }
                });
            });
        });
    };


    /**
     * Validates a signed request, returning a boolean that specifies if it's valid or not
     * See FBInstant.player.getSignedPlayerInfo for more information
     */
    var validate = function (signedRequest) {
        // You can set USE_SECURE_COMMUNICATION to false in the .env file to bypass validation
        // while doing local testing and using the FBInstant mock SDK.        
        if (process.env.USE_SECURE_COMMUNICATION == false) {
            console.log('Not validating signature')
            return true;
        }

        try {

            var firstpart = signedRequest.split('.')[0];
            var replaced = firstpart.replace(/-/g, '+').replace(/_/g, '/');
            var signature = crypto.enc.Base64.parse(replaced).toString();
            const dataHash = crypto.HmacSHA256(signedRequest.split('.')[1], process.env.APP_SECRET).toString();
            var isValid = signature === dataHash;
            if (!isValid) {
                console.log('Invalid signature');
                console.log('Expected', dataHash);
                console.log('Actual', signature);
            }

            return isValid;
        } catch (e) {
            return false;
        }
    };

    /**
     * Gets payload data encoded into a signed request.
     * See FBInstant.player.getSignedPlayerInfo for more information
     */
    var getEncodedData = function (signedRequest) {
        // You can set USE_SECURE_COMMUNICATION to false in the .env file to bypass validation
        // while doing local testing and using the FBInstant mock SDK.   
        if (process.env.USE_SECURE_COMMUNICATION === false) {
            return payload;
        }

        try {

            const json = crypto.enc.Base64.parse(signedRequest.split('.')[1]).toString(crypto.enc.Utf8);
            const encodedData = JSON.parse(json);

            /*
            Here's an example of encodedData can look like
            { 
                algorithm: 'HMAC-SHA256',
                issued_at: 1520009634,
                player_id: '123456789',
                request_payload: 'backend_save' 
            } 
            */

            return encodedData.request_payload;
        } catch (e) {
            return null;
        }
    };
}
