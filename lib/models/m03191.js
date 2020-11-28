
//	Основи на Компютърната Графика
//	Модел 03191 - Сферична координатна система
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M03191 = function M03191(room)
{
	MEIRO.Model.apply(this, arguments);
	
	// координатна система
	this.coordSys = new MEIRO.AxesSpherical(4);

	// подвижна точка
	this.point = new MEIRO.Point();

	// координатни елементи
	this.plateA = new MEIRO.Pie(1);
	this.plateA.material = MEIRO.PRIMITIVE.STYLE.PLATE;
	this.plateA.rotation.x = Math.PI;
	
	this.contourA = new MEIRO.CirclePie(1);
	this.contourA.material = MEIRO.PRIMITIVE.STYLE.CONTOUR;
	this.contourA.rotation.x = -Math.PI/2;
	
	this.plateB = new MEIRO.Pie(1);
	this.plateB.material = MEIRO.PRIMITIVE.STYLE.PLATE;
	this.plateB.rotation.x = -Math.PI/2;
	
	this.contourB = new MEIRO.CirclePie(1);
	this.contourB.material = MEIRO.PRIMITIVE.STYLE.CONTOUR;

	// надписи
	this.labelP = new MEIRO.Label('P(r,α,β)',0.4,-0.8,0.6,0);
	this.labelR = new MEIRO.Label('r',0.3,0,0,0);
	this.labelA = new MEIRO.Label('α',0.3);
	this.labelB = new MEIRO.Label('β',0.3,0.5,-0.2,0);

	// сглобяване на целия модел
	this.image.add(this.coordSys, this.point, this.plateA, this.contourA, this.plateB, this.contourB, this.labelP, this.labelR, this.labelA, this.labelB);
}

MEIRO.Models.M03191.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M03191.DIST = {MIN:5, MAX:30, HEIGHT:-1};
MEIRO.Models.M03191.POS = {DIST:15, ROT_X:-0.9, ROT_Y:0.4};
MEIRO.Models.M03191.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M03191.prototype.onAnimate = function(time)
{
	// ново положение на подвижната точка
	var x = 2.5*Math.sin(rpm(time,13));
	var y = 1.5+Math.sin(rpm(time,11));
	var z = 2.5*Math.cos(rpm(time,7));

	var r = Math.sqrt(x*x+y*y+z*z);
	var a = -Math.atan2(z,x);
	if (a<0) a += 2*Math.PI;
	var b = Math.atan2(y,Math.sqrt(x*x+z*z));

	// координатна система
	this.coordSys.rotateLabels();

	// подвижна точка
	this.point.position.set(x,y,z);

	// координатни елементи
	this.plateA.scale.set(r,0.02,r);
	this.plateA.setRange(0,a);
	
	this.contourA.scale.set(r,r,r);
	this.contourA.setRange(0,a);
	
	this.plateB.scale.set(r,0.02,r);
	this.plateB.setRange(0,b);
	this.plateB.rotation.z = a;
	
	this.contourB.scale.set(r,r,r);
	this.contourB.setRange(0,b);
	this.contourB.rotation.y = a;

	// надписи
	this.labelP.position.set(x,y,z);
	this.labelP.rotateLabel();

	this.labelR.position.set(x/2,y/2,z/2);
	this.labelR.rotateLabel();

	this.labelA.position.set(r*Math.cos(-a/2),0,r*Math.sin(-a/2));
	this.labelA.rotateLabel();

	this.labelB.position.set(r*Math.cos(-a)*Math.cos(b/2),r*Math.sin(b/2),r*Math.sin(-a)*Math.cos(b/2));
	this.labelB.rotateLabel();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M03191.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Сферична координатна система</h1>';
	
	s += '<p>Елементите ѝ са полюс (начало) &ndash; точката <em>O</em> и две полярни оси, определящи нулевите посоки. Координати на точка <em>P</em> в такава система е тройка числа <em>(r, α, β)</em>, които са разстояние до полюса и ъгли спрямо осите. Всяка точка може да има много координати.</p>';
	
	s += '<p>Често се използва алтернативно представяне с полюс, полярна ос и полярна равнина. Тогава единият от ъглите е спрямо полярната ос, а другият &ndash; спрямо полярната равнина.</p>';
	
	element.innerHTML = s;
}

