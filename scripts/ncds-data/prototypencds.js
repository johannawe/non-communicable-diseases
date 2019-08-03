//Do not start until jquery and our DOM is ready...
$( document ).ready(function() {
	$("#information .close").on("click", function(e){
		console.log("hi")
		$("#information").addClass("hidden-information")
	})
	init();
});

	//PopUp for Help
	function openSidebar() {
		$("#information").removeClass("hidden-information")
	}


	function init(){
		//Farbtests

		// var End1 = [80,20,30]; 
		// var End2 = [40,40, 80]; 
		// var Start = [45,80,83];

		// var End12 = [255,57,10]; 
		// var End22= [0,50, 255]; 
		// var Start2 = [50,255,159];



		// var End13 = [255,127,90]; 
		// var End23= [60,60, 255]; 
		// var Start3 = [70,255,230];

		var Krankheiten = ['CVD', 'cancer', 'respiratory', 'diabetes']
		var FarbenKrankheiten = ["#4d464c","#35313d","#1f1c28","#0f0f16"]
		var FarbenKrankheitenhover = ["#7f7a7f","#7f7a7f", "#7f7a7f", "#7f7a7f"]
		var FarbenKrankheiten = ["#04040a","#100b10", "#1f1c28", "#2f2a2f"]
		//var FarbenKrankheitenhover = ["#95919d","#95919d", "#95919d", "#95919d"]
		
		var End22 = [52,22,222]; 
		var Start2 = [22,222, 165]; 
		var End12 = [222,42,22];

		//rechts oben
		var End1 = [102,19,10]; 
		//links unten
		var End2= [24,10, 102]; 
		//linksoben
		var Start = [10,102,76];



		var End13 = [255,71,51]; 
		var End23= [82,51, 255]; 
		var Start3 = [51,255,197];


		// var End2 = [30,201,168]; //X
		// var End1 = [180,33, 237]; //Y 
		// var Start = [168,212,12];

		// var End1 = [195,147,156]; 
		// var End2 = [12,14, 237]; 
		// var Start = [242,99,46];

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
		var s = Snap(window.innerWidth, window.innerHeight);
		s.attr({
			'id': "snap"
		});


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
			return b.Value + a.Value;
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
			//Infrastructure
			for(iii=0; iii<Infra.length; iii++){
				if(SortedNCD[ii].dim.COUNTRY == Infra[iii].dim.COUNTRY && Infra[iii].dim.YEAR == 2013){
					SortedNCD[ii].infra = Infra[iii].Value;
				}
			}
			//Pos für Infra
			console.log(Besetzt)
			for(i=0; i<CodeToName.length; i++){
				if(SortedNCD[ii].dim.COUNTRY == CodeToName[i].name){
					var tmp = CodeToName[i].code.toLowerCase();
					if(SortedNCD[ii].infra == "Yes"){
						//Mapping auf Bildschirmgröße unter berücksichtigung des Rasters
						var x = (Math.round(((LatLong[""+tmp+""].long)*2)/grid)*grid)+(window.innerWidth/2.5)+window.innerWidth/20 + SortedNCD[ii].offset;
						var y = (Math.round(((LatLong[""+tmp+""].lat*(-1))*2)/grid)*grid)+(window.innerHeight/2)-window.innerHeight/3.5 + SortedNCD[ii].offset;
					}else if(SortedNCD[ii].infra == "No"){
						var x = (Math.round(((LatLong[""+tmp+""].long)*2)/grid)*grid)+(window.innerWidth/2.5)+window.innerWidth/20 + SortedNCD[ii].offset;
						var y = (Math.round(((LatLong[""+tmp+""].lat*(-1))*2)/grid)*grid)+(window.innerHeight/2)+window.innerHeight/3.5 + SortedNCD[ii].offset;
					}else if(SortedNCD[ii].infra == "Nodatareceived" || SortedNCD[ii].infra == "Dontknow"){
						var x = (Math.round(((LatLong[""+tmp+""].long)*2)/grid)*grid)+(window.innerWidth/2.5)+window.innerWidth/20 + SortedNCD[ii].offset;
						var y = (Math.round(((LatLong[""+tmp+""].lat*(-1))*2)/grid)*grid)+(window.innerHeight/2);
					}
					


					besetzt(x,y,BesetztInfra);
					

					SortedNCD[ii].xInfra = BesetztInfra[BesetztInfra.length-1].tmpX +"";
					SortedNCD[ii].yInfra = BesetztInfra[BesetztInfra.length-1].tmpY +"";
				}
			}
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
	createlayer1();



	function createlayer1(){
		console.log(SortedNCD)
//reset Values
//Leeres Polygon für die Auswahl
		Poly  = [];

//remove old Interactions
		$(document).off();
		$(".Country").off();
		$(".hoverobj").off();
		$(window).off()
		$(".hoverobj").remove();
		$(".CountryHover").remove();
		$(".CVD").remove()
		$(".cancer").remove()
		$(".diabetes").remove()
		$(".respiratory").remove()

//reset layer
		if(firstRun == true){
			first = true;
			for(ii=0; ii<SortedNCD.length; ii++){
				var h = (SortedNCD[ii].Value/sizer);
				var rect = s.rect((SortedNCD[ii].xPos), (SortedNCD[ii].yPos),h,h);
				rect.attr({
					fill: SortedNCD[ii].Farbehover,
					'class': 'Country',
					'id': SortedNCD[ii].dim.COUNTRY,
				})
			}
			firstRun = false;

			var del = 0
			for(i=0; i< SortedNCD.length; i++){
				TweenMax.from($('#'+SortedNCD[i].dim.COUNTRY+''),0.7,{attr:{x:'+='+($('#'+SortedNCD[i].dim.COUNTRY+'').attr('width'))/2+'', y:'+='+($('#'+SortedNCD[i].dim.COUNTRY+'').attr('height'))/2+'', width:0,height:0}, ease: Back.easeOut.config(0.1), delay: del})
				del += 0.005;
			}
		}


		if(layer2 == true){
			layer2 =false;
			layer1 = true;
			for(i=0; i<SortedNCD.length; i++){
				if(SortedNCD[i].selected == true){
					TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.3,{attr:{y:window.innerHeight-5, height:5},ease: Power3.easeOut})
					TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.7,{attr:{x:SortedNCD[i].xPos ,y:SortedNCD[i].yPos ,width:SortedNCD[i].Value/sizer,height:SortedNCD[i].Value/sizer}, delay:0.25,ease: Power3.easeOut})
				}else{
					TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.4,{attr:{x:SortedNCD[i].xPos ,y:SortedNCD[i].yPos ,width:SortedNCD[i].Value/sizer,height:SortedNCD[i].Value/sizer}, delay:0.3,ease: Power3.easeOut})
					TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.4,{attr:{fill: SortedNCD[i].Farbe}, delay:1})
				}
				
				$('#Female'+SortedNCD[i].dim.COUNTRY+'').remove()
				$('#Male'+SortedNCD[i].dim.COUNTRY+'').remove()
			}

		
		}
//erstellt die Rechtecke
		
//add layerInteraction
		layer1Interaction();
	}



	function createlayer2(){
		var tlLayer2 = new TimelineMax();
		layer1 = false;
		layer2 = true;

//remove objects
		$('.diabetes').remove();
		$('.CVD').remove();
		$('.cancer').remove();
		$('.respiratory').remove();
//cancel Events aus layer1
		$(document).off();
		$(window).off()
		$(".Country").off();

//Animate Objs
		var xOffset = 0;
		var xAbstand = 0;
//guidelines 
		// for (i = 1; i<4; i++){
		// 	// var guideline = s.rect(0,(window.innerHeight/4*i), window.innerWidth, 1)
		// 	// guideline.attr({
		// 	// 	fill: '#999999',
		// 	// 	'fillOpacity': 0.5
		// 	// })
		// 	var guidelinetext = s.text(3,(window.innerHeight/4*i)+17, (Math.max(...Maximum)-((Math.max(...Maximum)/4*i)))+"");
		// 	guidelinetext.attr({
		// 		fill: "#999999",
		// 		'font-size': 13,
		// 		'font-family': 'Open Sans',
		// 	})

		// }


		for(i=0; i<SortedNCD.length; i++){
			if(SortedNCD[i].selected == true){
				//referencwidth für den Abstand
			var referencewidth = window.innerWidth/NumberSelectedObj;
			//breite der einzelnen Elemente
			var width = window.innerWidth/(NumberSelectedObj)- 4;
			var x = (referencewidth) * xOffset + 2;
			xOffset ++;
			var height = SortedNCD[i].Value*Max;
			var y = window.innerHeight - height;
			var time = 1;
			tlLayer2
				.to($('#'+SortedNCD[i].dim.COUNTRY+''), 0.7,{attr:{x:x, y:window.innerHeight-5, width:width, height:5}, ease: Power3.easeOut, 
					onStart: function(){
						isAnimating = true;
					},
					onComplete: function(){
						isAnimating = false
					}

				}, 0.1)
				.to($('#'+SortedNCD[i].dim.COUNTRY+''), 0.4,{attr:{y:y, height:height}, ease: Power3.easeInOut}, 0.6)


			//HOVER
			rect = s.rect(x-2,0,width+4,window.innerHeight)
			rect.attr({
				fill: '#9999bb',
				fillOpacity: 0,
				'id': 'Hover'+SortedNCD[i].dim.COUNTRY+'',
				class: 'CountryHover'
			})
				
				for(ii=0; ii < Krankheiten.length; ii++){

					var height = SortedNCD[i][Krankheiten[ii]];
					var y = SortedNCD[i][''+Krankheiten[ii]+'Y'];
					
						rect = s.rect(x,y,width,height);
						rect.attr({
							'class':''+Krankheiten[ii]+'',
							'id': ''+Krankheiten[ii]+''+SortedNCD[i].dim.COUNTRY+'',				
							fill: FarbenKrankheiten[ii],				
							fillOpacity:0.5
						})
					tlLayer2.from($('#'+Krankheiten[ii]+''+SortedNCD[i].dim.COUNTRY+''),0.2,{attr:{y:y+height, height:0},  ease: Power3.easeInOut}, time)

					time +=0.1

				}
			}else if(SortedNCD[i].selected == false){
				TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.4,{attr:{width:0, height:0}})
				$('#'+SortedNCD[i].dim.COUNTRY+'').hide;
			}
		}

		//add new events
		if (isAnimating = true){
			layer2Interaction();
		}
	};

	function createlayer3(myId, height){
		var tlLayer3 = new TimelineMax;
		$(".CountryHover").remove();

//reset Values
		layer1 = false;
		layer2 = false;
		layer3 = true;
		//Variable für aktuelle farbe
		var currentColor;
//remove Old Interactions
		$(document).off();
		$(".Country").off();
		$(window).off();
		for(i=0; i< Krankheiten.length; i++){
			$('.'+Krankheiten[i]+'').off()
		}
		console.log(myId)
		for(i = 0; i< SortedNCD.length; i++){
			if(SortedNCD[i].selected == true){
				if(SortedNCD[i].dim.COUNTRY != myId){
					console.log(SortedNCD[i].dim.COUNTRY)
					tlLayer3.to($("#"+SortedNCD[i].dim.COUNTRY+""), 0.3, {attr:{y:(window.innerHeight), height:0},
						onStart: function(){ // ebene wird angefagen zu animieren
								isAnimating = true;
						}}, 0); 
						//nicht ausgewählte Objekte 
				}else{
					var currentHeight;
					currentColor = SortedNCD[i].Farbehover //speichere die Farbe des Aktuellen objekts für später
					tlLayer3.to($("#"+myId+""), 0.3, {attr:{y: window.innerHeight-5, height:5}}, 0); // ausgewähltes Objekte
					tlLayer3.to($("#"+myId+""), 0.4, {attr:{x:(window.innerWidth/3)+4, width:(window.innerWidth/3-8)}}, 0.3);
					tlLayer3.to($("#"+myId+""), 0.4,{ attr:{y: window.innerHeight-height, height:height}}, 0.6)
				}
				for(ii =0; ii<= Krankheiten.length; ii++){
					tlLayer3.to($('#'+Krankheiten[ii]+SortedNCD[i].dim.COUNTRY+''), 0.4, {attr:{y:(window.innerHeight), height:0}}, 0);
					$('#'+Krankheiten[ii]+SortedNCD[i].dim.COUNTRY+'').remove();

				}
			}
		}


//add objects





		var referencewidth = window.innerWidth/3;
		var width = window.innerWidth/3 - 8;

		for(i=0; i<NCDper100000.length; i++){

			if(myId == NCDper100000[i].dim.COUNTRY && NCDper100000[i].dim.YEAR == 2012){
				if(NCDper100000[i].dim.SEX == "Male"){ 
						//console.log(NCDper100000[i]); 

					rect = s.rect(4,(window.innerHeight-NCDper100000[i].Value*Max),width,NCDper100000[i].Value*Max)
					rect.attr({
						'class': "Male",
						'id': "Male "+NCDper100000[i].dim.COUNTRY+"",
						fill: currentColor,
						fillOpacity:1
					})
					var rect = s.rect(4,window.innerHeight-NCDper100000[i].Value*Max, width, NCDper100000[i].Value*Max) 
					rect.attr({
						fill:'#221137',
						'class': 'BG',
						fillOpacity:0.6
					})

				}
				if(NCDper100000[i].dim.SEX == "Female"){
						//console.log(NCDper100000[i]);


					rect = s.rect((window.innerWidth/3)*2+4,(window.innerHeight-NCDper100000[i].Value*Max),width,NCDper100000[i].Value*Max)
					rect.attr({
						'class': "Female",
						'id': "Female "+NCDper100000[i].dim.COUNTRY+"",
						fill: currentColor,
						fillOpacity:1
					})
					var rect = s.rect((window.innerWidth/3)*2+4,(window.innerHeight-NCDper100000[i].Value*Max),width,NCDper100000[i].Value*Max)
					rect.attr({
						fill:'#371122',
						'class': 'BG',
						fillOpacity:0.6
					})

				}
			}

		}	
//BG
//gradient
// var gMale = s.gradient("l(0.995,0.5,1,0.5)#55d7ff-#000000");
// var gFemale = s.gradient("l(0.5,1,0.5,0)#ff55d7-#000000");
//MAle

//Female

		TweenMax.from($('.BG'),0.4, {fillOpacity:0, delay:1.2})
		var offsetFem = 0;	
		var offsetMale = 0;
		var offsetBoth = 0;
		for(ii = 0; ii < Krankheiten.length; ii++){
			for( i = 0; i < NCDper100000.length; i++){
				var heightFem = parseInt(eval(Krankheiten[ii])[i].Value, 10)*Max;
				var yFem = window.innerHeight- heightFem;
				var heightMale = parseInt(eval(Krankheiten[ii])[i].Value, 10)*Max;
				var yMale = window.innerHeight- heightMale;
				var heightBoth = parseInt(eval(Krankheiten[ii])[i].Value, 10)*Max;
				var yBoth = window.innerHeight- heightBoth;
				if(myId == eval(Krankheiten[ii])[i].dim.COUNTRY && eval(Krankheiten[ii])[i].dim.YEAR == 2012){
					
					//Gesamt von unten nach oben
					if(eval(Krankheiten[ii])[i].dim.SEX == "Both sexes"){
						GesK[ii] = (yBoth-offsetBoth);
						rect = s.rect((window.innerWidth/3+4),yBoth-offsetBoth,width,heightBoth)
						rect.attr({
							'class': Krankheiten[ii],
							'id':"Both"+Krankheiten[ii]+"",
							fill: FarbenKrankheiten[ii],
							fillOpacity: 0.6
						})
						tlLayer3.from($("#Both"+Krankheiten[ii]+""),0.2, {attr:{height:0, y:window.innerHeight}},0.8)
						offsetBoth += heightBoth
					}


					// Frauen
					if(eval(Krankheiten[ii])[i].dim.SEX == "Female"){
						FemK[ii] = (yFem-offsetFem);
						rect = s.rect((window.innerWidth/3)*2+4,yFem-offsetFem,width,heightFem)
						rect.attr({
							'class': Krankheiten[ii],
							'id':"Female"+Krankheiten[ii]+"",
							fill: FarbenKrankheiten[ii],
							fillOpacity: 0.6
						})

						tlLayer3.from($("#Female"+Krankheiten[ii]+""),0.2, {attr:{height:0, y:window.innerHeight}},0.8)
						
						offsetFem += heightFem;
					}
					//Männer
					if(eval(Krankheiten[ii])[i].dim.SEX == "Male"){
						MaleK[ii] = (yMale-offsetMale);
						rect = s.rect(4,yMale-offsetMale,width,heightMale)
						rect.attr({
							'class': Krankheiten[ii],
							fill: FarbenKrankheiten[ii],
							'id':"Male"+Krankheiten[ii]+"",
							fillOpacity: 0.6
						})
						// keine Interaktion, bis die Ebene vollständig geladen hat
						tlLayer3.from($("#Male"+Krankheiten[ii]+""),0.2, {attr:{height:0, y:window.innerHeight},
							onComplete: function(){ //ebene ist fertig animiert
								isAnimating = false
							}},0.8)	
						offsetMale += heightMale;
					}
				}

			}
		}
		tlLayer3
			.from($('.Male'), 0.6, {attr:{y:window.innerHeight, height:0}},0.6)
			.from($('.Female'), 0.6, {attr:{y:window.innerHeight, height:0}},0.6)
		//}
//add new Interactions
		layer3Interaction(myId)
	}

//Interaktion
//Erstellt ein Polygon 
		function layer1Interaction(){
			var scrolltmp = 0;
			firstRun = false;
			var Countryname;
			$(document)
				.on("mousedown",function(event){

					mouseStartX = event.pageX;
					mouseStartY = event.pageY;
					Poly = [];
					mouseX = event.pageX;
					mouseY = event.pageY;
					Poly.push({x: mouseX, y: mouseY});	
					var CurrX = mouseX;
					var CurrY = mouseY;
					var num = 0;
					$(document).on("mousemove", function(event){
						CurrX = event.pageX;
						CurrY = event.pageY;

							num ++;
						if(Math.abs(CurrX-mouseX) >10 || Math.abs(CurrY-mouseY)>10){
							mouseX = CurrX;
							mouseY = CurrY;
							Poly.push({x: mouseX, y: mouseY});
							circle = s.circle(mouseX, mouseY, 1).attr({fill:"#ffffff", fillOpacity: 0.5, 'class':num})
							console.log(num)
							$('.'+num+'').fadeOut(600, function(){
								$('.'+num+'').remove();
							})

						};
					});

	    		})
				.on("mouseup",function(event){
					num = 0;
					$(document).off("mousemove")
					if(event.pageX != mouseStartX && event.pageY != mouseStartY){
						Poly.push({x: Poly[0].x, y: Poly[0].y})
						testIfSelected();
					}


					//SelectedPoints = [];
				})
				//klick und doppelklick werden mit timeout festgelegt, damit sie sich nicht in die Quere kommmen
				.on('click', function(event){
					clicks++
					if(clicks == 1){
						console.log(clicks)
						timerlayer1 = setTimeout(function(){
							if(event.target.id == 'snap' && NumberSelectedObj > 1 && event.pageX == mouseStartX && event.pageY == mouseStartY){
								createlayer2();
							}
							clicks = 0;
						},300)
							
					}else if(clicks == 2){
						console.log(clicks)
						clearTimeout(timerlayer1);
						clicks = 0;
						first = true;
						for(i= 0; i< SortedNCD.length; i++){
							SortedNCD[i].selected = true;
							Poly = [];
							NumberSelectedObj = SortedNCD.length;

							TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.6,{attr:{x:SortedNCD[i].xPos,y:SortedNCD[i].yPos, fill:SortedNCD[i].Farbehover}, ease:Back.easeOut.config(0.2)});	
						}
												// change selector
						
					}
				})			
				.on("dblclick",function(event){
					event.preventDefault();
				}) 
			$(window)
				.on("mousewheel", function(event){
					
					if(!$("#information").hasClass("information-hidden") && event.pageX < 400){
						console.log(":) "+event.pageX)

					}else{
						event.preventDefault();
						if(!isAnimating){
						scrolltmp ++;
						console.log(scrolltmp)
						if(scrolltmp >50){
							//go back to default

							if(state == 1){
								for(i=0; i<SortedNCD.length; i++){
									SortedNCD[i].xPos = SortedNCD[i].xInfra;
									SortedNCD[i].yPos = SortedNCD[i].yInfra;
									TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.5,{attr:{x:SortedNCD[i].xPos,y:SortedNCD[i].yPos}, ease:Back.easeOut.config(0.2)});	
								}
								state = 2;
							}else if(state == 2){
								for(i=0; i<SortedNCD.length; i++){
									SortedNCD[i].xPos = SortedNCD[i].xTopo;
									SortedNCD[i].yPos = SortedNCD[i].yTopo;
									TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.5,{attr:{x:SortedNCD[i].xPos,y:SortedNCD[i].yPos}, ease:Back.easeOut.config(0.2)});	
								}
								state =1;
							}
							scrolltmp = 0;
						}	
					}	
					}
				
					
				})

			$(".Country").on("click", function(event){
				//firstRun = false;
				if(first){
					first = false;
					NumberSelectedObj = 0;
					for(i=0;i<SortedNCD.length;i++){
						if(SortedNCD[i].selected && this.id != SortedNCD[i].dim.COUNTRY){
							SortedNCD[i].selected = false;
							TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.4,{attr:{fill:  SortedNCD[i].Farbe}, ease:Power3.easeOut});
						}
						if(this.id == SortedNCD[i].dim.COUNTRY){
							SortedNCD[i].selected = true;
							NumberSelectedObj ++;
							TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.4,{attr:{fill:  SortedNCD[i].Farbehover}, ease:Power3.easeOut});
						}
					}
					
				}else if(first == false){
					for(i=0;i<SortedNCD.length;i++){
						if(this.id == SortedNCD[i].dim.COUNTRY){
							if(SortedNCD[i].selected == true){
								SortedNCD[i].selected = false;
								TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.4,{attr:{fill:  SortedNCD[i].Farbe}, ease:Power3.easeOut});
								NumberSelectedObj --;
							}
							else if(SortedNCD[i].selected == false){
								SortedNCD[i].selected = true;
								NumberSelectedObj ++;
								TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.4,{attr:{fill:  SortedNCD[i].Farbehover}, ease:Power3.easeOut});
							}
						}				
					}
			}

			})

			.on("mouseenter", function(event){
				console.log($(this).attr('id'))
				for(i=0; i<SortedNCD.length; i++){
					if(this.id == SortedNCD[i].dim.COUNTRY){
						console.log(event.pageX)
						$('body').prepend('<div class="name" style="color:'+SortedNCD[i].Farbehoverheller+'; position:absolute; top:'+ (event.pageY + 10) +'px; left:'+ (event.pageX + 10)+'px">'+SortedNCD[i].dim.COUNTRYNAME+'<br/><span style="font-weight: 600;">'+SortedNCD[i].Value+'</span></div>')
						$('.name').fadeIn( 400 );
						if(firstRun == false){
							if(SortedNCD[i].selected == false){
								TweenMax.to($(this),0.4,{attr:{fill:SortedNCD[i].Farbehover}, ease:Power3.easeOut})
							}else{
								TweenMax.to($(this),0.4,{attr:{fill:SortedNCD[i].Farbehoverheller}, ease:Power3.easeOut})
							}
						}
						
					}
				}		
			})		
			.on("mouseleave", function(event){
				TweenMax.to($('.name'), 0, {opacity:0, onComplete:function(){
					$('.name').remove();
				}})
				for(i=0; i<SortedNCD.length; i++){
					if(this.id == SortedNCD[i].dim.COUNTRY){
						if(firstRun == false){
							if(SortedNCD[i].selected == false){
								TweenMax.to($(this),0.4,{attr:{fill:SortedNCD[i].Farbe}, ease:Power3.easeOut})
							}else{
								TweenMax.to($(this),0.4,{attr:{fill:SortedNCD[i].Farbehover }, ease:Power3.easeOut})
							}
							
						}
						
					}
				}
			})
			.on("mouseup", function(event){
				TweenMax.to($('.name'), 0, {opacity:0, onComplete:function(){
					$('.name').remove();
				}})
				for(i=0; i<SortedNCD.length; i++){
					if(this.id == SortedNCD[i].dim.COUNTRY){
						if(firstRun == false){
							if(SortedNCD[i].selected == false){
								TweenMax.to($(this),0.4,{attr:{fill:SortedNCD[i].Farbe}, ease:Power3.easeOut})
							}else{
								TweenMax.to($(this),0.4,{attr:{fill:SortedNCD[i].Farbehover }, ease:Power3.easeOut})
							}
							
						}
						
					}
				}
			});

			
		};

		function layer2Interaction(){
			var Krankheitname;

			var clicks = 0;
			$(".CountryHover")
				.on('mouseenter', function(event){
						TweenMax.to($(this), 0.1, {fillOpacity: 0.1})
						for(i=0; i<SortedNCD.length; i++){
							if(SortedNCD[i].dim.COUNTRY == this.id.substr(5)){
								var color = SortedNCD[i].Farbehoverheller;
							}
						}
						TweenMax.to($('#'+this.id.substr(5)+''),0.1,{attr:{fill:color}})

					
				})
				.on('mouseleave', function(){
					TweenMax.to($(this), 0.2, {fillOpacity: 0})
					for(i=0; i<SortedNCD.length; i++){
						if(SortedNCD[i].dim.COUNTRY == this.id.substr(5)){
							var color = SortedNCD[i].Farbehover
						}
					}
					TweenMax.to($('#'+this.id.substr(5)+''),0.2,{attr:{fill: color}})
				})
				.on("click", function(event){
					clicks++;
					//save ID 
					var tmp = this;
					if(clicks == 1){
						timerlayer2 = setTimeout(function(){
								//create layer3
								for(i=0; i<SortedNCD.length; i++){
									if(SortedNCD[i].dim.COUNTRY == tmp.id.substr(5)){
										var color = SortedNCD[i].Farbehover
									}
								}
								TweenMax.to($('#'+tmp.id.substr(5)+''),0.1,{attr:{fill: color}})
								console.log(tmp.id.substr(5))
								createlayer3(tmp.id.substr(5), $('#'+tmp.id.substr(5)+'').attr('height'));
							clicks = 0;
						},300)
					}else{
						clicks = 0
						clearTimeout(timerlayer2);
						createlayer1();
					}	
				})
				.on("dblclick", function(event){
					event.preventDefault();
				})
//display text
				.on("mouseenter", function(event){
					for(i=0; i<SortedNCD.length; i++){
						if(this.id.substring(5) == SortedNCD[i].dim.COUNTRY){
							console.log(SortedNCD[i].Farbehoverheller)
							//VERY UGLY QUICKFIX
							var pageY = event.pageY
							var pageX = event.pageX	
							if (event.pageX > window.innerWidth - 100){
								if(event.pageY >  window.innerHeight - 100){
									$('body').prepend('<div class="name" style="color:'+SortedNCD[i].Farbehoverheller+'; position:absolute; bottom:10px; right:10px" >'+SortedNCD[i].dim.COUNTRYNAME+'<br/><span style="font-weight: 600;">'+SortedNCD[i].Value+'</span></div>')
								}else{
									$('body').prepend('<div class="name" style="color:'+SortedNCD[i].Farbehoverheller+'; position:absolute; top:'+ (pageY + 10) +'px; right:10px" >'+SortedNCD[i].dim.COUNTRYNAME+'<br/><span style="font-weight: 600;">'+SortedNCD[i].Value+'</span></div>')
								}
							}else{
								if(event.pageY >  window.innerHeight - 100){
									$('body').prepend('<div class="name" style="color:'+SortedNCD[i].Farbehoverheller+'; position:absolute; bottom:10px; left:'+ (pageX + 10)+'px" >'+SortedNCD[i].dim.COUNTRYNAME+'<br/><span style="font-weight: 600;">'+SortedNCD[i].Value+'</span></div>')
								}else{
									$('body').prepend('<div class="name" style="color:'+SortedNCD[i].Farbehoverheller+'; position:absolute; top:'+ (pageY + 10) +'px; left:'+ (pageX + 10)+'px" >'+SortedNCD[i].dim.COUNTRYNAME+'<br/><span style="font-weight: 600;">'+SortedNCD[i].Value+'</span></div>')
								}
							}
							$('.name').fadeIn( 400 );
							if(firstRun == false){
								if(SortedNCD[i].selected == false){
									TweenMax.to($(this),0.4,{attr:{fill:SortedNCD[i].Farbehover}, ease:Power3.easeOut})
								}else{
									TweenMax.to($(this),0.4,{attr:{fill:SortedNCD[i].Farbehoverheller}, ease:Power3.easeOut})
								}
							}
								
						}
					}
				})		
				.on("mouseleave", function(event){
					TweenMax.to($('.name'), 0, {opacity:0, onComplete:function(){
					$('.name').remove();
					}})
					for(i=0; i<SortedNCD.length; i++){
						if(this.id == SortedNCD[i].dim.COUNTRY){
							if(firstRun == false){
								if(SortedNCD[i].selected == false){
									TweenMax.to($(this),0.4,{attr:{fill:SortedNCD[i].Farbe}, ease:Power3.easeOut})
								}else{
									TweenMax.to($(this),0.4,{attr:{fill:SortedNCD[i].Farbehover }, ease:Power3.easeOut})
								}
									
							}
							
						}
					}
				});	
			var krankheitselected = false; 
			for(i=0; i< Krankheiten.length; i++){
				$('.'+Krankheiten[i]+'')
					.on("click", function(){
						if(krankheitselected  == false){
							for(ii=0; ii< Krankheiten.length; ii++){
								if (Krankheiten[ii] !== this.getAttribute('class')){
									for(iii = 0; iii< SortedNCD.length; iii++){
										if(SortedNCD[iii].selected == true){
											TweenMax.to($('#'+Krankheiten[ii]+''+SortedNCD[iii].dim.COUNTRY+''), 0.2, {fillOpacity: 0, 
												onComplete: function(){
													$(this.target).hide() //disable interaction 
												}
											})
										}
									}
								}else{
									for(iii = 0; iii< SortedNCD.length; iii++){
										if(SortedNCD[iii].selected == true){
											TweenMax.to($('#'+Krankheiten[ii]+''+SortedNCD[iii].dim.COUNTRY+''), 0.2, {attr:{fill:FarbenKrankheiten[ii] , y: window.innerHeight-$('#'+Krankheiten[ii]+''+SortedNCD[iii].dim.COUNTRY+'').attr('height')}, delay: 0.1});
										}
									}
								}
							}
							krankheitselected  =true;
						}else if(krankheitselected){
							krankheitselected  =false;
							for(ii=0; ii< Krankheiten.length; ii++){
								if (Krankheiten[ii] !== this.getAttribute('class')){
									for(iii = 0; iii< SortedNCD.length; iii++){
										if(SortedNCD[iii].selected == true){
											TweenMax.to($('#'+Krankheiten[ii]+''+SortedNCD[iii].dim.COUNTRY+''), 0.2, {fillOpacity: 0.6, delay: 0.1,
												onStart: function(){
													$(this.target).show() // enable interaction
												}
											})
										}
									}
								}else{
									for(iii = 0; iii< SortedNCD.length; iii++){
										if(SortedNCD[iii].selected == true){
											TweenMax.to($('#'+Krankheiten[ii]+''+SortedNCD[iii].dim.COUNTRY+''), 0.2, {attr:{y: SortedNCD[iii][''+Krankheiten[ii]+'Y']}})
										}
									}
								}
							}
							
					}	
					})
					.on("mouseenter", function(event){
						for(i= 0; i<Krankheiten.length; i++){
							if(this.getAttribute('class') == Krankheiten[i]){

								//VERY UGLY QUICKFIX
								var pageY = event.pageY
								var pageX = event.pageX	
								var krankheit = Krankheiten[i]
								if (krankheit == "CVD"){
									krankheit = "cardiovascular disease"
								}else if(krankheit == "respiratory"){
									krankheit = "respiratory disease"
								}
								if (event.pageX > window.innerWidth - 100){
									if(event.pageY >  window.innerHeight - 100){
										$('body').prepend('<div class="name" style="position:absolute; bottom:10px; right:10px" >'+krankheit+'</div>')
									}else{
										$('body').prepend('<div class="name" style="position:absolute; top:'+ (pageY + 10) +'px; right:10px" >'+krankheit+'</div>')
									}
								}else{
									if(event.pageY >  window.innerHeight - 100){
										$('body').prepend('<div class="name" style="position:absolute; bottom:10px; left:'+ (pageX + 10)+'px" >'+krankheit+'</div>')
									}else{
										$('body').prepend('<div class="name" style="position:absolute; top:'+ (pageY + 10) +'px; left:'+ (pageX + 10)+'px" >'+krankheit+'</div>')
									}
								}								
								$('.name').fadeIn( 400 );

								color = FarbenKrankheitenhover[i];
							}
						}
						TweenMax.to($('.'+this.getAttribute('class')+''),0.2,{attr:{fill: color}})
					})
					.on("mouseleave", function(event){
						TweenMax.to('.name', 0, {opacity:0, onComplete:function(){
							$('.name').remove();
						}})
						for(i= 0; i<Krankheiten.length; i++){
							if(this.getAttribute('class') == Krankheiten[i]){
								color = FarbenKrankheiten[i];
							}
						}
						TweenMax.to($('.'+this.getAttribute('class')+''),0.2,{attr:{fill: color}})
					})
			$(document).on("mouseup", function(event){
				TweenMax.to('.name', 0, {opacity:0, onComplete:function(){
					$('.name').remove();
				}})
			})
					
			}

		}

		function layer3Interaction(myId){
			// var tmp = 0;
			// //var next = 0;
			var clicks = 0;
			 $(document)
				.on("click", function(event){
					clicks ++;
					if(clicks == 1){
						timerlayer3 = setTimeout(function(){
							clicks = 0
						},300)
					}else{
						clearTimeout(timerlayer3);
						$('.CVD').remove();
						$('.respiratory').remove();
						$('.cancer').remove();
						$('.diabetes').remove();
						TweenMax.to($(".Male"), 0.2, {attr:{y: window.innerHeight, height:0}})
						TweenMax.to($(".Female"), 0.2, {attr:{y: window.innerHeight, height:0}})
						TweenMax.to($("#"+myId), 0.2, {attr:{y:window.innerHeight-5, height:20}});

						TweenMax.to($('.BG'), 0.1, {fillOpacity: 0, 
							onComplete: function(){
								$('.BG').remove();
							}
						})
						createlayer2();
						$(".Country").show()
						$(".Country").show()
						tmp=0;
						clicks = 0;
					}
				})
			var krankheitselected = false;
			for(i=0; i< Krankheiten.length; i++){
				$('#Both'+Krankheiten[i]+', #Male'+Krankheiten[i]+',#Female'+Krankheiten[i]+'')
					.on("mouseenter", function(event){
						for(i= 0; i<Krankheiten.length; i++){
								if(this.getAttribute('class') == Krankheiten[i]){

									//VERY UGLY QUICKFIX
									var pageY = event.pageY
									var pageX = event.pageX	
									var krankheit = Krankheiten[i]
									if (krankheit == "CVD"){
										krankheit = "cardiovascular disease"
									}else if(krankheit == "respiratory"){
										krankheit = "respiratory disease"
									}
									if (event.pageX > window.innerWidth - 100){
										if(event.pageY >  window.innerHeight - 100){
											$('body').prepend('<div class="name" style="position:absolute; bottom:10px; right:10px" >'+krankheit+'</div>')
										}else{
											$('body').prepend('<div class="name" style="position:absolute; top:'+ (pageY + 10) +'px; right:10px" >'+krankheit+'</div>')
										}
									}else{
										if(event.pageY >  window.innerHeight - 100){
											$('body').prepend('<div class="name" style="position:absolute; bottom:10px; left:'+ (pageX + 10)+'px" >'+krankheit+'</div>')
										}else{
											$('body').prepend('<div class="name" style="position:absolute; top:'+ (pageY + 10) +'px; left:'+ (pageX + 10)+'px" >'+krankheit+'</div>')
										}
									}								
									$('.name').fadeIn( 400 );

									color = FarbenKrankheitenhover[i];
								}
							}
							TweenMax.to($('.'+this.getAttribute('class')+''),0.2,{attr:{fill: color}})
					})
					.on("mouseleave", function(event){
						TweenMax.to('.name', 0, {opacity:0, onComplete:function(){
							$('.name').remove();
						}})
						for(i= 0; i<Krankheiten.length; i++){
							if(this.getAttribute('class') == Krankheiten[i]){
								color = FarbenKrankheiten[i];
							}
						}
						TweenMax.to($('.'+this.getAttribute('class')+''),0.2,{attr:{fill: color}})
					})
					.on("click", function(event){
						console.log(MaleK)
						timelineKlick = new TimelineMax;
						if (krankheitselected == false){
							for(ii=0; ii< Krankheiten.length; ii++){
								if (Krankheiten[ii] !== this.getAttribute('class')){
										TweenMax.to($('#Both'+Krankheiten[ii]+''), 0.2, {fillOpacity: 0, 
											onComplete: function(){
												$(this.target).hide() //disable interaction 
											}
										})
										TweenMax.to($('#Female'+Krankheiten[ii]+''), 0.2, {fillOpacity: 0, 
											onComplete: function(){
												$(this.target).hide() //disable interaction 
											}
										})
										TweenMax.to($('#Male'+Krankheiten[ii]+''), 0.2, {fillOpacity: 0, 
											onComplete: function(){
												$(this.target).hide() //disable interaction 
											}
										})
								}else{
									TweenMax.to($('#Both'+Krankheiten[ii]+''), 0.2, {attr:{fill:FarbenKrankheiten[ii] , y: window.innerHeight-$('#Both'+Krankheiten[ii]+'').attr('height')}, delay: 0.1})	
									TweenMax.to($('#Female'+Krankheiten[ii]+''), 0.2, {attr:{fill:FarbenKrankheiten[ii] , y: window.innerHeight-$('#Female'+Krankheiten[ii]+'').attr('height')}, delay: 0.1})	
									TweenMax.to($('#Male'+Krankheiten[ii]+''), 0.2, {attr:{fill:FarbenKrankheiten[ii] , y: window.innerHeight-$('#Male'+Krankheiten[ii]+'').attr('height')}, delay: 0.1})	
								}
							}
							krankheitselected  =true;
							console.log ($('.CVD'))
						}else{
							krankheitselected  =false;
							for(ii = 0; ii< Krankheiten.length; ii++){
								if (Krankheiten[ii] == this.getAttribute('class')){
									TweenMax.to($('#Both'+Krankheiten[ii]+''), 0.2, {attr:{fill:FarbenKrankheiten[ii] , y: GesK[ii]}})	
									TweenMax.to($('#Female'+Krankheiten[ii]+''), 0.2, {attr:{fill:FarbenKrankheiten[ii] , y: FemK[ii]}})	
									TweenMax.to($('#Male'+Krankheiten[ii]+''), 0.2, {attr:{fill:FarbenKrankheiten[ii] , y: MaleK[ii]}})
								}else{
									$('#Both'+Krankheiten[ii]+'').show();
									$('#Female'+Krankheiten[ii]+'').show();
									$('#Male'+Krankheiten[ii]+'').show();
									TweenMax.to($('#Both'+Krankheiten[ii]+''), 0.2, {fillOpacity: 0.6, delay: 0.1})	
									TweenMax.to($('#Female'+Krankheiten[ii]+''), 0.2, {fillOpacity: 0.6, delay: 0.1})	
									TweenMax.to($('#Male'+Krankheiten[ii]+''), 0.2, {fillOpacity: 0.6, delay: 0.1})	
								}
}							
							
						}

					})
					$(document).on("mouseup", function(event){
						TweenMax.to('.name', 0, {opacity:0, onComplete:function(){
						$('.name').remove();
					}})
			})
			}
		}



		

//testet, ob sich ein Punkt in einem Polygon befindet	
		function testIfSelected(){
			if(first){
				first = false
				NumberSelectedObj = 0;
				for(i= 0; i<SortedNCD.length; i++){
					if(isPointInPoly(Poly, SortedNCD[i]) == false){
						SortedNCD[i].selected = false; 
						TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.4,{attr:{fill: SortedNCD[i].Farbe}, ease:Power3.easeOut});
					}
					if(isPointInPoly(Poly, SortedNCD[i]) == true){
						SortedNCD[i].selected = true; 
						NumberSelectedObj ++;
						TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.4,{attr:{fill: SortedNCD[i].Farbehover}, ease:Power3.easeOut});
					}
				}
			}else if (first == false){
				for(i= 0; i<SortedNCD.length; i++){
					if(isPointInPoly(Poly, SortedNCD[i]) == true){
						if(SortedNCD[i].selected == false){							
							SortedNCD[i].selected = true; 
							NumberSelectedObj ++;
							TweenMax.to($('#'+SortedNCD[i].dim.COUNTRY+''),0.4,{attr:{fill: SortedNCD[i].Farbehover}, ease:Power3.easeOut});
						}
					}
				}
			}

		}

		function isPointInPoly(poly, pt){
		    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
		        ((poly[i].y <= parseInt(pt.yPos) && parseInt(pt.yPos) < poly[j].y) || (poly[j].y <= parseInt(pt.yPos) && parseInt(pt.yPos) < poly[i].y))
		        && (parseInt(pt.xPos) < (poly[j].x - poly[i].x) * (parseInt(pt.yPos) - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
		        && (c = !c);
		    return c;
		};

//legt Farbe der einzelnen Objekte fest

// +2*(window.innerHeight/(360*1.1)) -> offset x
// +(window.innerHeight/(180*1.1) -> offset y
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


