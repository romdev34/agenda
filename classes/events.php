<?php

ini_set('display_errors', 1);
require('Autoloader.php');

function sql() {
    $request = file_get_contents('../sql/get_message.sql');
    $tab = array(
        '@id_utilisateur' => '1',
        '@date_begin' => $_POST['dateBegin'],
        '@date_end' => $_POST['dateEnd']
    );
    foreach ($tab as $key => $value) {
        $request = str_replace($key, $value, $request);
    }
    return $request;
}

function checkHour ($hour1, $hour2){
    return substr($hour1, 0, 2) === substr($hour2, 0, 2);
}

function floorHour($hour) {
    return substr($hour, 0, 2).':00:00';
}

function addItem(&$array, $data) {  // & : passage par référence
    $dateArray = null;
    $hourArray = null;
    // On regarde si la date existe
    // Si oui, on stocke le tableau dans & $dateArray
    for ($k = 0; $k < count($array); ++$k) {
        if ($array[$k]['date'] == $data['date']) {
            $dateArray = &$array[$k];
            break;
        }
    }
    // Sinon, on cree puis on stocke le tableau dans & $dateArray
    if ($dateArray == null) {
        array_push($array, array());
        $dateArray = &$array[count($array) - 1];
        $dateArray['date'] = $data['date'];
        $dateArray['times'] = array();
    }
    
    // On regarde si l'heure existe
    // Si oui, on stocke le tableau dans & $hourArray
    for ($k = 0; $k < count($dateArray['times']); ++$k) {
        if (checkHour($dateArray['times'][$k]['time'], $data['time'])) {
            $hourArray = &$dateArray['times'][$k];
            break;
        }
    }
    // Sinon, on cree puis on stocke le tableau dans & $hourArray
    if ($hourArray == null) {
        array_push($dateArray['times'], array());
        $hourArray = &$dateArray['times'][count($dateArray['times']) - 1];
        $hourArray['time'] = floorHour($data['time']);
        $hourArray['messages'] = array();
    }
    array_push($hourArray['messages'], array(
        "message" => $data['contenu_message'],
        "time" => $data['time']
    ));
}

function returnEvent($datas) {
    $value = array();
    while ($data = $datas ->fetch(PDO::FETCH_ASSOC))
    {
        addItem($value, $data);
    }
    return $value;
}

Autoloader::register();

$db = new Config();
$data = $db->getDb();
$datas = $data->query(sql());

echo json_encode(returnEvent($datas));

?>