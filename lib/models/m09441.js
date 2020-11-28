
//	Основи на Компютърната Графика
//	Модел 09441 - Създаване на квадратен тор
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09441 = function M09441(room)
{
	MEIRO.Model.apply(this, arguments);

	this.on = false;
	
	var m = 60; // брой върхове по периферията
	var n = 4; // брой върхове по напречното сечение
	var R = 3; // радиус на тора
	var r = 1.5; // радиус на напречното сечение
	
	this.torus = [];
	var material = new THREE.MeshLambertMaterial({color:'cornflowerblue',side:THREE.DoubleSide});

	// тор с ромбоидно сечение
	this.torus[0] = new THREE.Object3D();
	for (var i=0; i<n; i++)
	{
		var a0 = (i+0)/n*2*Math.PI;
		var a1 = (i+1)/n*2*Math.PI;
		
		var r0 = R-r*Math.cos(a0);
		var r1 = R-r*Math.cos(a1);
		
		var h0 = r*Math.sin(a0);
		var h1 = r*Math.sin(a1);

		var geometry = new THREE.CylinderGeometry(r1,r0,h1-h0,m,1,true);
		geometry.translate(0,h0+(h1-h0)/2,0);
		if (h1<h0) geometry.scale(-1,1,1);
		
		this.torus[0].add( new THREE.Mesh(geometry,material) );
	}

	// тор с квадратно сечение
	this.torus[1] = new THREE.Object3D();
	for (var i=0; i<n; i++)
	{
		var a0 = (i+0.5)/n*2*Math.PI;
		var a1 = (i+1.5)/n*2*Math.PI;
		
		var r0 = R-r*Math.cos(a0);
		var r1 = R-r*Math.cos(a1);
		
		var h0 = r*Math.sin(a0);
		var h1 = r*Math.sin(a1);

		var geometry = new THREE.CylinderGeometry(r1,r0,h1-h0,m,1,true);
		geometry.translate(0,h0+(h1-h0)/2,0);
		if (h1<h0) geometry.scale(-1,1,1);
		
		this.torus[1].add( new THREE.Mesh(geometry,material) );
	}
	this.torus[1].visible = false;


	// квадратен тор с квадратно сечение
	this.torus[2] = new THREE.Object3D();
	for (var i=0; i<n; i++)
	{
		var a0 = (i+0.5)/n*2*Math.PI;
		var a1 = (i+1.5)/n*2*Math.PI;
		
		var r0 = R-r*Math.cos(a0);
		var r1 = R-r*Math.cos(a1);
		
		var h0 = r*Math.sin(a0);
		var h1 = r*Math.sin(a1);

		var geometry = new THREE.CylinderGeometry(r1,r0,h1-h0,4,1,true);
		geometry.translate(0,h0+(h1-h0)/2,0);
		if (h1<h0) geometry.scale(-1,1,1);
		
		this.torus[2].add( new THREE.Mesh(geometry,material) );
	}
	this.torus[2].visible = false;
	
	light = new THREE.PointLight('white',1);
	light.position.set(0,10,0);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТЪПКА №1', 'images/n123.png');
	this.toggle.state = 0;
	this.toggle.hide();
	
	
	// сглобяване на целия модел
	this.image.add(this.torus[0],this.torus[1],this.torus[2],light);
}

MEIRO.Models.M09441.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09441.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09441.POS = {DIST:15, ROT_X:0, ROT_Y:0.6};
MEIRO.Models.M09441.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09441.prototype.onAnimate = function(time)
{
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M09441.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Създаване на квадратен тор</h1>';

	s += '<p>Създаването на квадратен тор като вариант на тор от пресечени конуси е в три стъпки:</p>';
	s += '<p><ul><li>намаляване на броя слоеве до 4, с това се постига ромбоидно сечение на тора</li>';
	s += '<li>завъртане на началните и крайните ъгли на слоевете с <em>π/2</em> за промяна на сечението в квадратно</li>';
	s += '<li>намаляване на броя околни стени ка пресечените конуси до 4.</li></ul></p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M09441.prototype.onToggle = function(element)
{
	this.torus[this.toggle.state].visible = false;
	this.toggle.state = (this.toggle.state+1)%3;
	this.toggle.setText('СТЪПКА №'+(this.toggle.state+1));
	this.torus[this.toggle.state].visible = true;
	reanimate();
}