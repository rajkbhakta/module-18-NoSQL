const {
    Thought,
    User
} = require('../models');
const thoughtController = {

   
    getAllThoughts(req, res) {
        Thought.find({})
            .then(dbThoughtData => res.json(dbThoughtData))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    },

    getThoughtById({
        params
    }, res) {
        Thought.findOne({
                _id: params.id
            })
            .select('-__v')
            .sort({
                _id: -1
            })
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({
                        message: 'Thought is not found with this ID'
                    });
                    return;
                }
                res.json(dbThoughtData)
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },


    addThought({
        body
    }, res) {
        Thought.create(body)
            .then((ThoughtData) => {
                return User.findOneAndUpdate(
                    
                    {
                        _id: body.userId
                    }, {
                        $addToSet: {
                            thoughts: ThoughtData._id
                        }
                    }, {
                        new: true
                    }
                );
            })
            .then(UsersData => {
                if (!UsersData) {
                    res.status(404).json({
                        message: 'User ID not found.'
                    });
                    return;
                }
                res.json(UsersData)
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },


    updateThought({
        params,
        body
    }, res) {
        Thought.findOneAndUpdate({
                _id: params.thoughtId
            }, {
                $set: body
            }, {
                runValidators: true,
                new: true
            })
            .then(updateThought => {
                if (!updateThought) {
                    return res.status(404).json({
                        message: 'Thought is not found with this ID'
                    });
                }
                return res.json({
                    message: "Success"
                });
            })
            .catch(err => res.json(err));
    },


    removeThought({
        params
    }, res) {
        Thought.findOneAndDelete({
                _id: params.thoughtId
            })
            .then(deletedThought => {
                if (!deletedThought) {
                    return res.status(404).json({
                        message: 'Thought is not found with this ID'
                    });
                }
                return User.findOneAndUpdate({
                    thoughts: params.thoughtId
                }, {
                    $pull: {
                        thoughts: params.thoughtId
                    }
                }, {
                    new: true
                });
            })
            .then(UserData => {
                if (!UserData) {
                    res.status(404).json({
                        message: 'Thought is not found with this ID'
                    });
                    return;
                }
                res.json(UserData);
            })
            .catch(err => res.json(err));
    },


    addReaction({
        params,
        body
    }, res) {
        Thought.findOneAndUpdate({
                _id: params.thoughtId
            }, {
                $push: {
                    reactions: body
                }
            }, {
                new: true,
                runValidators: true
            })
            .then(updatedThought => {
                if (!updatedThought) {
                    res.status(404).json({
                        message: ' reaction not found with this id!'
                    });
                    return;
                }
                res.json(updatedThought);
            })
            .catch(err => res.json(err));
    },

    removeReaction({
        params
    }, res) {
        Thought.findOneAndUpdate({
                    _id: params.thoughtId
                },
           
                {
                    $pull: {
                        reactions: {
                            reactionId: params.reactionId
                        }
                    }
                }, {
                    new: true
                }
            )
            .then((thought) => {
                if (!thought) {
                    res.status(404).json({
                        message: ' reaction not found with this id.'
                    });
                    return;
                }
                res.json(thought)
            })
            .catch(err => res.json(err));
    },
}

module.exports = thoughtController;