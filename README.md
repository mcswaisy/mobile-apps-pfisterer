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
          url: `**YOUR_URL_HERE**`,
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

