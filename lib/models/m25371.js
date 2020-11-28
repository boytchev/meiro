
//	Основи на Компютърната Графика
//	Модел 25371 - Локални координатни системи
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M25371 = function M25371(room, model)
{
	MEIRO.Model.apply(this, arguments);

	var iso = new THREE.IcosahedronGeometry(0.1,0);
	
	this.k = 40;
	var that = this;
	
	function Ring(n)
	{
		var ring = new THREE.Mesh(
			new THREE.CylinderGeometry(3,3,0.6,n,1,true),
			new THREE.MeshPhongMaterial({color:'orange',shininess:250,side:THREE.DoubleSide})
		);

		for (var i=0; i<that.k; i++)
		{
			var a = 2*Math.PI*i/that.k;
			var p = new THREE.Mesh(iso,new THREE.MeshPhongMaterial({color:MEIRO.RandomColor().addScalar(0.7),shininess:100,shading:THREE.FlatShading}));
			p.position.set(3*Math.sin(a),0,3*Math.cos(a));
			ring.add(p);
		}

		ring.rand = 0.7+0.6*Math.random();
		return ring;
	}
	
	var k = 0.85;
	this.n = 20;
	
	this.ring = Ring(60);
	for (var i=1, r=this.ring; i<this.n; i++)
	{
		var subring = Ring(60-2*i);
		subring.scale.set(k,k,k);
		r.add(subring);
		r = subring;
	}
	
	var ball = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.SPHERE,MEIRO.PRIMITIVE.STYLE.PAWN);
	k = Math.pow(k,this.n-2);
	ball.scale.set(k,k,k);
	
	var light = new THREE.PointLight('pink',0.5);
	light.position.set(0,0,0);
	
	// сглобяване на целия модел
	this.image.add(this.ring, ball, light);
}

MEIRO.Models.M25371.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M25371.DIST = {MIN:1, MAX:20, HEIGHT:0};
MEIRO.Models.M25371.POS = {DIST:5, ROT_X:0.7, ROT_Y:0};
MEIRO.Models.M25371.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M25371.prototype.onAnimate = function(time)
{
	var r = this.ring;
	for (var i=0; i<this.n; i++)
	{
		r.rotation.x = time/2000*r.rand+i;
		r.rotation.y = time/2300*r.rand-i;
		r.rotation.z = time/2800*r.rand+i*i;
		r = r.children[this.k];
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M25371.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Локални координатни системи</h1>';

	s += '<p>Камъчетата по пръстените в този модел са статични, техните координати не се променят. Това е реализирано чрез локални координатни системи. Всеки пръстен заедно с камъчетата му са в собствена координатна система. Движението се извършва чрез въртене на координатната система на всеки пръстен.</p>';

	element.innerHTML = s;
}