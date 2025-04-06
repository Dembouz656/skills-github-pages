function addMatch() {
    const sport = document.getElementById("sport").value;
    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    const score1 = parseInt(document.getElementById("score1").value);
    const score2 = parseInt(document.getElementById("score2").value);
    const buteur1 = document.getElementById("buteur1").value;
    const buteur2 = document.getElementById("buteur2").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const journee = document.getElementById("journee").value;

    if (!team1 || !team2 || !date || !time) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    const match = { journee, team1, team2, score1, score2, buteur1, buteur2, date, time };

    let matches = JSON.parse(localStorage.getItem(sport)) || [];
    matches.push(match);
    localStorage.setItem(sport, JSON.stringify(matches));

    loadMatches();
    updateRankings();
    updateScorers();
}

function loadMatches() {
    const sport = document.getElementById("sport").value;
    const journee = document.getElementById("journee").value;
    const matches = JSON.parse(localStorage.getItem(sport)) || [];
    const tableBody = document.getElementById("calendar").getElementsByTagName('tbody')[0];
    tableBody.innerHTML = "";

    matches.forEach((match, index) => {
        if (match.journee == journee) {
            const scoreDisplay = match.score1 === null || match.score2 === null ? "À venir" : `${match.score1} - ${match.score2}`;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${match.journee}</td>
                <td>${match.date}</td>
                <td>${match.time}</td>
                <td>${match.team1}</td>
                <td>${scoreDisplay}</td>
                <td>${match.team2}</td>
                <td><button onclick="editScore(${index}, '${sport}')">Modifier Score</button></td>
                <td><button onclick="deleteMatch(${index}, '${sport}')">Supprimer</button></td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function deleteMatch(index, sport) {
    let matches = JSON.parse(localStorage.getItem(sport)) || [];
    matches.splice(index, 1);
    localStorage.setItem(sport, JSON.stringify(matches));
    loadMatches();
    updateRankings();
    updateScorers();
}

function editScore(index, sport) {
    const matches = JSON.parse(localStorage.getItem(sport)) || [];
    const match = matches[index];
    const newScore1 = prompt(`Modifier le score de ${match.team1}`, match.score1);
    const newScore2 = prompt(`Modifier le score de ${match.team2}`, match.score2);

    if (newScore1 !== null && newScore2 !== null) {
        match.score1 = parseInt(newScore1);
        match.score2 = parseInt(newScore2);
        localStorage.setItem(sport, JSON.stringify(matches));
        loadMatches();
        updateRankings();
        updateScorers();
    }
}

function updateRankings() {
    const footballMatches = JSON.parse(localStorage.getItem('football')) || [];
    const handballMatches = JSON.parse(localStorage.getItem('handball')) || [];

    const footballTeams = getTeamsRanking(footballMatches, 4);
    const handballTeams = getTeamsRanking(handballMatches, 2);

    renderRanking('ranking-football', footballTeams);
    renderRanking('ranking-handball', handballTeams);
}

function getTeamsRanking(matches, qualifiers) {
    const teams = {};

    matches.forEach(match => {
        const { team1, team2, score1, score2 } = match;

        if (score1 === null || score2 === null) return;

        if (!teams[team1]) teams[team1] = { points: 0, goalsFor: 0, goalsAgainst: 0 };
        if (!teams[team2]) teams[team2] = { points: 0, goalsFor: 0, goalsAgainst: 0 };

        teams[team1].goalsFor += score1;
        teams[team2].goalsFor += score2;
        teams[team1].goalsAgainst += score2;
        teams[team2].goalsAgainst += score1;

        if (score1 > score2) {
            teams[team1].points += 3;
        } else if (score1 < score2) {
            teams[team2].points += 3;
        } else {
            teams[team1].points += 1;
            teams[team2].points += 1;
        }
    });

    return Object.keys(teams).map(team => {
        const { points, goalsFor, goalsAgainst } = teams[team];
        const goalDifference = goalsFor - goalsAgainst;
        return { team, points, goalsFor, goalsAgainst, goalDifference };
    }).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
      .map((team, index) => ({ ...team, status: index < qualifiers ? "Qualifié" : "Éliminé" }));
}

function renderRanking(tableId, teams) {
    const tableBody = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    tableBody.innerHTML = "";

    teams.forEach(team => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${team.team}</td>
            <td>${team.points}</td>
            <td>${team.goalsFor}</td>
            <td>${team.goalsAgainst}</td>
            <td>${team.goalDifference}</td>
            <td>${team.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

function resetData() {
    localStorage.clear();
    loadMatches();
    updateRankings();
    updateScorers();
}

loadMatches();
updateRankings();
