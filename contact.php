<?php
    
$lang = strval($_GET['lang']);

$conn = mysqli_connect('michella.mysql.db.internal', 'michella_user', 'SgjFhdaZ', 'michella_contact');
if(!$conn)
{
    die("Could not connect: " . mysqli_error($conn));
}
?>

  <section id="contact" class="anArticle">
    <form id="contactForm" action="scripts/sendMail.php" method="post">
      <h3>Contact</h3>
      <h4>Vous voulez en savoir plus sur ce qu'on fait? Vous avez besoin de conseil, envie de demander un devis ou toute autre nécessité de nous contacter? Utilisez ce formulaire sans hésiter:</h4>



      <?php
    
      buildForm($conn, "en");  

      mysqli_close($conn);
      
?>

    </form>
  </section>

  <?php

function getPlaceHolder($conn, $lang, $id)
{
  $req = "SELECT " . $lang . " FROM placeholders WHERE id = '" . $id . "'";
  $res = mysqli_query($conn, $req);
  if($row = mysqli_fetch_row($res))
  {
    $returnValue = $row[0];
  }
  
  mysqli_free_result($res);
  return $returnValue;
}

function buildForm($conn, $lang)
{
  $req = "SELECT id, field, required, type, name FROM fields_definition";
  $res = mysqli_query($conn, $req);
  $i = 0;
  while($row = mysqli_fetch_array($res))
  {
    echo "<fieldset>";
    echo "<";
    echo $row['field'] . " ";
    if(isset($row['type']))
    {
      echo "type='" . $row['type'] . "' ";
    }
    if(isset($row['name']))
    {
      echo "name='" . $row['name'] . "' "; 
    }
    echo "tabindex='" . ++$i . "' ";
    if($row['required'])
    {
      echo "required ";
    }
    
    if($row['field'] != "button")
    {
      echo "placeholder='" . getPlaceHolder($conn, $lang, $row['id']) . "'/>";
    }
    else
    {
       echo ">";
       echo getPlaceHolder($conn, $lang, $row['id']);
       echo "</" . $row['field'] . ">";
    }
    
    echo "</fieldset>";
  }
}
?>
