
//	Основи на Компютърната Графика
//	Модел 03061 - Декартова координатна система
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M03061 = function M03061(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.coordSys = new MEIRO.Axes3D([-6,6],[0,4],[-6,6]);
	
	// подвижна точка
	this.point = new MEIRO.Point();
	
	// координатни елементи
	this.plates = new MEIRO.Cube(1);
	this.plates.material = MEIRO.PRIMITIVE.STYLE.PLATE;
	
	this.contours = new THREE.BoxHelper(this.plates);
	this.contours.material = MEIRO.PRIMITIVE.STYLE.CONTOUR;
	
	// надписи
	this.labelP = new MEIRO.Label('P(x,y,z)',0.4,-2,0.8,0);
	this.labelX = new MEIRO.Label('x',0.3);
	this.labelY = new MEIRO.Label('y',0.3);
	this.labelZ = new MEIRO.Label('z',0.3);
	
	// сглобяване на целия модел
	this.image.add(this.coordSys,this.point,this.plates,this.labelP,this.labelX,this.labelY,this.labelZ);
	this.plates.add(this.contours);
}

MEIRO.Models.M03061.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M03061.DIST = {MIN:5, MAX:30, HEIGHT:-1};
MEIRO.Models.M03061.POS = {DIST:15, ROT_X:0.9, ROT_Y:0.15};
MEIRO.Models.M03061.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M03061.prototype.onAnimate = function(time)
{	
	// ново положение на подвижната точка
	var x = 5*Math.sin(rpm(time,5));
	var y = 2+1.5*Math.sin(rpm(time,3));
	var z = 5*Math.sin(rpm(time,7));
	
	// координатна система
	this.coordSys.rotateLabels();

	// подвижна точка
	this.point.position.set(x,y,z);
	
	// координатни елементи
	this.plates.position.set(x/2,y/2,z/2);
	this.plates.scale.set(Math.abs(x),Math.abs(y),Math.abs(z));
	
	// надписи
	this.labelP.position.set(x,y,z);
	this.labelP.rotateLabel();
	
	this.labelX.position.set(x-0.1,0.1,0);
	this.labelX.rotateLabel();
	
	this.labelY.position.set(0,y+0.2,0);
	this.labelY.rotateLabel();
	
	this.labelZ.position.set(0,0.1,z-0.1);
	this.labelZ.rotateLabel();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M03061.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Декартова координатна система</h1>';

	s += '<p>Елементите ѝ са начало &ndash; точката <em>O</em> и три взаимно перпендикулярни координатни оси с относителни посоки и условни имена <em>X</em>, <em>Y</em> и <em>Z</em>. Координати на точка <em>P</em> в такава система е тройката числа <em>(x, y, z)</em>, които са разстояния по съответните оси. Всяка точка е с единствени координати.</p>';
	element.innerHTML = s;
}

