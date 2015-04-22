Meals = "Meals"

var itemsToSave = []

Parse.Cloud.define("VerifyMeal", function(request, response) {
                   Parse.Cloud.useMasterKey();
                   var restaurantCode = request.params.restaurantCode;
                   var mealCode = request.params.mealCode;
                   
                   var validationQuery = new Parse.Query(Meals);
                   validationQuery.equalTo("restaurant", restaurantCode);
                   validationQuery.equalTo("objectId", mealCode);
                   
                   validationQuery.find({
                            success: function(results) {
                                if (results.length == 1) {
                                    var mealObject = results[0];
                                    var claimed = mealObject.get("claimed");
                                    
                                    if (claimed == true) {
                                        response.error("Meal Claimed");
                                    }
                                    else {
                                        response.success(mealObject);
                                    }
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
                   var review = request.params.review;
                   var starRating = request.params.starRating;
                   
                   var validationQuery = new Parse.Query(Meals);
                   validationQuery.equalTo("restaurant", restaurantCode);
                   validationQuery.equalTo("objectId", mealCode);
                   
                   validationQuery.find({
                          success: function(results) {
                                if (results.length == 1) {
                                    var mealObject = results[0];
                                    var claimed = mealObject.get("claimed");
                                    var mealReward = parseInt(mealObject.get("potential_reward"));
                                    var potentialRewardInt = parseInt(potentialReward)
                                        
                                    if (claimed == true) {
                                        response.error("Meal Claimed");
                                    }
                                    else if (potentialRewardInt != mealReward) {
                                        response.error("Invalid Reward Value");
                                    }
                                    else {
                                        rewardUser(username, potentialReward, response);
                                        claimMeal(mealObject, username);
                                    }
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

function rewardUser(username, reward, response) {
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("username", username);
    userQuery.find({
        success: function(users) {
                    var user = users[0];
                    var currentTotalRewards = user.get("total_rewards");
                    user.set("total_rewards", currentTotalRewards + reward);
                    user.save(null, {
                              success: function(currentUser) {
                              response.success(user.get("total_rewards"));
                              },
                              error: function(error) {
                                    alert("Error: " + error.code + " " + error.message);
                              }
                    });
        },
        error: function(error) {
            response.error(error);
        }
        
    });
}

function claimMeal(meal, username) {
    // meal.set("claimed", true);
    meal.set("claimed_by", username)
    meal.save(null, {
              success: function(meal) {

              },
              error: function(meal, error) {
              }
    });
}












