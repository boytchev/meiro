
//	Основи на Компютърната Графика
//	Модел 03101 - Лява и дясна координатна система
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M03101 = function M03101(room)
{
	MEIRO.Model.apply(this, arguments);

	// координатни системи
	this.coordSysL = new MEIRO.Axes3D([-3,3],[-3,3],[-3,3]);
	this.coordSysL.position.set(5,0,0);
	this.coordSysL.scale.set(-1,1,1);
	this.coordSysL.rotationDir = -1;
	
	this.coordSysR = new MEIRO.Axes3D([-3,3],[-3,3],[-3,3]);
	this.coordSysR.position.set(-5,0,0);
	
	// координатни елементи
	this.plateL = new MEIRO.Cube(1);
	this.plateL.scale.set(6,0.1,6);
	this.plateL.position.set(5,0,0);
	this.plateL.material = MEIRO.PRIMITIVE.STYLE.PLATE;
	
	this.plateR = this.plateL.clone();
	this.plateR.position.set(-5,0,0);
	
	// надписи
	this.labelL = new MEIRO.Label('Лява',0.6,-2,0,0);
	this.labelL.position.set(5,3,0);
	
	this.labelR = new MEIRO.Label('Дясна',0.6,-2.5,0,0);
	this.labelR.position.set(-5,3,0);
	
	this.image.add(this.coordSysL,this.coordSysR,this.plateL,this.plateR,this.labelL,this.labelR);
}

MEIRO.Models.M03101.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M03101.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M03101.POS = {DIST:20, ROT_X:-1.57, ROT_Y:0};
MEIRO.Models.M03101.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M03101.prototype.onAnimate = function(time)
{
	// координатни системи
	this.coordSysL.rotation.set(Math.sin(rpm(time,-1))/4,Math.sin(rpm(time,-2))/4,Math.sin(rpm(time,+2))/4); 
	this.coordSysR.rotation.set(Math.sin(rpm(time,+2))/4,Math.sin(rpm(time,+2))/4,Math.sin(rpm(time,-1))/4); 
	
	// координатни елементи
	this.plateL.rotation.copy(this.coordSysL.rotation); 
	this.plateR.rotation.copy(this.coordSysR.rotation); 
	
	// надписи
	this.coordSysL.rotateLabels();
	this.coordSysR.rotateLabels();
	this.labelL.rotateLabel();
	this.labelR.rotateLabel();

	reanimate();
}



// информатор на модела
MEIRO.Models.M03101.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Лява и дясна координатна система</h1>';
	
	s += '<p>Те са огледални една на друга и Функционално еквивалентни.</p>';
	s += '<p>При дясната координатна система, ако се намираме в положителната посока по оста <em>Z</em> и оста <em>X</em> се завърта на 90° до <em>Y</em>, то това завъртане го виждаме като обратно на часовниковата стрелка. При лява координатна система то е по посока на часовниковата стрелка.</p>';
	
	element.innerHTML = s;
}

