<?php

// Database access variables.
$GLOBALS['host'] = 'localhost';
$GLOBALS['db'] = 'mysql';
$GLOBALS['login'] = 'loco';
$GLOBALS['password'] = '';

// Users (name/password) file.
$GLOBALS['users_file'] = 'users.txt';

// Markers file.
$GLOBALS['markers_file'] = 'markers.txt';

// Load users.
function load_users(&$users)
{
    $file = $GLOBALS['users_file'];
    $fh = @fopen($file, "r");
    if ($fh)
    {
       while (!feof($fh))
       {
           list($user, $password) = explode(":", trim(fgets($fh, 4096)));
      	   $user_entry = array("user" => urldecode($user), "password" => urldecode($password));
      	   $users[] = $user_entry;
       }
       fclose($fh);
    } else {
      exit("Cannot read users from ".$file." file");
    }
}

// Save user.
function save_user($user, $password)
{
    $file = $GLOBALS['users_file'];
    $fh = @fopen($file, "a");
    if (!$fh || !fwrite($fh, urlencode($user).":".urlencode(crypt($password, "loco"))."\n"))
    {
      exit("Cannot write user to ".$file." file");
    }
    fclose($fh);
}

// Valid login?
function valid_login($user, $password)
{
    $users = array();
    load_users($users);
    for ($i = 0; $i < count($users); $i++)
    {
    	if ($user == $users[$i]["user"] &&
            crypt($password, "loco") == $users[$i]["password"])
    	{
    	   return true;
    	}
    }
    return false;
}

// Valid user?
function valid_user($user)
{
    $users = array();
    load_users($users);
    for ($i = 0; $i < count($users); $i++)
    {
    	if ($user == $users[$i]["user"])
    	{
    	   return true;
    	}
    }
    return false;
}

// Send markers.
function sendMarkers()
{
    $file = $GLOBALS['markers_file'];
    $fh = @fopen($file, "r");
    if (!$fh)
    {
      exit("Cannot read markers from ".$file." file");
    }
    $len = filesize($file);
    if ($len == 0)
    {
      $markers = "";
    } else {
      $markers = fread($fh,filesize($file));
    }
    fclose($fh);
    print($markers);
}

// Save marker transaction.
function saveMarker($type, $user, $lat, $lng, $address,
  $content, $start_date, $end_date)
{
    $file = $GLOBALS['markers_file'];
    $fh = @fopen($file, "r");
    if (!$fh)
    {
      exit("Cannot read markers file ".$file);
    }
    $text = fread($fh,filesize($file));
    fclose($fh);
    $markers = explode(";", $text);
    $fh = @fopen($file, "w");
    if (!$fh)
    {
      exit("Cannot write markers file ".$file);
    }
    $found = 0;
    for ($i = 0; $i < count($markers); $i++)
    {
      $marker = trim($markers[$i]);
      if ($marker == "") continue;
      list($user2, $lat2, $lng2, $address2, $content2, $start_date2, $end_date2) = 
        explode(":", $marker);
      if ($user2 == $user && $lat2 == $lat && $lng2 == $lng)
      {
        if ($type == "remove") continue; else $found = 1;
      }
      fwrite($fh, $user2.":".$lat2.":".$lng2.":".$address2.":".$content2.":".$start_date2.":".$end_date2.";\n");
    }
    if ($type == "add" && $found == 0)
    {
      fwrite($fh, $user.":".$lat.":".$lng.":".$address.":".$content.":".$start_date.":".$end_date.";\n");
    }
    fclose($fh);
    print("OK");
}

// Fill HTML template.
function filltemplate($file, $filler)
{
    $fh = fopen($file,"r");
    $html = fread($fh,filesize($file));
    foreach(array_keys($filler) as $fld) {
        $html = preg_replace("/%$fld%/",$filler[$fld],$html);
    }
    return $html;
}

// Logging.
function mylog($msg)
{
    $fh = @fopen("loco.log", "a");
    if (!$fh || !fwrite($fh, $msg."\n"))
    {
      exit("Cannot write message=".$msg." to loco.log file");
    }
    fclose($fh);
}
?>

