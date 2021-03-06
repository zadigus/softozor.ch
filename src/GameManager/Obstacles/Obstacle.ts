import Vector2D from '../Math/Vector2D';
import HitBox from '../HitBoxes/HitBox';
import Collision from '../Collision';
import Canvas from '../Canvas/Canvas';

export default abstract class Obstacle {
  constructor(
    protected readonly m_Canvas: Canvas,
    protected readonly m_TopLeftCorner: Vector2D
  ) {}

  /**
   * Public methods
   */
  public abstract get isOutOfBounds(): Boolean;

  public get hasCollided(): Boolean {
    return this.m_HasCollided;
  }

  public tick(): void {
    this.render();
  }

  public collide(hitBox: HitBox): Collision | undefined {
    let collision: Collision | undefined = this.hitBox.collide(hitBox);
    if (collision !== undefined) {
      this.m_HasCollided = true;
      return collision;
    }
    return undefined;
  }

  public abstract render(): void;

  /**
   * Protected methods
   */
  protected abstract get hitBox(): HitBox;

  /**
   * Private members
   */
  private m_HasCollided: Boolean = false;
}
