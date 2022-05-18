<?php
// Import PHPMailer classes into the global namespace
// These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader
require 'vendor/autoload.php';

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
    die("ActionNotExist");
}

function submit(){
    $mail = new PHPMailer();
    $input = $_POST;
    $message_erreur = "Une erreur est survenue lors de l'enregistrement de votre devis. Merci de réessayer ou de nous recontacter par téléphone";

    try {
        //Server settings
        $mail->CharSet = "UTF-8";
        $mail->SetLanguage('fr');
        // Set mailer to use SMTP
        $mail->IsSMTP();
        //$mail->isMail();
        $mail->SMTPDebug = 0;
        $mail->SMTPAuth = true;
        $mail->SMTPSecure = 'ssl';
        $mail->Host = 'ssl0.ovh.net';
        $mail->Port = 465;
        $mail->Username = "contact@evgdream.com";                 // SMTP username
        $mail->Password = "BenjiSachaJeremNathanEVG00";                           // SMTP password-

        //Recipients
        $mail->setFrom('contact@evgdream.com', 'EVGDREAM');
        $mail->addAddress('jerem98@gmail.com');     // Add a recipient
        $mail->addAddress('Sayoso@hotmail.fr');
        $mail->addAddress('benjamin_bitton@hotmail.com');
        $mail->addAddress('contact@evgdream.com');
        //$mail->addCC(''); //copie
        //$mail->addBCC('bcc@example.com'); //copie caché

        //Content
        $mail->isHTML(true);                                  // Set email format to HTML
        $mail->Subject = 'Nouvelle Demande de devis de '.$input["email"];
        $mail->Body    = getMailContent($input);
        if($mail->send()){
            die("OK");
        }

    } catch (Exception $e) {
        $message = "Demande de devis: Le message n'à pas pu être envoyé. Erreur: ".$mail->ErrorInfo;
        error_log(json_encode($input)." ".$mail->ErrorInfo );
        error_log($input["email"]." :".$e->getMessage());
    }

    die($message_erreur);
}

function getMailContent($input){
    $body = "";
    if(is_array($input) && count($input)){
        $body = "Bonjour,<br><br>Une nouvelle demande de devis a eu lieu à partir du site internet: <br><br>";
        $body .= "<u>Coordonnées du prospect:</u><br><br>";
        $body .= "Email: <b>" .$input["email"]."</b><br>";
        $body .= "Tel: <b>" .$input["telephone"]."</b><br>";
        $body .= "Date Départ: <b>" .$input["date_depart"]."</b><br>";
        $body .= "Date Retour: <b>" .$input["date_retour"]."</b><br>";
        $body .= "Ville de départ: <b>".$input["ville_depart"]."</b><br>";
        $body .= "Destination: <b>" .$input["destination"]."</b><br>";
        $body .= "Nombre de participants: <b>" .$input["nb_participant"]."</b><br>";
        $body .= "Liste activités : <b>" .print_r($input["activites"],TRUE)."</b><br>";
        $body .= "Budget par personne: <b>".$input["budget"]."</b><br>";
        $body .= "Commentaire: <b>".$input["message"]."</b><br><br>";
    }

    return $body;
}

































?>