const {
    User
} = require('../models');

const userController = {

  
    getAllUsers(req, res) {
        User.find({})
            .populate({
                path: 'thoughts',
              
                select: ('-__v')
            })
            .populate({
                path: 'friends',
                select: ('-__v')
            })
            .select('-__v')
         
            .sort({
                _id: -1
            })
            .then(dbUserData => res.json(dbUserData))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    },

// retrieves the user by ID
    getUserById({
        params
    }, res) {
        User.findOne({
                _id: params.id
            })
            .populate({
                path: 'thoughts',
                select: '-__v'
            })
            .select('-__v')
            .then(dbUserData => res.json(dbUserData))
            .catch(err => {
                console.log(err);
                res.sendStatus(400);
            });
    },

//creates a new user
    createUser({
        body
    }, res) {
        User.create(body)
            .then(dbUserData => res.json(dbUserData))
            .catch(err => res.status(400).json(err));
    },

   // updates the user ID
    updateUser({
        params,
        body
    }, res) {
        User.findOneAndUpdate({
                _id: params.id
            }, body, {
                new: true,
                runValidators: true
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({
                        message: 'No user found with this id.'
                    });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(400).json(err));
    },

// deletes the user
    deleteUser({
        params
    }, res) {
        User.findOneAndDelete({
                _id: params.id
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({
                        message: 'No user found with this id.'
                    });
                    return;
                }
                return dbUserData;
            })
            .then(dbUserData => {
                User.updateMany({
                        _id: {
                            $in: dbUserData.friends
                        }
                    }, {
                        $pull: {
                            friends: params.userId
                        }
                    })
                    .then(() => {
                        //deletes the users thought by ID
                        Thought.deleteMany({
                                username: dbUserData.username
                            })
                            .then(() => {
                                res.json({
                                    message: 'User deleted successfully'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(400).json(err);
                            })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(400).json(err);
                    })
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            })
    },

    // Add friends to a list
    addToFriendList({
        params
    }, res) {
        User.findOneAndUpdate({
                _id: params.userId
            }, {
                $push: {
                    friends: params.friendId
                }
            }, {
                new: true
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({
                        message: 'No user found with this id!'
                    });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => {
                console.log(err)
                res.json(err)
            });
    },

    //Delete friends from list
    removefromFriendList({
        params
    }, res) {
        User.findOneAndDelete({
                _id: params.userId
            })
            .then(deletedFriend => {
                if (!deletedFriend) {
                    return res.status(404).json({
                        message: 'No friend found with this id.'
                    })
                }
                return User.findOneAndUpdate({
                    friends: params.friendId
                }, {
                    $pull: {
                        friends: params.friendId
                    }
                }, {
                    new: true
                });
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({
                        message: 'No friend found with this id.'
                    })
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.json(err));
    },
};

module.exports = userController;