[![Build Status](https://travis-ci.org/mcswaisy/mobile-apps-pfisterer.svg?branch=master)](https://travis-ci.org/mcswaisy/mobile-apps-pfisterer)

# User-Info & Sign-In

Ziel: Anmeldung innerhalb der App auf einem Backend-Server der innerhalb von Docker läuft

Umsetzung:
 * Datenhaltung mit MongoDB
 * Bestätigung mit JWT
 * Speicherung des Tokens im localstorage der App
 * Authentifizierung durch "Authorization"-Header innerhalb der REST-Anfrage

## passport.js-Server

### Benutzung

Benötigt noch eine MongoDB, diese ist zusammen mit dem Server in der [docker-compose.yml](docker-compose.yml) konfiguriert.
```
docker-compose build
docker-compose up
```

### Authentifizierung mit passport.js

Initialisierung siehe [app.js](passport-server/app.js).

Lokale Strategie, für die */login*-Route, hier werden User und Password mit der Datenbank verglichen

```javascript
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {message: 'Unknown User'});
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }));


router.post('/login',
    passport.authenticate('local', {session: false}),
    function (req, res) {
        console.log("login", req.user);

        var payload = {id: req.user._id};
        var token = jwt.sign(payload, jwtOptions.secretOrKey)
        res.send({message: "ok", token: token})

    });
```

JWT-Strategie für alle andere Routen


```javascript


var jwtOptions = {}


jwtOptions.jwtFromRequest = ExtractJwt.fromHeader("authorization");
jwtOptions.secretOrKey = 'secret';

var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);
    // usually this would be a database call:
    User.getUserById(jwt_payload.id, function(err, user) {
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    });
});

passport.use(strategy);

router.get('/user', passport.authenticate('jwt', {session: false}), function (req, res) {
    res.send(req.user);
})



```

## Cordova-App

### Speicherung des JWT im localstorage

```javascript
$.ajax({
         type: "POST",
         url: **YOUR_URL_HERE**,
         data: {
             username: **YOUR_USERNAME_HERE**,
             password: **YOUR_PASSWORD_HERE**},
         success: function (data, textStatus, request) {
             console.log(data, textStatus, request)
             localStorage.setItem("connect.sid", data.token)
             if (data.token) {
                 alert("success")
             }
         },
         dataType: "json",
         error: function (request, textStatus, errorThrown) {
             console.log(request, textStatus, errorThrown)
         }
     });
```

### Mitsenden des JWT bei REST-Anfragen und Abreifen von User-Daten

```javascript
$.ajax({
          type: "GET",
          url: **YOUR_URL_HERE**,
          success: function (data) {
              alert(JSON.stringify(data))
          },
          dataType: "json",
          error: function (data) {
          },
          headers: {
              "Authorization": localStorage.getItem('connect.sid')
          }
      });
```

