# LoCo
A Location-based Cooperative Web Service Using Google Maps

LoCo (Location-based Cooperative) is a web service that allows
people to cooperate on activities that are organized around locales.
It allows users to add content-associated markers to a map and to
view and search for markers based on selected criteria, such as
content, dates, and user names and addresses. This service has
many applications, for example, individuals might use it to locate
others who are willing to buy or sell objects and services that are
feasible to utilize only within a specific locale, such as piano
lessons or leasing farm machinery.

Requirements:

1. A PHP-enabled web server.
2. A Google Maps key, available at www.google.com/apis/maps/
3. An initial latitude and longtitude, available at geocoder.us/

Installation:

1. Unzip the package in the web root directory. Make the files
   readable by the web server id. Make the data files, users.txt
   and markers.txt, writable.
2. Edit the main.htp file:
   Put the Google Maps key in the maps.google.com script line.
3. Edit the loco.js file:
   Put the latitude and longtitude in the home_* variables, e.g.,
    var home_longtitude = -88.986189;
    var home_latitude = 40.509543;
    
To invoke: 

www.your.host/LoCo/loco.php

Data files:

1. users.txt - user login/encrypted passwords.
2. markers.txt - markers file.
