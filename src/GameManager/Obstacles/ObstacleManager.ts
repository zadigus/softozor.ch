import { remove, forEach } from 'lodash';
import { VoidSyncEvent } from 'ts-events';

import SoftozorData from '../../../config/game/SoftozorData.json';
import CONSTANTS from '../../../config/game/Constants.json';
import CONFIG from '../../../config/game/Obstacles.json';

import ObstacleFactory from './ObstacleFactory';
import Vector2D from '../Math/Vector2D';
import Obstacle from './Obstacle';
import Canvas from '../Canvas/Canvas';
import Collision from '../Collision';
import BadBubble from './BadBubble';
import GoodBubble from './GoodBubble';
import * as MovingCoordinateSystem from '../Math/MovingCoordinateSystem';
import MovingObject from '../MovingObject';

type GoodScoreHandler = () => void;
type BadScoreHandler = () => void;

// TODO: upon setting the gameState to over, disconnect the tick method, i.e. don't trigger it any more!
// TODO: upon setting the gameState to on, connect the tick method
export default class ObstacleManager {
  constructor(private readonly m_Canvas: Canvas) {
    this.m_Canvas.attachResizeEvent(this.render.bind(this));
  }

  /**
   * Public methods
   */
  public attachGoodScoreHandler(callback: GoodScoreHandler): void {
    this.m_GoodScoreEvent.attach(callback);
  }

  public attachBadScoreHandler(callback: BadScoreHandler): void {
    this.m_BadScoreEvent.attach(callback);
  }

  public tick(): void {
    this.cleanup();
    this.fillWorldSquare();
    this.tickObstacles();
    // TODO: it would probably make more sense to call cleanup() here
  }

  public clear(): void {
    this.m_Obstacles.length = 0;
    CONFIG.firstFilledSquareDistance + SoftozorData.startPosition;
  }

  /**
   *  fill image of bubbles
   */
  public fillWorldSquare(): void {
    while (this.mustFill()) {
      this.fillSquareWithBadBubbles();
      this.fillSquareWithGoodBubbles();
      this.m_LastFilledSquareXW += CONSTANTS.BannerUnit;
    }
  }

  /**
   * Private methods
   */
  private render(): void {
    forEach(this.m_Obstacles, (element: Obstacle): void => {
      element.render();
    });
  }

  private tickObstacles(): void {
    forEach(this.m_Obstacles, (element: Obstacle): void => {
      element.tick();
      this.handleCollision(element);
    });
  }

  private handleCollision(obstacle: Obstacle): void {
    let collision: Collision | undefined = movingObject().collide(obstacle);
    if (collision != undefined) {
      if (obstacle instanceof BadBubble) {
        this.handleCollisionWithBadBubble(collision);
      } else if (obstacle instanceof GoodBubble) {
        this.handleCollisionWithGoodBubble(collision);
      } else {
        console.log('Collision not supported.');
      }
    }
  }

  private handleCollisionWithBadBubble(collision: Collision): void {
    movingObject().handleBadCollision(collision);
    this.m_BadScoreEvent.post();
  }

  private handleCollisionWithGoodBubble(collision: Collision): void {
    this.m_GoodScoreEvent.post();
  }

  private fillSquareWithBadBubbles(): void {
    for (
      let fillIndex: number = 0;
      fillIndex < CONFIG.badBubblePerSquare;
      ++fillIndex
    ) {
      let bubble: Obstacle = ObstacleFactory.createBadBubble(
        this.m_Canvas,
        this.badBubblePosition(),
        this.bubbleDiameter()
      );
      this.m_Obstacles.push(bubble);
    }
  }

  private fillSquareWithGoodBubbles(): void {
    for (
      let fillIndex: number = 0;
      fillIndex < CONFIG.goodBubblePerSquare;
      ++fillIndex
    ) {
      let bubble: Obstacle = ObstacleFactory.createGoodBubble(
        this.m_Canvas,
        this.goodBubblePosition(),
        this.bubbleDiameter()
      );
      this.m_Obstacles.push(bubble);
    }
  }

  private goodBubblePosition(): Vector2D {
    let x: number =
      Math.random() * CONSTANTS.BannerUnit + this.m_LastFilledSquareXW;
    let param1: number = CONFIG.bubblePosition.param1;
    let param2: number = CONFIG.bubblePosition.param2;
    let y: number =
      approachCenter(approachCenter(Math.random())) * param1 - param2;
    return new Vector2D(x, y);
  }

  private badBubblePosition(): Vector2D {
    let x: number =
      Math.random() * CONSTANTS.BannerUnit + this.m_LastFilledSquareXW;
    let param1: number = CONFIG.bubblePosition.param1;
    let param2: number = CONFIG.bubblePosition.param2;
    let y: number =
      approachExtrema01(approachExtrema01(Math.random())) * param1 - param2;
    return new Vector2D(x, y);
  }

  private cleanup(): void {
    remove(
      this.m_Obstacles,
      (element: Obstacle): Boolean =>
        element.isOutOfBounds || element.hasCollided
    );
  }

  private bubbleDiameter(): number {
    let param1: number = CONFIG.bubbleDiameter.param1;
    let param2: number = CONFIG.bubbleDiameter.param2;
    return param1 + Math.random() * param2;
  }

  private mustFill(): Boolean {
    let scrollX: number = MovingCoordinateSystem.scrollingPosition().x;
    let ratio: number = CONSTANTS.WorldBandRatioToBanner;
    return this.m_LastFilledSquareXW < scrollX + this.m_Canvas.width / ratio;
  }

  /**
   * Private members
   */
  private m_BadScoreEvent: VoidSyncEvent = new VoidSyncEvent(); // TODO: maybe not necessary; maybe just storing the callback is enough
  private m_GoodScoreEvent: VoidSyncEvent = new VoidSyncEvent();

  private m_LastFilledSquareXW: number;
  private m_Obstacles: Obstacle[];
}

// stretches a value between 0 and 1 to 0 or 1, symetric relative to 0.5
function approachExtrema01(value: number): number {
  return (3 - 2 * value) * value * value;
}

function approachCenter(value: number): number {
  return ((2 * value - 3) * value + 2) * value;
}

function movingObject(): MovingObject {
  return MovingCoordinateSystem.movingObject();
}