
//	Основи на Компютърната Графика
//	Модел 04141 - Модел на пешка
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M04141 = function M04141(room)
{
	MEIRO.Model.apply(this, arguments);
	
	// пешка
	this.split = 0;
	this.pawn = new MEIRO.Pawn('black');
	
	// надписи
	this.labelPawn = new MEIRO.Label('Пешка',0.4,-0.9,4,0);
	this.labelPawn.material = this.labelPawn.material.clone();
	this.labelPawn.material.transparent = true;
	this.labelPawn.material.opacity = 1;
	
	this.labelBody = new MEIRO.Label('Конус',0.4,-0.8,3.5,0);
	this.labelBody.material = this.labelBody.material.clone();
	this.labelBody.material.transparent = true;
	this.labelBody.material.opacity = 0;
	
	this.labelHead = new MEIRO.Label('Сфера',0.4,-0.9,4,0);
	this.labelHead.material = this.labelHead.material.clone();
	this.labelHead.material.transparent = true;
	this.labelHead.material.opacity = 0;
	
	this.labelBase = new MEIRO.Label('Полусфера',0.4,-1.5,4,0);
	this.labelBase.material = this.labelBase.material.clone();
	this.labelBase.material.transparent = true;
	this.labelBase.material.opacity = 0;
	
	this.labelNeck = new MEIRO.Label('Елипсоид',0.4,-1.2,4,0);
	this.labelNeck.material = this.labelBase.material.clone();
	this.labelNeck.material.transparent = true;
	this.labelNeck.material.opacity = 0;
	
	this.labelWaist = new MEIRO.Label('Елипсоид',0.4,-1.2,4,0);
	this.labelWaist.material = this.labelBase.material.clone();
	this.labelWaist.material.transparent = true;
	this.labelWaist.material.opacity = 0;
	
	this.labelFeet = new MEIRO.Label('Окръжност',0.4,-1.3,-1,0);
	this.labelFeet.material = this.labelBase.material.clone();
	this.labelFeet.material.transparent = true;
	this.labelFeet.material.opacity = 0;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ЕЛЕМЕНТИ', 'images/toggle.png');
	this.toggle.hide();

	// сглобяване на целия модел
	this.image.add(this.pawn,this.labelPawn,this.labelBody,this.labelHead,this.labelBase,this.labelNeck,this.labelWaist,this.labelFeet);
}

MEIRO.Models.M04141.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M04141.DIST = {MIN:10, MAX:30, HEIGHT:-1};
MEIRO.Models.M04141.POS = {DIST:20, ROT_X:-0.9, ROT_Y:0.4};
MEIRO.Models.M04141.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M04141.prototype.onAnimate = function(time)
{
	// ново положение на подвижната точка
	this.pawn.split(this.split);
	if (this.split>EPS && this.split<1-EPS)
		reanimate(time);
		
	// надписи
	this.labelPawn.rotateLabel();
	this.labelPawn.material.opacity = 1-this.split;
	
	this.labelBody.rotateLabel();
	this.labelBody.material.opacity = this.split;
	this.labelBody.position.y = 0.5-0.5*this.split;
	
	this.labelHead.rotateLabel();
	this.labelHead.material.opacity = this.split;
	this.labelHead.position.set(this.pawn.head.position.x, -2.25-0.5*this.split, this.pawn.head.position.z);
	
	this.labelBase.rotateLabel();
	this.labelBase.material.opacity = this.split;
	this.labelBase.position.set(this.pawn.bottom.position.x, -2.5-0.5*this.split, this.pawn.bottom.position.z);
	
	this.labelNeck.rotateLabel();
	this.labelNeck.material.opacity = this.split;
	this.labelNeck.position.set(this.pawn.neck.position.x, -2.85-0.5*this.split, this.pawn.neck.position.z);
	
	this.labelWaist.rotateLabel();
	this.labelWaist.material.opacity = this.split;
	this.labelWaist.position.set(this.pawn.waist.position.x, -2.6-0.5*this.split, this.pawn.waist.position.z);
	
	this.labelFeet.rotateLabel();
	this.labelFeet.material.opacity = this.split;
	this.labelFeet.position.set(this.pawn.feet.position.x, 0.5-0.75*this.split, this.pawn.feet.position.z);
	
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M04141.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Модел на пешка</h1>';
	
	s += '<p>По-сложните обекти се съставят от примитивни обекти. Тази пешка е направена от конус за тялото, сфера за главата, елипсоиди (т.е. сплескани сфери) за яката и кръста, полусфера за основата и окръжност за подложка.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M04141.prototype.onToggle = function(element)
{
	var newK = this.split>0.5?0:1;
	var that = this;
	new TWEEN.Tween({k:1-newK})
		.to({k:newK},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.split=this.k} )
		.start();
		
	reanimate();
}
