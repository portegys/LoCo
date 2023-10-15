    //<![CDATA[

    // The map.
    var map = "";
    var home_longtitude = -88.986189;
    var home_latitude = 40.509543;

    // Mapped markers.
    var mapList = new Array();

    // Marker transactions.
    var transactions = new Array();

    // Operations.
    var mode = 1;

    // Initialize map.
    function onLoad()
    {
      // Create the map and center on "home".
      if (GBrowserIsCompatible())
      {
        map = new GMap(document.getElementById("map"));
        map.addControl(new GSmallMapControl());
        map.addControl(new GMapTypeControl());
        map.centerAndZoom(new GPoint(home_longtitude, home_latitude), 2);

        // Download the current markers and load them on the map.
        loadMarkers();

        // Add and remove markers.
        GEvent.addListener(map, 'click', function(overlay, point) {
          document.forms['controls'].elements['notice'].value = "";
          var user = trim(document.forms['controls'].elements['user'].value);
          if (point && mode == 3) {
            if (user == "")
            {
              alert("User required!");
              return;
            }
            if (user != login_user)
            {
              alert("Invalid user!");
              return;
            }
            var address = trim(document.forms['controls'].elements['address'].value);
            var content = GetContent();
            var start_date = trim(document.forms['controls'].elements['start_date'].value);
            var end_date = trim(document.forms['controls'].elements['end_date'].value);
            createMarker(user, point, address,
              content, start_date, end_date);
            addTransaction(user, point, address, content,
              start_date, end_date);
          }
        });
      }

      // The content editor.
      oFCKeditor = new FCKeditor( 'content' ) ;
      oFCKeditor.BasePath = "FCKeditor/" ;
      oFCKeditor.ReplaceTextarea() ;
    }

    function SetContent(html)
    {
    	var oEditor = FCKeditorAPI.GetInstance('content') ;
    	oEditor.SetHTML( html ) ;
    }
    
    function GetContent()
    {
    	var oEditor = FCKeditorAPI.GetInstance('content') ;
    	return oEditor.GetXHTML( true ) ;
    }

    // Invoke geocoding to re-center map.
    function goAddress()
    {
      var address = trim(document.forms['controls'].elements['address'].value);
      if (address == "") return;
      var xmlhttp = GXmlHttp.create();
      var l = new Array();
      xmlhttp.open("GET", 'loco.php?geocode=true&address=' + encodeURIComponent(address), true);
      xmlhttp.onreadystatechange=function() 
      {
        if (xmlhttp.readyState==4)
        {
          coords = xmlhttp.responseText.split(',');
          if ( coords.length >= 2 )
          {
            map.centerAndZoom(new GPoint(coords[1], coords[0]), 2);
          } else {
            alert("Could not find this address!");
          }
        }
      }
      xmlhttp.send(null)
    }

    // Set mode.
    function setMode(m)
    {
      mode = m;
      map.closeInfoWindow();
      switch(mode)
      {
        case 1:
          viewAll();
          document.forms['controls'].elements['notice'].value="View all markers";
          break;
        case 2:
          viewFiltered();
          document.forms['controls'].elements['notice'].value="View markers that match values (user, address, etc.). Select these with the filter button.";
          break;
        case 3:
          document.forms['controls'].elements['notice'].value="Click map to add marker";
          break;
        case 4:
          document.forms['controls'].elements['notice'].value="Click marker to remove";
          break;
      }
    }
    
    // Reset controls.
    function resetControls()
    {
     document.forms['controls'].elements['user'].value="";
     document.forms['controls'].elements['address'].value="";
     SetContent("");
     document.forms['controls'].elements['start_date'].value="";
     document.forms['controls'].elements['end_date'].value="";
     document.forms['controls'].elements['notice'].value="";
    }

    // Create a marker whose info window displays its location.
    function createMarker(user_in, point_in, address_in, content_in,
      start_date_in, end_date_in)
    {
      var user = user_in;
      var point = point_in;
      var address = address_in;
      var content = content_in;
      var start_date = start_date_in;
      var end_date = end_date_in;
      var marker = new GMarker(point);
      map.addOverlay(marker);
      var element = new Object();
      element.user = user;
      element.address = address;
      element.content = content;
      element.start_date = start_date;
      element.end_date = end_date;
      element.marker = marker;
      element.mapped = "true";
      mapList[mapList.length] = element;
      GEvent.addListener(marker, 'click', function() {
     	if (mode == 1 || mode == 2) {
   	  document.forms['controls'].elements['user'].value = user;
   	  document.forms['controls'].elements['address'].value = address;
   	  SetContent(content);
   	  document.forms['controls'].elements['start_date'].value = start_date;
   	  document.forms['controls'].elements['end_date'].value = end_date;
          marker.openInfoWindowHtml(content);
        } else if (mode == 4) {
          if (user == login_user)
          {
            map.closeInfoWindow();
            map.removeOverlay(marker);
            removeTransaction(user, point);
            for (var i = 0; i < mapList.length; i++)
            {
              if (mapList[i] != "" && mapList[i].marker == marker)
              {
                mapList[i] = "";
                break;
              }
            }
          } else {
            alert("Invalid user!");
          }
        }
      });
    }

    // Add marker transaction.
    function addTransaction(user, point, 
      address, content, start_date, end_date)
    {
      var update = new Object;
      update.type = 'add';
      update.user = user;
      update.lat = point.y;
      update.lng = point.x;
      update.address = address;
      update.content = content;
      update.start_date = start_date;
      update.end_date = end_date;
      transactions[transactions.length] = update;
    }
    
    // Remove marker transaction.
    function removeTransaction(user, point)
    {
      var update = new Object;
      update.type = 'remove';
      update.user = user;
      update.lat = point.y;
      update.lng = point.x;
      transactions[transactions.length] = update;
    }

    // Load markers.
    function loadMarkers()
    {
      var request = GXmlHttp.create();
      request.open('GET', 'loco.php?load=true', true);
      request.onreadystatechange = function() {
        if (request.readyState == 4) {
          var oldmode = mode;
          mode = 3;
       	  var markers = new String(request.responseText).split(";");
       	  for (var i = 0; i < markers.length; i++) {
       	    markers[i] = trim(markers[i]);
       	    if (markers[i].length == 0) continue;
            var fields = markers[i].split(":");
            var point =
                    new GPoint(parseFloat(fields[2]), parseFloat(fields[1]));
            var user = unescape(fields[0]);
            var address = unescape(fields[3]);
            var content = unescape(fields[4]);
            var start_date = unescape(fields[5]);
            var end_date = unescape(fields[6]);
            createMarker(user, point, address,
              content, start_date, end_date);
          }
          mode = oldmode;
          if (mode == 2) viewFiltered();          
       	}
      }
      markerList = new Array();
      transactions = new Array();
      map.clearOverlays();
      request.send(null);
    }

    // Save markers.
    function saveMarkers()
    {
      var request;
      var content;
      for (var i = 0; i < transactions.length; i++)
      {
        request = GXmlHttp.create();
        request.open('POST', 'loco.php', true);
        request.setRequestHeader(
		'Content-Type',
		'application/x-www-form-urlencoded; charset=UTF-8');
        content = "save=true";
        content = content + "&type=" + transactions[i].type;
        content = content + "&user=" +
          encodeURIComponent(escape(transactions[i].user));
        content = content + "&lat=" + transactions[i].lat;
        content = content + "&lng=" + transactions[i].lng;
        if (transactions[i].type == "add")
        {
          content = content + "&address=" +
            encodeURIComponent(escape(transactions[i].address));
          content = content + "&content=" +
            encodeURIComponent(escape(transactions[i].content));
          content = content + "&start_date=" +
            encodeURIComponent(escape(transactions[i].start_date));
          content = content + "&end_date=" +
            encodeURIComponent(escape(transactions[i].end_date));
        }
        request.onreadystatechange = function() {
          if (request.readyState == 4) {
       	  }
        }
        request.send(content);
      }
      transactions = new Array();
    }

    // Filter markers.
    var filter_user = "";
    var filter_address = "";
    var filter_content = "";
    var filter_start_date = "";
    var filter_end_date = "";
    function filterMarkers()
    {
      map.closeInfoWindow();
      filter_user = trim(document.forms['controls'].elements['user'].value);
      filter_address = trim(document.forms['controls'].elements['address'].value);
      filter_content = trim(GetContent());
      filter_start_date = trim(document.forms['controls'].elements['start_date'].value);
      filter_end_date = trim(document.forms['controls'].elements['end_date'].value);
      if (mode == 2) viewFiltered();
    }

    // View filtered markers.
    function viewFiltered()
    {
      var element;
      var marker;
      var mapped;
      var content;
      var element_content;
      document.forms['controls'].elements['user'].value = filter_user;
      document.forms['controls'].elements['address'].value = filter_address;
      SetContent(filter_content);
      document.forms['controls'].elements['start_date'].value = filter_start_date;
      document.forms['controls'].elements['end_date'].value = filter_end_date;
      content = new String(filter_content).split("<br/>");
      for (var i = 0; i < mapList.length; i++)
      {
        element = mapList[i];
        if (element != "")
        {
          mapped = "true";
          if (filter_user != "" && filter_user != element.user)
          {
            mapped = "false";
          }
          if (mapped == "true" && filter_address != "" &&
            filter_address != element.address)
          {
            mapped = "false";
          }
          if (mapped == "true")
          {
            element_content = new String(element.content);
            for (var j = 0; j < content.length; j++)
            {
              if (content[j] == "") continue;
              if (element_content.indexOf(content[j]) == -1)
              {
                mapped = "false";
                break;
              }
            }
          }
          if (mapped == "true" && filter_start_date != "" &&
            filter_start_date != element.start_date)
          {
            mapped = "false";
          }
          if (mapped == "true" && filter_end_date != "" &&
            filter_end_date != element.end_date)
          {
            mapped = "false";
          }
          if (mapped == "true")
          {
            if (element.mapped == "false")
            {
              element.mapped = "true";
              marker = mapList[i].marker;
              map.addOverlay(marker);
            }
          } else {
            if (element.mapped == "true")
            {
              element.mapped = "false";
              marker = mapList[i].marker;
              map.removeOverlay(marker);
            }
          }
        }
      }
    }
    

    // Show all on map.
    function viewAll()
    {
      var element;
      var marker;
      for (var i = 0; i < mapList.length; i++)
      {
        element = mapList[i];
        if (element != "")
        {
          if (element.mapped == "false")
          {
            element.mapped = "true";
            marker = element.marker;
            map.addOverlay(marker);
          }
        }
      }
    }

    // Trim function.
    function trim(str) {
      return str.replace(/^\s*|\s*$/g,"");
    }
    //]]>
