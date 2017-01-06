<?php
ini_set('display_errors', 1);
require('Autoloader.php');

Autoloader::register();

$db = new Config();
$data = $db->getDb();

$datas = $data->prepare('UPDATE message SET contenu_message=:message WHERE date=:date AND id_utilisateur=:id_utilisateur AND time=:time');

$datas ->execute(array(
  'date' => $_POST['date'],
    'time' => $_POST['heure'],
    'id_utilisateur' => $_POST['id_utilisateur'],
  'message' => $_POST['message']
  ));
echo $_POST['date']; 

?>