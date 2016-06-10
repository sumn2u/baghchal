function eatGoat(){
	for(t=0;t<tigerArray.length;t++){
		var tiger1=tigerArray[t];
		var pointOfIn=new Array();
		pointOfInfluence(tiger1);
		var dupliPoint=pointOfIn;
		for(i=0;i<pointOfIn.length;i++){
			var removePoint=pointOfIn[i];
			if((removePoint.x == tiger1.x) && (removePoint.y == tiger1.y)){
				pointOfIn.splice(i,1);
			}
			for(p=(i+1);p<dupliPoint.length;p++){
				if((removePoint.x == dupliPoint[p].x) && (removePoint.y == dupliPoint[p].y)){
					pointOfIn.splice(p,1);
				}
			}
		}
	


		for(n=0;n<pointOfIn.length;n++){
			var tigerEat=pointOfIn[n];
			for(g=0;g<stockPoints.length;g++){
				var eatPoint=stockPoints[g];
				if((tigerEat.x == eatPoint.x) && (tigerEat.y == eatPoint.y)){
					//alert(eatPoint.x+" , "+eatPoint.y);
					var blankBox;
					var thisCondition;
					var thisCondition1;
					influenceOfInfluence(eatPoint,tiger1);
					if((blankBox.x >630) || (blankBox.x <30) || (blankBox.y >630) || (blankBox.y <30)){
						thisCondition=false;		
					}
					else{thisCondition=true;}
					for(r=0;r<stockPoints.length;r++){
						var bPoint=stockPoints[r];
						if((bPoint.x ==blankBox.x) && (bPoint.y ==blankBox.y)){
							thisCondition1=false;
							return false;
						}
						else{thisCondition1=true;}
					}
					if(thisCondition==true && thisCondition1==true){
						if(blankBox.x>0){
							//alert(blankBox.x+" , "+ blankBox.y+" , "+t)
							eatGoatCondition=true;
							return false;
						}
						else{return;}
					}
				}
				else{eatGoatCondition=false;}
				function influenceOfInfluence(eatPoint,tiger1){
				var thisEatX=parseInt(eatPoint.x);
				var thisEatY=parseInt(eatPoint.y);
				var thisTigerPointX=parseInt(tiger1.x);
				var thisTigerPointY=parseInt(tiger1.y);
				var blankBoxX;
				var blankBoxY;
				var increamentX=parseInt((thisEatX -(thisTigerPointX)));
				var increamentY=parseInt((thisEatY -(thisTigerPointY)));
				blankBoxX=(thisEatX+(increamentX));
				blankBoxY=(thisEatY+(increamentY));
				blankBox={x:blankBoxX,y:blankBoxY}

				}
			}
		}

	}
	function pointOfInfluence(tiger1) {
		for(j=(-150);j<=150;j+=150){
			for(k=(-150);k<=150;k+=150){
				var tiger1X=tiger1.x;
				var tiger1Y=tiger1.y;
				var thisX=tiger1X+j;
				var thisY=tiger1Y+k;
		if(((((tiger1X)%100)==80) && (((tiger1Y)%100)==30)) || (((tiger1X)%100)==30) && (((tiger1Y)%100)==80)) {//tiger can move diagonally if this condition is false
		if(( (thisX==(tiger1X+150)) ||  (thisX==(tiger1X-150))) && ((thisY==(tiger1Y+150)) ||  (thisY==(tiger1Y-150)))){
			var thisIncreament=Math.floor(Math.random()*1)+0;
			if(thisIncreament==0){
				thisY=tiger1Y;
			}
			else{
				thisX=tiger1Y;
			}
		}
	}
				if(thisX>630){
					thisX=thisX-300;
				}
				if(thisY>630){
					thisY=thisY-300;
				}
				if(thisX<30){
					thisX=Math.abs(thisX)+60;
				}
				if(thisY<30){
					thisY=Math.abs(thisY)+60;
				}
				var thisObject={x:thisX,y:thisY};
				pointOfIn.push(thisObject);
			}
		}
	}
	
}




























function letEatGoat(){
	for(t=0;t<tigerArray.length;t++){
		// document.getElementById('output1').innerHTML+="("+t+")"+"<br>";
		var tiger1=tigerArray[t];
		var pointOfIn=new Array();
		pointOfInfluence(tiger1);
		var dupliPoint=pointOfIn;
		for(i=0;i<pointOfIn.length;i++){
			var removePoint=pointOfIn[i];
			if((removePoint.x == tiger1.x) && (removePoint.y == tiger1.y)){
				pointOfIn.splice(i,1);
			}
			for(p=(i+1);p<dupliPoint.length;p++){
				if((removePoint.x == dupliPoint[p].x) && (removePoint.y == dupliPoint[p].y)){
					pointOfIn.splice(p,1);
				}
			}
		}
		


		for(n=0;n<pointOfIn.length;n++){
			var tigerEat=pointOfIn[n];
			for(g=0;g<stockPoints.length;g++){
				var eatPoint=stockPoints[g];
				if((tigerEat.x == eatPoint.x) && (tigerEat.y == eatPoint.y)){
					var blankBox;
					var thisCondition;
					var thisCondition1;
					influenceOfInfluence(eatPoint,tiger1);
					if((blankBox.x >630) || (blankBox.x <30) || (blankBox.y >630) || (blankBox.y <30)){
						thisCondition=false;
					}
					else{thisCondition=true;}
					for(r=0;r<stockPoints.length;r++){
						var bPoint=stockPoints[r];
						if((bPoint.x ==blankBox.x) && (bPoint.y ==blankBox.y)){
						return false;
						thisCondition1=false;
						}
						else{thisCondition1=true;}
					}
					if(thisCondition==true && thisCondition1==true){
						if(blankBox.x>0){
						//alert(blankBox.x+" , "+ blankBox.y+" , "+t)
						tigerArray.splice(t,1);
						tigerArray.insert(t,blankBox);
						stockPoints.splice(g,1);
						return false;

						}
						else{return;}
					}
				}
				function influenceOfInfluence(eatPoint,tiger1){
					var thisEatX=parseInt(eatPoint.x);
					var thisEatY=parseInt(eatPoint.y);
					var thisTigerPointX=parseInt(tiger1.x);
					var thisTigerPointY=parseInt(tiger1.y);
					var blankBoxX;
					var blankBoxY;
					var increamentX=parseInt((thisEatX -(thisTigerPointX)));
					var increamentY=parseInt((thisEatY -(thisTigerPointY)));
					blankBoxX=(thisEatX+(increamentX));
					blankBoxY=(thisEatY+(increamentY));
					blankBox={x:blankBoxX,y:blankBoxY}

				}
			}
		}

	}
	function pointOfInfluence(tiger1) {
		for(j=(-150);j<=150;j+=150){
			for(k=(-150);k<=150;k+=150){
				var tiger1X=tiger1.x;
				var tiger1Y=tiger1.y;
				var thisX=tiger1X+j;
				var thisY=tiger1Y+k;
		if(((((tiger1X)%100)==80) && (((tiger1Y)%100)==30)) || (((tiger1X)%100)==30) && (((tiger1Y)%100)==80)) {//tiger can move diagonally if this condition is false
		if(( (thisX==(tiger1X+150)) ||  (thisX==(tiger1X-150))) && ((thisY==(tiger1Y+150)) ||  (thisY==(tiger1Y-150)))){
			var thisIncreament=Math.floor(Math.random()*1)+0;
			if(thisIncreament==0){
				thisY=tiger1Y;
			}
			else{
				thisX=tiger1Y;
			}
		}
	}
				if(thisX>630){
					thisX=thisX-300;
				}
				if(thisY>630){
					thisY=thisY-300;
				}
				if(thisX<30){
					thisX=Math.abs(thisX)+60;
				}
				if(thisY<30){
					thisY=Math.abs(thisY)+60;
				}
				var thisObject={x:thisX,y:thisY};
				pointOfIn.push(thisObject);
			}
		}
	}
	
}



