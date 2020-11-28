
//	Основи на Компютърната Графика
//	Модел 09351 - Параметрична пеперуда
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09351 = function M09351(room)
{
	MEIRO.Model.apply(this, arguments);

	// изчисление на пеперуда
	this.max = 240;
	this.dataX = [];
	this.dataY = [];
	for (var i=0; i<this.max; i++)
	{
		var a = i/this.max*2*Math.PI;
		var r = Math.exp(Math.cos(a)) - 2*Math.cos(4*a) + Math.pow(Math.sin(a/12),5);
		this.dataX.push(r*Math.sin(a));
		this.dataY.push(r*Math.cos(a));
	}

	//
	this.steps = [1/*240*/,4/*60*/,10/*24*/,20/*12*/,24/*10*/,40/*6*/,60/*4*/];
	this.butterflies = [];
	for (var s=0; s<this.steps.length; s++)
	{
		var geometry = new THREE.Geometry();
		for (var i=0; i<=this.max; i+= this.steps[s])
			geometry.vertices.push(new THREE.Vector3());
		
		var object = new THREE.Line(geometry,new THREE.LineBasicMaterial({color:'black'}));
		object.visible = false;
		this.butterflies.push(object);
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'БРОЙ ВЪРХОВЕ', 'images/multiply.png');
	this.toggle.state = this.steps.length-1;
	this.toggle.stateTexts = [];
	for (var s=0; s<this.steps.length; s++) 
		this.toggle.stateTexts.push(this.max/this.steps[s]+' върха');
	this.onToggle();
	this.toggle.hide();
	
	// сглобяване на целия модел
	for (var s=0; s<this.steps.length; s++)
		this.image.add(this.butterflies[s]);
}

MEIRO.Models.M09351.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09351.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M09351.POS = {DIST:10, ROT_X:0, ROT_Y:0.6};
MEIRO.Models.M09351.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09351.prototype.onAnimate = function(time)
{
	
	// преизчисляване на крилата
	var geometry = this.butterflies[this.toggle.state].geometry;
	var vertices = geometry.vertices;
	var step = this.steps[this.toggle.state];
	
	var angle = Math.sin(rpm(time,37))+Math.sin(rpm(time,23))+Math.sin(rpm(time,17))+Math.sin(rpm(time,7));
	angle = THREE.Math.clamp(angle,0,Math.PI/2-EPS);
	var sin = Math.abs(Math.sin(angle));
	var cos = Math.cos(angle);
	
	for (var i=0; i<vertices.length; i++)
	{
		var j = (i*step)%this.max;
		vertices[i].set( this.dataX[j]*cos,Math.abs(this.dataX[j])*sin,this.dataY[j] );
	}
	geometry.verticesNeedUpdate = true;
	reanimate();
}



// информатор на модела
MEIRO.Models.M09351.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Параметрична пеперуда</h1>';

	s += '<p>Формата на пеперудата се генерира в полярни координати, като радиусът е функция на ъгъла. Видимата форма зависи значително и от броя върхове, които се ползват.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M09351.prototype.onToggle = function(element)
{
	this.butterflies[this.toggle.state].visible = false;
	this.toggle.state = (this.toggle.state+1)%this.butterflies.length;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.butterflies[this.toggle.state].visible = true;
	reanimate();
}