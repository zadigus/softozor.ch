import { values, filter, forEach } from 'lodash';
import { VoidSyncEvent } from 'ts-events';

import Button, { ClickHandlerCallback } from './Button';
import PlayButton from './PlayButton';
import RestartButton from './RestartButton';
import Size from '../Math/Size';
import BannerLoader from '../BannerLoader';

type T_ButtonMap = { [key: string]: Button };
type ResizeEvent = () => void;

enum KEY {
  e_ESC = 27,
  e_SPACE = 32
}

export default class Canvas {
  constructor() {
    this.connectMouseEvents();
    this.connectKeyboardEvents();
    this.connectResizeEvent();
    this.setCanvasSize(getCanvasSize());
  }

  /**
   * Public methods
   */
  public get context(): CanvasRenderingContext2D {
    return this.m_RenderingContext;
  }

  public get width(): number {
    return this.canvas.width;
  }

  public get height(): number {
    return this.canvas.height;
  }

  public set playClickHandler(value: ClickHandlerCallback) {
    this.m_Buttons.play.clickHandler = value;
  }

  public set restartClickHandler(value: ClickHandlerCallback) {
    this.m_Buttons.restart.clickHandler = value;
  }

  public set upHandler(value: ClickHandlerCallback) {
    this.m_UpHandler = value;
  }

  public set downHandler(value: ClickHandlerCallback) {
    this.m_DownHandler = value;
  }

  public set mouseEnterHandler(value: ClickHandlerCallback) {
    this.m_MouseEnterHandler = value;
  }

  public set mouseLeaveHandler(value: ClickHandlerCallback) {
    this.m_MouseLeaveHandler = value;
  }

  public load(): void {
    this.m_Buttons = {
      play: new PlayButton(this, this.onButtonReady.bind(this)),
      restart: new RestartButton(this, this.onButtonReady.bind(this))
    };
  }

  public attachLoader(loader: BannerLoader): void {
    loader.addEvent(this.m_ReadyEvent);
  }

  public showRestartButton(): void {
    this.m_Buttons.restart.show();
  }

  public hideRestartButton(): void {
    this.m_Buttons.restart.hide();
  }

  public attachResizeEvent(event: ResizeEvent): void {
    this.m_ResizeHandler.attach(event);
  }

  public clearResizeEvents(): void {
    this.m_ResizeHandler.detach();
  }

  public tick(): void {
    this.render();
  }

  public render(): void {
    forEach(this.m_Buttons, (value: Button): void => value.render());
  }

  /**
   * Private methods
   */
  private get canvas(): HTMLCanvasElement {
    return this.context.canvas;
  }

  private setCanvasSize(size: Size): void {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
  }

  private connectMouseEvents(): void {
    console.log('Connecting mouse events');
    this.canvas.onmousedown = this.handleMouseDown.bind(this);
    this.canvas.onmouseup = this.handleMouseUp.bind(this);
    this.canvas.ontouchstart = this.handleMouseDown.bind(this);
    this.canvas.ontouchend = this.handleMouseUp.bind(this);
    this.canvas.onmouseenter = this.m_MouseEnterHandler;
    this.canvas.onmouseleave = this.m_MouseLeaveHandler;
  }

  private connectKeyboardEvents(): void {
    console.log('Connecting keyboard events');
    document.onkeydown = this.handleKeyDown.bind(this);
    document.onkeyup = this.handleKeyUp.bind(this);
  }

  private resizeCanvasElement(): void {
    this.setCanvasSize(getCanvasSize());
    console.log('New canvas width  = ' + this.canvas.width);
    console.log('New canvas height = ' + this.canvas.height);
  }

  private resizeToWindow(): void {
    console.log('Resizing canvas to new window size');
    this.resizeCanvasElement();
    this.m_ResizeHandler.post();
  }

  private connectResizeEvent(): void {
    console.log('Connecting resize events');
    $(window).resize(this.resizeToWindow.bind(this));
  }

  private getClickedObject(event: MouseEvent): Button | undefined {
    let buttons: Button[] = values(this.m_Buttons);
    let clickedBtns: Button[] = filter(buttons, (elem: Button): Boolean =>
      elem.hasMouse(event)
    );
    return clickedBtns.length === 1 ? clickedBtns.pop() : undefined;
  }

  private handleMouseDown(event: MouseEvent): void {
    let btn: Button | undefined = this.getClickedObject(event);
    if (btn === undefined) {
      this.m_DownHandler();
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    let btn: Button | undefined = this.getClickedObject(event);
    if (btn !== undefined) {
      btn.click();
    } else {
      this.m_UpHandler();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.keyCode) {
    case KEY.e_SPACE:
      this.m_DownHandler();
      break;
    case KEY.e_ESC:
      this.m_Buttons.play.click();
    default:
      break;
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    switch (event.keyCode) {
    case KEY.e_SPACE:
      this.m_UpHandler();
      break;
    default:
      break;
    }
  }

  private onButtonReady(): void {
    if (--this.m_ReadyCounter === 0) {
      this.m_Buttons.play.show();
      this.m_Buttons.restart.hide();
      this.m_ReadyEvent.post();
      this.m_ReadyCounter = initReadyCounter();
      console.log('Buttons loaded');
    }
  }

  /**
   * Private members
   */
  private m_ReadyCounter: number = initReadyCounter(); // number of buttons
  private m_ResizeHandler: VoidSyncEvent = new VoidSyncEvent();
  private m_ReadyEvent: VoidSyncEvent = new VoidSyncEvent();

  private m_RenderingContext: CanvasRenderingContext2D = getRenderingContext();

  private m_Buttons: T_ButtonMap;

  private m_UpHandler: ClickHandlerCallback;
  private m_DownHandler: ClickHandlerCallback;
  private m_MouseEnterHandler: ClickHandlerCallback;
  private m_MouseLeaveHandler: ClickHandlerCallback;
}

/**
 * Non-member methods
 */
function initReadyCounter(): number {
  return 2;
}

function getRenderingContext(): CanvasRenderingContext2D | never {
  let context: CanvasRenderingContext2D | null = (<HTMLCanvasElement>$(
    '#banner > canvas'
  )[0]).getContext('2d');
  if (context !== null) {
    console.log('Found canvas context');
    return context;
  }
  throw Error('No canvas context available!');
}

function getCanvasSize(): Size {
  let result: Size = new Size();
  let width: number | undefined = $('#banner').width();
  if (width !== undefined) {
    result.width = width;
  }
  let height: number | undefined = $('#banner').height();
  if (height !== undefined) {
    result.height = height;
  }
  return result;
}
