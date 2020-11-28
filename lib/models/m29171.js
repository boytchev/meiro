
//	Основи на Компютърната Графика
//	Модел 29171 - Сцена с подсказка от припокриване
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M29171 = function M29171(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 12;
	this.pawn = [];
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Pawn('black');
		var material = new THREE.MeshBasicMaterial({color:MEIRO.RandomColor()});
		p.head.material = material;
		p.neck.material = material;
		p.waist.material = material;
		p.bottom.material = material;
		p.body.material = material;
		p.feet.material = material;
		p.offset = 2*Math.PI*Math.random();
		p.speed = 1.5-Math.random();
		p.radius = 3+4*Math.random();
		p.s = 1.5-Math.random();
		this.pawn.push( p );
	}
	
	// сглобяване на целия модел
	for (var i=0; i<this.n; i++)
		this.image.add(this.pawn[i]);
}

MEIRO.Models.M29171.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M29171.DIST = {MIN:15, MAX:15, HEIGHT:0};
MEIRO.Models.M29171.POS = {DIST:15, ROT_X:0, ROT_Y:0};
MEIRO.Models.M29171.ROT_Y = {MIN:0, MAX:0};


// аниматор на модела
MEIRO.Models.M29171.prototype.onAnimate = function(time)
{
	var v1 = camera.position.clone().sub(this.image.position).multiplyScalar(1/this.image.scale.x);
	var v2 = camera.target.clone().sub(this.image.position).multiplyScalar(1/this.image.scale.x);
	for (var i=0; i<this.n; i++)
	{
		var p = this.pawn[i];
		var a = p.speed*rpm(time,3)+p.offset;
		p.position.set(p.radius*Math.cos(a),0,p.radius*Math.sin(a));
		
		var v = p.getWorldPosition();
		var dist = v.distanceTo(camera.position)/this.image.scale.x;
		dist = p.s*dist/15;
		p.scale.set(dist,dist,dist);
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M29171.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Сцена с подсказка от припокриване</h1>';

	s += '<p>Най-силната подсказка е вързана с припокриването. Обект, който припокрива друг, се намира по-близо до наблюдателя в сравнение с другия обект.</p>';
	
	element.innerHTML = s;
}