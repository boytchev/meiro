
//	Основи на Компютърната Графика
//	Модел 24141 - Повърхност на Безие - мрежа от точки
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M24141 = function M24141(room)
{
	MEIRO.Model.apply(this, arguments);

	// контролни точки
	this.points = [];
	this.speed = [];
	this.offset = [];
	this.amplitude = [];
	this.k = 0;
	for (var i=0; i<4; i++)
	{
		this.points.push( [] );
		this.speed.push( [] );
		this.offset.push( [] );
		this.amplitude.push( [] );
		for (var j=0; j<4; j++)
		{
			this.points[i].push( new MEIRO.Point() );
			this.points[i][j].scale.set(0.1,0.1,0.1);
			this.points[i][j].material = MEIRO.PRIMITIVE.STYLE.PAWN;
			this.speed[i].push( 0.001*(Math.random()+1) );
			this.offset[i].push( Math.random()*Math.PI*2 );
			this.amplitude[i].push( ((i==0 && j==0) || (i==3 && j==0) || (i==0 && j==3) || (i==3 && j==3) )?0.7:1.4 );
		}
	}

	this.grid = new THREE.ParametricBufferGeometry(function(u,v){return new THREE.Vector3(10*u-5,0,10*v-5)},3,3);
	this.object = new THREE.Mesh( this.grid, MEIRO.PRIMITIVE.STYLE.WIREFRAME_GRID );
	
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ДВИЖЕНИЕ', 'images/toggle.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.object);
	for (var i=0; i<4; i++)
		for (var j=0; j<4; j++)
			this.image.add(this.points[i][j]);
}

MEIRO.Models.M24141.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M24141.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M24141.POS = {DIST:20, ROT_X:-1, ROT_Y:0.6};
MEIRO.Models.M24141.ROT_Y = {MIN:-0.1, MAX:0.7};

// аниматор на модела
MEIRO.Models.M24141.prototype.onAnimate = function(time)
{
	var k = 0;
	for (var i=0; i<4; i++)
		for (var j=0; j<4; j++)
		{
			k++;
			this.object.geometry.attributes.position.array[k++]=this.k*this.amplitude[i][j]*Math.sin(this.offset[i][j]+this.speed[i][j]*time);
			k++;
			this.points[i][j].position.set(
				this.object.geometry.attributes.position.array[k-3],
				this.object.geometry.attributes.position.array[k-2],
				this.object.geometry.attributes.position.array[k-1]
			);
		}
	this.object.geometry.attributes.position.needsUpdate = true;
	
	if (this.k>0) reanimate();
	
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M24141.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Повърхност на Безие - мрежа от точки</h1>';

	s += '<p>Първата стъпка при конструирането на повърхност на Безие е да се създаде мрежа от контролни точки. За удобство мрежата ще е от равномерно разположени точки, на които се променя само координатата по вертикала.';
	
	element.innerHTML = s;
}





// превключвател на модела
MEIRO.Models.M24141.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:that.k})
		.to({k:that.k>0.5?0:1},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.k=this.k} )
		.start();
		
	reanimate();
}
