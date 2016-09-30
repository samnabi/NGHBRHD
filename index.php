<?php
/**

NGHBRHD
A citybuilding puzzle

OBJECT
Build the city of your dreams. NGHBRHD asks you to set goals at the beginning of the game. These include targets for:

x mode share
x population
x jobs
x green space per person

MECHANICS
Choose one of the two randomly-selected typologies, then choose where you want to place it. Choose wisely, since you can't demolish what you've built.

DATA FORMATS
The game board is stored as a plain-text string

The distance between points on the grid is 50 metres. The universe is 450 metres by 450 metres (roughly a 5-minute walk across)

ICONS
Icons by Twitter https://github.com/twitter/twemoji/blob/gh-pages/LICENSE-GRAPHICS 
CC BY 4.0 https://creativecommons.org/licenses/by/4.0/

*/

/**
 *
 * HELPER FUNCTIONS
 *
 */

// Convert letters to numbers
function toNum($letter) {
  return strpos(' abcdefghi', $letter);
}

// Get random typologies
function get_typologies($num = 1) {
  $typologies = ['a','c','h','i','o','p'];
  $keys = array_rand($typologies,$num);
  $return = [];
  foreach ($keys as $k) $return[] = $typologies[$k];
  return $return;
}

// Set descriptions
$descriptions = [
  'a' => 'Apartment',
  'c' => 'Shop',
  'h' => 'House',
  'i' => 'Factory',
  'o' => 'Office',
  'p' => 'Park',
  '.' => ''
];


/**
 *
 * CONTROLLER
 *
 */

// Get the board
session_start();
if (!isset($_SESSION['board'])) {
  // Blank board with 81 spaces
  $_SESSION['board'] = '.................................................................................';
}

// Process command
if (isset($_GET['q']) and isset($_GET['t'])) {
  preg_match('/(\w+)(\d+)/', $_GET['q'], $matches);
  $row = toNum($matches[1]);
  $col = $matches[2];
  $typ = $_GET['t'];

  // Validate the command
  if (1 <= $col and $col <= 9 and 1 <= $row and $row <= 9 and in_array($typ, ['h','a','o','i','c','p'])) {
    $start = (($row-1)*9)+($col-1);
    // Make sure there's nothing there
    if (substr($_SESSION['board'], $start, 1) === '.') {
      $_SESSION['board'] = substr_replace($_SESSION['board'], $typ, $start, 1);
    }
  } else {
    // Invalid code
  }
}

// Calculate jobs
// Assuming one block can fit a 10,000 sq ft industrial use; a 15,000 sq ft commercial use, or a 40,000 sq ft mixed office use
$jobs = (substr_count($_SESSION['board'], 'i') * 16) + (substr_count($_SESSION['board'], 'c') * 53) + (substr_count($_SESSION['board'], 'o') * 184);

// Calculate people
// Assuming one block can fit 4 houses or one apartment building
$people = (substr_count($_SESSION['board'], 'h') * 12) + (substr_count($_SESSION['board'], 'a') * 143);

// Calculate green space per person
$green_space = max([$people,$jobs]) == 0 ? 0 : round((substr_count($_SESSION['board'], 'p') * 1300) / max([$people,$jobs]));

$green_cities = [
  'Curitiba, Brazil' => 52,
  'New York City, USA' => 23,
  'Paris, France' => 11,
  'Tokyo, Japan' => 3,
  'Your Neighbourhood' => $green_space,
];
arsort($green_cities);

// Initialise mode share
$walk = 0;
$bike = 0;
$drive = 0;

// Calculate neighbour effect
$rows = str_split($_SESSION['board'],9);
foreach ($rows as $row => $r) {
  $lots = str_split($r);
  foreach ($lots as $col => $lot) {
    $thislot = isset($rows[$row][$col]) ? $rows[$row][$col] : false;
    $neighbours = [
      'n' => isset($rows[$row-1][$col]) ? $rows[$row-1][$col] : false,
      's' => isset($rows[$row+1][$col]) ? $rows[$row+1][$col] : false,
      'nw' => isset($rows[$row-1][$col-1]) ? $rows[$row-1][$col-1] : false,
      'w' => isset($rows[$row][$col-1]) ? $rows[$row][$col-1] : false,
      'sw' => isset($rows[$row-1][$col-1]) ? $rows[$row-1][$col-1] : false,
      'ne' => isset($rows[$row-1][$col+1]) ? $rows[$row-1][$col+1] : false,
      'e' => isset($rows[$row][$col+1]) ? $rows[$row][$col+1] : false,
      'se' => isset($rows[$row+1][$col+1]) ? $rows[$row+1][$col+1] : false,
    ];

    // Neighbour mode share influence matrix
    // For apartments and houses, this chart shows the relative influence on mode share of each of their neighbours
    //        a  c  h  i  o  p
    //  walk +2 +1 -1 -2 +1 +2 
    //  bike +1 +2  0 -1  0 +1
    // drive -1  0 +1 +2  0 -1

    if (in_array($thislot, ['a','h'])) {
      $grouped = @array_count_values($neighbours);
      // Most possible points is 16. Least possible points is -8.
      // Add up all the neighbour effects, then add 8 to bring us to a 0 baseline. This brings the new maximum to 24, so divide by 24. Multiply by 100 to get a percentage.
      $walk += round((((@$grouped['a']*2) + @$grouped['c'] - @$grouped['h'] - (@$grouped['i']*2) + @$grouped['o'] + (@$grouped['p']*2) - @$grouped['.']) + 8) * 100 / 24);
      $bike += round(((@$grouped['a'] + (@$grouped['c']*2) - @$grouped['i'] + @$grouped['p']) + 8) * 100 / 24);
      $drive += round((((@$grouped['a']*-1) + @$grouped['h'] + (@$grouped['i']*2) - @$grouped['p'] + @$grouped['.']) + 8) * 100 / 24);
    }

  }
}
// Get average walk/bike/drive scores
$denominator = substr_count($_SESSION['board'], 'a') + substr_count($_SESSION['board'], 'h');
$walk = $denominator == 0 ? 0 : round($walk / $denominator);
$bike = $denominator == 0 ? 0 : round($bike / $denominator);
$drive = $denominator == 0 ? 0 : round($drive / $denominator);

// Get mode share as percentage
$modeshare_total = $walk + $bike + $drive;
$walk = round($walk / $modeshare_total * 100);
$bike = round($bike / $modeshare_total * 100);
$drive = round($drive / $modeshare_total * 100);

// Get widths
$maxmode = max([$walk,$bike,$drive]);
$walkwidth = round($walk / $maxmode * 100);
$bikewidth = round($bike / $maxmode * 100);
$drivewidth = round($drive / $maxmode * 100);

?>
<!doctype html>
<html lang="en">
<head>
  <!-- Set sensible character encoding -->
  <meta charset="utf-8">

  <!-- Tell IE to use the highest possible version, regardless of Compatibility Mode -->
  <meta http-equiv="x-ua-compatible" content="ie=edge">

  <!-- Use native font size and zoom level -->
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Page title and description -->
  <title>NGHBRHD</title>
  <meta name="description" content="A 10k citybuilding puzzle">

  <!-- Load styles -->
  <style>
    body,fieldset{text-align:center}.board,form{margin-top:2rem}.board label,.instructions,.stats,form{display:inline-block;vertical-align:top}body{color:#000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif}pre{line-height:1.5rem;letter-spacing:1.5rem}img{width:2rem}fieldset{border:none}.instructions,.stats,form{width:20rem;max-width:100%;text-align:left}form{width:25rem}.board{font-size:0}.board label{font-size:1rem;width:2rem;height:2rem;position:relative;overflow:hidden;padding:2px}.board input+div{content:'';display:block;position:absolute;top:2px;right:2px;bottom:2px;left:2px;background:#fff;border:2px dotted grey}.board input:checked+div{background:#ffe066}.stats h2{font-size:1.5rem;margin:2rem 0 .5rem}.stats span{display:block;font-size:1rem;padding:.5rem;margin:.2rem 0;box-sizing:border-box}.people{width:<?= round($people * 100 / max([$people,$jobs])) ?>%;background:#9775fa}.jobs{width:<?= round($jobs * 100 / max([$people,$jobs])) ?>%;background:#da77f2}.walk{width:<?= $walkwidth ?>%;background:#ff8787}.bike{width:<?= $bikewidth ?>%;background:#3bc9db}.drive{width:<?= $drivewidth ?>%;background:#f06595}.greenspace{background:#c0eb75;white-space:nowrap}.greenspace.active{font-weight:700;background:#82c91e}#typologies label{padding:.5rem;border-radius:.25rem}#typologies label:hover{background:#ffe066;cursor:pointer}#typologies label span,#typologies.hide button,#typologies.hide input{display:none}#typologies.hide label{display:inline-block}#typologies.hide label span{display:block;background:#DDD;border:1px solid #CCC;border-radius:.2rem;box-shadow:0 0 0 2px #fff;margin-top:.25rem}
  </style>

</head>
<body>
<div class="instructions">
  <p><strong>This is your NGHBRHD.</strong></p>
  <p>Click on a block, then choose what to build.</p>
  <p>Park or factory? Office or apartment building? The choice is yours.</p>
  <p>Keep an eye on the stats to see how your NGHBRHD is progressing.</p>
  <p><em>Created by <a href="http://samnabi.com" target="_blank">Sam Nabi</a></em></p>
  <h2>Acknowledgments</h2>
  <p>Icons adapted from the <a href="https://github.com/twitter/twemoji" target="_blank">Twemoji Library</a>, used under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC-BY-4.0</a> license.</p>
</div>

<form action="">
  <fieldset class="board">
    <?php
      $letters = 'abcdefghi';
      $numbers = '123456789';
    ?>
    <?php foreach (str_split($_SESSION['board'],9) as $i => $row) { ?>
      <?php foreach (str_split($row) as $ii => $cell) { ?>
        <label>
          <?php if ($cell === '.') { ?>
            <input type="radio" name="q" value="<?= $letters[$i].$numbers[$ii] ?>">
            <div></div>
          <?php } else { ?>
            <img src="<?= $cell ?>.png" alt="<?= $descriptions[$cell] ?>" title="<?= $descriptions[$cell] ?>">
          <?php } ?>
        </label>
      <?php } ?>
      <br>
    <?php } ?>
  </fieldset>
  <fieldset id="typologies" class="">
    <?php $typologies = get_typologies(2); ?>
    <label>
      <input id="z" tabindex=1 type="radio" name="t" value="<?= $typologies[0] ?>">
      <img src="<?= $typologies[0] ?>.png" alt="<?= $descriptions[$typologies[0]] ?>" title="<?= $descriptions[$typologies[0]] ?>">
      <span>Z</span>
    </label>
    <label>
      <input id="x" tabindex=2 type="radio" name="t" value="<?= $typologies[1] ?>">
      <img src="<?= $typologies[1] ?>.png" alt="<?= $descriptions[$typologies[1]] ?>" title="<?= $descriptions[$typologies[1]] ?>">
      <span>X</span>
    </label>
    <button type="submit">Build</button>
  </fieldset>
</form>

<div class="stats">
  <h2>Jobs-housing balance</h2>
  <span class="people"><?= $people ?> residents</span>
  <span class="jobs"><?= $jobs ?> jobs</span>

  <h2>Mode share</h2>
  <span class="walk"><?= $walk ?>% walk</span>
  <span class="bike"><?= $bike ?>% bike</span>
  <span class="drive"><?= $drive ?>% drive</span>

  <h2>Green space per person</h2>
  <?php foreach ($green_cities as $city => $space) { ?>
    <span class="greenspace <?= $city == 'Your NGHBRHD' ? 'active' : '' ?>" style="width: <?= round($space / 52 * 100) ?>%"><?= $space ?> m<sup>2</sup> <?= $city ?></span>
  <?php } ?>
</div>

<script>
  document.getElementsByTagName("input")[0].focus(),document.getElementsByTagName("input")[0].checked=!0,document.onkeydown=function(e){var t={Z:90,X:88};switch(e.keyCode){case t.Z:var n=document.getElementById("z");n.checked=!0,n.parentNode.form.submit();break;case t.X:var n=document.getElementById("x");n.checked=!0,n.parentNode.form.submit();break;default:return}},document.getElementById("z").onclick=function(){document.getElementById("z").form.submit()},document.getElementById("x").onclick=function(){document.getElementById("x").form.submit()},document.getElementById("typologies").className="hide";
</script>

</body>
</html>