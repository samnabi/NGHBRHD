  // Check the first available coordinate
  var first_input = document.querySelector('.board input');
  first_input.focus();
  first_input.checked = true;

  const types = ['a','c','h','i','o','p'];

  function refreshChoices() {
    // Refresh the available tiles
    var new_type1 = types[Math.floor(Math.random()*types.length)];
    document.querySelector('#z').parentNode.className = 'type--' + new_type1;
    document.querySelector('#z').value = new_type1;

    var new_type2 = types[Math.floor(Math.random()*types.length)];
    while (new_type2 == new_type1) { new_type2 = types[Math.floor(Math.random()*types.length)]; } // Ensure two different types
    document.querySelector('#x').parentNode.className = 'type--' + new_type2;
    document.querySelector('#x').value = new_type2;
  }

  function setTile(type) {
    
    // Set the tile on the board
    var target = document.querySelector('.board input[name="q"]:checked');
    target.parentNode.classList.add('type--'+type);
    target.disabled = true;

    // Select an empty tile
    var nextTile = document.querySelector('.board input[name="q"]:not([disabled])');
    if (nextTile) { nextTile.click(); }

    refreshChoices();
    setPeople();
    setJobs();
    setGreenSpace();
    calculateModeShare();
  }

  function countPeople() {
    var houses = document.querySelectorAll('.board .type--h');
    var apartments = document.querySelectorAll('.board .type--a');

    // Assuming one block fits 4 houses or one 8-storey apartment building
    var people = (houses.length * 12) + (apartments.length * 128);
    return people;
  }

  function countJobs() {
    var industrial = document.querySelectorAll('.board .type--i');
    var commercial = document.querySelectorAll('.board .type--c');
    var office = document.querySelectorAll('.board .type--o');

    // Assuming one block can fit a 10,000 sq ft industrial use; a 15,000 sq ft commercial use, or a 40,000 sq ft mixed office use
    var jobs = (industrial.length * 16) + (commercial.length * 53) + (office.length * 184);
    return jobs;
  }

  function countGreenSpacePerCapita() {
    var peopleOrJobs = Math.max(countPeople(), countJobs());
    var parks = document.querySelectorAll('.board .type--p');

    // Assuming each park block is 2,000 m2 of green space
    if (peopleOrJobs == 0) {
      return 0;
    } else {
      return Math.floor((parks.length * 2000) / peopleOrJobs);
    }
  }

  function setPeople() {
    var people = document.querySelector('.people');
    var peopleOrJobs = Math.max(countPeople(), countJobs());
    people.innerHTML = countPeople() + ' residents';
    people.style.width = 'calc(' + countPeople() + ' * 100% / ' + peopleOrJobs + ')';
  }

  function setJobs() {
    var jobs = document.querySelector('.jobs');
    var peopleOrJobs = Math.max(countPeople(), countJobs());
    jobs.innerHTML = countJobs() + ' jobs';
    jobs.style.width = 'calc(' + countJobs() + ' * 100% / ' + peopleOrJobs + ')';
  }

  function setGreenSpace() {
    var greenspace = countGreenSpacePerCapita();
    var legend = document.querySelector('.greenspace.active');
    legend.innerHTML = greenspace + ' m<sup>2</sup> Your Neighbourhood'; 
    if (greenspace > 52) { greenspace = 52; } // Prevent this from getting larger than Curitiba
    legend.style.width = 'calc(' + greenspace + ' / 52 * 100%)';
    legend.style.order = greenspace;
  }

  function calculateModeShare() {
    const lots = document.querySelectorAll('.board .type--a, .board .type--h');
    const neighbours = {
      a1: ['a2', 'b1', 'b2'],
      a2: ['a1', 'a3', 'b1', 'b2', 'b3'],
      a3: ['a2', 'a4', 'b2', 'b3', 'b4'],
      a4: ['a3', 'a5', 'b3', 'b4', 'b5'],
      a5: ['a4', 'a6', 'b4', 'b5', 'b6'],
      a6: ['a5', 'b5', 'b6'],
      b1: ['a1', 'a2', 'b2', 'c1', 'c2'],
      b2: ['a1', 'a2', 'a3', 'b1', 'b3', 'c1', 'c2', 'c3'],
      b3: ['a2', 'a3', 'a4', 'b2', 'b4', 'c2', 'c3', 'c4'],
      b4: ['a3', 'a4', 'a5', 'b3', 'b5', 'c3', 'c4', 'c5'],
      b5: ['a4', 'a5', 'a6', 'b4', 'b6', 'c4', 'c5', 'c6'],
      b6: ['a5', 'a6', 'b5', 'c5', 'c6'],
      c1: ['b1', 'b2', 'c2', 'd1', 'd2'],
      c2: ['b1', 'b2', 'b3', 'c1', 'c3', 'd1', 'd2', 'd3'],
      c3: ['b2', 'b3', 'b4', 'c2', 'c4', 'd2', 'd3', 'd4'],
      c4: ['b3', 'b4', 'b5', 'c3', 'c5', 'd3', 'd4', 'd5'],
      c5: ['b4', 'b5', 'b6', 'c4', 'c6', 'd4', 'd5', 'd6'],
      c6: ['b5', 'b6', 'c5', 'd5', 'd6'],
      d1: ['c1', 'c2', 'd2', 'e1', 'e2'],
      d2: ['c1', 'c2', 'c3', 'd1', 'd3', 'e1', 'e2', 'e3'],
      d3: ['c2', 'c3', 'c4', 'd2', 'd4', 'e2', 'e3', 'e4'],
      d4: ['c3', 'c4', 'c5', 'd3', 'd5', 'e3', 'e4', 'e5'],
      d5: ['c4', 'c5', 'c6', 'd4', 'd6', 'e4', 'e5', 'e6'],
      d6: ['c5', 'c6', 'd5', 'e5', 'e6'],
      e1: ['d1', 'd2', 'e2', 'f1', 'f2'],
      e2: ['d1', 'd2', 'd3', 'e1', 'e3', 'f1', 'f2', 'f3'],
      e3: ['d2', 'd3', 'd4', 'e2', 'e4', 'f2', 'f3', 'f4'],
      e4: ['d3', 'd4', 'd5', 'e3', 'e5', 'f3', 'f4', 'f5'],
      e5: ['d4', 'd5', 'd6', 'e4', 'e6', 'f4', 'f5', 'f6'],
      e6: ['d5', 'd6', 'e5', 'f5', 'f6'],
      f1: ['e1', 'e2', 'f2'],
      f2: ['e1', 'e2', 'e3', 'f1', 'f3'],
      f3: ['e2', 'e3', 'e4', 'f2', 'f4'],
      f4: ['e3', 'e4', 'e5', 'f3', 'f5'],
      f5: ['e4', 'e5', 'e6', 'f6'],
      f6: ['e5', 'e6', 'f5']
    }

    // Set up mode scores
    var walk = 0;
    var bike = 0;
    var drive = 0;
    lots.forEach(function(lot){
      var lot_id = lot.querySelector('input[name="q"]').value;
      neighbours[lot_id].forEach(function(neighbour_id) {
        neighbour_class = document.querySelector('input[value="' + neighbour_id + '"]').parentNode.classList;
        if (neighbour_class.contains('type--a')) {
          walk += 2;
          bike += 1;
          drive -= 1;
        } else if (neighbour_class.contains('type--c')) {
          walk += 1;
          bike += 2;
        } else if (neighbour_class.contains('type--h')) {
          walk += -1;
          drive += 1;
        } else if (neighbour_class.contains('type--i')) {
          walk -= 2;
          bike -= 1;
          drive += 2;
        } else if (neighbour_class.contains('type--o')) {
          walk += 1;
        } else if (neighbour_class.contains('type--p')) {
          walk += 2;
          bike += 1;
        }
      });
    });

    // Get average walk/bike/drive scores
    var modeshare_total = Math.floor(walk + bike + drive);
    var walk_percentage = 0;
    var bike_percentage = 0;
    var drive_percentage = 0;
    if (modeshare_total > 0) {
      walk_percentage = Math.floor(walk / modeshare_total * 100);
      bike_percentage = Math.floor(bike / modeshare_total * 100);
      drive_percentage = Math.floor(drive / modeshare_total * 100);
    }
    if (walk_percentage < 0) { walk_percentage = 0; } else if (walk_percentage > 100) { walk_percentage = 100; }
    if (bike_percentage < 0) { bike_percentage = 0; } else if (bike_percentage > 100) { bike_percentage = 100; }
    if (drive_percentage < 0) { drive_percentage = 0; } else if (drive_percentage > 100) { drive_percentage = 100; }
    var max_mode = Math.max(walk, bike, drive);
    var walk_width = Math.floor(walk / max_mode * 100);
    var bike_width = Math.floor(bike / max_mode * 100);
    var drive_width = Math.floor(drive / max_mode * 100);

    // Let's get this data onto the screen
    var walk_legend = document.querySelector('.walk');
    walk_legend.innerHTML = walk_percentage + '% walk'; 
    walk_legend.style.width = walk_width + '%';

    var bike_legend = document.querySelector('.bike');
    bike_legend.innerHTML = bike_percentage + '% bike'; 
    bike_legend.style.width = bike_width + '%';

    var drive_legend = document.querySelector('.drive');
    drive_legend.innerHTML = drive_percentage + '% drive'; 
    drive_legend.style.width = drive_width + '%';
  }

  // Select typology and submit
  document.onkeydown = function (e) {

    var KEY = {
        Z:  90,
        X: 88,
        left: 37,
        up: 38,
        right: 39,
        down: 40
    }
    
    switch (e.keyCode) {
      case KEY.Z:
        var input = document.getElementById('z');
        input.click();
        break;
      case KEY.X:
        var input = document.getElementById('x');
        input.click();
        break;
      case KEY.left:
        // Find current square
        var origin = document.querySelector('.board :checked');
        origin.row = origin.value.slice(0,1);

        // Find all open squares on this row and put their values in an array
        var inputs = document.querySelectorAll('.board input[value^="'+origin.row+'"]:not([disabled])');
        var possibleDestinations = [];
        for (var i = 0; i < inputs.length; i++) {
          possibleDestinations.push(inputs[i].value);
        };

        // Find the index of the current square in the array
        origin.index = possibleDestinations.indexOf(origin.value);

        // Make sure the index is valid
        if (origin.index != -1) {
          if (origin.index == 0) {
            // If the current square is the first one, go to the end of the array
            var destinationIndex = inputs.length - 1;
          } else {
            // Otherwise, go to the previous value in the array
            var destinationIndex = origin.index - 1;
          }

          // Select the destination square
          inputs[destinationIndex].checked = true;
        }
        e.preventDefault();
        break;
      case KEY.right:
        // Find current square
        var origin = document.querySelector('.board :checked');
        origin.row = origin.value.slice(0,1);

        // Find all open squares on this row and put their values in an array
        var inputs = document.querySelectorAll('.board input[value^="'+origin.row+'"]:not([disabled])');
        var possibleDestinations = [];
        for (var i = 0; i < inputs.length; i++) {
          possibleDestinations.push(inputs[i].value);
        };

        // Find the index of the current square in the array
        origin.index = possibleDestinations.indexOf(origin.value);

        // Make sure the index is valid
        if (origin.index != -1) {
          if (origin.index == inputs.length - 1) {
            // If the current square is the last one, go to the start of the array
            var destinationIndex = 0;
          } else {
            // Otherwise, go to the next value in the array
            var destinationIndex = origin.index + 1;
          }

          // Select the destination square
          inputs[destinationIndex].checked = true;
        }
        e.preventDefault();
        break;
      case KEY.up:
        // Find current square
        var origin = document.querySelector('.board :checked');
        origin.column = origin.value.slice(-1);

        // Find all open squares in this column and put their values in an array
        var inputs = document.querySelectorAll('.board input[value$="'+origin.column+'"]:not([disabled])');
        var possibleDestinations = [];
        for (var i = 0; i < inputs.length; i++) {
          possibleDestinations.push(inputs[i].value);
        };

        // Find the index of the current square in the array
        origin.index = possibleDestinations.indexOf(origin.value);

        // Make sure the index is valid
        if (origin.index != -1) {
          if (origin.index == 0) {
            // If the current square is the last one, go to the start of the array
            var destinationIndex = inputs.length - 1;
          } else {
            // Otherwise, go to the next value in the array
            var destinationIndex = origin.index - 1;
          }

          // Select the destination square
          inputs[destinationIndex].checked = true;
        }
        e.preventDefault();
        break;
      case KEY.down:
        // Find current square
        var origin = document.querySelector('.board :checked');
        origin.column = origin.value.slice(-1);

        // Find all open squares in this column and put their values in an array
        var inputs = document.querySelectorAll('.board input[value$="'+origin.column+'"]:not([disabled])');
        var possibleDestinations = [];
        for (var i = 0; i < inputs.length; i++) {
          possibleDestinations.push(inputs[i].value);
        };

        // Find the index of the current square in the array
        origin.index = possibleDestinations.indexOf(origin.value);

        // Make sure the index is valid
        if (origin.index != -1) {
          if (origin.index == inputs.length - 1) {
            // If the current square is the last one, go to the start of the array
            var destinationIndex = 0;
          } else {
            // Otherwise, go to the next value in the array
            var destinationIndex = origin.index + 1;
          }

          // Select the destination square
          inputs[destinationIndex].checked = true;
        }
        e.preventDefault();
        break;
      default:
        return; // exit this handler for other keys
    }
  };

  // Click typology labels to submit
  document.getElementById('z').onclick = function(event){
    setTile(event.target.value);
  };
  document.getElementById('x').onclick = function(event){
    setTile(event.target.value);
  };

  // Replace inputs with key codes
  document.getElementById('typologies').className = 'hide';

  // Refresh choices
  refreshChoices();
  setPeople();
  setJobs();
  setGreenSpace();