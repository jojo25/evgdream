<?php

require_once ("models/activitesM.php");

$method = "";

if(isset($_GET['action'])) {
    $method = $_GET["action"];
}

if ($method!= ""){
    if (function_exists ( $method)){
        call_user_func($method);
    }
    else{
        die("MethodNotExist");
    }
}

else {
    call_user_func("getById");
}


function getById(){

    $id_dest = $_GET["id"];
    $activitesM = new activitesM();
    $content = $activitesM->getContentByIdDest($id_dest);
    die (json_encode($content));
}