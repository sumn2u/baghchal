import tigerImage from '../images/tiger.png';
import goatImage from '../images/goat.png';
import { mount, el, list } from '../ui/dom';
import { TigerPossibleMoveList } from './components/tiger-possible-move-list';
export class Board {
    constructor(realCanvasElement, fakeCanvasElement,dataContainer) {
        this.dataContainer = dataContainer;
        this.goats = [];// Array<{x:number,y:number,pulled:false,dead:false}> 
        this.tigers = [];// Array<{x:number,y:number}>
        this.realCanvasElement = realCanvasElement;
        this.fakeCanvasElement = fakeCanvasElement;
        this.dataContainer = dataContainer;
        this.totalHeight = 600;
        this.totalWidth = 500;
        this.totalPoints = 24;
        this.paddingLeft = 20;
        this.paddingRight = 20;
        this.paddingTop = 120;
        this.paddingBottom = 20;
        this.height = this.totalHeight - (this.paddingTop + this.paddingBottom);
        this.width = this.totalWidth - (this.paddingLeft + this.paddingRight);
        this.steps = 4;
        this.verticalStep = this.width / this.steps;
        this.horizontalStep = this.height / this.steps;
        this.firstGoatRender = 0;
        this.tigerImage = null;
        this.goatImage = null;
        this.verticalIndicators = [1,2,3,4,5];
        this.horizontalIndicators = ['A','B','C','D','E'];
        this.realCanvasElement.setAttribute('height', this.totalHeight);
        this.realCanvasElement.setAttribute('width', this.totalWidth);
        this.fakeCanvasElement.setAttribute('height', this.totalHeight+50);
        this.fakeCanvasElement.setAttribute('width', this.totalWidth+50);
        this.fakeCanvasElement.classList.add('hide');
        this.realCanvasElement.style.border = '1px solid #ccc'
        this.canvas = this.realCanvasElement.getContext('2d');
        this.fakeCanvas = this.fakeCanvasElement.getContext('2d');
        this.currentX = 0;
        this.currentY = 0;
        this.goatHeight = 0;
        this.goatWidth = 0;
        this.canvasPosition = this.getCanvasPosition();
        this.points = this.calculatePoints();// Array<{x:number,y:number}>;
        this.fillGoatPoints();
        this.fillTigerPoints();
        this.mouseIntraction();
        this.totalMoveAttempts = 0;

    }
    /**
     * handle mouse intraction 
     */
    mouseIntraction() {
        let mouseDown = false;
        let dragStaticGoat = false;
        let staticGoat = {};
        let staticGoatIndex;
        this.realCanvasElement.addEventListener('mousedown', (event) => {
            mouseDown = true;
            this.currentX = event.pageX - this.canvasPosition.left;
            this.currentY = event.pageY - this.canvasPosition.top;
            // intraction with remaining goats
            if (this.currentY < this.paddingTop) {
                this.goats.forEach((point, index) => {

                    if (!point.pulled &&
                        !point.dead &&
                        this.currentX >= point.x
                        && this.currentX <= point.x + this.goatWidth
                        && this.currentY >= point.y
                        && this.currentY <= point.y + this.goatHeight

                    ) {
                        staticGoatIndex = index;
                        dragStaticGoat = true;
                        staticGoat = point;
                        this.drawStandByGoat(point.x, point.y, false, '#fff', this.canvas);
                        this.showFakeCanvas();
                        return;
                    }
                });
            } else {//intraction with board

            }
        });

        this.fakeCanvasElement.addEventListener('mouseup', (event) => {
            mouseDown = false;
            this.currentX = event.pageX - this.canvasPosition.left;
            this.currentY = event.pageY - this.canvasPosition.top;
            if (dragStaticGoat) {
                this.putGoatToBoard(this.currentX, this.currentY, staticGoatIndex);
            }
            this.hideFakeCanvas();
        });

        this.realCanvasElement.addEventListener('mouseup', (event) => {
            mouseDown = false;
            this.hideFakeCanvas();
        });
        this.fakeCanvasElement.addEventListener('mousemove', (event) => {
            this.currentX = event.pageX - this.canvasPosition.left;
            this.currentY = event.pageY - this.canvasPosition.top;
            if (!mouseDown) {
                return true;
            }

            if (dragStaticGoat) {
                this.fakeCanvas.clearRect(0, 0, this.totalHeight*2, this.totalWidth*2);
                this.drawBoardGoat(this.currentX, this.currentY, this.fakeCanvas);
            }

        });

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
        for (let y = this.paddingTop; y <= this.totalHeight; y += this.horizontalStep) {


            for (let x = this.paddingLeft; x <= this.totalWidth; x += this.verticalStep) {
                points.push({ x: x, y: y })
            }
        }
        return points;
    }
    /**
     * add points to tiger array while initialising the game
     */
    fillTigerPoints() {
        this.tigers.push(this.points[0], this.points[4], this.points[20], this.points[24]);
    }
    /**
     * fill goats initial points
     */
    fillGoatPoints() {

        let padding = 20;
        let spacing = 5;
        this.goatWidth = (this.width - 5) / 10;;
        this.goatHeight = 32;
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 10; x++) {
                let x1 = padding + spacing + (x * this.goatWidth);
                let y1 = padding / 2 + spacing + (y * this.goatHeight);
                this.goats.push({ x: x1, y: y1, pulled: false })
            }
        }
    }


    /**
     * draw square and lines for board
     */
    drawBoard() {
        let sides = ['vertical', 'horizontal'];
        //draw inner rectangle
        let yMiddlePoint = this.paddingTop + this.height / 2;

        sides.forEach((element) => {
            let i=0;
            let stepSize = element == 'vertical' ? this.verticalStep : this.horizontalStep;
            let totalSize = element == 'vertical' ? this.width : this.height;
            for (let length = 0; length <= totalSize; length += stepSize) {
                let x1 = element == 'vertical' ? this.paddingLeft + length : this.paddingLeft;
                let y1 = element == 'vertical' ? this.paddingTop : this.paddingTop + length;
                let x2 = element == 'vertical' ? this.paddingLeft + length : this.paddingLeft + this.width;
                let y2 = element == 'vertical' ? this.paddingTop + this.height : this.paddingTop + length;
                this.drawText(x1,y1,element,element==='vertical'? this.horizontalIndicators[i] : this.verticalIndicators[i]);
                this.drawLine(x1, y1, x2, y2);
                i++;
            }

            //draw diagonal lines
            let dx1 = element == 'vertical' ? this.paddingLeft : this.paddingLeft + this.width;
            let dy1 = this.paddingTop;

            let dx2 = element == 'vertical' ? this.paddingLeft + this.width : this.paddingLeft;
            let dy2 = this.paddingTop + this.height;
            this.drawLine(dx1, dy1, dx2, dy2);

            let mPointx1 = this.paddingLeft + (this.width / 2);
            let mPointy1 = element == 'vertical' ? this.paddingTop : this.paddingTop + this.height;
            let mPointx2 = element == 'vertical' ? this.paddingLeft : this.paddingLeft + this.width;
            let mPointy2 = this.paddingTop + (this.height / 2);
            this.drawLine(mPointx1, mPointy1, mPointx2, mPointy2);
            this.drawLine(mPointx1, mPointy1, mPointx2 + (element == 'vertical' ? this.width : -this.width), mPointy2);
        });



    }

    /**
     * draw tigers on board
     */
    drawTigers() {
        this.tigers.forEach(  (element) => {
            if(this.tigerImage){
                this.canvas.drawImage(this.tigerImage, element.x - 50, element.y - 35, 80, 60);
                return;
            }
            this.tigerImage = new Image();
            this.tigerImage.onload = () => {
                this.canvas.drawImage(this.tigerImage, element.x - 50, element.y - 35, 80, 60);
                this.drawTigers();
            }
            this.tigerImage.src = tigerImage;
        });
    }

    /**
     * draw goats on standby rectangle or on board
     */
    renderGoats() {
        let padding = 20;
        let rectHeight = this.paddingTop - 2.5 * padding;
        this.canvas.beginPath();
        this.canvas.fillStyle = '#FFB74D';
        this.canvas.fillRect(padding, padding / 2, this.width, rectHeight);
        this.canvas.shadowOffsetX = 0;
        this.canvas.shadowOffsetY = 0;
        this.canvas.shadowBlur = 0;
        this.canvas.shadowColor = "transparent";
        this.canvas.closePath();
        this.goats.forEach((point) => {
            if (!point.pulled && !point.dead) {
                this.drawStandByGoat(point.x, point.y, true, '#fff', this.canvas);
            } else if (point.pulled && !point.dead) {
                this.drawBoardGoat(point.x, point.y, this.canvas);
            }
        });
    }
    /**
     * draw goat on the upper rectangle standby mode
     * user will drag them to board
     * @param {} x1 
     * @param {*} y1 
     * @param {*} drawImage 
     * @param {*} bg 
     * @param {*} canvas 
     */
    drawStandByGoat(x1, y1, drawImage, bg = '#fff', canvas) {
        let spacing = 5;
        canvas.beginPath();
        canvas.globalCompositeOperation = "source-over";
        canvas.fillStyle = bg;
        canvas.fillRect(x1, y1, this.goatWidth - spacing, this.goatHeight - spacing);
        if (drawImage) {
            if(this.firstGoatRender>0){
                canvas.drawImage(this.goatImage,x1,y1,30,30);
            }else{
                this.goatImage = new Image();
                this.goatImage.onload = () => {
                    canvas.drawImage(this.goatImage, x1, y1, 30, 30);
                }
                this.goatImage.src = goatImage;
            }
        }
        canvas.closePath();
    }

    /**
     * draw goat on board from their static position if user drags
     * goat to the board near a point
     * @param {*} x 
     * @param {*} y 
     * @param {*} staticGoatIndex 
     */
    putGoatToBoard(x, y, staticGoatIndex) {

        let goatDrawn = false;
       for(let i in this.points){
           const point = this.points[i];
            if (
                x >= point.x - this.goatWidth
                && x <= point.x + this.goatWidth
                && y >= point.y - this.goatHeight
                && y <= point.y + this.goatHeight
                && this.checkTigerPosition(point.x, point.y)===-1
                && this.checkGoatPosition(point.x, point.y)===-1
            ) {
                this.drawBoardGoat(point.x, point.y, this.canvas);
                this.goats[staticGoatIndex] = { x: point.x, y: point.y, pulled: true, dead: false };
                goatDrawn = true;
                break;
            }
        }

        if (!goatDrawn) {
            let point = this.goats[staticGoatIndex];
            this.drawStandByGoat(point.x, point.y, true, '#fff', this.canvas)
            return false;
        }
        this.renderTigerMove();
        return true;

    }

    /**
     * method to draw goat
     * @param {*} x1 
     * @param {*} y1 
     * @param {*} canvas fake/real canvas object
     */
    drawBoardGoat(x1, y1, canvas) {
        canvas.beginPath();
        canvas.globalCompositeOperation = "source-over";
        canvas.drawImage(this.goatImage, x1 - this.goatWidth, y1 - this.goatHeight, 1.5 * this.goatWidth, 1.5 * this.goatHeight);
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
        this.canvas.strokeStyle = '#03a9f4';
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
        this.fakeCanvasElement.classList.remove('hide');
    }
    /**
     * hide fake canvas once animation is over
     */
    hideFakeCanvas() {
        this.fakeCanvas.clearRect(0, 0, this.totalHeight, this.totalWidth);
        this.fakeCanvasElement.classList.add('hide');
    }
    /**
     * check that at the given position tiger is already there or not
     * @param {*} x1 
     * @param {*} y1 
     * @param {*} index 
     */
    checkTigerPosition(x1, y1, index = -1) {
        let x = parseInt(x1);
        let y = parseInt(y1);
        let tigerIndex = -1;
       for(let i in  this.tigers){
           const tiger = this.tigers[i];
            if (tiger && parseInt(tiger.x) == x && parseInt(tiger.y) == y && index != i) {
                tigerIndex = i;
                break;
            }
        };
        return tigerIndex;
    }

    /**
     * check at given x1, y1 goat is already there or not
     * @param {*} x1 
     * @param {*} y1 
     * @param {*} index 
     */
    checkGoatPosition(x1, y1, index = -1) {
        let x = parseInt(x1);
        let y = parseInt(y1);
        let goatPosition = -1;
        for(let i  in this.goats){
            const goat = this.goats[i];
            if (goat && goat.pulled && parseInt(goat.x) == x && parseInt(goat.y) == y && index != i) {
                goatPosition = i;
                break;
            }
        }
        return goatPosition;
    }

    /**
     * move the tiger after user moves the goat
     */
    renderTigerMove() {
        let avilableTigers = [];
        this.tigers.forEach( (tigerPoint,i)=>{
            let pointIndex;
           for(let j in  this.points){
               const point = this.points[j];
                if (parseInt(point.x) == parseInt(tigerPoint.x) && parseInt(point.y) == parseInt(tigerPoint.y)) {
                    pointIndex = j;
                    break;
                }
            }
            let nextMovePossibleMoves = this.getNextPossibleMove(pointIndex);
            if (nextMovePossibleMoves.length>0) {
                avilableTigers.push({ tiger: i, possibleMoves: nextMovePossibleMoves });
            }
            
        });
       
       if(avilableTigers.length>0){
        const tigerCanEatGoat = avilableTigers.find(t=>t.possibleMoves.find(p=>p.eatGoat));
        if(tigerCanEatGoat){
            const tigerEatPoint = tigerCanEatGoat.possibleMoves.find(p=>p.eatGoat);
            this.goats[tigerEatPoint.eatGoatIndex] ={x:0,y:0,pulled: true,dead: true};
            this.tigers[tigerCanEatGoat.tiger] = this.points[tigerEatPoint.point];
        }else{
            let randomTiger = Math.floor(Math.random() * avilableTigers.length);
            let tigerToMove = avilableTigers[randomTiger];
            let randomMove = Math.floor(Math.random() * tigerToMove.possibleMoves.length);
            let tigerMovePoint = tigerToMove.possibleMoves[randomMove];
            this.tigers[tigerToMove.tiger] = this.points[tigerMovePoint.point];
        }
        this.render();
       }else{
           alert('Congratulations! You won the game! ')
       }
       this.dataContainer.innerHTML = '';
       const deatGoats = this.goats.filter(g=>g.dead).length;
       const goatsInBoard = this.goats.filter(g=>g.pulled).length;
       mount(this.dataContainer,el('p',`Dead Goats: ${deatGoats}`));
       mount(this.dataContainer,el('p',`Goats On Board: ${goatsInBoard}`));
       avilableTigers.forEach(tiger=>{
           this.displayPossibleMoves(tiger.tiger,tiger.possibleMoves.map(p=>p.point));
       })
    }

    /**
     * get next possible moves of tiger/goat
     * @param {} pointIndex 
     */
    getNextPossibleMove(pointIndex,type='tiger') {
        pointIndex = Number(pointIndex);
        this.totalMoveAttempts++;

        const nextPossiblePoints = [ 5, -5];// 5, -5 for move up down
        if (pointIndex % 2 === 0) { //can move diagonally
            if (pointIndex%5===0 ) { // left conrner points
               nextPossiblePoints.push(-4,6);
            }else if(pointIndex%5===4){ // right corners
               nextPossiblePoints.push(4,-6)
            }else{
                nextPossiblePoints.push(4,-4,6,-6)
            }
        }

        if(pointIndex%5===0){ // left conrner points
            nextPossiblePoints.push(1);
        }else if(pointIndex%5===4){ // right corner points
            nextPossiblePoints.push(-1);
        }else{
            nextPossiblePoints.push(1,-1);
        }
        let nextLegalPoints = nextPossiblePoints.map(el=> {
            const index = Number(el)+Number(pointIndex);
            return index>=0 && index<this.totalPoints ? index : null;
        });
        nextLegalPoints = nextLegalPoints.filter(el=>{
            if(!el){
                return false;
            }
            const point = this.points[el];
            const tigerExist = this.checkTigerPosition(point.x,point.y, type==='tiger' ? pointIndex :-1);
            return tigerExist===-1;
        });
        if(type==='goat'){
            return nextLegalPoints.filter(p => {
                const point = this.points[p];
                const goataExists = this.checkGoatPosition(point.x,point.y,pointIndex);
                return goataExists=== -1;
            })
        }
        nextLegalPoints = nextLegalPoints.map(p=>{
            const point = this.points[p];
            const noGoat  = this.checkGoatPosition(point.x,point.y);
            if(noGoat>-1){
                const tigerMoveDistance = p-pointIndex;
                const tigerEatPoint = Number(p)+ Number(tigerMoveDistance);
                if(tigerEatPoint<0 || tigerEatPoint>this.totalPoints){
                    return null;
                }
                const eatPoint = this.points[tigerEatPoint];
                if(eatPoint && this.checkGoatPosition(eatPoint.x,eatPoint.y)=== -1 && this.checkTigerPosition(eatPoint.x,eatPoint.y)=== -1){
                    return {point:tigerEatPoint ,eatGoat: true,eatGoatIndex: noGoat}
                }
                return null;
            }
            return {point:p,eatGoat: false};
        })
        return nextLegalPoints.filter(p=>p);
    }

    displayPossibleMoves(tigerIndex,possibleMoves){
        const moves = possibleMoves.map(el=>{
            return this.verticalIndicators[Math.floor(el/5)].toString() +this.horizontalIndicators[el%5].toString();
        });
        mount(this.dataContainer,el('h3',`Tiger ${tigerIndex+1}`));
        const tigerPossiblePointList = list(`ul.tiger-possible-points`, TigerPossibleMoveList);
            mount(this.dataContainer, tigerPossiblePointList);
        tigerPossiblePointList.update(moves);
    }

    drawText(x,y,side,text){
        this.canvas.beginPath();
        this.canvas.font = "20px Arial";
        this.canvas.fillStyle = '#000';
        this.canvas.fillText(text, side==='vertical' ? x: x-15, side==='vertical' ? y-10: y);
        this.canvas.closePath();
    }
}

