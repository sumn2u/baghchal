import tigerImage from '../images/tiger.png';
import goatImage from '../images/goat.png';
Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}
export class Board {
    constructor(canvasElement, fakeCanvasElement) {
        this.goats = [];// Array<{x:number,y:number,pulled:false,dead:false}> 
        this.tigers = [];// Array<{x:number,y:number}>
        this.holder = document.getElementById(canvasElement);
        this.fakeHolder = document.getElementById(fakeCanvasElement);
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



        this.holder.setAttribute('height', this.totalHeight);
        this.holder.setAttribute('width', this.totalWidth);
        this.fakeHolder.setAttribute('height', this.totalHeight);
        this.fakeHolder.setAttribute('width', this.totalWidth);
        this.fakeHolder.classList.add('hide');
        this.holder.style.border = '1px solid #ccc'
        this.canvas = this.holder.getContext('2d');
        this.fakeCanvas = this.fakeHolder.getContext('2d');
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

    mouseIntraction() {
        let mouseDown = false;
        let dragStaticGoat = false;
        let staticGoat = {};
        let staticGoatIndex;
        this.holder.addEventListener('mousedown', (event) => {
            mouseDown = true;
            this.currentX = event.pageX - this.canvasPosition.left;
            this.currentY = event.pageY - this.canvasPosition.top;
            // intraction with remaining goats
            if (this.currentY < this.paddingTop) {
                this.goats.forEach((point, index) => {

                    if (!point.pulled &&
                        !point.deat &&
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

        this.fakeHolder.addEventListener('mouseup', (event) => {
            mouseDown = false;
            this.currentX = event.pageX - this.canvasPosition.left;
            this.currentY = event.pageY - this.canvasPosition.top;
            if (dragStaticGoat) {
                this.putGoatToBoard(this.currentX, this.currentY, staticGoatIndex);
            }
            this.hideFakeCanvas();
        });

        this.holder.addEventListener('mouseup', (event) => {
            mouseDown = false;
            this.hideFakeCanvas();
        });
        this.fakeHolder.addEventListener('mousemove', (event) => {
            this.currentX = event.pageX - this.canvasPosition.left;
            this.currentY = event.pageY - this.canvasPosition.top;
            if (!mouseDown) {
                return true;
            }

            if (dragStaticGoat) {
                this.fakeCanvas.clearRect(0, 0, this.totalHeight, this.totalWidth);
                this.drawBoardGoat(this.currentX, this.currentY, this.fakeCanvas);
            }

        });

    }


    render() {
        this.tigerMoveAttems = 0;
        this.canvas.clearRect(0, 0, this.totalWidth, this.totalHeight);
        this.drawBoard();
        this.drawTigers();
        this.renderGoats();
    }
    calculatePoints() {
        let points = [];
        for (let y = this.paddingTop; y <= this.totalHeight; y += this.horizontalStep) {


            for (let x = this.paddingLeft; x <= this.totalWidth; x += this.verticalStep) {
                points.push({ x: x, y: y })
            }
        }
        return points;
    }
    fillTigerPoints() {
        this.tigers.push(this.points[0], this.points[4], this.points[20], this.points[24]);
    }

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


    drawBoard() {
        let sides = ['vertical', 'horizontal'];
        //draw inner rectangle
        let yMiddlePoint = this.paddingTop + this.height / 2;
        sides.forEach((element) => {
            let stepSize = element == 'vertical' ? this.verticalStep : this.horizontalStep;
            let totalSize = element == 'vertical' ? this.width : this.height;
            for (let length = 0; length <= totalSize; length += stepSize) {
                let x1 = element == 'vertical' ? this.paddingLeft + length : this.paddingLeft;
                let y1 = element == 'vertical' ? this.paddingTop : this.paddingTop + length;
                let x2 = element == 'vertical' ? this.paddingLeft + length : this.paddingLeft + this.width;
                let y2 = element == 'vertical' ? this.paddingTop + this.height : this.paddingTop + length;
                this.drawLine(x1, y1, x2, y2);
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

    drawTigers() {
        this.tigers.forEach((element) => {
            let img = new Image();
            img.onload = () => {
                this.canvas.drawImage(img, element.x - 15, element.y - 25, 40, 40)
            }
            img.src = tigerImage;
        });
    }
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
            } else if (point.pulled && !point.deat) {
                this.drawBoardGoat(point.x, point.y, this.canvas);
            }
        });
    }

    drawStandByGoat(x1, y1, drawImage, bg = '#fff', canvas) {
        let spacing = 5;
        canvas.beginPath();
        canvas.globalCompositeOperation = "source-over";
        canvas.fillStyle = bg;
        canvas.fillRect(x1, y1, this.goatWidth - spacing, this.goatHeight - spacing);
        if (drawImage) {
            let img = new Image();
            img.onload = () => {
                canvas.drawImage(img, x1, y1, 30, 30);
            }
            img.src = goatImage;
        }
        canvas.closePath();
    }

    putGoatToBoard(x, y, staticGoatIndex) {

        let goatDrawn = false;
        this.points.forEach((point, i) => {
            if (
                x >= point.x - this.goatWidth
                && x <= point.x + this.goatWidth
                && y >= point.y - this.goatHeight
                && y <= point.y + this.goatHeight
                && this.checkTigerPosition(point.x, point.y)
                && this.checkGoatPosition(point.x, point.y)
            ) {
                this.drawBoardGoat(point.x, point.y, this.canvas);
                this.goats[staticGoatIndex] = { x: point.x, y: point.y, pulled: true, dead: false };
                goatDrawn = true;
                return;
            }
        });

        if (!goatDrawn) {
            let point = this.goats[staticGoatIndex];
            this.drawStandByGoat(point.x, point.y, true, '#fff', this.canvas)
            return false;
        }
        this.renderTigerMove();
        return true;

    }


    drawBoardGoat(x1, y1, canvas) {
        canvas.beginPath();
        canvas.globalCompositeOperation = "source-over";
        let img = new Image();
        img.onload = () => {
            canvas.drawImage(img, x1 - this.goatWidth, y1 - this.goatHeight, 1.5 * this.goatWidth, 1.5 * this.goatHeight);
        }
        img.src = goatImage;
        canvas.closePath();
    }


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



    getCanvasPosition() {
        let box = this.holder.getBoundingClientRect();
        let scrollLeft = this.holder.parentNode.scrollLeft;
        let scrollTop = this.holder.parentNode.scrollTop;
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

    showFakeCanvas() {
        this.fakeCanvas.clearRect(0, 0, this.totalHeight, this.totalWidth);
        this.fakeHolder.classList.remove('hide');
    }

    hideFakeCanvas() {
        this.fakeCanvas.clearRect(0, 0, this.totalHeight, this.totalWidth);
        this.fakeHolder.classList.add('hide');
    }

    checkTigerPosition(x1, y1, index = -1) {
        let x = parseInt(x1);
        let y = parseInt(y1);
        let spotAvilable = true;
        for (let i in this.tigers) {
            let tiger = this.tigers[i];
            if (tiger && parseInt(tiger.x) == x && parseInt(tiger.y) == y && index != i) {
                spotAvilable = false;
                break;
            }
        }
        return spotAvilable;
    }

    checkGoatPosition(x1, y1, index = -1) {
        let x = parseInt(x1);
        let y = parseInt(y1);
        let spotAvilable = true;
        for (let i in this.goats) {
            let goat = this.goats[i];
            if (goat && goat.pulled && parseInt(goat.x) == x && parseInt(goat.y) == y && index != i) {
                spotAvilable = false;
                break;
            }
        }
        return spotAvilable;
    }

    renderTigerMove() {
        let avilableTigers = [];
        for (let i = 0; i < 4; i++) {

            let tigerPoint = this.tigers[i];

            let pointIndex;

            for (let j in this.points) {
                let point = this.points[j];
                if (parseInt(point.x) == parseInt(tigerPoint.x) && parseInt(point.y) == parseInt(tigerPoint.y)) {
                    pointIndex = j;
                    break;
                }
            }

            let nextMovePossibleMoves = this.getNextPossibleMove(pointIndex);

            if (nextMovePossibleMoves.length>0) {
                avilableTigers.push({ tiger: i, possibleMoves: nextMovePossibleMoves });
            }

        }

    }

    getNextPossibleMove(pointIndex) {
        pointIndex = parseInt(pointIndex);
        this.totalMoveAttempts++;
        let nextPossiblePoints = [ 5, -5];//+1-1+5-5 for straight (current point inedex+1, currentPoint-1,currentPoint+5,currentPoint-5)

        if (pointIndex % 2 === 0) { //can move diagonally
            nextPossiblePoints = nextPossiblePoints.concat([6, -6]);
            if ([0, 4, 20, 24].indexOf(pointIndex) === -1) {
                nextPossiblePoints = nextPossiblePoints.concat([4, -4]);
            }
        }
        if((pointIndex+1)%5===1){
            nextPossiblePoints.push(1);
        }else if((pointIndex+1)%5==0){
            nextPossiblePoints.push(-1);
        }else{
            nextPossiblePoints.push(1);
            nextPossiblePoints.push(-1);
        }
        let nextLegalPoints = [];
        nextPossiblePoints.forEach(element => {
            let index = parseInt(pointIndex) + parseInt(element);
            let point = this.points[index];
            if (point && this.checkGoatPosition(point.x,point.y) && this.checkTigerPosition(point.x,point.y,pointIndex)) {
                nextLegalPoints.push(point);
            }
        });
        return nextLegalPoints;
    }


}

