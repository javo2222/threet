import {Injectable} from '@angular/core';
import {Player} from '../models/Player';
import {STAGE} from '../constants/config';
import {AngularFirestore} from 'angularfire2/firestore';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class PlayerService {

  players: Player[];

  loaded = new BehaviorSubject(false);

  constructor(private db: AngularFirestore) {
    this.db.collection<Player>(STAGE + 'players').valueChanges().subscribe(players => {
      this.players = players;
      this.loaded.next(true);
    });
  }
}
