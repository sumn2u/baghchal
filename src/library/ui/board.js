import { Logic } from "../ai/logic";
import { TIGER, GOAT, EAT, PUT, MOVE, COMPUTER, FRIEND } from "../constants";
import { Howl } from "howler";
import tigerImage from "../images/tiger.png";
import goatImage from "../images/goat.png";
import diamondCircle from "../images/diamond-circle.png";
import topBorderImage from "../images/top-bar.png";
import bottomBorderImage from "../images/bottom-bar.png";
import leftRightBorderImage from "../images/left-right-bar.png";
import { mount, el, list } from "../ui/dom";
import { Socket } from "../game/socket";
import { Backend } from "./backend";
import { OnlineUsersList } from "./components/online-users-list";
import html2canvas from "html2canvas";
export class Board {
  constructor(
    realCanvasElement,
    fakeCanvasElement,
    infoBox,
    dataContainer,
    moveIndicator,
    moveCount,
    FBInstant,
    matchData
  ) {
    this.chosenItem = null;
    this.myTurn = false;
    this.friend = COMPUTER;
    this.FBInstant = FBInstant;
    this.difficultyLevel = 5;
    this.matchData = matchData;
    this.dataContainer = dataContainer;
    this.moveIndicator = moveIndicator;
    this.moveCount = moveCount;
    this.moves = 0;
    this.realCanvasElement = realCanvasElement;
    this.fakeCanvasElement = fakeCanvasElement;
    this.infoBox = infoBox;
    this.playSound = true;
    this.sound = new Howl({
      src: ["bagchal.mp3"],
      html5: true,
      preload: true,
      autoplay: false,
      loop: false,
      volume: 1,
      sprite: {
        goat: [0, 2500],
        tiger: [3000, 3002],
        eating: [4000, 5500],
      },
    });

    // addRequiredDom ELEMENTS
    this.addUIDOMToGame();
    this.goats = []; // Array<{x:number,y:number,dead:false, currentPoint,drag: false,index: number;}>
    this.tigers = []; // Array<{x:number,y:number,currentPoint: number,drag: false,index: number}>

    const totalWidth = this.realCanvasElement.parentNode.offsetWidth;
    const totalHeight = window.innerHeight;
    this.totalWidth = totalWidth > 500 ? 500 : totalWidth;
    this.totalHeight =
      totalHeight > totalWidth
        ? totalWidth
        : totalHeight > 500
        ? 500
        : totalHeight;
    this.totalPoints = 24;
    this.paddingLeft = this.totalWidth / 10;
    this.paddingRight = this.totalWidth / 10;
    this.paddingTop = this.totalWidth / 10;
    this.paddingBottom = this.totalWidth / 10;
    this.height = this.totalHeight - (this.paddingTop + this.paddingBottom);
    this.width = this.totalWidth - (this.paddingLeft + this.paddingRight);
    this.steps = 4;
    this.verticalStep = this.width / this.steps;
    this.horizontalStep = this.height / this.steps;
    this.firstGoatRender = 0;
    this.tigerImage = null;
    this.goatImage = null;
    this.diamondCircleImage = null;
    this.leftRightBorderImage = null;
    this.topBorderImage = null;
    this.bottomBorderImage = null;
    this.verticalIndicators = [1, 2, 3, 4, 5];
    this.horizontalIndicators = ["A", "B", "C", "D", "E"];
    this.realCanvasElement.setAttribute("height", this.totalHeight);
    this.realCanvasElement.setAttribute("width", this.totalWidth);
    this.fakeCanvasElement.setAttribute("height", this.totalHeight);
    this.fakeCanvasElement.setAttribute("width", this.totalWidth);
    this.fakeCanvasElement.classList.add("hide");
    this.realCanvasElement.style.border = "1px solid #ccc";
    this.canvas = this.realCanvasElement.getContext("2d");
    this.fakeCanvas = this.fakeCanvasElement.getContext("2d");

    this.goatHeight = this.totalWidth >= 500 ? 80 : 60;
    this.goatWidth = this.totalWidth >= 500 ? 80 : 60;
    this.tigerWidth = this.totalWidth >= 500 ? 80 : 60;
    this.tigerHeight = this.totalWidth >= 500 ? 80 : 60;
    this.cirlceImageRad = this.totalWidth >= 500 ? 40 : 24;
    this.points = this.calculatePoints(); // Array<{x:number,y:number,index: number,item:'tiger or goat', itemIndex: number (tiger goat Index)}>;
    this.fillTigerPoints();
    this.mouseDown = false;
    this.mouseIntraction();
    this.totalMoveAttempts = 0;
    // item ready for drag
    this.dragItem = null; //  {item:TIGER,itemData:clickedPoint}
    this.animationInProgress = false;

    this.logic = null;
    this.socket = null;
    this.player = null;
    this.startGame = null;
  }

  /**
   * handle mouse intraction
   */
  mouseIntraction() {
    this.canvasPosition = this.getCanvasPosition();
    /**
     * Mouse down/ touch start event handlers
     */
    this.realCanvasElement.addEventListener(
      "mousedown",
      this.handelMouseDownEvent.bind(this)
    );
    this.realCanvasElement.addEventListener(
      "touchstart",
      this.handelMouseDownEvent.bind(this)
    );

    /**
     * Mouse up /touch end event handlers
     */
    this.realCanvasElement.addEventListener(
      "mouseup",
      this.handleMouseUpEvent.bind(this)
    );
    this.realCanvasElement.addEventListener(
      "touchend",
      this.handleMouseUpEvent.bind(this)
    );
    this.fakeCanvasElement.addEventListener(
      "mouseup",
      this.handleMouseUpEvent.bind(this)
    );
    this.fakeCanvasElement.addEventListener(
      "touchend",
      this.handleMouseUpEvent.bind(this)
    );
    /**
     * mouse move/ touch move event handler
     */
    this.fakeCanvasElement.addEventListener(
      "mousemove",
      this.handleMouseMoveEvent.bind(this)
    );
    this.fakeCanvasElement.addEventListener(
      "touchmove",
      this.handleMouseMoveEvent.bind(this)
    );
    this.realCanvasElement.addEventListener(
      "touchmove",
      this.handleMouseMoveEvent.bind(this)
    );
  }

  /**
   * returns roomId
   *
   */
  getRoomId() {
    return this.roomId;
  }

  /**
   * method to handle mouse down event/touch start
   * @param {mouse event} event
   */
  handelMouseDownEvent(event) {
    if (!this.myTurn) {
      return false;
    }
    event.preventDefault();
    if (!this.chosenItem) {
      return true;
    }
    if (this.animationInProgress) {
      return true;
    }
    this.mouseDown = true;
    const pageX =
      event.type === "mousedown" ? event.pageX : event.changedTouches[0].pageX;
    const pageY =
      event.type === "mousedown" ? event.pageY : event.changedTouches[0].pageY;
    const x = pageX - this.canvasPosition.left;
    const y = pageY - this.canvasPosition.top;
    const goatWidth = Math.floor(this.goatWidth / 2);
    const goatHeight = Math.floor(this.goatHeight / 2);
    const clickedPoint = this.points.find((point) => {
      return (
        x >= point.x - goatWidth &&
        x <= point.x + goatWidth &&
        y >= point.y - goatHeight &&
        y <= point.y + goatHeight
      );
    });
    if (!clickedPoint) {
      return true;
    }
    const i = clickedPoint.index;
    if (
      !clickedPoint.item &&
      this.chosenItem === GOAT &&
      this.goats.length < 20
    ) {
      const clickedGoatData = {
        x: clickedPoint.x,
        y: clickedPoint.y,
        dead: false,
        drag: false,
        currentPoint: i,
        index: this.goats.length,
      };
      this.goats.push(clickedGoatData); // add new point to goat
      // track goat point to all points array
      this.points[i].item = GOAT;
      this.points[i].itemIndex = this.goats.length - 1;
      if (this.friend === COMPUTER) {
        this.moves++;
        this.moveCount.innerHTML = `Moves: ${this.moves}`;
        this.renderComputerTigerMove();
      } else {
        this.sendGoatMoveDataToFriend({
          type: "new",
          nextPoint: null,
          clickedPoint,
        });
      }
    } else if (this.chosenItem === GOAT && this.goats.length === 20) {
      this.goats.forEach((g) => (g.drag = g.currentPoint === i ? true : false));
      this.dragItem = { item: GOAT, point: clickedPoint };
    } else if (this.chosenItem === TIGER) {
      this.tigers.forEach(
        (t) => (t.drag = t.currentPoint === i ? true : false)
      );
      this.dragItem = { item: TIGER, point: clickedPoint };
      this.render;
    }
    if (!this.dragItem) {
      return true;
    }
    this.showFakeCanvas();
    this.render();
  }
  /**
   * handle mouse down event
   * @param {mouse event} event
   */
  handleMouseUpEvent(event) {
    if (!this.myTurn) {
      return false;
    }
    this.mouseDown = false;
    this.hideFakeCanvas();
    if (this.dragItem) {
      const pageX =
        event.type === "mouseup" ? event.pageX : event.changedTouches[0].pageX;
      const pageY =
        event.type === "mouseup" ? event.pageY : event.changedTouches[0].pageY;
      const x = pageX - this.canvasPosition.left;
      const y = pageY - this.canvasPosition.top;
      const goatWidth = Math.floor(this.goatWidth / 2);
      const goatHeight = Math.floor(this.goatHeight / 2);
      const releasedPoint = this.points.find((point) => {
        return (
          x >= point.x - goatWidth &&
          x <= point.x + goatWidth &&
          y >= point.y - goatHeight &&
          y <= point.y + goatHeight
        );
      });

      if (releasedPoint) {
        if (this.dragItem.item === GOAT) {
          const possiblePoints = this.getNextPossibleMove(
            this.dragItem.point.index,
            GOAT
          );
          const validPoint = possiblePoints.find(
            (p) => p.point === releasedPoint.index
          );

          const lastPointIndex = this.dragItem.point.lastPoint;
          if (validPoint && lastPointIndex !== releasedPoint.index) {
            const draggedGoat = this.goats.find((g) => g.drag);
            this.moves++;
            this.moveCount.innerHTML = `Moves: ${this.moves}`;
            if (draggedGoat) {
              const prevPointIndex = draggedGoat.currentPoint;
              const currentPointIndex = releasedPoint.index;

              // release  item from prev point
              this.points[prevPointIndex].item = null;
              this.points[prevPointIndex].itemIndex = null;
              // update goat points
              this.goats[draggedGoat.index].x = releasedPoint.x;
              this.goats[draggedGoat.index].y = releasedPoint.y;
              this.goats[draggedGoat.index].currentPoint = currentPointIndex;

              // add new item to points
              this.points[currentPointIndex].item = GOAT;
              this.points[currentPointIndex].itemIndex = draggedGoat.index;
              this.points[currentPointIndex].lastPoint =
                this.dragItem.point.index;
              // computer turn to move tiger
              if (this.friend === COMPUTER) {
                this.renderComputerTigerMove();
              } else {
                // send current data to friend
                this.sendGoatMoveDataToFriend({
                  type: "move",
                  prevPoint: prevPointIndex,
                  nextPoint: currentPointIndex,
                  type: "new",
                });
              }
            }
          }
        } else {
          const possiblePoints = this.getNextPossibleMove(
            this.dragItem.point.index,
            TIGER
          );
          const validPoint = possiblePoints.find(
            (p) => p.point === releasedPoint.index
          );

          const lastPointIndex = this.dragItem.point.lastPoint;
          if (
            validPoint &&
            lastPointIndex === releasedPoint.index &&
            possiblePoints.length == 1
          ) {
            this.gameCompleted(GOAT);
          }
          if (validPoint && lastPointIndex !== releasedPoint.index) {
            const draggedTiger = this.tigers.find((t) => t.drag);
            this.moves++;
            this.moveCount.innerHTML = `Moves: ${this.moves}`;
            if (draggedTiger) {
              // release  item from prev point
              const prevPointIndex = draggedTiger.currentPoint;
              this.points[prevPointIndex].item = null;
              this.points[prevPointIndex].itemIndex = null;
              // update tiger point
              this.tigers[draggedTiger.index].x = releasedPoint.x;
              this.tigers[draggedTiger.index].y = releasedPoint.y;
              this.tigers[draggedTiger.index].currentPoint =
                releasedPoint.index;
              // add this tiger reference to points array
              const nextPointIndex = releasedPoint.index;
              this.points[nextPointIndex].item = TIGER;
              this.points[nextPointIndex].itemIndex = draggedTiger.index;
              this.points[nextPointIndex].lastPoint = this.dragItem.point.index;
              // if tiger eat the goat remove goat from goats
              this.moveIndicator.innerHTML = `🐐 is moving!`;

              if (validPoint.eatGoat) {
                // remove eaten goat point index from points
                const currentEatenGoatIndex =
                  this.goats[validPoint.eatGoatIndex].currentPoint;
                this.points[currentEatenGoatIndex].item = null;
                this.points[currentEatenGoatIndex].itemIndex = null;
                this.goats[validPoint.eatGoatIndex] = {
                  x: 0,
                  y: 0,
                  dead: true,
                  currentPoint: -currentEatenGoatIndex,
                };
                this.moveIndicator.innerHTML = `🐅 ate 🐐!`;
                if (this.playSound) {
                  this.sound.play("tiger");
                }
              }
              if (this.playSound) {
                this.sound.play("goat");
              }
              // computer turns to move goat

              if (this.friend === COMPUTER) {
                this.renderComputerGoatMove();
              } else {
                this.sendTigerMoveDataToFriend({
                  tigerIndex: draggedTiger.index,
                  nextPointIndex,
                  eatGoat: validPoint.eatGoat,
                  eatGoatIndex: validPoint.eatGoatIndex,
                });
              }
            }
          }
        }
      }
    }
    this.dragItem = null;
    this.goats.forEach((g) => (g.drag = false));
    this.tigers.forEach((t) => (t.drag = false));
    this.render();
  }

  handleMouseMoveEvent(event) {
    event.preventDefault();
    if (this.animationInProgress) {
      return true;
    }
    if (!(this.mouseDown && this.dragItem)) {
      return true;
    }
    const pageX =
      event.type === "mousemove" ? event.pageX : event.changedTouches[0].pageX;
    const pageY =
      event.type === "mousemove" ? event.pageY : event.changedTouches[0].pageY;
    const x = pageX - this.canvasPosition.left;
    const y = pageY - this.canvasPosition.top;
    this.fakeCanvas.clearRect(0, 0, this.width * 1.5, this.height * 1.5);
    if (this.dragItem.item === GOAT) {
      this.drawBoardGoat({ x, y }, this.fakeCanvas);
    } else {
      this.drawTigerImage({ x, y }, this.fakeCanvas);
    }
  }
  /**
   * render all objects
   */
  render() {
    this.tigerMoveAttems = 0;
    this.canvas.clearRect(0, 0, this.totalWidth * 1.5, this.totalHeight * 1.5);
    this.drawBoard();
    this.drawTigers();
    this.renderGoats();
  }
  /**
   * calculate all posible points of board
   */
  calculatePoints() {
    let points = [];
    for (
      let y = this.paddingTop;
      y <= this.totalHeight;
      y += this.horizontalStep
    ) {
      for (
        let x = this.paddingLeft;
        x <= this.totalWidth;
        x += this.verticalStep
      ) {
        points.push({
          x: x,
          y: y,
          index: points.length,
          item: null,
          itemIndex: null,
        });
        if (this.diamondCircleImage) {
          this.canvas.drawImage(
            this.diamondCircleImage,
            x - this.cirlceImageRad / 2,
            y - this.cirlceImageRad / 2,
            this.cirlceImageRad,
            this.cirlceImageRad
          );
        } else {
          this.diamondCircleImage = new Image();
          this.diamondCircleImage.onload = () => {
            this.canvas.drawImage(
              this.diamondCircleImage,
              x - this.cirlceImageRad / 2,
              y - this.cirlceImageRad / 2,
              this.cirlceImageRad,
              this.cirlceImageRad
            );
          };
          this.diamondCircleImage.src = diamondCircle;
        }
      }
    }
    return points;
  }
  /**
   * add points to tiger array while initialising the game
   */
  fillTigerPoints() {
    [0, 4, 20, 24].forEach((t, i) => {
      this.points[t].item = TIGER;
      this.points[t].itemIndex = t;
      const point = this.points[t];
      this.tigers.push({
        x: point.x,
        y: point.y,
        currentPoint: t,
        drag: false,
        index: i,
      });
    });
  }

  /**
   * draw square and lines for board
   */
  drawBoard() {
    let sides = ["vertical", "horizontal"];
    //draw inner rectangle
    let yMiddlePoint = this.paddingTop + this.height / 2;

    sides.forEach((element) => {
      let i = 0;
      let stepSize =
        element == "vertical" ? this.verticalStep : this.horizontalStep;
      let totalSize = element == "vertical" ? this.width : this.height;
      for (let length = 0; length <= totalSize; length += stepSize) {
        let x1 =
          element == "vertical" ? this.paddingLeft + length : this.paddingLeft;
        let y1 =
          element == "vertical" ? this.paddingTop : this.paddingTop + length;
        let x2 =
          element == "vertical"
            ? this.paddingLeft + length
            : this.paddingLeft + this.width;
        let y2 =
          element == "vertical"
            ? this.paddingTop + this.height
            : this.paddingTop + length;
        // this.drawText(
        //   x1,
        //   y1,
        //   element,
        //   element === "vertical"
        //     ? this.horizontalIndicators[i]
        //     : this.verticalIndicators[i]
        // );
        this.drawLine(x1, y1, x2, y2);
        i++;
      }

      //draw diagonal lines
      let dx1 =
        element == "vertical"
          ? this.paddingLeft
          : this.paddingLeft + this.width;
      let dy1 = this.paddingTop;

      let dx2 =
        element == "vertical"
          ? this.paddingLeft + this.width
          : this.paddingLeft;
      let dy2 = this.paddingTop + this.height;
      this.drawLine(dx1, dy1, dx2, dy2);

      let mPointx1 = this.paddingLeft + this.width / 2;
      let mPointy1 =
        element == "vertical" ? this.paddingTop : this.paddingTop + this.height;
      let mPointx2 =
        element == "vertical"
          ? this.paddingLeft
          : this.paddingLeft + this.width;
      let mPointy2 = this.paddingTop + this.height / 2;
      this.drawLine(mPointx1, mPointy1, mPointx2, mPointy2);
      this.drawLine(
        mPointx1,
        mPointy1,
        mPointx2 + (element == "vertical" ? this.width : -this.width),
        mPointy2
      );
    });

    // draw small circles near each point
    this.points.forEach((p, i) => {
      const factor = i % 2 === 0 ? 1 : 2;
      this.canvas.drawImage(
        this.diamondCircleImage,
        p.x - this.cirlceImageRad / (2 * factor),
        p.y - this.cirlceImageRad / (2 * factor),
        this.cirlceImageRad / factor,
        this.cirlceImageRad / factor
      );
    });

    // draw left right top down border images
    if (this.topBorderImage) {
      this.canvas.drawImage(
        this.topBorderImage,
        0,
        0,
        this.totalWidth,
        this.paddingTop
      );
      this.canvas.drawImage(
        this.borderBottomImage,
        0,
        this.totalHeight - this.paddingBottom,
        this.totalWidth,
        this.paddingBottom
      );
      this.canvas.drawImage(
        this.leftRightBorderImage,
        0,
        this.paddingTop,
        this.paddingLeft,
        this.height
      );
      this.canvas.drawImage(
        this.leftRightBorderImage,
        this.totalWidth - this.paddingRight,
        this.paddingTop,
        this.paddingRight,
        this.height
      );
    } else {
      this.topBorderImage = new Image();
      this.topBorderImage.onload = () => {
        this.canvas.drawImage(
          this.topBorderImage,
          0,
          0,
          this.totalWidth,
          this.paddingTop
        );
      };
      this.topBorderImage.src = topBorderImage;

      this.borderBottomImage = new Image();
      this.borderBottomImage.onload = () => {
        this.canvas.drawImage(
          this.borderBottomImage,
          0,
          this.totalHeight - this.paddingBottom,
          this.totalWidth,
          this.paddingBottom
        );
      };
      this.borderBottomImage.src = bottomBorderImage;

      this.leftRightBorderImage = new Image();
      this.leftRightBorderImage.onload = () => {
        this.canvas.drawImage(
          this.leftRightBorderImage,
          0,
          this.paddingTop,
          this.paddingLeft,
          this.height
        );
        this.canvas.drawImage(
          this.leftRightBorderImage,
          this.totalWidth - this.paddingRight,
          this.paddingTop,
          this.paddingRight,
          this.height
        );
      };
      this.leftRightBorderImage.src = leftRightBorderImage;
    }
  }

  /**
   * draw tigers on board
   */
  drawTigers() {
    this.tigers.forEach((element) => {
      if (element.drag) {
        return;
      }
      this.drawTigerImage(element, this.canvas);
    });
  }

  drawTigerImage(point, canvas) {
    if (this.tigerImage) {
      canvas.drawImage(
        this.tigerImage,
        point.x - this.tigerWidth / 2,
        point.y - this.tigerHeight / 2,
        this.tigerWidth,
        this.tigerHeight
      );
      return true;
    }
    this.tigerImage = new Image();
    this.tigerImage.onload = () => {
      canvas.drawImage(
        this.tigerImage,
        point.x - this.tigerWidth / 2,
        point.y - this.tigerHeight / 2,
        this.tigerWidth,
        this.tigerHeight
      );
      this.drawTigers();
    };
    this.tigerImage.src = tigerImage;
  }

  /**
   * draw goats on standby rectangle or on board
   */
  renderGoats() {
    this.goats.forEach((point) => {
      if (point.dead || point.drag) {
        return;
      }
      this.drawBoardGoat(point, this.canvas);
    });
  }

  /**
   * method to draw goat
   * @param {*} x1
   * @param {*} y1
   * @param {*} canvas fake/real canvas object
   */
  drawBoardGoat(point, canvas) {
    canvas.beginPath();
    canvas.globalCompositeOperation = "source-over";
    if (this.goatImage) {
      canvas.drawImage(
        this.goatImage,
        point.x - this.goatWidth / 2,
        point.y - this.goatHeight / 2,
        this.goatWidth,
        this.goatHeight
      );
    } else {
      this.goatImage = new Image();
      this.goatImage.onload = () => {
        canvas.drawImage(
          this.goatImage,
          point.x - this.goatWidth / 2,
          point.y - this.goatHeight / 2,
          this.goatWidth,
          this.goatHeight
        );
      };
      this.goatImage.src = goatImage;
    }
    canvas.closePath();
  }

  /**
   * method to draw line on canvas
   * @param {} x1
   * @param {*} y1
   * @param {*} x2
   * @param {*} y2
   */
  drawLine(x1, y1, x2, y2) {
    this.canvas.beginPath();
    this.canvas.moveTo(x1, y1);
    this.canvas.lineTo(x2, y2);
    this.canvas.strokeStyle = "#636363";
    this.canvas.lineWidth = 1;
    this.canvas.lineCap = "round";
    this.canvas.stroke();
    this.canvas.closePath();
  }

  /**
   * method to get canvas positio on current window
   */
  getCanvasPosition() {
    let box = this.realCanvasElement.getBoundingClientRect();
    let scrollLeft = this.realCanvasElement.parentNode.scrollLeft;
    let scrollTop = this.realCanvasElement.parentNode.scrollTop;
    let body = document.body;
    let docEl = document.documentElement;

    scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    let clientTop = docEl.clientTop || body.clientTop || 0;
    let clientLeft = docEl.clientLeft || body.clientLeft || 0;
    let top = box.top + scrollTop - clientTop;
    let left = box.left + scrollLeft - clientLeft;
    return { top: Math.round(top), left: Math.round(left) };
  }

  /**
   * show fake canvas for the animation purpose
   */
  showFakeCanvas() {
    this.fakeCanvas.clearRect(0, 0, this.totalHeight, this.totalWidth);
    this.fakeCanvasElement.classList.remove("hide");
  }
  /**
   * hide fake canvas once animation is over
   */
  hideFakeCanvas() {
    this.fakeCanvas.clearRect(0, 0, this.totalHeight, this.totalWidth);
    this.fakeCanvasElement.classList.add("hide");
  }

  /**
   * move the tiger after user moves the goat
   */
  renderComputerTigerMove() {
    let avilableTigers = [];
    this.tigers.forEach((tigerPoint, i) => {
      let pointIndex;
      for (let j in this.points) {
        const point = this.points[j];
        if (
          parseInt(point.x) == parseInt(tigerPoint.x) &&
          parseInt(point.y) == parseInt(tigerPoint.y)
        ) {
          pointIndex = j;
          break;
        }
      }
      let nextMovePossibleMoves = this.getNextPossibleMove(pointIndex);
      if (nextMovePossibleMoves.length > 0) {
        avilableTigers.push({
          tiger: i,
          point: pointIndex,
          possibleMoves: nextMovePossibleMoves,
        });
      }
    });
    const deadGoats = this.goats.filter((g) => g.dead).length;
    const goatsInBoard = this.goats.filter((g) => !g.dead).length;
    if (avilableTigers.length > 0) {
      let tigerData = null;

      // Filter out only eatable goats as first priority, start
      const goatEatingTigers = [];
      avilableTigers.forEach((tiger) => {
        const goatEatingMoves = [];
        tiger.possibleMoves.forEach((possibleMove) => {
          // check if the move can eat goat
          if (possibleMove.eatGoat) {
            goatEatingMoves.push(possibleMove);
          }
        });

        // check if each tiger has goat eating moves
        if (goatEatingMoves.length) {
          tiger.possibleMoves = goatEatingMoves;
          goatEatingTigers.push(tiger);
        }
      });
      // check if there are goat eating tigers
      if (goatEatingTigers.length) {
        avilableTigers = goatEatingTigers;
      }
      // Filter out only eatable goats as first priority, end

      // getting next best move for tiger, will be improved later
      const bestMove = this.logic.getNextBestMove(TIGER, avilableTigers);
      if (bestMove.eatGoat) {
        // eats the goat
        if (this.playSound) {
          this.sound.play("tiger");
        }
      }
      if (goatsInBoard === 20) {
        this.gameCompleted(GOAT);
        return false;
      }
      if (deadGoats >= 5) {
        this.gameCompleted(TIGER);
        return false;
      }
      this.moveTiger(bestMove);
    } else {
      // GOATS WINS the Game
      this.gameCompleted(this.chosenItem);
    }
    const updatedDeadGoats = this.goats.filter((g) => g.dead).length;
    const updatedBoardGoats = this.goats.filter((g) => !g.dead).length;
    this.deadGoatIndicator.innerHTML = `Dead Goats: ${updatedDeadGoats}`;
    this.goatBoardIndicator.innerHTML = `Goats in Board : ${updatedBoardGoats}`;
  }
  /**
   * remove duplicate values
   */
  isDuplicate(entry, arr) {
    return arr.some((x) => entry.x == x.x && entry.y == x.y);
  }
  renderGoatStatus(updatedGoats) {
    const deadGoats = this.goats.filter((g) => g.dead).length;
    this.deadGoatIndicator.innerHTML = `Dead Goats: ${deadGoats}`;
    const goatsInBoard = updatedGoats.filter((g) => !g.dead).length;
    this.goatBoardIndicator.innerHTML = `Goats in Board : ${goatsInBoard}`;
    if (goatsInBoard >= 20) {
      this.gameCompleted(GOAT);
      return false;
    }
    if (deadGoats >= 5) {
      this.gameCompleted(TIGER);
      return false;
    }
    this.render();
  }

  /**
   * render goat after user moves tiger
   */
  renderComputerGoatMove() {
    const nextBestMove = this.logic.getNextBestMove(GOAT);
    if (nextBestMove) {
      // only used "new" and "move" because it was used in this file
      let goatType = "new";
      let nextPoint = null;
      // in case of put, goatPoint is just a board point
      let goatPoint = nextBestMove.move;
      if (nextBestMove.type == MOVE) {
        goatType = "move";
        nextPoint = nextBestMove.destinationPoint;
        // in case of move, goatPoint is a goat value from this.goats
        goatPoint = this.goats
          .filter((g) => !g.dead)
          .find((goat) => goat.currentPoint == nextBestMove.sourcePoint);
      }
      this.moveGoat(nextPoint, goatPoint, goatType, COMPUTER);
    }

    let updatedGoats = [];
    for (const entry of this.goats) {
      if (!this.isDuplicate(entry, updatedGoats)) {
        updatedGoats.push(entry);
      }
    }
    this.renderGoatStatus(updatedGoats);
    this.myTurn = true;
  }
  /**
   * get next possible moves of tiger/goat
   * @param {} pointIndex
   */
  getNextPossibleMove(pointIndex, type = TIGER) {
    pointIndex = Number(pointIndex);
    this.totalMoveAttempts++;

    const nextPossiblePoints = [5, -5]; // 5, -5 for move up down
    if (pointIndex % 2 === 0) {
      //can move diagonally
      if (pointIndex % 5 === 0) {
        // left conrner points
        nextPossiblePoints.push(-4, 6);
      } else if (pointIndex % 5 === 4) {
        // right corners
        nextPossiblePoints.push(4, -6);
      } else {
        nextPossiblePoints.push(4, -4, 6, -6);
      }
    }

    if (pointIndex % 5 === 0) {
      // left conrner points
      nextPossiblePoints.push(1);
    } else if (pointIndex % 5 === 4) {
      // right corner points
      nextPossiblePoints.push(-1);
    } else {
      nextPossiblePoints.push(1, -1);
    }
    let nextLegalPoints = [];
    nextPossiblePoints.forEach((el) => {
      const index = Number(el) + Number(pointIndex);
      if (index >= 0 && index <= this.totalPoints) {
        nextLegalPoints.push(index);
      }
    });
    if (type === GOAT) {
      let goatLegalPoints = nextLegalPoints.map((p) => {
        if (!this.points[p] || (this.points[p] && this.points[p].item)) {
          return false;
        }
        const point = {
          point: p,
          canDie: false,
          tigerJumpPoint: null,
          possibleTigerPoint: null,
        };
        const goatMoveDistance = p - pointIndex;
        const tigerJumpPoint = Number(p) + Number(goatMoveDistance);
        // get the distance between current position and next position
        // and double the distance is where tiger will jump to eat goat
        if (
          tigerJumpPoint < 0 ||
          tigerJumpPoint > this.totalPoints ||
          ([1, 4, 6].indexOf(Math.abs(goatMoveDistance)) >= 0 &&
            (p % 5 === 4 || p % 5 === 0))
        ) {
          return point;
        }
        const eatPoint = this.points[goatMoveDistance];
        if (!eatPoint) {
          return point;
        }
        if (eatPoint.item) {
          return point;
        }

        const possibleTigerPoint = Number(p) - Number(goatMoveDistance);
        if (possibleTigerPoint < 0 || possibleTigerPoint > this.totalPoints) {
          return point;
        }
        const tigerPoint = this.points[goatMoveDistance];
        if (!tigerPoint) {
          return point;
        }
        if (tigerPoint.item !== TIGER) {
          return point;
        }
        return {
          point: p,
          canDie: true,
          tigerJumpPoint,
          possibleTigerPoint,
        };
      });
      goatLegalPoints = goatLegalPoints.filter((p) => p);
      return goatLegalPoints;
    }
    nextLegalPoints = nextLegalPoints.map((p) => {
      const point = this.points[p];
      if (point.item === GOAT) {
        const tigerMoveDistance = p - pointIndex;
        const tigerEatPoint = Number(p) + Number(tigerMoveDistance);
        // get the distance between current position and next position
        // and double the distance is where tiger will jump to eat goat
        if (
          tigerEatPoint < 0 ||
          tigerEatPoint > this.totalPoints ||
          ([1, 4, 6].indexOf(Math.abs(tigerMoveDistance)) >= 0 &&
            (p % 5 === 4 || p % 5 === 0))
        ) {
          // if next eat point is less than zero or greater thant totalPoint
          // or the goat is at right most point or goat is at left most point
          return null;
        }

        const eatPoint = this.points[tigerEatPoint];
        if (eatPoint && !eatPoint.item) {
          return {
            point: tigerEatPoint,
            eatGoat: true,
            eatGoatIndex: point.itemIndex,
          };
        }
        return null;
      } else if (!point.item) {
        return { point: p, eatGoat: false };
      }
      return null;
    });
    return nextLegalPoints.filter((p) => p);
  }

  drawText(x, y, side, text) {
    this.canvas.beginPath();
    this.canvas.font = "20px Arial";
    this.canvas.fillStyle = "#000";
    this.canvas.fillText(
      text,
      side === "vertical" ? x : x - 15,
      side === "vertical" ? y - 10 : y
    );
    this.canvas.closePath();
  }
  /**
   *
   * @param {tiger/goat} item
   * @param {{prevPoint:this.tigers[tigerToMove.tiger],nextPoint:tigerNewPoint,currentPoint:tigerMovePoint.point}} data
   */
  showMoveAnimation(item, data) {
    return new Promise((resolve, reject) => {
      const frameRate = 24;
      this.animationInProgress = true;
      if (item === TIGER) {
        const prevPoint = data.prevPoint;
        const nextPoint = data.nextPoint;
        let frame = 0;
        let x = prevPoint.x;
        let y = prevPoint.y;
        const dx = nextPoint.x - prevPoint.x;
        const dy = nextPoint.y - prevPoint.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const xIncrement = dx / frameRate;
        const yIncrement = dy / frameRate;
        this.tigers[prevPoint.index] = {
          x: -2000,
          y: -2000,
          currentPoint: data.currentPoint,
        };
        const animationFrame = setInterval(() => {
          if (frame < 10) {
            this.showFakeCanvas();
          }
          this.fakeCanvas.clearRect(0, 0, this.width * 1.2, this.height * 1.2);
          this.drawTigerImage({ x: x, y: y }, this.fakeCanvas);
          if (absDx < 1) {
            y += yIncrement;
          } else if (absDy < 1) {
            x += xIncrement;
          } else {
            x += xIncrement;
            y = (dy / dx) * (x - prevPoint.x) + prevPoint.y;
          }
          if (frame > frameRate) {
            this.animationInProgress = false;
            this.tigers[prevPoint.index] = {
              x: nextPoint.x,
              y: nextPoint.y,
              drag: false,
              index: prevPoint.index,
              currentPoint: nextPoint.index,
            };
            this.render();
            this.hideFakeCanvas();
            clearInterval(animationFrame);
            return resolve(item);
          }
          frame++;
        }, 20);
      } else {
        // {type:'new',pointData:{x:point.x,y:point.y,dead: false,drag: false,index:this.goats.length,currentPoint:point.index}
        const pointData = data.pointData;
        const midPoint = this.totalWidth / 2;
        let x = data.type === "new" ? midPoint : this.goats[pointData.index].x;
        let y = data.type === "new" ? 0 : this.goats[pointData.index].y;
        const dx = pointData.x - x;
        const dy = pointData.y - y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const xIncrement = dx / frameRate;
        const yIncrement = dy / frameRate;
        let frame = 0;
        if (data.type === "move") {
          this.goats[pointData.index].x = -200;
          this.goats[pointData.index].y = -200;
          this.render();
        }
        const animationFrame = setInterval(() => {
          if (frame < 10) {
            this.showFakeCanvas();
          }
          this.fakeCanvas.clearRect(0, 0, this.width * 1.2, this.height * 1.2);
          this.drawBoardGoat({ x: x, y: y }, this.fakeCanvas);
          if (absDx < 1) {
            y += yIncrement;
          } else if (absDy < 1) {
            x += xIncrement;
          } else {
            x += xIncrement;
            y = (dy / dx) * (x - midPoint);
          }
          if (frame > frameRate) {
            this.animationInProgress = false;
            if (data.type === "new") {
              this.goats.push(pointData);
              this.renderGoatStatus(this.goats);
            } else {
              this.goats[pointData.index].x = pointData.x;
              this.goats[pointData.index].y = pointData.y;
              this.goats[pointData.index].currentPoint = pointData.currentPoint;
            }
            this.render();
            this.hideFakeCanvas();
            clearInterval(animationFrame);
            return resolve(item);
          }
          frame++;
        }, 20);
      }
    });
  }

  /**
   * method to move goat from both computer or friends move
   */
  moveGoat(nextPoint, goatPoint, type = "new", source = FRIEND) {
    if (type === "move") {
      // here goatPoint is an element of this.goats[index]
      const point = this.points.find((point) => point.index == nextPoint);
      // release goat from prev point
      this.points[goatPoint.currentPoint].item = null;
      this.points[goatPoint.currentPoint].itemIndex = null;
      // map new goat position to points
      point.item = GOAT;
      point.itemIndex = goatPoint.index;
      // show animation and change goat point

      this.showMoveAnimation(GOAT, {
        type: "move",
        pointData: {
          x: point.x,
          y: point.y,
          currentPoint: point.index,
          index: goatPoint.index,
        },
      }).then((result) => {
        this.showMoveNotification(this.chosenItem);
      });
    } else {
      if (source === COMPUTER) {
        goatPoint.currentPoint = goatPoint.index;
      }
      // here goatPoint is an element of the this.points[i]
      this.points[goatPoint.currentPoint].item = GOAT;
      this.points[goatPoint.currentPoint].itemIndex = this.goats.length;
      this.showMoveAnimation(GOAT, {
        type: "new",
        pointData: {
          x: goatPoint.x,
          y: goatPoint.y,
          dead: false,
          drag: false,
          index: this.goats.length,
          currentPoint: goatPoint.currentPoint,
        },
      }).then((result) => {
        this.showMoveNotification(this.chosenItem);
      });
    }
  }

  /**
   * method to move tiger for both computer or friends move
   * @param tigerData { tigerIndex: index from tigers array, tigerNextPointIndex: tigerNextPointIndex,   eatGoat: boolean,  eatGoatIndex: number };
   */
  moveTiger(tigerData) {
    if (tigerData.eatGoat) {
      const currentEatenGoatIndex =
        this.goats[tigerData.eatGoatIndex].currentPoint;
      this.points[currentEatenGoatIndex].item = null;
      this.points[currentEatenGoatIndex].itemIndex = null;
      this.goats[tigerData.eatGoatIndex] = {
        x: 0,
        y: 0,
        dead: true,
        currentPoint: -currentEatenGoatIndex,
      };
    }

    const tigerNewPoint = this.points[tigerData.nextPointIndex];
    // release prev tiger index from all points
    const currentTigerPointIndex =
      this.tigers[tigerData.tigerIndex].currentPoint;
    this.points[currentTigerPointIndex].item = null;
    this.points[currentTigerPointIndex].itemIndex = null;

    const animationTigerData = {
      prevPoint: this.tigers[tigerData.tigerIndex],
      nextPoint: tigerNewPoint,
      currentPointIndex: tigerData.tigerIndex,
    };
    this.showMoveAnimation(TIGER, animationTigerData).then((result) => {
      // this.showMoveNotification(this.chosenItem);
      if (tigerData.eatGoat) {
        // HIDE POP UP THAT'S Causing problem
        this.moveIndicator.innerHTML = `🐅 ate 🐐!`;
        if (this.friend !== COMPUTER) {
          this.showMoveNotification(this.chosenItem, `🐅 ate your 🐐!`);
        }
        setTimeout(() => {
          this.showMoveNotification(this.chosenItem);
        }, 500);
      } else {
        // this.showMoveNotification(this.chosenItem);
      }
    });
    // add new reference of tiger to the points
    this.points[tigerData.nextPointIndex].item = TIGER;
    this.points[tigerData.nextPointIndex].itemIndex = tigerData.tiger;
  }

  /**
   * method to send current users goat move/add data to friend
   * @param data {nextPoint, goatPoint, type}
   *
   */
  sendGoatMoveDataToFriend(data) {
    this.socket.sendMoveDataToFriend(data, GOAT);
    setTimeout(() => {
      this.myTurn = false;
    }, 500);
    this.persistDataMovement(data);
  }
  /**
   *
   * @param {*} matchData  persist data to backend
   */
  persistDataMovement(data) {
    let matcheData = window.game.bagchal._matchData;
    matcheData.moves = data;
    matcheData.playerTurn ^= 1;
    const socket = this.socket;
    const playerSocketId = socket.player.socketId;
    const friendSocketId = socket.friend.socketId;
    this.saveDataAsync(matcheData, playerSocketId, friendSocketId)
      .then(
        function () {
          return this.getPlayerImageAsync();
        }.bind(this)
      )
      .then(
        function (image) {
          // let updateConfig = this.getUpdateConfig(image)
          // return FBInstant.updateAsync(updateConfig)
        }.bind(this)
      )
      .then(function () {
        // closes the game after the update is posted.
        // FBInstant.quit();
      });
  }

  saveDataAsync(matchData, playerSocketId, friendSocketId) {
    const backend = new Backend("https://wiggly-licorice.glitch.me/");
    return new Promise(function (resolve, reject) {
      FBInstant.player
        .getSignedPlayerInfoAsync(JSON.stringify(matchData))
        .then(function (result) {
          return backend.save(
            FBInstant.context.getID(),
            result.getPlayerID(),
            result.getSignature(),
            playerSocketId,
            friendSocketId
          );
        })
        .then(function () {
          resolve(matchData);
        })
        .catch(function (error) {
          console.error(error, "error");
          reject(error);
        });
    });
  }
  /**
   * create image of the game to send it back to friend
   */
  getPlayerImageAsync() {
    return new Promise(function (resolve, reject) {
      var sceneRoot = document.getElementById("game-box");
      var sceneWidth = sceneRoot.offsetWidth;
      html2canvas(sceneRoot, {
        width: sceneWidth * 3,
        x: -sceneWidth,
      })
        .then(function (canvas) {
          resolve(canvas.toDataURL("image/png"));
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  getUpdateConfig(base64Picture) {
    var isMatchWon = this.isMatchWon();
    var isBoardFull = this.isBoardFull();
    var updateData = null;
    var playerName = FBInstant.player.getName();

    if (isMatchWon) {
      // Game over, player won
      updateData = {
        action: "CUSTOM",
        cta: "Rematch!",
        image: base64Picture,
        text: {
          default: playerName + " has won!",
          localizations: {
            pt_BR: playerName + " venceu!",
            en_US: playerName + " has won!",
            de_DE: playerName + " hat gewonnen",
          },
        },
        template: "match_won",
        data: {
          rematchButton: true,
        },
        strategy: "IMMEDIATE",
        notification: "NO_PUSH",
      };
    } else if (isBoardFull) {
      // Game over, tie
      updateData = {
        action: "CUSTOM",
        cta: "Rematch!",
        image: base64Picture,
        text: {
          default: "It's a tie!",
          localizations: {
            pt_BR: "Deu empate!",
            en_US: "It's a tie!",
            de_DE: "Es ist ein unentschiedenes Spiel!",
          },
        },
        template: "match_tie",
        data: {
          rematchButton: true,
        },
        strategy: "IMMEDIATE",
        notification: "NO_PUSH",
      };
    } else {
      // Next player's turn
      // updateData = {
      //   action: 'CUSTOM',
      //   cta: 'Play your turn!',
      //   image: base64Picture,
      //   text: {
      //     default: playerName + ' has played. Now it\'s your turn',
      //     localizations: {
      //       pt_BR: playerName + ' jogou. Agora é sua vez!',
      //       en_US: playerName + ' has played. Now it\'s your turn',
      //       de_DE: playerName + ' hat gespielt. Jetzt bist du dran.'
      //     }
      //   },
      //   template: 'play_turn',
      //   data: {
      //     rematchButton: false
      //   },
      //   strategy: 'IMMEDIATE',
      //   notification: 'NO_PUSH',
      // };
    }

    return updateData;
  }

  isMatchWon() {
    // match won conditions
    return false;
  }

  isBoardFull() {
    return false;
  }
  /**
   *
   * @param {*} data
   */
  /**
   * send current user's tiger move data to friend
   * @param data {prevPointIndex,nextPointIndex,tiger: draggedTiger}
   */
  sendTigerMoveDataToFriend(data) {
    // send tiger moved data
    this.socket.sendMoveDataToFriend(data, TIGER);
    setTimeout(() => {
      this.myTurn = false;
    }, 500);
    this.persistDataMovement(data);
  }

  addUIDOMToGame() {
    mount(
      this.infoBox,
      el(
        "div",
        (this.moveNotificationModal = el(
          "div.move-notification-modal.hide",
          el(
            "div.wrapper",
            el("p", "Test"),
            el("button.close-notifcation.hide#close-notifcation", "")
          )
        )),
        (this.selectItem = el(
          "div.select-option#select-option",
          el(
            "div.container-fluid",
            el("div.game-name", ""),
            el("p", "A Hunt for Goats"),
            (this.playWithInterface = el(
              "div.play-with-interface#play-with-interface",

              // el("p", "A Hunt for Goats"),
              el(
                "div.play-options",
                el("button.play-with-computer", "")
                // el("button.play-with-friend", "")
              )
            )),
            (this.inputNameInterface = el(
              "div.input-user-name.hide",

              el("p", "Enter your Name"),
              el(
                "div.input-group",
                (this.playerNameInput = el("input.form-control", {
                  placeholder: "Enter Your Name",
                })),
                (this.submitInputName = el(
                  "div.input-group-append",
                  el("button.btn.btn-info.active", "Submit")
                ))
              )
            )),
            (this.friendsListInterface = el("div.friends-list.hide")),
            (this.friendRequestWaitModal = el(
              "div.friend-request-wait-modal.hide",
              el("div.wait-wrapper", el("p"))
            )),
            (this.requestNotificationModal = el(
              "div.friend-request-notification.hide",
              el(
                "div.req-holder",
                el("p", ""),
                el("button.btn.accept-friend-request", "Start Game")
              )
            )),
            (this.difficultyLevelInterface = el(
              "div.difficulty-level-interface.hide",
              el("p", "Level"),
              el(
                "div.difficulty-levels",
                el("button.easy", "Easy"),
                el("button.medium", "Medium"),
                el("button.hard", "Hard")
              )
            )),
            (this.selectItemInterface = el(
              "div.select-interface.hide#select-interface",
              el("p", "Play as?"),
              el(
                "div.pick-options",
                el(
                  "button",
                  {
                    class: "select-turn-btn tiger",
                  },
                  ""
                ),
                el("button", { class: "select-turn-btn goat" }, "")
              ),
              el(
                "div.sound-settings.text-right",
                (this.playSoundButton = el("button.play-sound", ""))
              )
            ))
          )
        ))
      )
    );
    mount(
      this.infoBox,
      (this.genralInfo = el(
        "div.container-fluid.goat-box",
        el(
          "div.row",
          el(
            "div.col-xs-4",
            (this.goatBoardIndicator = el("p", `Goats in board : 0`))
          ),
          el(
            "div.col-xs-4.text-center",
            (this.displayChosenItem = el("p", "You Choose"))
          ),
          el(
            "div.col-xs-4.text-right",
            (this.deadGoatIndicator = el("p", `Dead Goats: 0`))
          )
        )
      ))
    );

    this.emitSocket = () => {
      let name = FBInstant.player.getName();
      // HERE Initialise the Socket Object and Send User Name  to Server
      this.socket = new Socket(name);
      // hide add name interface
      this.inputNameInterface.classList.add("hide");
      //handle events dispatched from socket
      this.handleSocketEvents();

      return this.socket;
    };
    this.getSocketId = () => {
      return this.socket.player.socketId();
    };
    /**
     * =============================================
     * UI INTRACTION
     * =============================================
     */
    // user selects with whom he want to play with (computer or friend)
    this.playWithInterface.querySelectorAll("button").forEach((element) => {
      element.addEventListener("click", (event) => {
        var _this = this;
        if (event.target.classList.contains("play-with-friend")) {
          this.friend = FRIEND;
          let contextId = this.FBInstant.context.getID();
          const backend = new Backend("https://wiggly-licorice.glitch.me");
          FBInstant.context.chooseAsync().then(function () {
            let game = this.game;
            backend.clear(FBInstant.context.getID()).then(function () {
              // setTimeout(function(){
              game.start();
              // }, 1000)
            });
          });

          // this.inputNameInterface.classList.remove('hide');
        } else {
          this.difficultyLevelInterface.classList.remove("hide");
          this.friend = COMPUTER;
          this.playWithInterface.classList.add("hide");
        }
      });
    });

    // IF USER SELECT WITH FRIEND GET HIS NAME AND SEND TO SERVER

    this.submitInputName.addEventListener("click", (event) => {
      event.preventDefault();
      const userName = this.playerNameInput.value;
      if (!userName) {
        alert("Enter Valid Name");
        return false;
      }
      // HERE Initialise the Socket Object and Send User Name  to Server
      this.socket = new Socket(userName);
      // hide add name interface
      this.inputNameInterface.classList.add("hide");
      // handle events dispatched from socket
      this.handleSocketEvents();
      this.friendsListInterface.classList.remove("hide");
    });

    // mute unmute sound button
    this.playSoundButton.addEventListener("click", () => {
      if (this.playSoundButton.classList.contains("play-sound")) {
        this.playSoundButton.classList.remove("play-sound");
        this.playSoundButton.classList.add("mute-sound");
        this.playSound = false;
      } else {
        this.playSoundButton.classList.add("play-sound");
        this.playSoundButton.classList.remove("mute-sound");
        this.playSound = true;
      }
    });

    /**
     * USER SELECTS TIGER OR GOAT
     */
    this.selectItem.querySelectorAll(".select-turn-btn").forEach((element) => {
      // update info
      element.addEventListener("click", (event) => {
        if (event.target.classList.contains(TIGER)) {
          this.chosenItem = TIGER;
          if (this.playSound) {
            this.sound.play("tiger");
          }
        } else {
          this.chosenItem = GOAT;
          if (this.playSound) {
            this.sound.play("goat");
          }
        }

        document.getElementById("game-box").style.background = "none";
        this.myTurn = this.chosenItem === GOAT ? true : false;

        this.displayChosenItem.innerHTML = `<span>You:   <span class="player-icon-${
          this.chosenItem === GOAT ? "goat" : "tiger"
        }"> </span></span>`;
        this.selectItem.classList.add("hide");
        this.moveCount.innerHTML = `Moves: 0`;
        // IF user is playing with computer
        if (this.chosenItem === GOAT) {
          this.showMoveNotification(GOAT);
        }
        if (this.friend == COMPUTER && this.chosenItem === TIGER) {
          this.firstGoatRender++;
          this.renderComputerGoatMove();
        } else {
          // send item chosen info to friend
          // logic happens here
          // let matchData = window.game.bagchal._matchData;
          // matchData.avatar = this.chosenItem;
          // this.socket.friendChoseTigerGoat(this.chosenItem);
        }
        this.showGameNotification(this.chosenItem);
      });
    });

    // SELECT DIFFICULTY LEVEL FOR PLAYING WITH COMPUTER
    this.difficultyLevelInterface
      .querySelectorAll("button")
      .forEach((element) => {
        element.addEventListener("click", (event) => {
          // this.selectItem.classList.remove("cover");
          if (event.target.classList.contains("easy")) {
            this.difficultyLevel = 1;
          } else if (event.target.classList.contains("medium")) {
            this.difficultyLevel = 2;
          } else {
            this.difficultyLevel = 3;
          }
          // initialise new logic object for playing with friend
          this.logic = new Logic(this, this.difficultyLevel);
          this.difficultyLevelInterface.classList.add("hide");
          this.selectItemInterface.classList.remove("hide");
        });
      });

    // HANDLE CLICK ON ACCEPT FRIEND REQUEST
    this.requestNotificationModal
      .querySelector(".accept-friend-request")
      .addEventListener("click", () => {
        this.socket.acceptFriendRequest();
        this.requestNotificationModal.classList.add("hide");
        this.friendRequestWaitModal.classList.remove("hide");
        this.friendRequestWaitModal.querySelector("p").innerHTML =
          "Wait! Let your friend choose the tiger/goat";
      });
  }

  gameCompleted(avatar) {
    const d = document;
    const body = d.querySelector("body");
    const buttons = d.querySelectorAll("[data-modal-trigger]");
    // attach click event to all modal triggers
    for (let button of buttons) {
      triggerEvent(button);
    }

    function triggerEvent(button) {
      // button.addEventListener('click', () => {
      const trigger = button.getAttribute("data-modal-trigger");
      const modal = d.querySelector(`[data-modal=${trigger}]`);
      const modalBody = modal.querySelector(".modal-body");
      // const closeBtn = modal.querySelector(".close");
      document.getElementById("game-end-heading").innerHTML = ` Alas, the ${
        avatar === "goat" ? "🐐" : "🐅"
      } has claimed victory!`;
      // closeBtn.addEventListener("click", () =>
      //   modal.classList.remove("is-open")
      // );
      modal.addEventListener("click", () => modal.classList.remove("is-open"));
      const gameResetButton = document.getElementById("game-reset-btn");

      modalBody.addEventListener("click", (e) => e.stopPropagation());

      modal.classList.toggle("is-open");
      const _this = this;
      gameResetButton.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.remove("is-open");
        const previousGameBoard = document.getElementsByClassName("game-box");
        if (previousGameBoard) previousGameBoard[0].remove();
        window.location.reload();
      });

      // Close modal when hitting escape
      body.addEventListener("keydown", (e) => {
        if (e.keyCode === 27) {
          modal.classList.remove("is-open");
        }
      });
      //  });
    }
  }

  /**
   * Method to handle event dispatched from socket
   */
  handleSocketEvents() {
    this.socket.dispatcher.on("setUserInfo", this.setUserInfo.bind(this));
    this.socket.dispatcher.on(
      "updateOnlineUsers",
      this.updateOnlineUsers.bind(this)
    );
    this.socket.dispatcher.on(
      "friendSendsRequest",
      this.showFriendRequestNotification.bind(this)
    );
    this.socket.dispatcher.on(
      "requestAccepted",
      this.friendRequestAccepted.bind(this)
    );
    this.socket.dispatcher.on(
      "friendChoseItem",
      this.friendChooseItem.bind(this)
    );
    this.socket.dispatcher.on(
      "friendMovedItem",
      this.handleFriendMove.bind(this)
    );
    this.socket.dispatcher.on("closeGame", this.closeGame.bind(this));
  }
  setUserInfo(data) {
    this.player = data;
  }
  closeGame(data) {
    // data.friendId, data.socketId
    let _this = this;
    let contextId = this.FBInstant.context.getID();
    const backend = new Backend("https://wiggly-licorice.glitch.me");
    backend.clear(contextId).then(function () {
      _this.FBInstant.quit();
      location.reload();
    });
    // backend.delete(data.person.friendId, data.person.socketId).then(()=> {
    //   location.reload();
    // })
  }
  updateOnlineUsers(data) {
    const users = data.filter((u) => u.socketId != this.player.socketId);
    const onlineUsers = list(`ul.online-users`, OnlineUsersList);
    this.friendsListInterface.innerHTML = "";
    mount(this.friendsListInterface, onlineUsers);
    onlineUsers.update(users);
    this.friendsListInterface
      .querySelectorAll(".send-friend-req")
      .forEach((el) => {
        el.addEventListener("click", (evt) => {
          evt.preventDefault();
          const friendId = el.getAttribute("socketId");
          this.socket.sendRequestToFriend(friendId);
          this.friendRequestWaitModal.classList.remove("hide");
          this.friendRequestWaitModal.querySelector("p").innerHTML =
            "Wait! Let your friend accept the request";
        });
      });
  }
  showFriendRequestNotification(data) {
    this.requestNotificationModal.classList.remove("hide");
    this.requestNotificationModal.querySelector(
      "p"
    ).innerHTML = `${data.name} Sends you request for playing game`;
  }
  showPlayerJoinGame() {
    this.friendRequestWaitModal.classList.remove("hide");
    this.friendRequestWaitModal.querySelector("p").innerHTML =
      "Wait! Let your friend start the game";
  }
  friendRequestAccepted(data) {
    this.friend = FRIEND;
    this.requestNotificationModal.classList.add("hide");
    this.friendsListInterface.classList.add("hide");
    this.friendRequestWaitModal.classList.add("hide");
    this.selectItemInterface.classList.remove("hide");
  }

  friendChooseItem(myItem) {
    this.selectItem.classList.add("hide");
    this.requestNotificationModal.classList.add("hide");
    this.friendsListInterface.classList.add("hide");
    this.friendRequestWaitModal.classList.add("hide");
    this.selectItemInterface.classList.remove("hide");
    this.friendRequestWaitModal.classList.add("hide");
    this.chosenItem = myItem;
    this.displayChosenItem.innerHTML = `You chose : ${this.chosenItem.toUpperCase()}`;
    this.myTurn = this.chosenItem === GOAT ? true : false;
    this.showMoveNotification(
      this.chosenItem,
      `Your Friend Choose ${this.chosenItem === TIGER ? GOAT : TIGER}`
    );
    if (this.chosenItem === GOAT) {
      setTimeout(() => {
        this.showMoveNotification(this.chosenItem);
      }, 2100);
    } else {
      setTimeout(() => {
        this.showMoveNotification(
          this.chosenItem,
          "Please Wait.. Friends Turn"
        );
      }, 2100);
    }
  }
  showGameNotification(item) {
    this.moveNotificationModal.classList.remove("hide");
    this.moveNotificationModal.querySelector("p").innerHTML =
      `You choose ` +
      "<b>" +
      `${this.chosenItem === TIGER ? TIGER : GOAT}` +
      "</b>" +
      `. To win this game you have to ${
        this.chosenItem === TIGER
          ? "hunt five or more goats."
          : "surround the four tigers."
      }` +
      "<br/> <br/>" +
      ` One can move along any of the lines to an adjacent junction.
            There are free junctions on the board where goats can be placed.  Upon placement of all goats (20 goats), they can be moved to any adjacent junction following any straight line.
            Tigers can hunt goats placed at an adjacent junction by jumping over following a straight line and landing at the next junction adjacent to the position occupied by the goat. A tiger or goat cannot move a piece in such a way that a similar position appears repeatedly on the board.`;
    this.moveNotificationModal.querySelector("button").classList.remove("hide");
    this.moveNotificationModal
      .querySelector("button")
      .addEventListener("click", (event) => {
        event.preventDefault();
        this.moveNotificationModal.classList.add("hide");
      });
  }

  showMoveNotification(item, message = null) {
    if (message) {
      setTimeout(() => {
        this.moveNotificationModal.classList.remove("hide");
        this.moveNotificationModal.querySelector("p").innerHTML = message
          ? message
          : `It's your turn to move ${item}.`;
        setTimeout(() => {
          this.moveNotificationModal.classList.add("hide");
        }, 2000);
      }, 1000);
    }
    if (item) {
      if (this.myTurn) {
        this.moveIndicator.innerHTML = `It's your turn to move ${this.chosenItem}.`;
      } else {
        this.moveIndicator.innerHTML = `Wait! Its ${
          this.friend === COMPUTER ? "Computer's" : "friend's"
        } turn to move ${this.chosenItem === TIGER ? GOAT : TIGER}`;
      }
    }
  }

  handleFriendMove(data) {
    this.myTurn = true;
    const deadGoats = this.goats.filter((g) => g.dead).length;
    const goatsInBoard = this.goats.filter((g) => !g.dead).length;
    if (data.movedItem === GOAT) {
      let goatMovePoint = null;
      if (data.moveData.type === "new") {
        const friendClickedPoint = data.moveData.clickedPoint;
        const myClickedPoint = this.points[friendClickedPoint.index];
        goatMovePoint = {
          x: myClickedPoint.x,
          y: myClickedPoint.y,
          dead: false,
          drag: false,
          currentPoint: myClickedPoint.index,
          index: this.goats.length + 1,
        };
      } else {
        goatMovePoint = this.goats[prevPoint];
      }
      this.moveGoat(data.moveData.nextPoint, goatMovePoint, data.moveData.type);
    } else {
      this.moveTiger(data.moveData);
    }

    setTimeout(() => {
      this.showMoveNotification(this.chosenItem);
    }, 1100);
    this.render();
    if (goatsInBoard === 20) {
      this.gameCompleted(GOAT);
      return false;
    }
    if (deadGoats >= 5) {
      this.gameCompleted(TIGER);
      return false;
    }
    this.deadGoatIndicator.innerHTML = `Dead Goats: ${deadGoats}`;
    this.goatBoardIndicator.innerHTML = `Goats in Board : ${goatsInBoard}`;
  }
}
