
//	Основи на Компютърната Графика
//	Модел 28271 - Твърда сянка с обект
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M28271 = function M28271(room)
{
	MEIRO.Model.apply(this, arguments);

	var floor = new MEIRO.Cube(1);
	floor.scale.set(20,0.1,20);
	floor.material = new THREE.MeshBasicMaterial({color:'burlywood'});

	this.n = 8;
	this.ball = [];
	for (var i=0; i<this.n; i++)
	{
		this.ball.push( new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.SPHERE,MEIRO.PRIMITIVE.STYLE.PAWN) );
		this.ball[i].offset = 2*Math.PI*Math.random();
	}
	
	var geometry = new THREE.CircleGeometry(1,options.lowpoly?16:32);
	this.shadow = [];
	for (var i=0; i<this.n; i++)
	{
		this.shadow.push( new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:'sienna',transparent:!true,opacity:0.5})) );
		this.shadow[i].rotation.x = -Math.PI/2;
	}
	
	// сглобяване на целия модел
	this.image.add(floor);
	for (var i=0; i<this.n; i++)
	{
		this.image.add(this.ball[i]);
		this.image.add(this.shadow[i]);
	}
}

MEIRO.Models.M28271.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28271.DIST = {MIN:10, MAX:40, HEIGHT:-3};
MEIRO.Models.M28271.POS = {DIST:20, ROT_X:0, ROT_Y:0.3};
MEIRO.Models.M28271.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M28271.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var a = 2*Math.PI*i/this.n;
		var b = this.ball[i];
		b.position.set(
			8*Math.sin(rpm(time,12)+a),
			1+8*Math.abs(Math.sin(rpm(time,20)+b.offset)),
			8*Math.cos(rpm(time,12)+a)
		);
		this.shadow[i].position.set(
			b.position.x,
			0.1,
			b.position.z
		);
	}
	reanimate();
}



// информатор на модела
MEIRO.Models.M28271.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Твърда сянка с обект</h1>';

	s += '<p>Сянката на всяка от сферите е допълнителен графичен обект &ndash; окръжност. Движи се самостоятелно, малко над повърхността на основата, но точно под сферата. Това е твърда сянка, понеже контурите ѝ са резки.</p>';
	element.innerHTML = s;
}