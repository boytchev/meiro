
//	Основи на Компютърната Графика
//	Модел 24071 - Пример за NURBS повърхност
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M24071 = function M24071(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 6;
	
	// плочка
	this.speed = [];
	this.offset = [];
	this.amplitude = [];
	for (var i=0; i<this.n; i++)
	{
		this.speed.push( [] );
		this.offset.push( [] );
		this.amplitude.push( [] );
		for (var j=0; j<this.n; j++)
		{
			this.speed[i].push( 0.002*(Math.random()+1) );
			this.offset[i].push( Math.random()*Math.PI*2 );
			this.amplitude[i].push( ((i==0 && j==0) || (i==this.n-1 && j==0) || (i==0 && j==this.n-1) || (i==this.n-1 && j==this.n-1) )?1:2 );
		}
	}

	this.object = new MEIRO.Bezier3D(this.n);
	
	this.light = new THREE.PointLight('pink',1);
	this.light.position.set(0,10,0);
	
	// сглобяване на целия модел
	this.image.add(this.object,this.light);
}

MEIRO.Models.M24071.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M24071.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M24071.POS = {DIST:10, ROT_X:0.5, ROT_Y:0.2};
MEIRO.Models.M24071.ROT_Y = {MIN:-0.1, MAX:0.7};

// аниматор на модела
MEIRO.Models.M24071.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
		for (var j=0; j<this.n; j++)
			this.object.setControlPoint(i,j,
				i-(this.n-1)/2,
				this.amplitude[i][j]*Math.sin(this.offset[i][j]+this.speed[i][j]*time),
				j-(this.n-1)/2
			);
		
	this.object.recalculate();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M24071.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>NURBS повърхност</h1>';

	s += '<p>Тази повърхност позволява да бъде дефинирана чрез малък брой контролни точки, разположени в "правоъгълна" или "квадратна" мрежа. Всяка контролна точка притегля повърхността към себе си.';
	
	element.innerHTML = s;
}