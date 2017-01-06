<?php
ini_set('display_errors', 1);
require('Autoloader.php');

Autoloader::register();

$db = new Config();
$data = $db->getDb();

 $datas = $data->prepare('DELETE FROM message WHERE date=:date AND time=:time AND id_utilisateur=:id_utilisateur');

$datas ->execute(array(
  'date' => $_POST['date'],
    'time' => $_POST['heure'],
    'id_utilisateur' => $_POST['id_utilisateur']
  ));
echo $_POST['date']; 
?>