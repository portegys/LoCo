<?php

/*

Location-based Cooperative (LoCo) PHP program.

*/

session_start();
include_once("loco.inc");
$message = "";

if ( !isset( $_SESSION["session"] ) )
{
  // New session - initialize LoCo
  $step = 1;
  
  // Store session state.
  $_SESSION["session"] = "true";
  $_SESSION["step"] = $step;


} else {
         
  // Retrieve session state.
  $step = $_SESSION["step"];

  // Process submitted page.
  switch ($step)
  {
    // Validate login.
    case 1:

      if ($_REQUEST["login"])
      {
        $message = "Invalid login";
        if ($_REQUEST["user"] && $_REQUEST["password"])
        {
          $user = trim($_REQUEST["user"]);
          $password = trim($_REQUEST["password"]);
          if ($user != "" && $password != "")
          {
            if (valid_login($user, $password))
            {
              $_SESSION["user"] = $user;              
              $step = 3;
              $message = "";
            }
          }
        }
        break;
      }
               
      // Registering?
      if ($_REQUEST["register"])
      {
        $step = 2;
        break;
      }

      break;

    // Validate registration.
    case 2:

      if ($_REQUEST["register"])
      {
        if ($_REQUEST["user"])
        {
          $user = trim($_REQUEST["user"]);
          if ($user != "")
          {
            if (!valid_user($user))
            {
              if ($_REQUEST["password"] && $_REQUEST["confirm"])
              {
                $password = trim($_REQUEST["password"]);
                $confirm = trim($_REQUEST["confirm"]);
                if ($password != "" && $confirm != "")
                {
                  if ($password == $confirm)
                  {
                    // Valid registration - go login.
                    save_user($user, $password);
                    $step = 1;
                  } else {
                    $message = "Password mismatch";
                  }
                } else {
                  $message = "You must enter both passwords";
                }
              } else {
                $message = "You must enter both passwords";
              }
            } else {
              $message = "Duplicate user name";
            }
          } else {
            $message = "Invalid user name";
          }
        } else {
          $message = "You must enter a user name";
        }
        break;
      }

      // Quit?
      if ($_REQUEST["quit"])
      {
        session_destroy();
        $step = 5;
        break;
      }

      break;

    // Main page.
    case 3:

      // Send markers.
      if ($_REQUEST["load"])
      {
        sendMarkers();
        return;
      }

      // Save marker transaction.
      if ($_REQUEST["save"])
      {
        saveMarker($_REQUEST["type"], $_REQUEST["user"],
          $_REQUEST["lat"], $_REQUEST["lng"], $_REQUEST["address"],
          $_REQUEST["content"], $_REQUEST["start_date"],
          $_REQUEST["end_date"]);
        return;
      }

      // Geocode address?
      if ($_REQUEST["geocode"])
      {
        $address = urlencode($_REQUEST["address"]);
        $html = file_get_contents("http://rpc.geocoder.us/service/csv?address=".$address);
        print($html);
        return;
      }

      // Help?
      if ($_REQUEST["help"])
      {
        $step = 4;
        break;
      }

      // Logging out?
      if ($_REQUEST["logout"])
      {
        session_destroy();
        $step = 5;
        break;
      }

      break;

    // Help page.
    case 4:

      // Back?
      if ($_REQUEST["back"])
      {
        $step = 3;
      }

      break;
  }
}

// Send the next page.
switch ($step)
{
  case 1:
    $nextpage = "login.htp";
    break;
  case 2:
    $nextpage = "register.htp";
    break;
  case 3:
    $nextpage = "main.htp";
    break;
  case 4:
    $nextpage = "help.htp";
    break;
  case 5:
    $nextpage = "goodbye.htp";
    break;
}

// Save session state.
$_SESSION["step"] = $step;

// Create html.
$user = $_SESSION["user"];
$fill = array(message => $message, user => $user);
$html = filltemplate($nextpage, $fill);
print($html);
?>
