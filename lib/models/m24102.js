
//	Основи на Компютърната Графика
//	Модел 24102 - Координатна система по NURBS повърхност
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M24102 = function M24102(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 6;
	
	var map = new THREE.TextureLoader().load('data:image/png;base64,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' );
	map.anisotropy = 16;
	
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
			this.speed[i].push( 0.001*(Math.random()+1) );
			this.offset[i].push( Math.random()*Math.PI*2 );
			this.amplitude[i].push( ((i==0 && j==0) || (i==this.n-1 && j==0) || (i==0 && j==this.n-1) || (i==this.n-1 && j==this.n-1) )?1:2 );
		}
	}

	this.object = new MEIRO.Bezier3D(this.n);
	this.object.material = new THREE.MeshBasicMaterial({map:map,side:THREE.DoubleSide,color:'ghostwhite'});
	
	// сглобяване на целия модел
	this.image.add(this.object);
}

MEIRO.Models.M24102.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M24102.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M24102.POS = {DIST:10, ROT_X:-1, ROT_Y:0.6};
MEIRO.Models.M24102.ROT_Y = {MIN:-0.1, MAX:0.7};

// аниматор на модела
MEIRO.Models.M24102.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
		for (var j=0; j<this.n; j++)
			this.object.setControlPoint(i,j,
				-i+(this.n-1)/2,
				this.amplitude[i][j]*Math.sin(this.offset[i][j]+this.speed[i][j]*time),
				j-(this.n-1)/2
			);
		
	this.object.recalculate();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M24102.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Координатна система по NURBS повърхност</h1>';

	s += '<p>Всяка фамилия от прави може да се приеме като направление на координатна система, наложена върху повърхността. Едната ос е условно кръстена <em>u</em>, а другата &ndash; <em>v</em>. Прието е единият връх на повърхността има uv-координати (0,0), а срещуположният връх &ndash; (1,1). По такъв начин за всяка uv координата от 0 до 1 съответства точка от повърхността.';
	
	element.innerHTML = s;
}