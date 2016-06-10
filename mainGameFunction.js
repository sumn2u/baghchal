function canvasAnimation(){
		//FROM here to line no 90(drawing and defining the global variable)
		
			//goat will be drawn if we click near the point of intersection
			canvas.click(function(e){
				mouseX=e.pageX-this.offsetLeft;
				mouseY=e.pageY-this.offsetTop;
					//loop for the detection of mousePoint 
					for(i=0;i<points.length;i++){
						var thisPoint=points[i];
						var thisX=thisPoint.x;
						var thisY=thisPoint.y;
						for(j=thisX-20;j<=thisX+20;j++){
							for(k=thisY-20;k<=thisY+20;k++)
							if(mouseX==j && mouseY==k){
								mousePointX=thisPoint.x;
								mousePointY=thisPoint.y;
								clickOutsideCondition=true;
								}								
							}
						} 
						//Loop to prevent the double click bug
						if(stockPoints.length>=0){
							for(a=0;a<stockPoints.length;a++){
								var checkPoint=stockPoints[a];
								if(parseInt(checkPoint.x)==mousePointX && parseInt(checkPoint.y)==mousePointY){
									actualcount=0;
									return false;
								}
								else{actualcount=(stockPoints.length-a);}
							}
						}									
				//loop to prevent the overlaping of goat over tiger
				for(i=0;i<tigerArray.length;i++){
					var tigerPoint=tigerArray[i];
					if(tigerPoint.x==mousePointX && tigerPoint.y==mousePointY){
						return false;
						condition=false;
						actualcount=0;
					}
					else{condition=true;}
				}
				if(clickOutsideCondition==true){//means there will be increament in count if we click in the proper position
					if(count<=20){
				count+=actualcount;
				}
				if(count>20){
					return false;
				}
				}
				//conditionsi
				//It will draw the goat if the given conditions will be satisfied 		
				if(condition==true){
					if(count<=20){
						document.getElementById('goatNo').innerHTML=20-count;
						ctx.beginPath();
						ctx.arc(mousePointX,mousePointY,10,0,2*Math.PI);
						ctx.closePath();
						ctx.fillStyle="green";
						ctx.fill();
					}
				}	
				if(condition==false){
					return false;
					count--;
				}
				//stores the data in stockPoints array
				var stockPoint={x:mousePointX,y:mousePointY}
				stockPoints.push(stockPoint);
				stockActual.push(stockPoint);
					eatGoat();	
					reDrawBoard();
					document.getElementById('rGoat').innerHTML=20-(count-(stockPoints.length));
					document.getElementById('dGoat').innerHTML=count-(stockPoints.length);
			});		
			//LOGIC of THE GAME
			//functions for the detection of the state of the mouse(ie mouseUp and mouseDown)
			//mouseup
			function reDrawBoard(){
				if(eatGoatCondition==false){	
				var thisTiger=Math.floor(Math.random()*4)+0;
				var thisTigerX=tigerArray[thisTiger].x;
				var thisTigerY=tigerArray[thisTiger].y;
				var indexArray=[0,150,-150];
				var randomX=(Math.floor(Math.random()*3)+0);
				var randomY=(Math.floor(Math.random()*3)+0);
				thisTigerNewX=thisTigerX+indexArray[randomX];
				thisTigerNewY=thisTigerY+indexArray[randomY];
		//Function to check the Boundry Conditions;
	//checking the moving condition(ie can be moved diagonally or not)
	if(((((thisTigerX)%100)==80) && (((thisTigerY)%100)==30)) || (((thisTigerX)%100)==30) && (((thisTigerY)%100)==80)) {//tiger can move diagonally if this condition is false
		if(( (thisTigerNewX==(thisTigerX+150)) ||  (thisTigerNewX==(thisTigerX-150))) && ((thisTigerNewY==(thisTigerY+150)) ||  (thisTigerNewY==(thisTigerY-150)))){
			var thisIncreament=Math.floor(Math.random()*1)+0;
			if(thisIncreament==0){
				thisTigerNewY=thisTigerY;
			}
			else{
				thisTigerNewX=thisTigerX;
			}
		}
	}
				//checking the boundry Conditions
	if(thisTigerNewX>630){
	thisTigerNewX=thisTigerNewX-300;
	}
	if(thisTigerNewX<30){
		thisTigerNewX=(thisTigerX+30+Math.abs(thisTigerNewX));
	}
	if(thisTigerNewY>630){
		thisTigerNewY=thisTigerNewY-300;
	}
	if(thisTigerNewY<30){
		thisTigerNewY=(thisTigerY+30+Math.abs(thisTigerNewY));
	}
				checkMatchCondition(thisTigerNewX,thisTigerNewY);
				var thisTigerPoint={x:thisTigerNewX,y:thisTigerNewY}
				if(matchingCondition==true){
				tigerArray.splice(thisTiger,1);
				tigerArray.insert(thisTiger,thisTigerPoint);
				ctx.clearRect(0,0,c.width,c.height);
				drawEveryThing()
				reDrawGoats()
				reDrawTigers();
				}
				else{reDrawBoard()}
				}
			 if(eatGoatCondition==true){
			 	letEatGoat();
			 	//alert('yessssssss');
			 	ctx.clearRect(0,0,c.width,c.height);
				drawEveryThing()
				reDrawGoats()
				reDrawTigers();

			 }

				}//End of Function ReDrawBoard
			// function to Eat the Goats
			
			//detection of the state of the mouse
			//call the function tigers
			tigers();
			passValuesToPointArray();
			drawEveryThing();			
				//Function to Redraw the Goats
				//Problem1 How to Eat Goat;
				//function to draw Board	
			
			function reDrawGoats(){
					for(i=0;i<stockPoints.length;i++){
						var theseGoat=stockPoints[i];
						var goatGrad=ctx.createRadialGradient(theseGoat.x,theseGoat.y,1,theseGoat.x,theseGoat.y,15);
						goatGrad.addColorStop(0,"#fff");
						goatGrad.addColorStop(1,"#000");

						ctx.beginPath();
						ctx.arc(theseGoat.x,theseGoat.y,15,0,2*Math.PI);
						ctx.closePath();
						ctx.fillStyle=goatGrad;
						ctx.fill();
					}
				}
				//End of Function Redraw

	}//End of canvasAnimation Function
