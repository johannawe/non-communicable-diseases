//Do not start until jquery and our DOM is ready...
$( document ).ready(function() {

	init();
});

	function init(){


		var Krankheiten = ['CVD', 'cancer', 'respiratory', 'diabetes']
		var FarbenKrankheiten = ["#131313","#232323","#333333", "#434343"]
		//var FarbenKrankheitenhover = ["#7f7a7f","#7f7a7f", "#7f7a7f", "#7f7a7f"]
		//var FarbenKrankheiten = ["#04040a","#100b10", "#1f1c28", "#2f2a2f"]
		//var FarbenKrankheitenhover = ["#95919d","#95919d", "#95919d", "#95919d"]
		
		var End22 = [52,22,255]; 
		var Start2 = [22,255, 165]; 
		var End12 = [255,42,22];

		//rechts oben
		var End1 = [102,19,10]; 
		//links unten
		var End2= [24,10, 102]; 
		//linksoben
		var Start = [10,102,76];



		var End13 = [255,71,51]; 
		var End23= [82,51, 255]; 
		var Start3 = [51,255,197];


		//Polygon
		var Besetzt = [];
		var BesetztInfra = [];
		var Farben = [];
		var Poly  = [];
		var AnyObjSelected = false;
		var NumberSelectedObj = 0;
		var firstRun = true;

		//set active layer

		var layer1 = true;
		var layer2 = false;
		var layer3 = false;
		var state = 1;
		//raster für die Platzierung der Länder
		var grid = window.innerWidth/85;
		//größe der Länder angepasst auf raster und bildschirm
		var sizer = 100800/window.innerWidth;
		var colortmp;
		var mouseX=0;
    	var mouseY=0; 		
    	var timerlayer1;
    	var timerlayer2;
    	var timerlayer3;
		var clicks = 0;

		var isAnimating = false;
		//yWerte der Krankheiten in Ebene3
		var GesK = [];
		var MaleK = [];
		var FemK=[];
		//Koordinaten festlegen
		var x;
		var y;
		var s = Snap("#snap");
		// $("#snap").appendTo(".projectintro")


		var Maximum = [];
		for(i=0; i< NCDper100000.length; i++){
			Maximum.push(parseInt(NCDper100000[i].Value,10))
		}
		var Max = window.innerHeight/Math.max(...Maximum);
		console.log(Math.max(...Maximum))
//sorted Array of total value for both sexes
		var SortedNCD = [];
		for(i=0;i<NCDper100000.length-1;i++){
			if(NCDper100000[i].dim.YEAR == "2012" && NCDper100000[i].dim.SEX == "Both sexes"){
				SortedNCD.push(NCDper100000[i]);
			}
		}
		SortedNCD = SortedNCD.sort(function(b,a){
			return a.respiratory + b.respiratory;
		});


		//positionierung im bildschirm (Math.round((grade *2 --> rand vom bildschirm; *3 scalierung ; +window.innerWidth/8)/20)*20)
// Math.round(((LatLong[""+tmp+""].long)*2*3+(window.innerWidth/8))/20)*20


//fügt der Sortierten liste die Param Farbe und Ausgewählt und x/y pos hinzu
		for(ii=0; ii<SortedNCD.length; ii++){
			//Pos
			for(i=0; i<CodeToName.length; i++){
				if(SortedNCD[ii].dim.COUNTRY == CodeToName[i].name){
					var tmp = CodeToName[i].code.toLowerCase();
					SortedNCD[ii].offset = grid-Math.round(SortedNCD[ii].Value/sizer/2);
					x = (Math.round(((LatLong[""+tmp+""].long)*2*(window.innerHeight/(360*1.1)))/grid)*grid)+(window.innerWidth/2.6)+ SortedNCD[ii].offset;
					y = (Math.round(((LatLong[""+tmp+""].lat*(-1))*(window.innerHeight/(180*1.1)))/grid)*grid)+(window.innerHeight/1.9)+ SortedNCD[ii].offset ;
					besetzt(x,y,Besetzt);

					SortedNCD[ii].xTopo = Besetzt[Besetzt.length-1].tmpX +"";
					SortedNCD[ii].yTopo = Besetzt[Besetzt.length-1].tmpY +"";

					SortedNCD[ii].xPos = SortedNCD[ii].xTopo;
					SortedNCD[ii].yPos = SortedNCD[ii].yTopo;
				}
			}

			//Ausgewählt 
			SortedNCD[ii].selected = true;

		};
		//Farbe
		fillColor(Start, End1, End2, "Farbe");
		fillColor(Start2, End12, End22, "Farbehover");
		fillColor(Start3, End13, End23, "Farbehoverheller");

		//fügt Krankheiten zum SortedArray hinzu
		for(i=0; i<SortedNCD.length; i++){
			SortedNCD[i].CVD = Math.round(addDiseaseValue(CVD,i)*Max);
			SortedNCD[i].respiratory = Math.round(addDiseaseValue(respiratory,i)*Max);
			SortedNCD[i].diabetes = Math.round(addDiseaseValue(diabetes,i)*Max);
			SortedNCD[i].cancer = Math.round(addDiseaseValue(cancer,i)*Max);

			var height = SortedNCD[i].Value*Max;
			var y = window.innerHeight - height;
			var offset = 0;
			for(ii=0; ii < Krankheiten.length; ii++){
				var height = SortedNCD[i][Krankheiten[ii]];
				SortedNCD[i][''+Krankheiten[ii]+'Y'] = window.innerHeight- height - offset;
				offset += height;
			}
		}
		console.log(SortedNCD)

//startscreen
	//createlayer1();
	overviewlayer();




	
	function overviewlayer(){
		var width = 0;
		var line = 200 /3;
		var elementwidth = 80 / 4;
		var linewidth = 200 /3; 
		var del = 0; 
		
		for(ii=0; ii<SortedNCD.length; ii++){
			var h = (SortedNCD[ii].Value * Max) / 15;
			var y = 0;
						


			var rect = s.rect(linewidth*width, line - h,elementwidth,h);
			rect.attr({
				fill: SortedNCD[ii].Farbehover,
				'class': 'Country',
				'id': SortedNCD[ii].dim.COUNTRY,
			})

 			TweenMax.from($('#'+SortedNCD[ii].dim.COUNTRY+''),0.9,{attr:{y: line, height:0}, ease: Back.easeOut.config(0.1), delay: del})
 				del += 0.000001;



			var name = s.text(linewidth*width+ elementwidth/2, line + 20, SortedNCD[ii].dim.COUNTRYNAME);
			name.attr({
			    'font-family': 'Open Sans',
   			 	'font-size': '7px',
   			 	'fill': '#9a9a9a',
				'text-anchor': "middle",
				'id': SortedNCD[ii].dim.COUNTRY + "name",
				opacity: 1
			});
			TweenMax.from($('#'+SortedNCD[ii].dim.COUNTRY+'name'),0.7,{opacity: 0, ease: Back.easeOut.config(0.1), delay: del})
 				del += 0.009;

 				
			if(linewidth * width < window.innerWidth - linewidth * 2){
				width = width + 1;
			}else{
				width = 0;
				line = line + 100;
			}




		 // 	for(iii=0; iii < Krankheiten.length; iii++){

			// 	var height = SortedNCD[ii][Krankheiten[iii]]/7;
			// 	//var y = SortedNCD[ii][''+Krankheiten[iii]+'Y'] / 10;
				
			// 	console.log(SortedNCD[ii])

			// 	rect = s.rect(linewidth*width, line - (height + y),elementwidth, height);
			// 	rect.attr({
			// 		'class':''+Krankheiten[iii]+'',
			// 		'id': ''+Krankheiten[iii]+''+SortedNCD[ii].dim.COUNTRY+'',				
			// 		fill: FarbenKrankheiten[iii],				
			// 		fillOpacity: 0.4
			// 	})

			// 	y = y + height;
						
			// }

		 }
	}



		

		function fillColor(colorBeg, colorEnd1,colorEnd2, Farbe){
			for(i=0; i<SortedNCD.length; i++){
				Farben = [];
				for (var ii=0; ii<3; ii++){
					anf = colorBeg[ii];
					col = Math.round(anf+((((colorEnd1[ii]-anf)/window.innerWidth)*parseInt(SortedNCD[i].xPos))+(((colorEnd2[ii]-anf)/window.innerHeight)*parseInt(SortedNCD[i].yPos))));
					if (col>255){
						col = 255;
					}else if( col < 0){
						col = 0;
					}
					Farben.push(col);

				}; 
				SortedNCD[i][""+Farbe+""] = rgbToHex(Farben[0],Farben[1],Farben[2]) ;
			};
			
			SortedNCD = SortedNCD.sort(function(a,b){
				return a.Value - b.Value;
			});
		};

//convert RGB to Hex
		function rgbToHex(r, g, b) {
	   		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
		};	

		function besetzt(tmpX,tmpY, Arr){
			for(iii=0; iii<Arr.length ;iii++){
				if(tmpX >= Arr[iii].tmpX  && tmpX <= Arr[iii].tmpX+grid  && tmpY >= Arr[iii].tmpY && tmpY <= Arr[iii].tmpY+grid){
					tmpX+= grid;
					tmpY+= grid;
					besetzt(tmpX,tmpY,Arr);
				}
			}
			Arr.push({tmpX,tmpY});
		}
			
		function addDiseaseValue(disease, ind){
	//		for(i=0; i<SortedNCD.length; i++){
				for(ii=0; ii< disease.length; ii++){
					if(SortedNCD[ind].dim.COUNTRY == disease[ii].dim.COUNTRY && disease[ii].dim.YEAR == "2012" && disease[ii].dim.SEX == "Both sexes"){
						return disease[ii].Value;
					}
				}
	//		}
		};
	};


