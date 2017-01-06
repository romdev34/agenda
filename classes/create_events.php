<?php
ini_set('display_errors', 1);
require('Autoloader.php');

Autoloader::register();

$db = new Config();
$data = $db->getDb();

 $datas = $data->prepare('INSERT INTO message (contenu_message, date, time, id_utilisateur) VALUES (:message_content, :date, :time, :id_utilisateur)');

$datas ->execute(array(
  'message_content' => $_POST['message_content'],
    'date' => $_POST['date'],
    'time' => $_POST['time'],
    'id_utilisateur' => $_POST['id_utilisateur']
  ));

?>