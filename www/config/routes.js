var home = require('../app/controllers/home');

//you can include all your controllers

module.exports = function (app, passport) {

    app.get('/', home.userReload, home.home);
    app.get('/signup/', home.signup);
    app.get('/confirm/', home.confirm);
    app.get('/logout/', home.logout);
    app.get('/delete/', home.delete);
    app.get('/delete_on_activation/', home.delete_on_activation);
    
    //posts
    app.post('/signup/', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/signup/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
    // process the login form
    app.post('/login/', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the login page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.post('/change_plz_interests/', home.change_plz_interests);

}