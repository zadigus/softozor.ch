import GameState from './GameState';

export default class PauseState extends GameState {
  constructor() {
    super();
  }

  /**
   * Public methods
   */
  public enter(): void {
    console.log('entering pause state');
    this.m_ShowBanner();
    this.m_StopTick();
  }

  public exit(): void {
    console.log('leaving pause state');
  }

  public onPlayClick(): void {
    console.log('play');
    this.m_SetPlayState();
  }
}
