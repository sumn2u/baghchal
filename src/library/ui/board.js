import tigerImage from '../images/tiger.png';
import goatImage from '../images/goat.png';
export class Board {
    constructor(canvasElement) {
        this.goats = [];// Array<{x:number,y:number}> x point (0,1,2,3,4) y point (0,1,2,3,4)
        this.tigers = [];// Array<{x:number,y:number}>
        let holder = document.getElementById(canvasElement);
        let height = 600;
        let width = 500;

        this.paddingLeft = 20;
        this.paddingRight = 20;
        this.paddingTop = 120;
        this.paddingBottom = 20; 
        this.height = height - ( this.paddingTop+this.paddingBottom);
        this.width = width - (this.paddingLeft+this.paddingRight);
        this.steps = 4;
        this.verticalStep = this.width / this.steps;
        this.horizontalStep = this.height / this.steps;

        this.points = this.calculatePoints();// Array<{x:number,y:number}>;

        holder.setAttribute('height', height);
        holder.setAttribute('width', width);
        holder.style.border = '1px solid #ccc'
        this.canvas = holder.getContext('2d');

    }

    render() {
        this.canvas.clearRect(0, 0, this.width, this.height);
        this.drawBoard();
        this.drawTigers();
        this.renderGoatBoard();
    }


    drawGoats() {

    }

    drawTigers() {
        this.tigers.forEach((element)=>{
            var img = new Image();
            img.onload =  ()=> {
              this.canvas.drawImage(img,element.x-20,element.y-20,40,40)
            }
            img.src = tigerImage;
        });
    }

    drawBoard() {
        let sides = ['vertical', 'horizontal'];
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
            let dy1 =  this.paddingTop;

            let dx2 = element == 'vertical' ? this.paddingLeft + this.width : this.paddingLeft;
            let dy2 =  this.paddingTop + this.height ;
            this.drawLine(dx1, dy1, dx2, dy2);
            this.tigers.push({x:dx1,y:dy1},{x:dx2,y:dy2});
        });
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

    
    calculatePoints() {
        let points = [];
        for (let x = 0; x <= this.width; x += this.verticalStep) {
            for (let y = 0; y <= this.height; y += this.horizontalStep) {
                points.push({ x: x, y: y })
            }
        }
        return points;
    }

    renderGoatBoard(){
        let padding = 20;
        let rectHeight = this.paddingTop-2.5*padding;
        this.canvas.beginPath();
        this.canvas.fillStyle = '#FFB74D';
        this.canvas.fillRect(padding,padding/2,this.width,rectHeight);
        this.canvas.shadowOffsetX = 0;
        this.canvas.shadowOffsetY = 0;
        this.canvas.shadowBlur =0;
        this.canvas.shadowColor = "transparent";
        this.canvas.closePath();
        
        let spacing = 5;
        let goatWidth = (this.width-5)/10;;
        let goatHeight = 32;
        for(let y = 0;y<2;y++){
            for(let x=0;x<10;x++){
                this.canvas.beginPath();
                this.canvas.fillStyle = '#fff';
                this.canvas.fillRect(padding+spacing+(x*goatWidth),padding/2+spacing+(y*goatHeight),goatWidth-spacing,goatHeight-spacing);
                var img = new Image();
                img.onload =  ()=> {
                this.canvas.drawImage(img,padding+spacing+(x*goatWidth),padding/2+spacing+(y*goatHeight),30,30)
                }
                img.src = goatImage;
                this.canvas.closePath();
                
            }
        }

    }

}
