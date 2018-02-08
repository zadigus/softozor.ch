import axios from 'axios';

import * as SERVER from '../config/server/api.json';
import * as scoresTemplate from './templates/ScoresTable.pug';

type ScoreData = { username: string; score: string }[];

export default class HighScoresRenderer {
  constructor() {
    $('#highScores').click(this.onMouseClick.bind(this));
    let height: number | undefined = $('#highScores').height();
    this.m_OriginalHeight = height !== undefined ? height : 0;

    axios
      .get(`${this.SERVER}/${this.GET_API}/`)
      .then(res => this.fillScores(res.data))
      .catch(error => console.log('Connection to server failed: ' + error));
  }

  /**
   * Public methods
   */

  /**
   * Private methods
   */
  private fillScores(data: ScoreData): void {
    console.log('data = ' + JSON.stringify(data));
    let html: string = scoresTemplate({
      Scores: data
    });
    $('#highScores table').html(html);
  }

  private expand(event): void {
    let dh: number | undefined = $('#highScores table').height();
    console.log(
      'current height = ' + $(event.currentTarget).height() + ', ' + dh
    );
    if (dh !== undefined) {
      $(event.currentTarget).animate(
        {
          height: `+=${dh}px`,
          bottom: `-=${dh}px`
        },
        'slow'
      );
    }
  }

  private collapse(event): void {
    let dh: number | undefined = $('#highScores table').height();
    if (dh !== undefined) {
      $(event.currentTarget).animate(
        {
          height: `-=${dh}px`,
          bottom: `+=${dh}px`
        },
        'slow'
      );
    }
  }

  private onMouseClick(event): void {
    if ($(event.currentTarget).height() === this.m_OriginalHeight) {
      this.expand(event);
    } else {
      this.collapse(event);
    }
  }

  /**
   * Private members
   */
  private readonly SERVER: string = (<any>SERVER).server;
  private readonly SET_API: string = (<any>SERVER).api.publishScore;
  private readonly GET_API: string = (<any>SERVER).api.getScores;

  private m_OriginalHeight: number;
}