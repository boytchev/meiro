
//	Основи на Компютърната Графика
//	Модел 03141 - Полярна координатна система
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M03141 = function M03141(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// координатна система
	this.coordSys = new MEIRO.AxesPolar(4);
	
	// подвижна точка
	this.point = new MEIRO.Point();
	
	// координатни елементи
	this.plate = new MEIRO.Pie(1);
	this.plate.material = MEIRO.PRIMITIVE.STYLE.PLATE;
	this.plate.rotation.x = -Math.PI/2;

	this.contour = new MEIRO.CirclePie(1);
	this.contour.material = MEIRO.PRIMITIVE.STYLE.CONTOUR;
	
	// надписи
	this.labelP = new MEIRO.Label('P(r,α)',0.4,-0.75,0.5,0);
	this.labelR = new MEIRO.Label('r',0.3);
	this.labelA = new MEIRO.Label('α',0.3,-0.1);

	// сглобяване на целия модел
	this.image.add(this.coordSys, this.point, this.plate, this.contour, this.labelP, this.labelR, this.labelA);
}

MEIRO.Models.M03141.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M03141.DIST = {MIN:5, MAX:30, HEIGHT:0};
MEIRO.Models.M03141.POS = {DIST:15, ROT_X:1.35, ROT_Y:0.2};
MEIRO.Models.M03141.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M03141.prototype.onAnimate = function(time)
{
	// ново положение на подвижната точка
	var x = 2.5*Math.sin(rpm(time,11));
	var y = 2.5*Math.cos(rpm(time,7));

	var r = Math.sqrt(x*x+y*y);
	var a = Math.atan2(y,x);
	if (a<0) a += 2*Math.PI;
	
	// координатна система
	this.coordSys.rotateLabels();
	
	// подвижна точка
	this.point.position.set(x,y,0);

	// координатни елементи
	this.plate.scale.set(r,0.02,r);
	this.plate.setRange(0,a);
	
	this.contour.scale.set(r,r,r);
	this.contour.setRange(0,a);
	
	// надписи
	this.labelP.position.set(x,y,0);
	this.labelP.rotateLabel();
	
	this.labelR.position.set(x/2,y/2,0);
	this.labelR.rotateLabel();
	
	this.labelA.position.set((r+0.2)*Math.cos(a/2),(r+0.2)*Math.sin(a/2),0);
	this.labelA.rotateLabel();

	reanimate();
}



// информатор на модела
MEIRO.Models.M03141.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Полярна координатна система</h1>';
	
	s += '<p>Елементите ѝ са полюс (начало) &ndash; точката <em>O</em> и полярна ос, определяща нулева посока. Координати на точка <em>P</em> в такава система е двойка числа <em>(r, α)</em>, които са разстояние до полюса и ъгъл спрямо оста. Всяка точка може да има много координати.</p>';
	
	element.innerHTML = s;
}

