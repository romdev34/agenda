<?php


ini_set('display_errors', 1);

class Config{
  
  /**
  @var array contient les données de connexion à la base de donnée
  */
  
  private $settings = [];
  
  private static $_instance;

  private static $_db;
   
  public static function getInstance(){
    if (is_null(self::$_instance)){
      self::$_instance = new Config();
    }
    return self::$_instance;
  }
  
  public function __construct(){
    $this->settings =require ('../bdd/config_bdd.php'); 
    try
{
	self::$_db = new  PDO ('mysql:host='.$this->settings['db_host'].';dbname='.$this->settings['db_name'],$this->settings['username'],$this->settings['pass'],array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));
}
catch(Exception $e)
{
        die('Erreur : '.$e->getMessage());
}

 /* ici on peut éventuellement faire pointer l'objet sur une fonction ex: $this->setEmploye(); */
  }


 public static function getDb(){
   return self::$_db;
 }

}



?>
