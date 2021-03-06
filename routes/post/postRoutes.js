var Post = require('../../models/post');
var Comment = require('../../models/comment')
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');


module.exports = {
  /**All posts */
  getAllPosts: function (req, res, next) {
    Post.find({}).populate("comments created_user").exec(function (err, posts) {
      if (err) {
        console.log(err);
      } else {
        res.json(posts);
      }
    });
  },
  /**Get post by Id*/
  getPostById: function (req, res, next) {
    
      var id = req.params.postId

      Post.findById({ _id: id })
      .populate({ 
        path: 'comments',
        populate: {
          path: 'author',
          model: 'User'
        }
     })
     .populate(
       {
        path: 'created_user',
        model: 'User'
       }
     )
     
     .exec(function (err, post) {
        if (err) {
          console.log(err);
        } else {
          
          res.json(post);
        }
      });
    
  },






  /**Create post */
  createPost: function (req, res, next) {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        var title = req.body.title;

        Post.find({ title }, function (err, doc) {
          if (doc.length <= 0) {



            
            if (req.file) {
              var post = {
                _id: new mongoose.Types.ObjectId(),
                title: req.body.title,
                imageFile: req.file.path.slice(15),
                description: req.body.description,
                created_user: authData.user._id
              };
            }
            else {
              var post = {
                _id: new mongoose.Types.ObjectId(),
                title: req.body.title,
                description: req.body.description,
                created_user: authData.user._id
              };
            }




            var newPost = new Post(post);
            newPost.save(function (err, post) {
              res.json(post);
            });




          }
          else {
            res.json('Post exists')
          }
        })
      }
    });
  },
  /**Edit post*/
  editPost: function (req, res, next) {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        if (authData.user.isAdmin) {
          var id = req.params.post;
          Post.findByIdAndUpdate(id, {
            title: req.body.title,
            description: req.body.description,
            image: req.file.path.slice(15),
          }, function (err, doc) { res.json('Post edited') })
        }
        else if (!authData.user.isAdmin) {
          var id = req.params.post;
          Post.findOne({ _id: id }, function (err, doc) {
            if (err) res.json(err);
            if (doc.created_user == authData.user._id) {
              if (req.body.title) {doc.title = req.body.title;}
              if(req.body.description){doc.description = req.body.description;}
              if (req.file) { doc.imageFile = req.file.path.slice(15) }
              doc.save(function (err, doc) {
                if (err) return res.json(err);
                res.json(doc);
              });
            }
            else { res.status(403).json('You can edit only your posts') }
          })
        }
        else { res.status(403).json('You can edit only your posts') }
      }
    });
  },
  /**Delete post*/
  deletePost: function (req, res, next) {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
      
      if (err) {
        res.sendStatus(403);
      } else {
        if (authData.user.isAdmin) {
          var postId = req.params.post;
          Post.deleteOne({ _id: postId }, function (err, doc) { res.json('Post deleted') })
        }
        else {
          var postId = req.params.post;
          Post.findById({ _id: postId }, function (err, doc) {
            if (err) res.json(err);
            console.log(doc.created_user)
            console.log(authData.user._id)
            if (doc.created_user == authData.user._id) {
              doc.remove(function (err, doc) {
                if (err) return res.json(err);
                res.json('Yor post successfully deleted');
              });
            }
            else { res.status(403).json('You can delete only your posts') }
          })
        }
      }
    });
  }
};