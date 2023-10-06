const prompt = require('prompt-sync')();
const questions = require('./Questions.json');
const fs = require('fs');

console.clear();
function mainMenu() {
  console.log('Välkommen till husdjursquizzet!');
  console.log('1. Starta djurquizzet');
  console.log('2. Visa tidigare resultat');
  console.log('3. Avsluta quizzet');

  const choice = prompt('Välj ett alternativ (1/2/3): ');

  switch (choice) {
    case '1':
      startQuiz();
      break;
    case '2':
      showResults();
      break;
    case '3':
      console.log('Tack för att du gjort quizzet! Hoppas vi ses igen. Hej då!');
      process.exit(0);
    default:
      console.log('Ogiltigt sifferval. Vänligen välj mellan (1/2/3).');
      mainMenu();
  }
}

function startQuiz() {
  const fullName = prompt("Vänligen ange ditt för och efternamn. Tänk på att å/ä/ö ej fungerar att skriva!: ");
  const names = fullName.trim().split(' ');

  if (names.length !== 2) {
    console.log('Vänligen skriv både ditt för och efternamn. Exempelvis (Sven Svensson).');
    startQuiz();
    return;
  }

  const firstName = names[0];
  const lastName = names[1];

  console.log(`
  Hej ${firstName} ${lastName}!

  Idag ska vi göra ett quizz för att se vilket husdjur som skulle passa dig bäst.
  
  De husdjur vi kommer utvärdera är katt, kanin, hund och fisk.
  
  Detta kommer vi göra genom att ställa några frågor till dig!
  
  Lycka till!!!`);

  const animalPoints = [0, 0, 0, 0];

  for (const quizzQuestion of questions) {
    let running = true;

    while (running) {
      console.log(quizzQuestion.quizzQuestion);
      const answer = prompt('1.Ja 2.Nej ');


      switch (answer) {
        case '1':
          for (let a = 0; a < animalPoints.length; a++) {
            animalPoints[a] += quizzQuestion.ja[a];
          }
          running = false;
          break;

        case '2':
          for (let a = 0; a < animalPoints.length; a++) {
            animalPoints[a] += quizzQuestion.nej[a];
          }
          running = false;
          break;

        default:
          console.log('Vänligen ange antingen 1 eller 2.');
      }
    }
  }

  const finalPoints = animalPoints.reduce((a, b) => a + b, 0);

  const animals = ['Hund', 'Katt', 'Kanin', 'Fisk'];

  const maxPointIndex = animalPoints.indexOf(Math.max(...animalPoints));

  const score = animals.map((animalScore, index) => {
    const percentage = ((animalPoints[index] / finalPoints) * 100).toFixed(2);
    return {
      animal: animalScore,
      finalScore: animalPoints[index],
      percentage: `${percentage}%`
    };
  });

  score.sort((a, b) => b.finalScore - a.finalScore);

  console.log(`
  Tack ${firstName} ${lastName} för att du har gjort djurquizzet.
  
  Det djur som vi tror skulle passa dig bäst är ${animals[maxPointIndex]}.
  
  Om du inte är nöjd med resultatet visas här nedan en beräkning på hur sannolikt alla djur skulle passa dig:`);

  score.forEach((animalScore) => {
    const percentageRounded = Math.round(parseFloat(animalScore.percentage));
    console.log(`${animalScore.animal}: ${percentageRounded}%`);
  });

  saveResults(firstName, lastName, score);
  mainMenu();
}

function showResults() {
  let allUsers;

  try {
    const fileContents = fs.readFileSync('./Results.json', 'utf8');
    allUsers = JSON.parse(fileContents);

    if (!Array.isArray(allUsers)) {
      allUsers = [];
    }
  } catch {
    allUsers = [];
  }

  console.log('Tidigare resultat:');
  allUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} - Datum: ${user.score[0].date}`);
    console.log('   Djur som passar dig bäst:');
    user.score[0].scores.forEach((result) => {
      console.log(`   - ${result.animal}: ${result.percentage}`);
    });
  });

  mainMenu();
}

function saveResults(firstName, lastName, score) {
  let allUsers;

  try {
    const fileContents = fs.readFileSync('./Results.json', 'utf8');
    allUsers = JSON.parse(fileContents);

    if (!Array.isArray(allUsers)) {
      allUsers = [];
    }
  } catch {
    allUsers = [];
  }

  const user = allUsers.find((u) => u.name === firstName + ' ' + lastName);

  if (user) {
    user.score.push({
      scores: score,
      date: new Date().toLocaleString(),
    });
  } else {
    allUsers.push({
      name: firstName + ' ' + lastName,
      score: [
        {
          scores: score,
          date: new Date().toLocaleString(),
        },
      ],
    });
  }

  fs.writeFileSync('./Results.json', JSON.stringify(allUsers, null, 2));
}

mainMenu();
