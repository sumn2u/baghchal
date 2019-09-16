import tigerImage from "../images/tiger.png";
import goatImage from "../images/goat.png";
import { mount, el, list } from "../ui/dom";
import { TigerPossibleMoveList } from "./components/tiger-possible-move-list";
export class Board {
  constructor(realCanvasElement, fakeCanvasElement, dataContainer) {
    this.chosenItem = "tiger";
    this.dataContainer = dataContainer;
    this.realCanvasElement = realCanvasElement;
    this.fakeCanvasElement = fakeCanvasElement;
    mount(
      this.realCanvasElement.parentNode,
      (this.selectItem = el(
        "div.pos-absolute",
        el("h4", "Choose Tiger or Goat"),
        el(
          "div.btn-group",
          el(
            "button",
            {
              class: "btn btn-danger active tiger",
              style: "margin-right:15px"
            },
            "Tiger"
          ),
          el("button", { class: "btn btn-info active goat" }, "Goat")
        )
      ))
    );
    mount(
      this.dataContainer,
      el(
        "div",
        (this.genralInfo = el(
          "div.hide",
          (this.chooseItemIndicator = el("h4", "")),
          (this.resetButton = el(
            "button",
            { class: "btn btn-primary active" },
            "Reset Game"
          ))
        )),
        (this.moveIndicator = el("div"))
      )
    );

    this.realCanvasElement.classList.add("hide-visibility");
    this.selectItem.querySelectorAll(".btn").forEach(element => {
      element.addEventListener("click", event => {
        if (event.target.classList.contains("tiger")) {
          this.chosenItem = "tiger";
        } else {
          this.chosenItem = "goat";
        }
        this.realCanvasElement.classList.remove("hide-visibility");
        this.selectItem.classList.add("hide");
        this.chooseItemIndicator.innerHTML = `You chose ${this.chosenItem}`;
        this.genralInfo.classList.remove("hide");
      });
    });
    this.goats = []; // Array<{x:number,y:number,dead:false, currentPoint,drag: false,index: number;}>
    this.tigers = []; // Array<{x:number,y:number,currentPoint: number,drag: false,index: number}>

    this.totalHeight = 500;
    this.totalWidth = 500;
    this.totalPoints = 24;
    this.paddingLeft = 30;
    this.paddingRight = 30;
    this.paddingTop = 30;
    this.paddingBottom = 30;
    this.height = this.totalHeight - (this.paddingTop + this.paddingBottom);
    this.width = this.totalWidth - (this.paddingLeft + this.paddingRight);
    this.steps = 4;
    this.verticalStep = this.width / this.steps;
    this.horizontalStep = this.height / this.steps;
    this.firstGoatRender = 0;
    this.tigerImage = null;
    this.goatImage = null;
    this.verticalIndicators = [1, 2, 3, 4, 5];
    this.horizontalIndicators = ["A", "B", "C", "D", "E"];
    this.realCanvasElement.setAttribute("height", this.totalHeight);
    this.realCanvasElement.setAttribute("width", this.totalWidth);
    this.fakeCanvasElement.setAttribute("height", this.totalHeight + 50);
    this.fakeCanvasElement.setAttribute("width", this.totalWidth + 50);
    this.fakeCanvasElement.classList.add("hide");
    this.realCanvasElement.style.border = "1px solid #ccc";
    this.canvas = this.realCanvasElement.getContext("2d");
    this.fakeCanvas = this.fakeCanvasElement.getContext("2d");
   
    this.goatHeight = 40;
    this.goatWidth = 40;
    this.points = this.calculatePoints(); // Array<{x:number,y:number,index: number,item:'tiger or goat', itemIndex: number (tiger goat Index)}>;
    this.fillTigerPoints();
    this.mouseDown = false;
    this.mouseIntraction();
    this.totalMoveAttempts = 0;
    // item ready for drag
    this.dragItem = null;//  {item:'tiger',itemData:clickedPoint}
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
    this.realCanvasElement.addEventListener("mouseup", this.handleMouseUpEvent.bind(this));
    this.realCanvasElement.addEventListener("touchend",  this.handleMouseUpEvent.bind(this));
    this.fakeCanvasElement.addEventListener("mouseup", this.handleMouseUpEvent.bind(this));
    this.fakeCanvasElement.addEventListener("touchend",  this.handleMouseUpEvent.bind(this));
    /**
     * mouse move/ touch move event handler
     */
    this.fakeCanvasElement.addEventListener('mousemove', this.handleMouseMoveEvent.bind(this));
  }

  /**
   * method to handle mouse down event/touch start
   * @param {mouse event} event 
   */
  handelMouseDownEvent(event) {
    this.mouseDown = true;
    const x = event.pageX - this.canvasPosition.left;
    const y = event.pageY - this.canvasPosition.top;
    const clickedPoint = this.points.find(point=> {
        return x >= point.x - this.goatWidth &&
        x <= point.x + this.goatWidth &&
        y >= point.y - this.goatHeight &&
        y <= point.y + this.goatHeight
    });
    if(!clickedPoint){
      return true;
    }
    const i = clickedPoint.index;
    if( !clickedPoint.item && this.chosenItem==='goat' && this.goats.length<20){
        this.goats.push({
          x: clickedPoint.x,
          y: clickedPoint.y,
          dead: false,
          drag: false,
          currentPoint: i,
          index: this.goats.length
        }); // add new point to goat
        // track goat point to all points array
        this.points[i].item = "goat";
        this.points[i].itemIndex = this.goats.length-1;
        this.renderTigerMove();
    }else if(this.chosenItem==='goat' && this.goats.length===20){
        this.goats.forEach(g=> g.drag = g.currentPoint===i?true:false);
        this.dragItem = {item:'goat',point:clickedPoint}
    }else if(this.chosenItem==='tiger'){
      this.tigers.forEach(t=> t.drag = t.currentPoint===i?true:false);
      this.dragItem = {item:'tiger',point:clickedPoint}
    }
    if(!this.dragItem){
      return true;
    }
    this.showFakeCanvas();
    this.render();
  }

  /**
   * handle mouse down event
   * @param {mouse event} event 
   */
  handleMouseUpEvent(event){
    this.mouseDown = false;
    this.hideFakeCanvas();
    if(this.dragItem){    
      const x = event.pageX - this.canvasPosition.left;
      const y = event.pageY - this.canvasPosition.top;
      const releasedPoint = this.points.find(point=> {
          return x >= point.x - this.goatWidth &&
          x <= point.x + this.goatWidth &&
          y >= point.y - this.goatHeight &&
          y <= point.y + this.goatHeight
      }); 
      if(releasedPoint){        

        if(this.dragItem.item==='goat'){        
          const possiblePoints = this.getNextPossibleMove(this.dragItem.point.index,'goat');
          const validPoint = possiblePoints.find(p=>p===releasedPoint.index);
          if(validPoint){
            const draggedGoat = this.goats.find(g=>g.drag);
            if(draggedGoat){
              // release  item from prev point
              this.points[draggedGoat.currentPoint].item = null;
              this.points[draggedGoat.currentPoint].itemIndex = null;
              // update goat points
              this.goats[draggedGoat.index].x = x;
              this.goats[draggedGoat.index].y = y;
              this.goats[draggedGoat.index].currentPoint = releasedPoint.index;
              
              // add new item to points
              this.points[releasedPoint.index].item = 'goat';
              this.points[releasedPoint.index].itemIndex = draggedGoat.index;
              // computer turn to move tiger
              this.renderTigerMove();
            }
          }
        }else{
          const possiblePoints = this.getNextPossibleMove(this.dragItem.point.index,'tiger');
          const validPoint = possiblePoints.find(p=>p.point===releasedPoint.index);
          if(validPoint){
            const draggedTiger = this.tigers.find(t=>t.drag);
            console.log(draggedTiger);
            if(draggedTiger){
               // release  item from prev point
               this.points[draggedTiger.currentPoint].item = null;
               this.points[draggedTiger.currentPoint].itemIndex = null;
               // update tiger point
              this.tigers[draggedTiger.index].x = x;
              this.tigers[draggedTiger.index].y = y;
              this.tigers[draggedTiger.index].currentPoint = releasedPoint.index;
              // add this tiger reference to points array
              this.points[releasedPoint.index].item = 'tiger';
              this.points[releasedPoint.index].itemIndex = draggedTiger.index;
              // computer turns to move goat
              this.renderGoatMove();
            }
          }
        }
      } 
    }
    this.dragItem = null;
    this.goats.forEach(g=>g.drag = false);
    this.tigers.forEach(t=>t.drag = false);
    this.render();
  }

  handleMouseMoveEvent(event){
    if(!(this.mouseDown && this.dragItem)){
      return true;
    }
    const x = event.pageX - this.canvasPosition.left;
    const y = event.pageY - this.canvasPosition.top;
    this.fakeCanvas.clearRect(0,0,this.width*1.2,this.width*1.2)
    if(this.dragItem.item ==='goat'){
      this.drawBoardGoat({x,y},this.fakeCanvas);
    }else{
      this.drawTigerImage({x,y},this.fakeCanvas);
    }
  }
  /**
   * render all objects
   */
  render() {
    this.tigerMoveAttems = 0;
    this.canvas.clearRect(0, 0, this.totalWidth, this.totalHeight);
    this.drawBoard();
    this.drawTigers();
    this.renderGoats();
    this.firstGoatRender++;
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
        points.push({ x: x, y: y,index:points.length, item: null, itemIndex: null });
      }
    }
    return points;
  }
  /**
   * add points to tiger array while initialising the game
   */
  fillTigerPoints() {
    [0, 4, 20, 24].forEach((t,i) => {
      this.points[t].item = "tiger";
      this.points[t].itemIndex = t;
      const point = this.points[t];
      this.tigers.push({ x: point.x, y: point.y, currentPoint: t,drag:false,index: i });
    });
  }

  /**
   * draw square and lines for board
   */
  drawBoard() {
    let sides = ["vertical", "horizontal"];
    //draw inner rectangle
    let yMiddlePoint = this.paddingTop + this.height / 2;

    sides.forEach(element => {
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
        this.drawText(
          x1,
          y1,
          element,
          element === "vertical"
            ? this.horizontalIndicators[i]
            : this.verticalIndicators[i]
        );
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
  }

  /**
   * draw tigers on board
   */
  drawTigers() {
    this.tigers.forEach(element => {
      if(element.drag){
        return;
      }
     this.drawTigerImage(element,this.canvas);
    });
  }

  drawTigerImage(point,canvas){
    if (this.tigerImage) {
      canvas.drawImage(
          this.tigerImage,
        point.x - 30,
        point.y - 15,
          60,
          40
        );
      return true;
    }
    this.tigerImage = new Image();
    this.tigerImage.onload = () => {
    canvas.drawImage(
        this.tigerImage,
       point.x - 30,
       point.y - 15,
        60,
        40
      );
      this.drawTigers();
    };
    this.tigerImage.src = tigerImage;
  }
  /**
   * draw goats on standby rectangle or on board
   */
  renderGoats() {
    this.goats.forEach(point => {
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
       point.x - this.goatWidth,
       point.y - this.goatHeight,
        1.5 * this.goatWidth,
        1.5 * this.goatHeight
      );
    } else {
      this.goatImage = new Image();
      this.goatImage.onload = () => {
        canvas.drawImage(
          this.goatImage,
         point.x - this.goatWidth,
         point.y - this.goatHeight,
          1.5 * this.goatWidth,
          1.5 * this.goatHeight
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
    this.canvas.strokeStyle = "#03a9f4";
    this.canvas.lineWidth = 5;
    this.canvas.lineCap = "round";
    this.canvas.stroke();
    this.canvas.shadowOffsetX = 1;
    this.canvas.shadowOffsetY = 1;
    this.canvas.shadowBlur = 1;
    this.canvas.shadowColor = "#000";
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
  renderTigerMove() {
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
        avilableTigers.push({ tiger: i, possibleMoves: nextMovePossibleMoves });
      }
    });

    if (avilableTigers.length > 0) {
      const tigerCanEatGoat = avilableTigers.find(t =>
        t.possibleMoves.find(p => p.eatGoat)
      );
      if (tigerCanEatGoat) {
        const tigerEatPoint = tigerCanEatGoat.possibleMoves.find(
          p => p.eatGoat
        );
        const currentEatenGoatIndex = this.goats[tigerEatPoint.eatGoatIndex]
          .currentPoint;

        // remove eaten goat point index from points
        this.points[currentEatenGoatIndex].item = null;
        this.points[currentEatenGoatIndex].itemIndex = null;
        this.goats[tigerEatPoint.eatGoatIndex] = {
          x: 0,
          y: 0,
          dead: true,
          currentPoint: -currentEatenGoatIndex
        };

        const tigerNewPoint = this.points[tigerEatPoint.point];

        // release prev tiger index from all points
        const currentTigerIndex = this.tigers[tigerCanEatGoat.tiger]
          .currentPoint;
        this.points[currentTigerIndex].item = null;
        this.points[currentTigerIndex].itemIndex = null;

        this.tigers[tigerCanEatGoat.tiger] = {
          x: tigerNewPoint.x,
          y: tigerNewPoint.y,
          currentPoint: tigerEatPoint.point
        };
        // add new reference of tiger to the points
        this.points[tigerEatPoint.point].item = "tiger";
        this.points[tigerEatPoint.point].itemIndex = tigerCanEatGoat.tiger;
      } else {
        let randomTiger = Math.floor(Math.random() * avilableTigers.length);
        let tigerToMove = avilableTigers[randomTiger];
        let randomMove = Math.floor(
          Math.random() * tigerToMove.possibleMoves.length
        );
        let tigerMovePoint = tigerToMove.possibleMoves[randomMove];
        // release prev tiger index from all points
        const currentTigerPoint = this.tigers[tigerToMove.tiger].currentPoint;
        this.points[currentTigerPoint].item = null;
        this.points[currentTigerPoint].itemIndex = null;

        const tigerNewPoint = this.points[tigerMovePoint.point];
        this.tigers[tigerToMove.tiger] = {
          x: tigerNewPoint.x,
          y: tigerNewPoint.y,
          currentPoint: tigerMovePoint.point
        };
        // add new reference of tiger to the points
        this.points[tigerMovePoint.point].item = "tiger";
        this.points[tigerMovePoint.point].itemIndex = tigerToMove.tiger;
      }
      this.render();
    } else {
      alert("Congratulations! You won the game! ");
    }
    this.moveIndicator.innerHTML = "";

    avilableTigers.forEach(tiger => {
      this.displayPossibleMoves(
        tiger.tiger,
        tiger.possibleMoves.map(p => p.point)
      );
    });
    const deatGoats = this.goats.filter(g => g.dead).length;
    const goatsInBoard = this.goats.filter(g => !g.dead).length;
    mount(this.moveIndicator, el("p", `Dead Goats: ${deatGoats}`));
    mount(this.moveIndicator, el("p", `Goats On Board: ${goatsInBoard}`));
  }

  /**
   * render goat after user moves tiger
   */
  renderGoatMove(){

  }
  /**
   * get next possible moves of tiger/goat
   * @param {} pointIndex
   */
  getNextPossibleMove(pointIndex, type = "tiger") {
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
    let nextLegalPoints = nextPossiblePoints.map(el => {
      const index = Number(el) + Number(pointIndex);
      return index >= 0 && index < this.totalPoints ? index : null;
    });
    nextLegalPoints = nextLegalPoints.filter(el => el);
    if (type === "goat") {
      return nextLegalPoints.filter(p => !this.points[p].item);
    }
    nextLegalPoints = nextLegalPoints.map(p => {
      const point = this.points[p];
      if (point.item==='goat') {
        const tigerMoveDistance = p - pointIndex;
        const tigerEatPoint = Number(p) + Number(tigerMoveDistance);
        // get the distance between current position and next position
        // and double the distance is where tiger will jump to eat goat
        if (
          tigerEatPoint < 0 ||
          tigerEatPoint > this.totalPoints ||
          (tigerMoveDistance === 1 && p % 5 === 4) ||
          (tigerMoveDistance === -1 && p % 5 === 0)
        ) {
          // if next eat point is less than zero or greater thant totalPoint
          // or the goat is at right most point or goat is at left most point
          return null;
        }

        const eatPoint = this.points[tigerEatPoint];
        if ( eatPoint &&  !eatPoint.item ) {
          return { point: tigerEatPoint, eatGoat: true, eatGoatIndex: point.itemIndex };
        }
        return null;
      }else if(!point.item){
          return { point: p, eatGoat: false };
      }
      return null;
    });
    return nextLegalPoints.filter(p => p);
  }

  displayPossibleMoves(tigerIndex, possibleMoves) {
    const moves = possibleMoves.map(el => {
      return (
        this.verticalIndicators[Math.floor(el / 5)].toString() +
        this.horizontalIndicators[el % 5].toString()
      );
    });
    mount(this.moveIndicator, el("h3", `Tiger ${tigerIndex + 1}`));
    const tigerPossiblePointList = list(
      `ul.tiger-possible-points`,
      TigerPossibleMoveList
    );
    mount(this.moveIndicator, tigerPossiblePointList);
    tigerPossiblePointList.update(moves);
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
}
