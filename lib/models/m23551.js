
//	Основи на Компютърната Графика
//	Модел 23551 - Преливащи функции в кубичен сплайн
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M23551 = function M23551(room)
{
	MEIRO.Model.apply(this, arguments);

	// екран
	this.oxy = new MEIRO.Axes2D([0,4],[0,1],false,false,false);
	this.oxy.position.set(-2,-0.5,0);
	
	this.n = 20;
	this.pos = 0;

	this.funcs = [
		function (t) {return  t*t*t/6},
		function (t) {return -t*t*t/2+t*t/2+t/2+1/6},
		function (t) {return  t*t*t/2-t*t+2/3},
		function (t) {return -t*t*t/6+t*t/2-t/2+1/6},
	]
	
	this.lines = [];
	this.labels = [];
	this.labelsX = [-1.3,-1.3,-1.7,-1.7];
	this.labelsY = [-0.4,0.15,0.15,-0.4];
	
	for (var j=0; j<4; j++)
	{
		this.lines[j] = new MEIRO.Polygon(this.n);
		this.lines[j].position.copy( this.oxy.position );
		for (var i=0; i<this.n; i++)
		{
			var t = i/(this.n-1);
			this.lines[j].setPoint(i,new THREE.Vector3(t,this.funcs[j](t),0));
		}
		this.labels[j] = new MEIRO.Label('W'+(3-j),0.085,-0.1);
		this.labels[j].position.set(this.labelsX[j],this.labelsY[j],0);
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.oxy);
	for (var i=0; i<4; i++) this.image.add(this.lines[i],this.labels[i]);
}

MEIRO.Models.M23551.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M23551.DIST = {MIN:2, MAX:10, HEIGHT:0};
MEIRO.Models.M23551.POS = {DIST:5, ROT_X:1.571, ROT_Y:0.1};
MEIRO.Models.M23551.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M23551.prototype.onAnimate = function(time)
{
	for (var i=0; i<4; i++)
	{
		this.lines[i].position.x = this.oxy.position.x + i*this.pos;
		this.labels[i].position.set(this.labelsX[i] + i*this.pos,this.labelsY[i],0);
		this.labels[i].rotateLabel();
	}
	
	TWEEN.update();
	
	if (this.pos>0 && this.pos<1)
		reanimate();
}



// информатор на модела
MEIRO.Models.M23551.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Преливащи функции в кубичен сплайн</h1>';

	s += '<p>Този модел показва четирите преливащи функции при кубичен сплайн. Разположени една до друга, те образуват гладка крива, която показва как влиянието на контролните точки върху сплайн кривата прелива плавно от една към друга.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M23551.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:this.pos})
		.to({k:this.pos>0.5?0:1},1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.pos=this.k} )
		.start();
	reanimate();
}