
//	Основи на Компютърната Графика
//	Модел 25251 - Движение на скелет
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M25251 = function M25251(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// човече
	this.male = мъжествен();
	this.male.scale.set(0.15,0.15,0.15);
	this.male.л_китка.врът(-10,40,0);
	this.male.д_китка.врът(10,40,0);
	
	// сглобяване на целия модел
	this.image.add(this.male);
}

MEIRO.Models.M25251.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M25251.DIST = {MIN:5, MAX:30, HEIGHT:0};
MEIRO.Models.M25251.POS = {DIST:15, ROT_X:0.7, ROT_Y:0};
MEIRO.Models.M25251.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M25251.prototype.onAnimate = function(time)
{
	var t = time/150;
	
	var s = Math.sin(t);
	var q = Math.sin(2*t);
	var p = Math.sin(t-Math.PI/4);
	
	this.male.position.y = 0.2*q;
	
	this.male.глава.врът(5*s,10*s,-5*q);
	this.male.тяло.врът(-5*s,-15*s,-10);
	this.male.таз.врът(0,10*s,0);
	
	this.male.л_крак.врът(0,10*s,30*s);
	this.male.л_коляно.врът(0,0,30+30*p);
	this.male.л_глезен.врът(0,0,20+30*p);

	this.male.д_крак.врът(0,10*s,-30*s);
	this.male.д_коляно.врът(0,0,30-30*p);
	this.male.д_глезен.врът(0,0,20-30*p);

	this.male.л_ръка.врът(0,0,-30*s);
	this.male.л_лакът.врът(0,20+20*s,-30-30*s);

	this.male.д_ръка.врът(0,0,30*s);
	this.male.д_лакът.врът(0,-20-20*s,-30+30*s);
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M25251.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение на скелет</h1>';

	s += '<p>Ако тяло е представено чрез скелет, то всяка негова поза се свежда до специфична ориентация на ставите, според съответните ѝ степени на свобода. Настоящият модел на тичане е реализиран като всеки ъгъл се изчислява с функция.</p>';

	element.innerHTML = s;
}