import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AngularFirestore} from 'angularfire2/firestore';
import {STAGE} from '../../constants/config';
import {Tournament} from '../../models/Tournament';
import {switchMap} from 'rxjs/operators';
import {Game} from '../../models/Game';
import {combineLatest} from 'rxjs';
import {PlayerService} from '../../services/player.service';

@Component({
  selector: 'app-tournament-overview',
  templateUrl: './tournament-overview.component.html',
  styleUrls: ['./tournament-overview.component.css']
})
export class TournamentOverviewComponent {

  tournament: Tournament;
  games: Game[];
  tournamentId: string;

  constructor(private route: ActivatedRoute,
              private db: AngularFirestore,
              private playerService: PlayerService,
              private router: Router) {
    this.route.params
      .pipe(
        switchMap(params => combineLatest(this.db.collection<Tournament>(STAGE + 'tournaments').doc(params.tournamentId).valueChanges(),
          this.db.collection<Game>(STAGE + 'games', ref => ref.where('tournamentId', '==', params.tournamentId)).valueChanges(),
          (tournament, games) => {
            this.tournamentId = params.tournamentId;
            return {tournament, games};
          }
          ),
        ))
      .subscribe((tournamentAndGames: { tournament: Tournament, games: Game[] }) => {
        this.tournament = tournamentAndGames.tournament;
        this.games = tournamentAndGames.games;
      });
  }

  nextMatch() {
    const currentStage = Object.keys(this.tournament.stages)
      .map(key => parseInt(key, 10))
      .sort((a, b) => a - b)
      .map(key => this.tournament.stages[key])
      .find(stage => stage
        .map(gameId => this.games.find(game => game.gameId === gameId))
        .some(game => !game.done));


    const nextGame = currentStage.map(gameId => this.games.find(game => game.gameId === gameId)).find(game => !game.done);

    this.router.navigate(['game', 'score', nextGame.gameId], {
      queryParams: {tournamentId: this.tournamentId}
    });

  }
}
