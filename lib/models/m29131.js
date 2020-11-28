
//	Основи на Компютърната Графика
//	Модел 29131 - Сцена с подсказка от цвят
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M29131 = function M29131(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 12;
	var material = new THREE.MeshBasicMaterial({color:'black'});
	this.pawn = [];
	for (var i=0; i<this.n; i++)
	{
		var p = new MEIRO.Pawn('black');
		p.head.material = material;
		p.neck.material = material;
		p.waist.material = material;
		p.bottom.material = material;
		p.body.material = material;
		p.feet.material = material;
		p.offset = 2*Math.PI*Math.random();
		p.speed = 1.5-Math.random();
		p.radius = 3+4*Math.random();
		this.pawn.push( p );
	}

	this.image.fog = new THREE.Fog('white',1,2);
	
	// сглобяване на целия модел
	for (var i=0; i<this.n; i++)
		this.image.add(this.pawn[i]);
}

MEIRO.Models.M29131.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M29131.DIST = {MIN:15, MAX:15, HEIGHT:0};
MEIRO.Models.M29131.POS = {DIST:15, ROT_X:0, ROT_Y:0};
MEIRO.Models.M29131.ROT_Y = {MIN:0, MAX:0};


// аниматор на модела
MEIRO.Models.M29131.prototype.onAnimate = function(time)
{
	this.image.fog.near = (15-7)*this.image.scale.x;
	this.image.fog.far = (15+8)*this.image.scale.x;
	
	var v1 = camera.position.clone().sub(this.image.position).multiplyScalar(1/this.image.scale.x);
	var v2 = camera.target.clone().sub(this.image.position).multiplyScalar(1/this.image.scale.x);
	for (var i=0; i<this.n; i++)
	{
		var p = this.pawn[i];
		var a = p.speed*rpm(time,3)+p.offset;
		p.position.set(p.radius*Math.cos(a),0,p.radius*Math.sin(a));
		
		var v = p.getWorldPosition();
		var dist = v.distanceTo(camera.position)/this.image.scale.x;
		dist = dist/15;
		p.scale.set(dist,dist,dist);
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M29131.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Сцена с подсказка от цвят</h1>';

	s += '<p>Когато има подсказка от цвят, най-често чрез мъгла или отслабване на осветеността, тогава цветовете на обектите са индикатори за тяхната отдалеченост.</p>';
	
	element.innerHTML = s;
}