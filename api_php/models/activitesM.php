<?php

// Load Composer's autoloader
require 'inc/rb.php';



class activitesM extends \RedBeanPHP\SimpleModel
{
    public function __construct()
    {
        try{
            if(!R::testConnection()){
                R::setup( 'mysql:host=127.0.0.1;port=3306;dbname=evgdreacscroot',
                    'root', '' );

                /*R::setup( 'mysql:host=evgdreacscroot.mysql.db;dbname=evgdreacscroot',
                'evgdreacscroot', 'Benjipsgevgdream00' );*/

                R::fancyDebug( false );
            }
        }
        catch (Exception $e){
            echo $e->getMessage();
        }

        R::freeze( true );

    }

    public function getContentByIdDest($id_dest){

        try{
            if($id_dest > 0){
                $destination = R::findOne( 'destination', ' id = ? ', array($id_dest) )->export();


                $activite = R::find( 'activite', ' id_destination = ? ', array($id_dest));
                $activites = R::exportAll( $activite );

                $list = array_merge ($destination, array("listactivites" => $activites));
                return $list;
            }
        }

        catch (Exception $e){
            error_log($e->getMessage());
        }

        return "";
    }

    public function __destruct()
    {
        R::close();
    }
}