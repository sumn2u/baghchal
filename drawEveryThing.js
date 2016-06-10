function drawEveryThing(){
				var lineGrad = ctx.createLinearGradient(0, 0, 2000, 100);
					// Add the color stops.
					lineGrad.addColorStop(0,'rgb(255,0,0)');
					lineGrad.addColorStop(.5,'rgb(0,255,0)');
					lineGrad.addColorStop(1,'rgb(255,0,0)');

				for(i=30;i<=630;i+=150){
					for(j=30;j<=630;j+=150){//draw lines
					ctx.beginPath();
					ctx.moveTo(i,j);
					ctx.lineTo(i+600,j);
					ctx.closePath();
					ctx.lineWidth="5";
					ctx.strokeStyle=lineGrad;
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(i,j);
					ctx.lineTo(i,j+600);
					ctx.closePath();
					ctx.strokeStyle=lineGrad;
					ctx.lineWidth="5";
					ctx.stroke();

					}
				}		
				//draw square
				ctx.beginPath();
				ctx.moveTo(330,30);
				ctx.lineTo(630,330);
				ctx.lineTo(330,630);
				ctx.lineTo(30,330);
				ctx.lineTo(330,30);
				ctx.closePath();
				ctx.strokeStyle=lineGrad;
				ctx.lineWidth="5";
				ctx.stroke();
				//Diagonals
				ctx.beginPath();
				ctx.moveTo(30,30);
				ctx.lineTo(630,630);
				ctx.closePath();
				ctx.lineWidth="5";
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(630,30);
				ctx.lineTo(30,630);
				ctx.closePath();
				ctx.strokeStyle=lineGrad;
				ctx.lineWidth="5";
				ctx.stroke();
				//line which removes the extra lines
				ctx.beginPath();
				ctx.moveTo(647,0)
				ctx.lineTo(647,660);
				ctx.closePath();
				ctx.lineWidth="30";
				ctx.strokeStyle="#fff";
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(0,645)
				ctx.lineTo(660,647);
				ctx.closePath();
				ctx.lineWidth="30";
				ctx.strokeStyle="#fff";
				ctx.stroke();				
			}//Endo of drawEveryThing Function 
			//function to prevent the OverLaping of Tigers Over Goat
			function passValuesToPointArray(){
			//loop stores the points in the array						
					for(i=30;i<=630;i+=150){
						for(j=30;j<=630;j+=150){
							point= {x:i,y:j};
							points.push(point);
						}
					}				
				}
				//Draw Tigers
				function tigers(){
					for(i=30;i<=630;i+=600){
						for(j=30;j<=630;j+=600){
							tigerObject={x:i,y:j};
							tigerArray.push(tigerObject);
							ctx.beginPath();
							ctx.arc(i,j,20,0,2*Math.PI);
							ctx.closePath();
							ctx.fillStyle="pink";
							ctx.fill();
						}
					}
				}
				function reDrawTigers(){
							for(i=0;i<tigerArray.length;i++){
							ctx.beginPath();
							ctx.arc(tigerArray[i].x,tigerArray[i].y,20,0,2*Math.PI);
							ctx.closePath();
							ctx.fillStyle="pink";
							ctx.fill();
						}
						for(i=0;i<stockPoints.length;i++){
				//document.getElementById('check').innerHTML+=stockPoints[i].x+" , "+stockPoints[i].y+'<br>';
			}
				}
		function checkMatchCondition(thisTigerNewX,thisTigerNewY){
				//condition1(overLaping of tiger on Tiger)
				for(i=0;i<tigerArray.length;i++){
					var tigerMatcingPoint=tigerArray[i];
					if((thisTigerNewX!=(tigerMatcingPoint.x)) && (thisTigerNewY!=(tigerMatcingPoint.y))){
						matchingCondition=true;
					}
				}
				//condition2(OverLaping of Tiger on Goat)
				for(i=0;i<stockPoints.length;i++){
					var thisMathcPoint=stockPoints[i];
					if((thisTigerNewX!=(thisMathcPoint.x)) && (thisTigerNewY!=(thisMathcPoint.y))){
						matchingCondition=true;
					}
				}
				for(i=0;i<tigerArray.length;i++){
					var tigerMatcingPoint=tigerArray[i];
					if((thisTigerNewX==(tigerMatcingPoint.x)) && (thisTigerNewY==(tigerMatcingPoint.y))){
						matchingCondition=false;
					}
				}
				//condition2(OverLaping of Tiger on Goat)
				for(i=0;i<stockPoints.length;i++){
					var thisMathcPoint=stockPoints[i];
					if((thisTigerNewX==(thisMathcPoint.x)) && (thisTigerNewY==(thisMathcPoint.y))){
						matchingCondition=false;
					}

				}

			}//End of CheckMatchCondition
