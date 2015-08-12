Parse.Cloud.beforeSave("Points", function(request, response) {
                       var newACL = new Parse.ACL();
                       
                       newACL.setPublicWriteAccess(false);
                       newACL.setPublicReadAccess(true);
                       
                       request.object.setACL(newACL);
                       response.success();
                       });

Parse.Cloud.beforeSave("Deals", function(request, response) {
                       var newACL = new Parse.ACL(request.user);
                       
                       newACL.setPublicWriteAccess(false);
                       newACL.setPublicReadAccess(true);
                       
                       request.object.setACL(newACL);
                       response.success();
                       });

Parse.Cloud.beforeSave("Meals", function(request, response) {
                       if (!request.object.existed()) {
                           var newACL = new Parse.ACL(request.user);
                           
                           newACL.setPublicWriteAccess(false);
                           newACL.setPublicReadAccess(false);
                           
                           request.object.setACL(newACL);
                       }
                       response.success();
                       });

Parse.Cloud.beforeSave("Servers", function(request, response) {
                       var newACL = new Parse.ACL(request.user);
                       
                       newACL.setPublicWriteAccess(false);
                       newACL.setPublicReadAccess(true);
                       
                       request.object.setACL(newACL);
                       response.success();
                       });

Parse.Cloud.beforeSave("Reviews", function(request, response) {
                       var newACL = new Parse.ACL(request.user);
                       
                       newACL.setPublicWriteAccess(false);
                       newACL.setPublicReadAccess(false);
                       
                       request.object.setACL(newACL);
                       response.success();
                       });

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
                       var newACL = new Parse.ACL();
                       
                       newACL.setPublicWriteAccess(false);
                       newACL.setPublicReadAccess(true);
                       
                       request.object.setACL(newACL);
                       request.object.save();
                       response.success();
                       });

Parse.Cloud.define('JoinWaitlist', function(request, response){
                   Parse.Cloud.useMasterKey();
                   if(!request.params.phone_number || !request.params.email) {
                   response.error('Phone number or e-mail is required to sign-up for the waitlist')
                   }
                   else {
                   var location = request.params.location
                   var phoneNumber = request.params.phone_number
                   var email = request.params.email
                   var name = request.params.name
                   var waitlist = new Parse.Object("Waitlist");
                   waitlist.set("location", location)
                   waitlist.set("phone_number", phoneNumber)
                   waitlist.set("email", email)
                   waitlist.set("name", name)
                   waitlist.save(null,{
                                 success: function (object) {
                                 response.success(object);
                                 },
                                 error: function (object, error) {
                                 response.error(error);
                                 }
                                 });
                   }
                   });

Parse.Cloud.define('ChargeUser', function(request, response) {
                   Parse.Cloud.useMasterKey();
                   if (!request.params.username) {
                   response.error('Username has not been provided');
                   }
                   if (!request.params.userToCharge) {
                   response.error('User To Charge has not been provided');
                   }
                   if (!request.params.cost) {
                   response.error('Cost has not been provided');
                   }
                   
                   var costInt = parseInt(request.params.cost)
                   if (costInt < 0) {
                   response.error('The provided cost must be 0 or greater');
                   }
                   
                   var queryRole = new Parse.Query(Parse.Role);
                   queryRole.equalTo('name', 'Restaurant');
                   
                   queryRole.first({
                                   success: function(r){
                                   var role = r;
                                   var relation = new Parse.Relation(role, 'users');
                                   var admins = relation.query();
                                   
                                   admins.equalTo('username', request.params.username)
                                   admins.first({
                                                success: function(u){
                                                var user = u;
                                                
                                                if(user){
                                                    rewardUser(request.params.userToCharge, -1 * costInt, response);
                                                }else{
                                                response.error('User is not admin');
                                                }
                                                },
                                                error: function(){
                                                response.error('Error on user lookup');
                                                }
                                                })
                                   },
                                   error: function(){
                                   response.error('User admin check failed');
                                   }
                                   });
                   });

Parse.Cloud.define('isRestaurant', function(req, response){
                   Parse.Cloud.useMasterKey();
                   if(!req.params.username){
                   response.error('Username has not been provided');
                   }
                   
                   var queryRole = new Parse.Query(Parse.Role);
                   queryRole.equalTo('name', 'Restaurant');
                   
                   queryRole.first({
                                   success: function(r){
                                   var role = r;
                                   var relation = new Parse.Relation(role, 'users');
                                   var admins = relation.query();
                                   
                                   admins.equalTo('username', req.params.username)
                                   admins.first({
                                                success: function(u){
                                                var user = u;
                                                
                                                if(user){
                                                response.success();
                                                }else{
                                                response.error('User is not admin');
                                                }
                                                },
                                                error: function(){
                                                response.error('Error on user lookup');
                                                }
                                                })
                                   },
                                   error: function(){
                                   response.error('User admin check failed');
                                   }
                                   });
                   });

Parse.Cloud.define("VerifyMeal", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   var restaurantCode = request.params.restaurantCode;
                   var mealCode = request.params.mealCode;
                   
                   var validationQuery = new Parse.Query("Meals");
                   validationQuery.equalTo("restaurant_objectId", restaurantCode);
                   validationQuery.equalTo("objectId", mealCode);
                   
                   validationQuery.find({
                                        success: function(results) {
                                        if (results.length == 1) {
                                        var mealObject = results[0];
                                        var claimed = mealObject.get("claimed");
                                        var newACL = mealObject.getACL();
                                        newACL.setReadAccess(request.user.id, true);
                                        mealObject.setACL(newACL);
                                        mealObject.save(null, {
                                                            success: function(meal) {
                                                                if (claimed == true) {
                                                                response.error("Meal Claimed");
                                                                }
                                                                else {
                                                                response.success(mealObject);
                                                                }
                                                            },
                                                            error: function(meal, error) {
                                                                if (claimed == true) {
                                                                response.error("Meal Claimed");
                                                                }
                                                                else {
                                                                response.success(mealObject);
                                                                }
                                                            }
                                                            });
                                        }
                                        else {
                                        response.error("Meal Not Found");
                                        }
                                        },
                                        error: function(error) {
                                        response.error(error);
                                        }
                                        });
                   });

Parse.Cloud.define("ReviewMeal", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   
                   var username = request.params.username;
                   
                   var restaurantCode = request.params.restaurantCode;
                   var mealCode = request.params.mealCode;
                   var potentialReward = parseInt(request.params.potentialReward);
                   
                   var validationQuery = new Parse.Query("Meals");
                   validationQuery.equalTo("restaurant_objectId", restaurantCode);
                   validationQuery.equalTo("objectId", mealCode);
                   
                   validationQuery.find({
                                        success: function(results) {
                                        if (results.length == 1) {
                                        var mealObject = results[0];
                                        var claimed = mealObject.get("claimed");
                                        var mealReward = parseInt(mealObject.get("potential_reward"));
                                        var potentialRewardInt = parseInt(potentialReward)
                                        
                                        if (potentialRewardInt < 0) {
                                            response.error("A reward of 0 or more is required.");
                                        }
                                        
                                        if (claimed == true) {
                                        response.error("This meal has already been claimed.");
                                        }
                                        else if (potentialRewardInt != mealReward) {
                                        response.error("The given reward value doesn't match our records.");
                                        }
                                        else {
                                        claimMeal(mealObject, username);
                                        rewardUser(username, potentialReward, response);
                                        }
                                        }
                                        else {
                                        response.error("This meal was not found.");
                                        }
                                        },
                                        error: function(error) {
                                        response.error(error);
                                        }
                                        });
                   });

function rewardUser(username, reward, response) {
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("username", username);
    userQuery.find({
       success: function(users) {
            var user = users[0];
            var userPointsQuery = new Parse.Query("Points")
            userPointsQuery.equalTo("username", username);
            userPointsQuery.find({
                       success: function(results) {
                            var points;
                                 var newPoints = -1
                            if (results.length > 0) {
                                points = results[0]
                                var currentTotalRewards = points.get("points")
                                var newPoints = currentTotalRewards + reward
                                points.set("points", newPoints)
                            }
                            else if (results.length == 0) {
                                var Points = Parse.Object.extend("Points");
                       
                                // Create a new instance of that class.
                                points = new Points();
                                newPoints = reward
                       
                                points.set("points", reward)
                                points.set("username", username)
                            }
                            if (newPoints >= 0) {
                                 points.save(null, {
                                             success: function(savedPoints) {
                                             // Execute any logic that should take place after the object is saved.
                                             response.success(savedPoints.get("points"));
                                             },
                                             error: function(savedPoints, error) {
                                             // Execute any logic that should take place if the save fails.
                                             // error is a Parse.Error with an error code and message.
                                             response.error(error)
                                             }
                                             });
                            }
                            else {
                                response.error("The user doesn't have enough points for this deal.")
                            }
                       },
                       error: function(error) {
                            response.error(error);
                       }
            });
       }
    });
}

function claimMeal(meal, username) {
    meal.set("claimed", true);
    meal.set("claimed_by", username)
    meal.save(null, {
              success: function(meal) {
              
              },
              error: function(meal, error) {
              }
              
              });
}


                                   
                                   
                                   
                                   
                                   
                                   
                                   
                                   
                                   
                                   
