import axios from 'axios';

import * as SERVER from '../config/server/api.json';
import * as scoresTemplate from './templates/ScoresTable.pug';

type ScoreData = { username: string; score: string }[];

export default class HighScoresRenderer {
  constructor() {
    $(`${this.ELEMENT} p`).click(this.onMouseClick.bind(this));
    $(document).click(this.onMouseClickOutside.bind(this));

    $(`${this.ELEMENT} table`).hide();
    this.refreshScores();
  }

  /**
   * Public methods
   */
  public refreshScores(): void {
    console.log('Refresh scores!');
    axios
      .get(`${this.SERVER}/${this.GET_API}/`)
      .then(res => this.fillScores(res.data))
      .catch(error => console.log('Connection to server failed: ' + error));
  }

  /**
   * Private methods
   */
  private onMouseClickOutside(event): void {
    if (!$(event.target).closest(this.ELEMENT).length) {
      if ($(this.ELEMENT).is(':visible')) {
        this.collapse(event);
      }
    }
  }

  private fillScores(data: ScoreData): void {
    let html: string = '<tr><td colspan=2 align=center>Empty scores</td></tr>';
    if (data.length > 0) {
      html = scoresTemplate({
        Scores: data
      });
    }
    $(`${this.ELEMENT} table`).html(html);
  }

  private expand(event): void {
    if (!this.m_Collapsed) {
      return;
    }
    let dh: string = $(`${this.ELEMENT} table`).css('max-height');
    $(`${this.ELEMENT} table`).show();
    $(this.ELEMENT).animate(
      {
        height: `+=${dh}`,
        bottom: `-=${dh}`
      },
      'slow'
    );
    $(this.ELEMENT).addClass('active');
    this.m_Collapsed = false;
  }

  private collapse(event): void {
    if (this.m_Collapsed) {
      return;
    }
    let dh: string = $(`${this.ELEMENT} table`).css('max-height');
    $(this.ELEMENT).animate(
      {
        height: `-=${dh}`,
        bottom: `+=${dh}`
      },
      'slow',
      this.onCollapse.bind(this)
    );
    this.m_Collapsed = true;
  }

  private onCollapse(): void {
    $(`${this.ELEMENT} table`).hide();
    $(this.ELEMENT).removeClass('active');
  }

  private onMouseClick(event): void {
    this.m_Collapsed ? this.expand(event) : this.collapse(event);
  }

  /**
   * Private members
   */
  private readonly SERVER: string = (<any>SERVER).server;
  private readonly SET_API: string = (<any>SERVER).api.publishScore;
  private readonly GET_API: string = (<any>SERVER).api.getScores;

  private readonly ELEMENT: string = '#highScores';
  private m_Collapsed: Boolean = true;
}
